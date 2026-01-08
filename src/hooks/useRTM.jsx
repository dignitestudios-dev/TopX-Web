import { useEffect, useRef, useState, useCallback } from "react";

export const useRTM = ({ appId, uid, token, channelName }) => {
  const clientRef = useRef(null);
  const channelRef = useRef(null);
  const messageHandlerRef = useRef(null); // Store message handler for cleanup
  const isLoggingInRef = useRef(false);
  const isLoggedInRef = useRef(false);
  let singletonRTMClient = null;

  const [isConnected, setIsConnected] = useState(false);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appId || !uid || !token || !channelName) {
      console.log("⚠️ RTM: Missing required parameters", {
        appId,
        uid,
        token,
        channelName,
      });
      return;
    }

    const initRTM = async () => {
      try {
        console.log("✅ RTM: Initializing...", { appId, uid, channelName });

        // Dynamically import agora-rtm
        let RTMClass;
        try {
          const rtmModule = await import("agora-rtm");
          const RTMExport = rtmModule.default || rtmModule;
          // agora-rtm 2.x exports RTM class in default.RTM
          RTMClass = RTMExport.RTM || RTMExport;
          console.log("🔍 RTM: Imported module", {
            hasDefault: !!rtmModule.default,
            hasRTM: !!RTMClass,
            moduleKeys: Object.keys(rtmModule),
            rtmKeys: RTMExport ? Object.keys(RTMExport) : [],
          });
        } catch (importError) {
          throw new Error(`Failed to import agora-rtm: ${importError.message}`);
        }

        if (!RTMClass || typeof RTMClass !== "function") {
          throw new Error(
            `RTM class not found. Available: ${
              RTMClass ? Object.keys(RTMClass).join(", ") : "null"
            }`
          );
        }

        // Create RTM client instance (agora-rtm 2.x uses constructor, not createClient)
        if (!singletonRTMClient) {
          singletonRTMClient = new RTMClass(appId, String(uid));
        }
        clientRef.current = singletonRTMClient;
        const client = clientRef.current;
        // Listen for connection state changes
        client.addEventListener("status", (event) => {
          console.log("📡 RTM: Connection status changed", event);
          if (event.state === "CONNECTED") {
            setIsConnected(true);
          } else if (
            event.state === "DISCONNECTED" ||
            event.state === "RECONNECTING"
          ) {
            setIsConnected(false);
          }
        });

        if (isLoggingInRef.current || isLoggedInRef.current) {
          console.log("⚠️ RTM: Login already in progress or completed");
          return;
        }

        isLoggingInRef.current = true;

        await client.login({ token });

        isLoggedInRef.current = true;
        isLoggingInRef.current = false;

        console.log("✅ RTM: Logged in successfully");

        // Subscribe to channel messages (agora-rtm 2.x uses subscribe method)
        await client.subscribe(channelName, {
          withMessage: true,
        });
        console.log("✅ RTM: Subscribed to channel");

        // Set connected state after successful subscription
        // Note: Connection state will also be updated via status event listener
        setIsConnected(true);
        console.log("✅ RTM: Connection ready for publishing");

        // Message handler function - defined separately for cleanup
        // Store handler reference so we can remove it later
        const handleMessage = (event) => {
          try {
            // event contains: channelName, message, messageType, publisher
            const messageText = event.message;
            const publisher = event.publisher || "Unknown";

            let data;
            // Try to parse as JSON first
            if (typeof messageText === "string") {
              try {
                data = JSON.parse(messageText);
              } catch {
                // If not JSON, treat as plain text comment
                data = {
                  msg: messageText,
                  userName: publisher,
                };
              }
            } else {
              // Binary message - convert to string if possible
              data = {
                msg: String(messageText),
                userName: publisher,
              };
            }

            console.log("📨 RTM: Received message", {
              data,
              publisher,
              channel: event.channelName,
            });

            // Handle comment messages
            if (
              data.type === "comment" ||
              data.msg ||
              data.text ||
              data.comment
            ) {
              // Normalize userIds to strings for comparison
              const messageUserId = String(data.userId || publisher);
              const currentUserId = String(uid);
              const isOwnMessage = messageUserId === currentUserId;

              console.log("🔍 RTM: Message check", {
                messageUserId,
                currentUserId,
                isOwnMessage,
                publisher,
                dataUserId: data.userId,
              });

              const commentId = `comment-${Date.now()}-${Math.random()}-${messageUserId}`;
              const newComment = {
                id: commentId,
                username:
                  data.userName || data.username || publisher || "Anonymous",
                text: data.msg || data.text || data.comment || "",
                profilePicture: data.profilePicture || data.userAvatar || null,
                userId: messageUserId,
                timestamp: Date.now(),
              };

              setComments((prev) => {
                // OTHER USERS: always add (only skip exact duplicates within 500ms to avoid double listeners)
                if (!isOwnMessage) {
                  // More strict duplicate check: same text + same userId + same timestamp (or very close)
                  const duplicateExists = prev.some((c) => {
                    const sameText = c.text === newComment.text;
                    const sameUserId =
                      String(c.userId) === String(newComment.userId);
                    // Use 500ms window - very short to only catch true duplicate events
                    const recentTime =
                      Math.abs((c.timestamp || 0) - newComment.timestamp) < 500;
                    // Also check if comment ID is the same (if somehow generated identically)
                    const sameId = c.id === newComment.id;

                    return (sameText && sameUserId && recentTime) || sameId;
                  });

                  if (duplicateExists) {
                    console.log(
                      "⚠️ RTM: Duplicate comment from other user detected (likely duplicate event), skipping",
                      {
                        text: newComment.text,
                        publisher,
                        userId: messageUserId,
                        existingComments: prev.length,
                        commentId: newComment.id,
                      }
                    );
                    return prev;
                  }

                  console.log("✅ RTM: Adding comment from other user", {
                    text: newComment.text,
                    publisher,
                    userId: messageUserId,
                    username: newComment.username,
                    totalComments: prev.length,
                    willBeTotal: prev.length + 1,
                    timestamp: newComment.timestamp,
                    commentId: newComment.id,
                  });

                  // Verify the comment will actually be added
                  const newComments = [
                    ...prev,
                    { ...newComment, isOptimistic: false },
                  ];
                  console.log(
                    "📊 RTM: State update - prev:",
                    prev.length,
                    "new:",
                    newComments.length
                  );

                  return newComments;
                }

                // OWN MESSAGE LOOPBACK:
                // 1) replace optimistic if present
                // 2) otherwise ALWAYS add (no duplicate skip) so other devices see it

                const optimisticIndex = prev.findIndex(
                  (c) =>
                    c.text === newComment.text &&
                    c.userId === newComment.userId &&
                    c.isOptimistic === true
                );

                if (optimisticIndex >= 0) {
                  const updated = [...prev];
                  updated[optimisticIndex] = {
                    ...newComment,
                    isOptimistic: false,
                  };
                  console.log(
                    "✅ RTM: Replacing optimistic comment with confirmed",
                    {
                      text: newComment.text,
                      index: optimisticIndex,
                    }
                  );
                  return updated;
                }

                // No optimistic found: add it unconditionally (do NOT skip as duplicate)
                console.log(
                  "✅ RTM: Adding own message (no optimistic match found)",
                  {
                    text: newComment.text,
                    publisher,
                    userId: messageUserId,
                  }
                );
                return [...prev, { ...newComment, isOptimistic: false }];
              });
            }

            // Handle like messages
            if (data.type === "like") {
              if (data.action === "add") {
                setLikesCount((prev) => prev + 1);
                if (data.userId === String(uid)) {
                  setUserLiked(true);
                }
              } else if (data.action === "remove") {
                setLikesCount((prev) => Math.max(0, prev - 1));
                if (data.userId === String(uid)) {
                  setUserLiked(false);
                }
              }
            }
          } catch (err) {
            console.error("❌ RTM: Error processing message", err, event);
          }
        };

        // Listen for messages in the channel (agora-rtm 2.x uses "message" event)
        // Remove any existing listener first to prevent duplicates
        if (messageHandlerRef.current) {
          try {
            client.removeEventListener("message", messageHandlerRef.current);
          } catch (err) {
            // Ignore if listener doesn't exist
          }
        }

        // Store handler reference and add listener
        messageHandlerRef.current = handleMessage;
        client.addEventListener("message", handleMessage);
        console.log("✅ RTM: Message event listener registered");

        // Store channel info for sending messages
        channelRef.current = { name: channelName, client };

        setIsConnected(true);
        console.log("✅ RTM: Fully connected and ready");
      } catch (err) {
        console.error("❌ RTM: Initialization failed", err);
        setError(err.message || "Failed to initialize RTM");
      }
    };

    initRTM();

    return () => {
      if (clientRef.current) {
        const client = clientRef.current;

        try {
          if (messageHandlerRef.current) {
            client.removeEventListener("message", messageHandlerRef.current);
            messageHandlerRef.current = null;
          }

          if (channelRef.current?.name) {
            client.unsubscribe(channelRef.current.name).catch(() => {});
          }

          // ❗ ONLY logout if ACTUALLY logged in
          if (isLoggedInRef.current) {
            client.logout().catch(() => {});
            isLoggedInRef.current = false;
          }
        } catch (e) {
          console.warn("RTM cleanup warning:", e);
        }

        clientRef.current = null;
      }

      setIsConnected(false);
    };
  }, [appId, channelName]);

  // Send comment function
  const sendComment = useCallback(
    async (text, userInfo) => {
      if (!channelRef.current || !text || !text.trim()) {
        console.warn("⚠️ RTM: Cannot send comment - missing channel or text");
        return false;
      }

      try {
        const { client, name: channelName } = channelRef.current;
        if (!client || !channelName) {
          console.warn("⚠️ RTM: Client or channel name not available");
          return false;
        }

        const currentUserId = String(uid);
        const payload = {
          type: "comment",
          msg: text.trim(),
          userId: currentUserId,
          userName: userInfo?.username || userInfo?.userName || "Anonymous",
          profilePicture: userInfo?.profilePicture || null,
        };

        console.log("📤 RTM: Sending comment", payload);

        // Add comment immediately to local state (optimistic update)
        // Use a unique key that will help identify duplicates later
        const optimisticTimestamp = Date.now();
        const commentId = `comment-${optimisticTimestamp}-${Math.random()}-${currentUserId}`;
        const newComment = {
          id: commentId,
          username: payload.userName,
          text: payload.msg,
          profilePicture: payload.profilePicture,
          userId: currentUserId,
          timestamp: optimisticTimestamp,
          isOptimistic: true, // Mark as optimistic so we can replace it later
        };

        setComments((prev) => {
          // Check if already exists (shouldn't, but just in case)
          const exists = prev.some(
            (c) =>
              c.text === newComment.text &&
              c.userId === newComment.userId &&
              Math.abs((c.timestamp || 0) - newComment.timestamp) < 1000
          );
          if (exists) {
            console.log("⚠️ RTM: Comment already in local state");
            return prev;
          }
          console.log("✅ RTM: Adding comment to local state immediately", {
            text: newComment.text,
          });
          return [...prev, newComment];
        });

        // Check if client is connected before publishing
        // Wait for connection if not ready (with timeout)
        let retries = 0;
        const maxRetries = 5;
        while (!isConnected && retries < maxRetries) {
          console.warn(
            `⚠️ RTM: Not connected, waiting... (${retries + 1}/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
          retries++;
        }

        if (!isConnected) {
          console.error("❌ RTM: Client not connected after waiting");
          throw new Error(
            "RTM client is not connected. Please wait and try again."
          );
        }

        console.log("📤 RTM: Publishing message to channel", channelName);
        // agora-rtm 2.x uses publish method
        await client.publish(channelName, JSON.stringify(payload));

        console.log("✅ RTM: Comment sent successfully");
        return true;
      } catch (err) {
        console.error("❌ RTM: Failed to send comment", err);
        return false;
      }
    },
    [uid, isConnected]
  );

  // Send like function
  const sendLike = useCallback(
    async (action) => {
      if (!channelRef.current) {
        console.warn("⚠️ RTM: Cannot send like - channel not available");
        return false;
      }

      try {
        const { client, name: channelName } = channelRef.current;
        if (!client || !channelName) {
          console.warn("⚠️ RTM: Client or channel name not available");
          return false;
        }

        const currentUserId = String(uid);
        const payload = {
          type: "like",
          action: action, // "add" or "remove"
          userId: currentUserId,
        };

        console.log("📤 RTM: Sending like", payload);

        // agora-rtm 2.x uses publish method
        await client.publish(channelName, JSON.stringify(payload));

        // Optimistically update local state
        if (action === "add") {
          setLikesCount((prev) => prev + 1);
          setUserLiked(true);
        } else if (action === "remove") {
          setLikesCount((prev) => Math.max(0, prev - 1));
          setUserLiked(false);
        }

        console.log("✅ RTM: Like sent successfully");
        return true;
      } catch (err) {
        console.error("❌ RTM: Failed to send like", err);
        return false;
      }
    },
    [uid]
  );

  return {
    isConnected,
    comments,
    likesCount,
    userLiked,
    error,
    sendComment,
    sendLike,
  };
};
