import { useEffect, useRef, useState, useCallback } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useSelector } from "react-redux";

export const useAgora = ({
  pageId,
  role,
  appId,
  token = null,
  uid = null,
  backendChannelName = null,
  onRemoteUserLeft = null,
}) => {
  const clientRef = useRef(null);
  const onRemoteUserLeftRef = useRef(onRemoteUserLeft);
  onRemoteUserLeftRef.current = onRemoteUserLeft;
  const { user } = useSelector((state) => state.auth);

  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);

  const [localVideo, setLocalVideo] = useState(null);
  const [localAudio, setLocalAudio] = useState(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
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
      console.log("USER PUBLISHED", {
        remoteUid: user.uid,
        mediaType,
        myUid: client.uid,
        channelName,
      });
      try {
        console.log(`📡 User ${user.uid} published ${mediaType}`);

        await client.subscribe(user, mediaType);
        console.log(`✅ Subscribed to user ${user.uid}`);

        setRemoteUsers((prev) => {
          const exists = prev.find((u) => String(u.uid) === String(user.uid));
          const updatedUser = {
            ...(exists || {}),
            ...user,
            hasVideo: mediaType === "video" ? true : (exists?.hasVideo ?? user.hasVideo),
            hasAudio: mediaType === "audio" ? true : (exists?.hasAudio ?? user.hasAudio),
            videoTrack: mediaType === "video" ? user.videoTrack : (exists?.videoTrack || user.videoTrack),
            audioTrack: mediaType === "audio" ? user.audioTrack : (exists?.audioTrack || user.audioTrack),
          };

          if (exists) {
            return prev.map((u) => (String(u.uid) === String(user.uid) ? updatedUser : u));
          }
          return [...prev, updatedUser];
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
      console.log(`📡 Remote user ${user.uid} unpublished ${mediaType}`);
      if (mediaType === "video") {
        try {
          user.videoTrack?.stop();
        } catch (e) {
          // ignore
        }
      }
      if (mediaType === "audio") {
        try {
          user.audioTrack?.stop();
        } catch (e) {
          // ignore
        }
      }

      setRemoteUsers((prev) =>
        prev.map((u) => {
          if (String(u.uid) === String(user.uid)) {
            return {
              ...u,
              ...user,
              hasVideo: mediaType === "video" ? false : u.hasVideo,
              hasAudio: mediaType === "audio" ? false : u.hasAudio,
              videoTrack: mediaType === "video" ? null : u.videoTrack,
              audioTrack: mediaType === "audio" ? null : u.audioTrack,
            };
          }
          return u;
        })
      );
    };

    // 🔹 User mute video
    const handleUserMuteVideo = (user, isMuted) => {
      console.log(`📡 Remote user ${user.uid} mute video: ${isMuted}`);
      setRemoteUsers((prev) =>
        prev.map((u) => {
          if (String(u.uid) === String(user.uid)) {
            return {
              ...u,
              ...user,
              hasVideo: !isMuted,
              videoTrack: isMuted ? null : (user.videoTrack || u.videoTrack),
            };
          }
          return u;
        })
      );
    };

    // 🔹 User mute audio
    const handleUserMuteAudio = (user, isMuted) => {
      console.log(`📡 Remote user ${user.uid} mute audio: ${isMuted}`);
      setRemoteUsers((prev) =>
        prev.map((u) => {
          if (String(u.uid) === String(user.uid)) {
            return {
              ...u,
              ...user,
              hasAudio: !isMuted,
              audioTrack: isMuted ? null : (user.audioTrack || u.audioTrack),
            };
          }
          return u;
        })
      );
    };

    // 🔹 User left
    const handleUserLeft = (user) => {
      console.log(`👋 Remote user ${user.uid} left channel`);
      setRemoteUsers((prev) => prev.filter((u) => String(u.uid) !== String(user.uid)));
      if (typeof onRemoteUserLeftRef.current === "function") {
        onRemoteUserLeftRef.current(user);
      }
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-mute-video", handleUserMuteVideo);
    client.on("user-mute-audio", handleUserMuteAudio);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-mute-video", handleUserMuteVideo);
      client.off("user-mute-audio", handleUserMuteAudio);
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
          setIsAudioMuted(false);
          setIsVideoMuted(false);
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
      console.log("🔥 AGORA JOINED", {
        role,
        myUid: client.uid,
        numericUid: numericUid,
        // returnedUid,
        channelName, appId,
        connectionState: client.connectionState,
      });
      console.log("🔍 STREAM UID SOURCE", {
        // streamAccountNumber: streamData?.accountNumber,
        currentUser: user,
        currentUserId: user?.id,
        currentAccountNumber: user?.accountNumber,
      });
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
      setIsAudioMuted(false);
      setIsVideoMuted(false);
    } catch (err) {
      console.error("❌ Leave failed:", err);
    }
  }, [isJoined]);

  // ✅ Toggle Media
  const toggleAudio = useCallback(async () => {
    if (localAudio) {
      const client = clientRef.current;
      const newMutedState = !isAudioMuted;
      try {
        await localAudio.setMuted(newMutedState);
        if (client && (client.connectionState === "CONNECTED" || client.connectionState === "CONNECTING")) {
          if (newMutedState) {
            await client.unpublish(localAudio);
          } else {
            await client.publish(localAudio);
          }
        }
      } catch (err) {
        console.error("❌ Error toggling audio track:", err);
      }
      setIsAudioMuted(newMutedState);
    }
  }, [localAudio, isAudioMuted]);

  const toggleVideo = useCallback(async () => {
    if (localVideo) {
      const client = clientRef.current;
      const newMutedState = !isVideoMuted;
      try {
        await localVideo.setMuted(newMutedState);
        if (client && (client.connectionState === "CONNECTED" || client.connectionState === "CONNECTING")) {
          if (newMutedState) {
            await client.unpublish(localVideo);
          } else {
            await client.publish(localVideo);
          }
        }
      } catch (err) {
        console.error("❌ Error toggling video track:", err);
      }
      setIsVideoMuted(newMutedState);
    }
  }, [localVideo, isVideoMuted]);

  return {
    join,
    leave,
    toggleVideo,
    toggleAudio,
    isVideoMuted,
    isAudioMuted,
    localVideo,
    localAudio,
    remoteUsers,
    isJoined,
    isLoading,
    error,
    setError,
  };
};
