import { useEffect, useRef, useState, useCallback } from "react";

export const useRTM = ({ appId, uid, token, channelName }) => {
  const clientRef = useRef(null);
  const channelRef = useRef(null);
  const messageHandlerRef = useRef(null); // Store message handler for cleanup

  const [isConnected, setIsConnected] = useState(false);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
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

    let isMounted = true;

    const initRTM = async () => {
      try {
        console.log("✅ RTM: Initializing...", { appId, uid, channelName });

        // Dynamically import agora-rtm
        let RTMClass;
        try {
          const rtmModule = await import("agora-rtm");
          const RTMExport = rtmModule.default || rtmModule;
          RTMClass = RTMExport.RTM || RTMExport;
        } catch (importError) {
          throw new Error(`Failed to import agora-rtm: ${importError.message}`);
        }

        if (!RTMClass || typeof RTMClass !== "function") {
          throw new Error(`RTM class not found`);
        }

        // Create fresh RTM client instance per mount
        const client = new RTMClass(appId, String(uid));
        clientRef.current = client;
        
        client.addEventListener("status", (event) => {
          if (!isMounted) return;
          console.log("📡 RTM: Connection status changed", event);
          if (event.state === "CONNECTED") {
            setIsConnected(true);
          } else if (
            event.state === "DISCONNECTED" ||
            event.state === "RECONNECTING"
          ) {
            setIsConnected(false);
            setViewerCount(0);
          }
        });

        // ✅ Add Presence Listener for Viewer Count
        client.addEventListener("presence", (event) => {
          if (!isMounted) return;
          
          if (event.eventType === "SNAPSHOT") {
            // Snapshot gives us the initial list of users currently in the channel
            setViewerCount(event.snapshot.length);
          } else if (event.eventType === "REMOTE_JOIN") {
            setViewerCount((prev) => prev + 1);
          } else if (
            event.eventType === "REMOTE_LEAVE" ||
            event.eventType === "REMOTE_TIMEOUT"
          ) {
            setViewerCount((prev) => Math.max(0, prev - 1));
          }
        });

        await client.login({ token });
        
        // If unmounted while logging in, instantly log out
        if (!isMounted) {
          client.logout().catch(() => {});
          return;
        }

        console.log("✅ RTM: Logged in successfully");

        // Subscribe to channel messages (agora-rtm 2.x uses subscribe method)
        await client.subscribe(channelName, {
          withMessage: true,
          withPresence: true, // Enable presence to track viewers
          types: ["msg"],
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
            const messageText = event.message;
            const publisher = event.publisher || "Unknown";

            let data;
            if (typeof messageText === "string") {
              try {
                data = JSON.parse(messageText);
              } catch {
                data = {
                  customType: "msg",
                  msg: messageText,
                  userName: publisher,
                };
              }
            } else {
              data = {
                customType: "msg",
                msg: String(messageText),
                userName: publisher,
              };
            }

            // Normalize comment detection: accept msg even without type
            const isComment =
              (data.customType && data.customType === "comment") ||
              typeof data.msg === "string" ||
              typeof data.text === "string" ||
              typeof data.comment === "string";

            if (isComment) {
              const messageUserId = String(data.userId || publisher);
              const currentUserId = String(uid);
              const isOwnMessage = messageUserId === currentUserId;

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
                // Always add comment from other users (ignore duplicate timestamp check)
                if (!isOwnMessage) {
                  return [...prev, { ...newComment, isOptimistic: false }];
                }

                // Handle own message with optimistic update
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
                  return updated;
                }

                return [...prev, { ...newComment, isOptimistic: false }];
              });
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
      isMounted = false;
      if (clientRef.current) {
        const client = clientRef.current;

        try {
          if (messageHandlerRef.current) {
            client.removeEventListener("message", messageHandlerRef.current);
            messageHandlerRef.current = null;
          }

          if (channelRef.current?.name) {
            client.unsubscribe(channelRef.current.name).catch(() => { });
          }

          client.logout().catch(() => { });
        } catch (e) {
          console.warn("RTM cleanup warning:", e);
        }

        clientRef.current = null;
      }

      setIsConnected(false);
    };
  }, [appId, channelName, token, uid]);

  // Send comment function
  const sendComment = useCallback(
    async (text, userInfo) => {
      if (!channelRef.current || !text?.trim()) return false;
      const { client, name: channelName } = channelRef.current;

      const payload = {
        msg: text.trim(),
        userId: String(uid),
        userName: userInfo?.username || "Anonymous",
        profilePicture: userInfo?.profilePicture || null,
      };

      // Optimistic UI
      setComments((prev) => [
        {
          id: `comment-${Date.now()}-${Math.random()}-${uid}`,
          username: payload.userName,
          text: payload.msg,
          profilePicture: payload.profilePicture,
          userId: String(uid),
          timestamp: Date.now(),
          isOptimistic: true,
        },
        ...prev,
      ]);

      // ✅ Send with correct customType argument
      await client.publish(channelName, JSON.stringify(payload), {
        customType: "msg",
      });
      return true;
    },
    [uid]
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
        await client.publish(
          channelName,
          JSON.stringify(payload),
          { customType: "msg" }
        ); // <- this is important

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
    viewerCount,
  };
};
