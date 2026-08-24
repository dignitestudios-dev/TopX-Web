import { useEffect, useRef, useState, useCallback } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

export const useAgora = ({
  pageId,
  role,
  appId,
  token = null,
  uid = null,
  backendChannelName = null,
}) => {
  const clientRef = useRef(null);

  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);

  const [localVideo, setLocalVideo] = useState(null);
  const [localAudio, setLocalAudio] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const channelName = backendChannelName;

  // ✅ Initialize Agora client
  if (!clientRef.current && appId) {
    clientRef.current = AgoraRTC.createClient({
      mode: "live",
      codec: "vp8",
    });
  }

  // ✅ Attach event listeners reliably
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !appId) return;

    // 🔹 User published
    const handleUserPublished = async (user, mediaType) => {
      try {
        console.log(`📡 User ${user.uid} published ${mediaType}`);

        await client.subscribe(user, mediaType);
        console.log(`✅ Subscribed to user ${user.uid}`);

        setRemoteUsers((prev) => {
          const exists = prev.find((u) => u.uid === user.uid);
          // Return a NEW array to trigger React re-render so video is displayed
          if (exists) {
            return prev.map((u) => (u.uid === user.uid ? user : u));
          }
          return [...prev, user];
        });

        if (mediaType === "audio" && user.audioTrack) {
          try {
            user.audioTrack.play();
          } catch (err) {
            console.error("❌ Audio play failed:", err);
          }
        }
      } catch (err) {
        console.error("❌ Error subscribing to user:", err);
        setError(err.message || "Failed to subscribe");
      }
    };

    // 🔹 User unpublished
    const handleUserUnpublished = (user, mediaType) => {
      if (mediaType === "video") user.videoTrack?.stop();
      if (mediaType === "audio") user.audioTrack?.stop();
      
      // Force UI update
      setRemoteUsers((prev) => prev.map((u) => (u.uid === user.uid ? user : u)));
    };

    // 🔹 User left
    const handleUserLeft = (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
    };
  }, [appId]);

  // ✅ Unmount cleanup
  useEffect(() => {
    return () => {
      localAudioTrackRef.current?.stop();
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.stop();
      localVideoTrackRef.current?.close();
      
      const client = clientRef.current;
      if (client && (client.connectionState === "CONNECTED" || client.connectionState === "CONNECTING")) {
        client.leave().catch(console.error);
      }
    };
  }, []);

  // ✅ Join channel
  const join = useCallback(async () => {
    const client = clientRef.current;
    if (!client || !appId) return;

    setIsLoading(true);
    setError(null);

    try {
      await client.setClientRole(role === "host" ? "host" : "audience");

      if (!token) throw new Error("RTC token missing");
      if (!channelName) throw new Error("Channel name missing");
      if (uid === null || uid === undefined) throw new Error("UID missing");

      const numericUid = Number(uid);
      if (isNaN(numericUid)) throw new Error("Invalid UID");

      // For host: create media tracks BEFORE publishing
      let audioTrack = null;
      let videoTrack = null;

      if (role === "host") {
        try {
          [audioTrack, videoTrack] =
            await AgoraRTC.createMicrophoneAndCameraTracks();
            
          // Store tracks immediately so they are properly cleaned up if client.join fails
          localAudioTrackRef.current = audioTrack;
          localVideoTrackRef.current = videoTrack;
          setLocalAudio(audioTrack);
          setLocalVideo(videoTrack);
        } catch (trackErr) {
          console.error("❌ Failed to create Agora media tracks:", trackErr);
          const isPermissionDenied =
            trackErr?.code === "PERMISSION_DENIED" ||
            trackErr?.name === "NotAllowedError" ||
            trackErr?.name === "PermissionDeniedError" ||
            trackErr?.message?.toLowerCase().includes("permission") ||
            trackErr?.message?.toLowerCase().includes("notallowed");

          const userMsg = isPermissionDenied
            ? "Camera and microphone permissions were denied. Please allow access in your browser settings (click the lock icon in the address bar) and try again."
            : trackErr?.message || "Failed to access camera and microphone.";

          const permError = new Error(userMsg);
          permError.isPermissionDenied = isPermissionDenied;
          permError.code = trackErr?.code || trackErr?.name || "PERMISSION_DENIED";
          throw permError;
        }
      }

      await client.join(appId, channelName, token, numericUid);
      setIsJoined(true);

      if (role === "host" && audioTrack && videoTrack) {
        await client.publish([audioTrack, videoTrack]);
      }
    } catch (err) {
      console.error("❌ Join failed:", err);
      // Clean up any partially created tracks
      try {
        localAudioTrackRef.current?.stop();
        localAudioTrackRef.current?.close();
        localVideoTrackRef.current?.stop();
        localVideoTrackRef.current?.close();
        localAudioTrackRef.current = null;
        localVideoTrackRef.current = null;
        setLocalAudio(null);
        setLocalVideo(null);
        if (client.connectionState === "CONNECTED" || client.connectionState === "CONNECTING") {
          await client.leave();
        }
      } catch (cleanupErr) {
        console.warn("Error during join failure cleanup:", cleanupErr);
      }

      setError(err.message || "Failed to join live stream");
      setIsJoined(false);
    } finally {
      setIsLoading(false);
    }
  }, [role, appId, token, uid, channelName]);

  // ✅ Leave channel
  const leave = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    try {
      localAudioTrackRef.current?.stop();
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.stop();
      localVideoTrackRef.current?.close();

      localAudioTrackRef.current = null;
      localVideoTrackRef.current = null;

      if (isJoined) {
        await client.leave();
        setIsJoined(false);
      }

      setRemoteUsers([]);
      setLocalAudio(null);
      setLocalVideo(null);
    } catch (err) {
      console.error("❌ Leave failed:", err);
    }
  }, [isJoined]);

  return {
    join,
    leave,
    localVideo,
    localAudio,
    remoteUsers,
    isJoined,
    isLoading,
    error,
    setError,
  };
};
