import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useAgora } from "../../hooks/useAgora";
import { useRTM } from "../../hooks/useRTM";
import { startStream, joinStream, endStream } from "../../redux/slices/livestream.slice";
import { getPageDetail } from "../../redux/slices/pages.slice";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import LiveCommentsLikes from "../../components/livestream/LiveCommentsLikes";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Loader2,
} from "lucide-react";

const LiveStreampage = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { pageDetail, pageDetailLoading } = useSelector(
    (state) => state.pages
  );
  const { livestreamLoading, streamData } = useSelector(
    (state) => state.livestream
  );

  const [role, setRole] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const remoteVideosContainerRef = useRef(null);

  // Determine if user is page owner (host) or viewer (audience)
  useEffect(() => {
    const fromGoLive = location.state?.fromGoLive === true;

    const determineRole = async () => {
      try {
        // Shortcut: if coming from GoLive and streamData already exists, user is host
        if (
          fromGoLive &&
          streamData &&
          streamData.channelName &&
          streamData.rtcToken
        ) {
          console.log("StreamData already exists from GoLive, user is host");
          setRole("host");
          setIsInitializing(false);
          return;
        }

        // Try to fetch page details to check ownership
        const pageRes = await dispatch(getPageDetail(pageId));

        if (pageRes.meta.requestStatus === "fulfilled") {
          const page = pageRes.payload;
          const isOwner =
            page.owner?._id === user?._id ||
            page.ownerId === user?._id ||
            page.userId === user?._id;

          if (isOwner) {
            // Owner (host) - call startStream API
            setRole("host");
            
            const startRes = await dispatch(startStream(pageId));

            if (startRes.meta.requestStatus === "fulfilled") {
              setTimeout(() => {
                setIsInitializing(false);
              }, 100);
            } else {
              ErrorToast(
                startRes.payload || "Failed to start stream"
              );
              navigate("/home");
            }
          } else {
            // Viewer - call joinStream API
            setRole("audience");
            const joinRes = await dispatch(joinStream(pageId));

            if (joinRes.meta.requestStatus === "fulfilled") {
              setIsInitializing(false);
            } else {
              ErrorToast(
                joinRes.payload || "Failed to join stream"
              );
              navigate("/home");
            }
          }
        } else {
          // Page details API failed - default to audience (safer)
          console.warn("Page details API failed, defaulting to audience role");
          setRole("audience");
          const joinRes = await dispatch(joinStream(pageId));

          if (joinRes.meta.requestStatus === "fulfilled") {
            setIsInitializing(false);
          } else {
            ErrorToast(
              joinRes.payload || "Failed to join stream"
            );
            navigate("/home");
          }
        }
      } catch (error) {
        console.error("Error determining role:", error);
        // On error, default to audience
        setRole("audience");
        const joinRes = await dispatch(joinStream(pageId));
        
        if (joinRes.meta.requestStatus === "fulfilled") {
          setIsInitializing(false);
        } else {
          ErrorToast(error.message || "Failed to initialize stream");
          navigate("/home");
        }
      }
    };

    if (user && pageId) {
      determineRole();
    }
  }, [pageId, user, dispatch, navigate, streamData, location.state]);

  // Get Agora credentials from streamData - use EXACT values from backend
  const appId =
    streamData?.appId || 
    streamData?.app_id || 
    import.meta.env.VITE_AGORA_APP_ID || 
    "d2049131656f4ef389a7e743effcbeec";
  
  // Backend returns rtcToken - use EXACT value
  const token = streamData?.rtcToken || null;
  
  // Backend returns rtmToken for RTM messaging
  const rtmToken = streamData?.rtmToken || null;
  
  // Backend returns accountNumber as UID - convert to Number
  const uid = streamData?.accountNumber ? Number(streamData.accountNumber) : null;
  
  // Backend returns channelName - use EXACT value (no fallback)
  const channelName = streamData?.channelName || null;

  // Debug logging
  useEffect(() => {
    if (streamData) {
      console.log("Agora credentials from backend:", {
        appId,
        channelName,
        hasRtcToken: !!token,
        hasRtmToken: !!rtmToken,
        rtcTokenLength: token?.length || 0,
        rtmTokenLength: rtmToken?.length || 0,
        uid,
        uidType: typeof uid,
        streamData,
      });
    }
  }, [streamData, appId, token, rtmToken, uid, channelName]);

  // Log role before passing to useAgora
  useEffect(() => {
    console.log("🎭 Current role:", role, {
      isHost: role === "host",
      isAudience: role === "audience",
      shouldAccessCamera: role === "host"
    });
  }, [role]);

  const {
    join,
    leave,
    toggleVideo,
    toggleAudio,
    localVideo,
    localAudio,
    remoteUsers,
    isJoined,
    isLoading: agoraLoading,
    error: agoraError,
  } = useAgora({
    pageId,
    role: role || "audience", // Default to audience if role not set
    appId,
    token,
    uid,
    backendChannelName: channelName, // Use EXACT channelName from backend
  });

  // Initialize RTM for live comments and likes
  // Only initialize if we have all required RTM credentials
  const hasRTMParams = rtmToken && channelName && uid && appId;
  
  const {
    isConnected: rtmConnected,
    comments,
    likesCount,
    userLiked,
    error: rtmError,
    sendComment,
    sendLike,
  } = useRTM(
    hasRTMParams
      ? {
          appId,
          uid: String(uid), // RTM requires string UID
          token: rtmToken,
          channelName, // Same channelName as RTC
        }
      : { appId: "", uid: "", token: "", channelName: "" }
  );

  // Debug: Log comments updates in parent component
  useEffect(() => {
    console.log("📨 LiveStreampage: Comments state updated", {
      count: comments?.length || 0,
      hasRTMParams,
      rtmConnected,
      comments: comments?.map(c => ({
        id: c.id,
        text: c.text?.substring(0, 30),
        username: c.username,
        userId: c.userId,
      })) || [],
    });
  }, [comments, hasRTMParams, rtmConnected]);

  // RTM connection debug - moved after useRTM hook
  useEffect(() => {
    console.log("RTM Status:", {
      isConnected: rtmConnected,
      hasRtmToken: !!rtmToken,
      channelName,
      uid,
      error: rtmError,
    });
  }, [rtmConnected, rtmToken, channelName, uid, rtmError]);

  // Log RTM errors if any
  useEffect(() => {
    if (rtmError) {
      console.error("RTM Error:", rtmError);
      // Don't show error toast for RTM - it's not critical for stream
    }
  }, [rtmError]);

  // Join Agora channel when role is determined and streamData is ready
  useEffect(() => {
    // Wait for:
    // 1. Role to be determined
    // 2. Initialization to complete
    // 3. Not already joined
    // 4. Agora not loading
    // 5. All required data: streamData, channelName, token, uid
    const canJoin = 
      role && 
      !isInitializing && 
      !isJoined && 
      !agoraLoading &&
      streamData && 
      channelName && // Must have channelName from backend
      token && // Must have rtcToken from backend
      uid !== null && // Must have accountNumber (UID) from backend
      appId;

    if (canJoin) {
      console.log("Joining Agora channel:", { role, channelName, uid, hasToken: !!token });
      join();
    }
  }, [role, isInitializing, isJoined, agoraLoading, streamData, channelName, token, uid, appId, join]);

  // Handle local video display (HOST ONLY - no camera access for audience)
  useEffect(() => {
    // Only play local video if user is host
    if (role === "host" && localVideo && localVideoRef.current) {
      console.log("📹 Playing local video (host)", {
        hasLocalVideo: !!localVideo,
        hasRef: !!localVideoRef.current,
        isPlaying: localVideo.isPlaying,
      });
      
      try {
        const playPromise = localVideo.play(localVideoRef.current);
        // Handle promise if it exists
        if (playPromise && typeof playPromise.then === "function") {
          playPromise
            .then(() => {
              console.log("✅ Local video playing successfully");
            })
            .catch((err) => {
              console.error("❌ Error playing local video:", err);
            });
        } else {
          // If play() doesn't return a promise, it's still okay
          console.log("✅ Local video play() called (no promise returned)");
        }
      } catch (err) {
        console.error("❌ Error calling localVideo.play():", err);
      }
    } else if (role === "host" && !localVideo) {
      console.log("⏳ Host: Waiting for local video track...");
    }

    // For audience, ensure no local video is being displayed
    if (role === "audience" && localVideo) {
      console.warn("⚠️ Local video exists for audience role - stopping it");
      try {
        localVideo.stop();
      } catch (err) {
        console.error("Error stopping local video:", err);
      }
    }

    return () => {
      if (localVideo && role === "host") {
        try {
          localVideo.stop();
        } catch (err) {
          console.error("Error stopping local video in cleanup:", err);
        }
      }
    };
  }, [localVideo, role]);

  // Handle remote users video display (for audience to see host, and host to see other hosts)
  useEffect(() => {
    if (!remoteVideosContainerRef.current) {
      console.log("⚠️ Remote videos container not available");
      return;
    }

    // Process remote users for both roles:
    // - Audience sees host(s)
    // - Host can see other hosts (if multiple hosts exist)
    console.log(`📹 Processing ${remoteUsers.length} remote user(s) for ${role} role:`, remoteUsers);

    remoteUsers.forEach((user) => {
      const uid = user.uid.toString();
      console.log(`📹 Processing remote user ${uid}:`, {
        hasVideoTrack: !!user.videoTrack,
        hasAudioTrack: !!user.audioTrack,
        videoTrackState: user.videoTrack?.isPlaying,
      });

      // Handle video track
      if (user.videoTrack) {
        let div = remoteVideoRefs.current[uid];

        if (!div) {
          div = document.createElement("div");
          div.id = `remote-video-${uid}`;
          div.className = "w-full h-full bg-black";
          div.style.width = "100%";
          div.style.height = "100%";
          div.style.minWidth = "100%";
          div.style.minHeight = "100%";
          div.style.position = "absolute";
          div.style.top = "0";
          div.style.left = "0";
          // Video element will be inserted by Agora SDK
          remoteVideoRefs.current[uid] = div;
          remoteVideosContainerRef.current.appendChild(div);
          console.log(`✅ Created video container for remote user ${uid}`);
        }

        // Play video track - ensure it's not already playing
        if (user.videoTrack && div && !user.videoTrack.isPlaying) {
          try {
            const playPromise = user.videoTrack.play(div);
            if (playPromise && typeof playPromise.then === "function") {
              playPromise
                .then(() => {
                  console.log(`✅ Remote video playing for user ${uid}`);
                })
                .catch((err) => {
                  console.error(`❌ Error playing remote video for user ${uid}:`, err);
                });
            } else {
              console.log(`✅ Remote video play() called for user ${uid}`);
            }
          } catch (err) {
            console.error(`❌ Error calling play() for user ${uid}:`, err);
          }
        } else if (user.videoTrack && div && user.videoTrack.isPlaying) {
          // If already playing, just ensure it's in the right container
          console.log(`📹 Video already playing for user ${uid}`);
        }
      }

      // Play audio track
      if (user.audioTrack && !user.audioTrack.isPlaying) {
        try {
          const playPromise = user.audioTrack.play();
          if (playPromise && typeof playPromise.then === "function") {
            playPromise
              .then(() => {
                console.log(`✅ Remote audio playing for user ${uid}`);
              })
              .catch((err) => {
                console.error(`❌ Error playing remote audio for user ${uid}:`, err);
              });
          } else {
            console.log(`✅ Remote audio play() called for user ${uid}`);
          }
        } catch (err) {
          console.error(`❌ Error calling audio play() for user ${uid}:`, err);
        }
      }
    });

    // Cleanup removed users
    Object.keys(remoteVideoRefs.current).forEach((uid) => {
      const userExists = remoteUsers.find(
        (u) => u.uid.toString() === uid
      );
      if (!userExists) {
        const div = remoteVideoRefs.current[uid];
        if (div) {
          console.log(`🗑️ Cleaning up video container for user ${uid}`);
          if (div.parentNode) {
            div.parentNode.removeChild(div);
          }
        }
        delete remoteVideoRefs.current[uid];
      }
    });
  }, [remoteUsers, role]);

  // Update viewer count (simplified - in production, get from Agora stats)
  useEffect(() => {
    if (isJoined) {
      setViewerCount(remoteUsers.length + (role === "host" ? 1 : 0));
    }
  }, [remoteUsers.length, isJoined, role]);

  // Handle leave/end stream
  const handleEndStream = async () => {
    try {
      if (role === "host") {
        // End stream API call
        const endRes = await dispatch(endStream(pageId));
        if (endRes.meta.requestStatus === "fulfilled") {
          SuccessToast("Stream ended successfully");
        }
      }

      await leave();
      navigate("/home");
    } catch (error) {
      ErrorToast(error.message || "Failed to end stream");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup remote video refs
      Object.values(remoteVideoRefs.current).forEach((div) => {
        if (div && div.parentNode) {
          div.parentNode.removeChild(div);
        }
      });
      remoteVideoRefs.current = {};

      // Leave channel if still joined
      if (isJoined) {
        leave().catch(console.error);
      }
    };
  }, [isJoined, leave]);

  // Show loading state
  if (isInitializing || pageDetailLoading || livestreamLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">
            {isInitializing
              ? "Initializing stream..."
              : "Loading stream..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (agoraError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <p className="text-xl mb-4">Stream Error</p>
          <p className="text-gray-400 mb-6">{agoraError}</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Live Comments & Likes Sidebar */}
      {rtmToken && hasRTMParams && (
        <LiveCommentsLikes
          comments={comments || []}
          likesCount={likesCount || 0}
          userLiked={userLiked || false}
          onSendComment={async (text, userInfo) => {
            try {
              if (sendComment) {
                const result = await sendComment(text, userInfo);
                return result;
              }
            } catch (err) {
              console.error("Error in sendComment:", err);
            }
            return false;
          }}
          onToggleLike={async () => {
            try {
              if (sendLike) {
                await sendLike(userLiked ? "remove" : "add");
              }
            } catch (err) {
              console.error("Error in sendLike:", err);
            }
          }}
          user={user}
          isConnected={rtmConnected || false}
        />
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleEndStream}
              className="text-white hover:text-gray-300"
            >
              ← Back
            </button>
            {pageDetail && (
              <div>
                <h1 className="text-lg font-semibold">{pageDetail.name}</h1>
                <p className="text-sm text-gray-400">Live Now</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">LIVE</span>
            {viewerCount > 0 && (
              <span className="text-sm ml-2 flex items-center gap-1">
                <Users className="w-4 h-4" />
                {viewerCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative w-full h-screen bg-black">
        {/* Local Video (Host Only) */}
        {role === "host" && (
          <div className="absolute inset-0 bg-black">
            {localVideo ? (
              <div
                ref={localVideoRef}
                className="w-full h-full bg-black"
                style={{
                  width: "100%",
                  height: "100%",
                  minWidth: "100%",
                  minHeight: "100%",
                }}
              ></div>
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
                  <p>Starting your stream...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Remote Videos (Audience sees host, Host can see other hosts) */}
        {(role === "audience" || (role === "host" && remoteUsers.length > 0)) && (
          <div
            ref={remoteVideosContainerRef}
            id="remote-videos-container"
            className="absolute inset-0 bg-black"
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            {remoteUsers.length === 0 && !isJoined && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                <div>
                  <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
                  <p>Connecting to stream...</p>
                </div>
              </div>
            )}
            {remoteUsers.length === 0 && isJoined && role === "audience" && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                <div>
                  <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
                  <p>Waiting for host to start streaming...</p>
                </div>
              </div>
            )}
            {remoteUsers.length > 0 && (
              <div className="text-white text-sm absolute top-4 left-4 bg-black/50 px-2 py-1 rounded z-10">
                {remoteUsers.length} user(s) streaming
              </div>
            )}
            {/* Remote videos will be rendered here by the useEffect */}
          </div>
        )}


        {/* Controls (Host only) */}
        {role === "host" && isJoined && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full ${
                  localVideo?.isPlaying !== false
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-red-600 hover:bg-red-700"
                } transition-colors`}
              >
                {localVideo?.isPlaying !== false ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full ${
                  localAudio?.isPlaying !== false
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-red-600 hover:bg-red-700"
                } transition-colors`}
              >
                {localAudio?.isPlaying !== false ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={handleEndStream}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Audience View - Show message */}
        {role === "audience" && remoteUsers.length === 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-center">
              <p className="text-lg mb-2">Waiting for stream to start...</p>
              <button
                onClick={handleEndStream}
                className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Leave Stream
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreampage;
