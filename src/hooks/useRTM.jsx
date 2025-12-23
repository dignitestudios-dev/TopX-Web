import { useEffect, useRef, useState, useCallback } from "react";
import AgoraRTM from "agora-rtm";


export const useRTM = ({ appId, uid, token, channelName }) => {
  const clientRef = useRef(null);
  const channelRef = useRef(null);
  const isInitializedRef = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Early return if any required parameter is missing or empty
    if (!appId || !uid || !token || !channelName ||
      appId === "" || uid === "" || token === "" || channelName === "") {
      console.log("RTM: Missing required parameters, skipping initialization", {
        hasAppId: !!appId && appId !== "",
        hasUid: !!uid && uid !== "",
        hasToken: !!token && token !== "",
        hasChannelName: !!channelName && channelName !== ""
      });
      setIsConnected(false);
      isInitializedRef.current = false;
      return;
    }

    // Only initialize once when all params exist
    if (isInitializedRef.current) {
      return;
    }

    const initRTM = async () => {
      try {
        console.log("RTM init with:", { appId, uid, channelName });

        const client = AgoraRTM.RTM.createInstance(appId);
        clientRef.current = client;

        await client.login({
          uid: String(uid),
          token,
        });

        const channel = client.createChannel(channelName);
        channelRef.current = channel;

        channel.on("ChannelMessage", ({ text }, senderId) => {
          const data = JSON.parse(text);

          if (data.type === "comment") {
            setComments((prev) => [...prev, data]);
          }

          if (data.type === "like") {
            setLikesCount((prev) => prev + 1);
          }
        });

        await channel.join();

        isInitializedRef.current = true;

        // Important delay (Agora RTM quirk)
        setTimeout(() => setIsConnected(true), 300);

        console.log("RTM connected");
      } catch (err) {
        console.error("RTM init failed:", err);
        setError(err.message);
        setIsConnected(false);
        isInitializedRef.current = false;
      }
    };


    initRTM();

    return () => {
      isInitializedRef.current = false;
      channelRef.current?.leave();
      clientRef.current?.logout();
      setIsConnected(false);
    };
  }, [appId, uid, token, channelName]);

  const sendComment = useCallback(async (text, userInfo) => {
    // Check channel existence instead of isConnected state
    if (!channelRef.current) {
      console.warn("RTM channel not ready, cannot send comment");
      return false;
    }

    try {
      const message = {
        type: "comment",
        id: Date.now().toString(),
        text: text.trim(),
        username: userInfo?.username || "Anonymous",
        profilePicture: userInfo?.profilePicture || null,
        timestamp: Date.now(),
      };

      await channelRef.current.sendMessage({
        text: JSON.stringify(message),
      });

      console.log("Comment sent via RTM:", message);
      return true;
    } catch (err) {
      console.error("Error sending comment:", err);
      setError(err.message || "Failed to send comment");
      return false;
    }
  }, []);

  const sendLike = useCallback(async (action = "add") => {
    // Check channel existence instead of isConnected state
    if (!channelRef.current) {
      console.warn("RTM channel not ready, cannot send like");
      return false;
    }

    try {
      await channelRef.current.sendMessage({
        text: JSON.stringify({
          type: "like",
          action: action, // "add" or "remove"
          timestamp: Date.now(),
        }),
      });

      // Update local state immediately for better UX
      if (action === "add") {
        setUserLiked(true);
        setLikesCount((prev) => prev + 1);
      } else {
        setUserLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      }

      return true;
    } catch (err) {
      console.error("Error sending like:", err);
      setError(err.message || "Failed to send like");
      return false;
    }
  }, []);

  // Treat channelRef existence as connected for UI purposes
  const isChannelReady = !!channelRef.current;

  return {
    isConnected: isConnected || isChannelReady, // Use channel existence as fallback
    comments,
    likesCount,
    userLiked,
    error,
    sendComment,
    sendLike,
  };
};
