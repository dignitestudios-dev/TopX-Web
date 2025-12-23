import { useEffect, useRef, useState, useCallback } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

/**
 * Custom hook for Agora RTC livestream functionality
 * @param {string} pageId - The page ID for the stream
 * @param {string} role - "host" or "audience"
 * @param {string} appId - Agora App ID
 * @param {string} token - Agora token (optional, can be null for testing)
 * @param {number} uid - User ID (optional, Agora will generate if not provided)
 * @param {string} backendChannelName - Channel name from backend (if provided, use this instead of page_${pageId})
 */
export const useAgora = ({ pageId, role, appId, token = null, uid = null, backendChannelName = null }) => {
  const clientRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const localAudioTrackRef = useRef(null);

  const [localVideo, setLocalVideo] = useState(null);
  const [localAudio, setLocalAudio] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use EXACT channel name from backend (no fallback)
  const channelName = backendChannelName;

  // Initialize Agora client
  useEffect(() => {
    if (!appId) {
      setError("Agora App ID is required");
      return;
    }

    try {
      clientRef.current = AgoraRTC.createClient({
        mode: "live",
        codec: "vp8",
      });

      const client = clientRef.current;

      // Handle remote user publishing
      client.on("user-published", async (user, mediaType) => {
        try {
          await client.subscribe(user, mediaType);

          setRemoteUsers((prev) => {
            // Avoid duplicates
            const exists = prev.find((u) => u.uid === user.uid);
            if (exists) return prev;
            return [...prev, user];
          });

          // Play audio track
          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
          }
        } catch (err) {
          console.error("Error subscribing to user:", err);
          setError(err.message || "Failed to subscribe to user");
        }
      });

      // Handle remote user unpublishing
      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") {
          user.videoTrack?.stop();
        }
        if (mediaType === "audio") {
          user.audioTrack?.stop();
        }
      });

      // Handle remote user leaving
      client.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      // Handle connection state changes
      client.on("connection-state-change", (curState, revState) => {
        console.log("Connection state changed:", curState, revState);
      });

      // Cleanup on unmount
      return () => {
        if (client) {
          client.removeAllListeners();
          if (isJoined) {
            client.leave().catch(console.error);
          }
        }
      };
    } catch (err) {
      console.error("Error initializing Agora client:", err);
      setError(err.message || "Failed to initialize Agora client");
    }
  }, [appId, pageId, isJoined]);

  // Join channel
  const join = useCallback(async () => {
    if (!clientRef.current || !appId) {
      setError("Client not initialized or App ID missing");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = clientRef.current;

      // Set client role (host or audience)
      await client.setClientRole(role);

      // Join the channel with EXACT backend values
      // Validate all required parameters
      if (!token) {
        throw new Error("rtcToken is required from backend. Please check backend response.");
      }
      
      if (!channelName) {
        console.error("❌ Channel name is required from backend");
        throw new Error("channelName is required from backend. Please check backend response.");
      }

      // UID must be a Number (from accountNumber) - do NOT pass null
      if (uid === null || uid === undefined) {
        throw new Error("UID (accountNumber) is required from backend. Cannot join without UID.");
      }
      
      const actualUid = Number(uid); // Ensure it's a Number
      
      if (isNaN(actualUid)) {
        throw new Error(`Invalid UID: ${uid}. Must be a valid number.`);
      }

      console.log("Joining Agora with backend values:", {
        appId,
        channelName,
        tokenLength: token.length,
        uid: actualUid,
        uidType: typeof actualUid,
        role,
      });
      
      // Join with EXACT parameters from backend: appId, channelName, rtcToken, Number(accountNumber)
      await client.join(appId, channelName, token, actualUid);

      setIsJoined(true);

      // If host, create and publish local tracks
      if (role === "host") {
        try {
          // Create microphone and camera tracks
          const [audioTrack, videoTrack] =
            await AgoraRTC.createMicrophoneAndCameraTracks(
              {
                encoderConfig: {
                  bitrateMax: 1000,
                  bitrateMin: 500,
                  frameRate: 30,
                  width: 1280,
                  height: 720,
                },
              },
              {
                encoderConfig: {
                  bitrateMax: 1000,
                  bitrateMin: 500,
                  frameRate: 30,
                  width: 1280,
                  height: 720,
                },
              }
            );

          localAudioTrackRef.current = audioTrack;
          localVideoTrackRef.current = videoTrack;

          setLocalAudio(audioTrack);
          setLocalVideo(videoTrack);

          // Publish tracks
          await client.publish([audioTrack, videoTrack]);
        } catch (trackError) {
          console.error("Error creating local tracks:", trackError);
          setError(
            trackError.message || "Failed to access camera/microphone"
          );
          // Still joined, just no local tracks
        }
      }
    } catch (err) {
      console.error("Error joining channel:", err);
      setError(err.message || "Failed to join channel");
      setIsJoined(false);
    } finally {
      setIsLoading(false);
    }
  }, [role, channelName, appId, token, uid]);

  // Leave channel and cleanup
  const leave = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop and close local tracks
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }

      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }

      setLocalAudio(null);
      setLocalVideo(null);

      // Leave channel
      if (clientRef.current && isJoined) {
        await clientRef.current.leave();
        setIsJoined(false);
      }

      // Clear remote users
      setRemoteUsers([]);
    } catch (err) {
      console.error("Error leaving channel:", err);
      setError(err.message || "Failed to leave channel");
    } finally {
      setIsLoading(false);
    }
  }, [isJoined]);

  // Toggle local video
  const toggleVideo = useCallback(async () => {
    if (localVideoTrackRef.current) {
      try {
        await localVideoTrackRef.current.setEnabled(
          !localVideoTrackRef.current.isPlaying
        );
      } catch (err) {
        console.error("Error toggling video:", err);
        setError(err.message || "Failed to toggle video");
      }
    }
  }, []);

  // Toggle local audio
  const toggleAudio = useCallback(async () => {
    if (localAudioTrackRef.current) {
      try {
        await localAudioTrackRef.current.setEnabled(
          !localAudioTrackRef.current.isPlaying
        );
      } catch (err) {
        console.error("Error toggling audio:", err);
        setError(err.message || "Failed to toggle audio");
      }
    }
  }, []);

  return {
    join,
    leave,
    toggleVideo,
    toggleAudio,
    localVideo,
    localAudio,
    remoteUsers,
    isJoined,
    isLoading,
    error,
  };
};

