import { useEffect, useRef, useState, useCallback } from "react";

export const useRTM = ({ appId, uid, token, channelName }) => {
  const clientRef = useRef(null);
  const channelRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appId || !uid || !token || !channelName) {
      console.log("⚠️ RTM: Missing required parameters", { appId, uid, token, channelName });
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
            rtmKeys: RTMExport ? Object.keys(RTMExport) : []
          });
        } catch (importError) {
          throw new Error(`Failed to import agora-rtm: ${importError.message}`);
        }

        if (!RTMClass || typeof RTMClass !== 'function') {
          throw new Error(`RTM class not found. Available: ${RTMClass ? Object.keys(RTMClass).join(", ") : "null"}`);
        }

        // Create RTM client instance (agora-rtm 2.x uses constructor, not createClient)
        const client = new RTMClass(appId, String(uid));
        clientRef.current = client;

        // Listen for connection state changes
        client.addEventListener("status", (event) => {
          console.log("📡 RTM: Connection status changed", event);
          if (event.state === "CONNECTED") {
            setIsConnected(true);
          } else if (event.state === "DISCONNECTED" || event.state === "RECONNECTING") {
            setIsConnected(false);
          }
        });

        // Login to RTM
        await client.login({
          token,
        });
        console.log("✅ RTM: Logged in successfully");

        // Subscribe to channel messages (agora-rtm 2.x uses subscribe method)
        await client.subscribe(channelName);
        console.log("✅ RTM: Subscribed to channel");

        // Set connected state after successful subscription
        // Note: Connection state will also be updated via status event listener
        setIsConnected(true);
        console.log("✅ RTM: Connection ready for publishing");

        // Listen for messages in the channel (agora-rtm 2.x uses "message" event)
        client.addEventListener("message", (event) => {
          try {
            // event contains: channelName, message, messageType, publisher
            const messageText = event.message;
            const publisher = event.publisher || "Unknown";

            let data;
            // Try to parse as JSON first
            if (typeof messageText === 'string') {
              try {
                data = JSON.parse(messageText);
              } catch {
                // If not JSON, treat as plain text comment
                data = {
                  type: "comment",
                  msg: messageText,
                  userName: publisher,
                };
              }
            } else {
              // Binary message - convert to string if possible
              data = {
                type: "comment",
                msg: String(messageText),
                userName: publisher,
              };
            }

            console.log("📨 RTM: Received message", { data, publisher, channel: event.channelName });

            // Handle comment messages
            if (data.type === "comment" || data.msg || data.text || data.comment) {
              const messageUserId = data.userId || publisher;
              const currentUserId = String(uid);
              const isOwnMessage = messageUserId === currentUserId;

              const commentId = `comment-${Date.now()}-${Math.random()}-${messageUserId}`;
              const newComment = {
                id: commentId,
                username: data.userName || data.username || publisher || "Anonymous",
                text: data.msg || data.text || data.comment || "",
                profilePicture: data.profilePicture || data.userAvatar || null,
                userId: messageUserId,
                timestamp: Date.now(),
              };

              setComments((prev) => {
                // Only skip if it's our own message (loopback) and already exists in local state
                // For other users' messages, always add them (they won't be in local state)
                if (isOwnMessage) {
                  // Check if this exact message already exists (from optimistic update)
                  // Use text + userId combination with a reasonable time window (5 seconds)
                  const exists = prev.some(
                    (c) => {
                      const sameText = c.text === newComment.text;
                      const sameUserId = c.userId === newComment.userId;
                      // Use a 5 second window to catch optimistic updates
                      const recentTime = Math.abs((c.timestamp || 0) - newComment.timestamp) < 5000;

                      // Only skip if it's the exact same message from same user within 5 seconds
                      if (sameText && sameUserId && recentTime) {
                        return true;
                      }
                      return false;
                    }
                  );
                  if (exists) {
                    console.log("⚠️ RTM: Duplicate comment detected (own message loopback), skipping", {
                      text: newComment.text,
                      publisher,
                      userId: messageUserId,
                      timestamp: newComment.timestamp
                    });
                    return prev;
                  }

                  // If it's our own message but not found, it might be a retry or delayed message
                  // Replace optimistic comment with confirmed one, or add if not found
                  const optimisticIndex = prev.findIndex(
                    (c) => c.text === newComment.text &&
                      c.userId === newComment.userId &&
                      c.isOptimistic
                  );

                  if (optimisticIndex >= 0) {
                    // Replace optimistic comment with confirmed one
                    const updated = [...prev];
                    updated[optimisticIndex] = { ...newComment, isOptimistic: false };
                    console.log("✅ RTM: Replacing optimistic comment with confirmed", { text: newComment.text });
                    return updated;
                  }
                }

                // For other users' messages or new own messages, add them
                console.log("✅ RTM: Adding new comment", {
                  text: newComment.text,
                  publisher,
                  userId: messageUserId,
                  isOwnMessage
                });
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
        });

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
      // Cleanup
      if (channelRef.current && clientRef.current) {
        const { client, name: channelName } = channelRef.current;
        if (channelName) {
          client.unsubscribe(channelName).catch(console.error);
        }
        channelRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.logout().catch(console.error);
        clientRef.current = null;
      }
      setIsConnected(false);
    };
  }, [appId, uid, token, channelName]);

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
            (c) => c.text === newComment.text &&
              c.userId === newComment.userId &&
              Math.abs((c.timestamp || 0) - newComment.timestamp) < 1000
          );
          if (exists) {
            console.log("⚠️ RTM: Comment already in local state");
            return prev;
          }
          console.log("✅ RTM: Adding comment to local state immediately", { text: newComment.text });
          return [...prev, newComment];
        });

        // Check if client is connected before publishing
        // Wait for connection if not ready (with timeout)
        let retries = 0;
        const maxRetries = 5;
        while (!isConnected && retries < maxRetries) {
          console.warn(`⚠️ RTM: Not connected, waiting... (${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        }

        if (!isConnected) {
          console.error("❌ RTM: Client not connected after waiting");
          throw new Error("RTM client is not connected. Please wait and try again.");
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
