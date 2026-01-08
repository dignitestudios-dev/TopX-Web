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
  const hasInitializedRef = useRef(false);

  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);

  const [localVideo, setLocalVideo] = useState(null);
  const [localAudio, setLocalAudio] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const channelName = backendChannelName;

  // ✅ Initialize Agora client ONCE
  useEffect(() => {
    if (!appId || hasInitializedRef.current) return;

    hasInitializedRef.current = true;

    const client = AgoraRTC.createClient({
      mode: "live",
      codec: "vp8",
    });

    clientRef.current = client;

    // 🔹 User published
    client.on("user-published", async (user, mediaType) => {
      try {
        console.log(`📡 User ${user.uid} published ${mediaType}`);

        await client.subscribe(user, mediaType);
        console.log(`✅ Subscribed to user ${user.uid}`);

        setRemoteUsers((prev) => {
          const exists = prev.find((u) => u.uid === user.uid);
          return exists ? prev : [...prev, user];
        });

        // ✅ FIXED audio play
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
    });

    // 🔹 User unpublished
    client.on("user-unpublished", (user, mediaType) => {
      if (mediaType === "video") user.videoTrack?.stop();
      if (mediaType === "audio") user.audioTrack?.stop();
    });

    // 🔹 User left
    client.on("user-left", (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    return () => {
      client.removeAllListeners();
    };
  }, [appId]);

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

      await client.join(appId, channelName, token, numericUid);
      setIsJoined(true);

      if (role === "host") {
        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();

        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        setLocalAudio(audioTrack);
        setLocalVideo(videoTrack);

        await client.publish([audioTrack, videoTrack]);
      }
    } catch (err) {
      console.error("❌ Join failed:", err);
      setError(err.message);
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
  };
};
