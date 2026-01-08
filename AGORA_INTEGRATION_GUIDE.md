# Agora Live Streaming Integration Guide

## Overview

This guide provides complete instructions for implementing cross-platform live streaming with Agora RTC (video/audio) and RTM (messaging) for Web ↔ Web, Web ↔ App, and App ↔ App scenarios.

## Key Features

✅ **Cross-platform compatibility**: Web ↔ Web, Web ↔ App, App ↔ Web  
✅ **Unique UIDs**: Each participant gets a unique UID, even on the same device/browser  
✅ **No infinite loops**: Proper singleton pattern prevents duplicate API calls  
✅ **Real-time messaging**: Comments, likes, and custom messages sync across platforms  
✅ **Proper cleanup**: Event listeners and resources are properly managed  
✅ **Error handling**: Comprehensive error handling and recovery  

## Web Implementation

### Dependencies

```json
{
  "agora-rtc-sdk-ng": "^4.24.2",
  "agora-rtm": "^2.2.3-2"
}
```

### Usage Example

```jsx
import { useAgora } from './hooks/useAgora';
import { useRTM } from './hooks/useRTM';

function LiveStreamPage() {
  const { user } = useSelector(state => state.auth);
  const { streamData } = useSelector(state => state.livestream);
  
  // Extract credentials from backend
  const appId = streamData?.appId || "YOUR_APP_ID";
  const rtcToken = streamData?.rtcToken;
  const rtmToken = streamData?.rtmToken;
  const uid = streamData?.accountNumber ? Number(streamData.accountNumber) : null;
  const channelName = streamData?.channelName;
  const role = streamData?.role || "audience"; // "host" or "audience"

  // Initialize RTC for video/audio
  const {
    join: joinRTC,
    leave: leaveRTC,
    toggleVideo,
    toggleAudio,
    localVideo,
    localAudio,
    remoteUsers,
    isJoined: isRTCJoined,
    isLoading: rtcLoading,
    error: rtcError,
  } = useAgora({
    pageId: pageId,
    role: role,
    appId: appId,
    token: rtcToken,
    uid: uid,
    backendChannelName: channelName,
  });

  // Initialize RTM for messaging
  const {
    isConnected: rtmConnected,
    comments,
    likesCount,
    userLiked,
    error: rtmError,
    sendComment,
    sendLike,
  } = useRTM(
    rtmToken && channelName && uid && appId
      ? {
          appId: appId,
          uid: String(uid), // RTM requires string UID
          token: rtmToken,
          channelName: channelName,
        }
      : { appId: "", uid: "", token: "", channelName: "" }
  );

  // Join RTC channel when ready
  useEffect(() => {
    if (role && !isRTCJoined && !rtcLoading && rtcToken && channelName && uid) {
      joinRTC();
    }
  }, [role, isRTCJoined, rtcLoading, rtcToken, channelName, uid, joinRTC]);

  // Send comment
  const handleSendComment = async (text) => {
    await sendComment(text, {
      username: user?.username || "Anonymous",
      profilePicture: user?.profilePicture || null,
    });
  };

  // Send like
  const handleToggleLike = async () => {
    await sendLike(userLiked ? "remove" : "add");
  };

  return (
    <div>
      {/* Video rendering */}
      {localVideo && (
        <div ref={localVideoRef}></div>
      )}
      
      {/* Comments */}
      <div>
        {comments.map(comment => (
          <div key={comment.id}>
            <strong>{comment.username}:</strong> {comment.text}
          </div>
        ))}
      </div>
      
      {/* Like button */}
      <button onClick={handleToggleLike}>
        ❤️ {likesCount}
      </button>
    </div>
  );
}
```

## Mobile (Android/iOS) Implementation

### Android Setup

#### 1. Add Dependencies

**build.gradle (app level)**
```gradle
dependencies {
    implementation 'io.agora.rtc:full-sdk:4.5.0'
    implementation 'io.agora.rtm:rtm-sdk:1.5.1'
}
```

#### 2. Initialize RTC Engine

```kotlin
import io.agora.rtc2.*
import io.agora.rtc2.video.VideoCanvas

class LiveStreamActivity : AppCompatActivity() {
    private var rtcEngine: RtcEngine? = null
    private var rtmClient: RtmClient? = null
    private var rtmChannel: RtmChannel? = null
    
    private fun initializeRTC() {
        try {
            val config = RtcEngineConfig().apply {
                mContext = applicationContext
                mAppId = "YOUR_APP_ID"
                mEventHandler = rtcEventHandler
            }
            rtcEngine = RtcEngine.create(config)
            
            // Enable video
            rtcEngine?.enableVideo()
            rtcEngine?.startPreview()
            
            // Setup local video
            val surfaceView = SurfaceView(this)
            localVideoContainer.addView(surfaceView)
            rtcEngine?.setupLocalVideo(
                VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, 0)
            )
        } catch (e: Exception) {
            Log.e("RTC", "Initialization failed: ${e.message}")
        }
    }
    
    private fun joinRTCChannel(token: String, channelName: String, uid: Int, role: String) {
        val options = ChannelMediaOptions().apply {
            clientRoleType = if (role == "host") {
                Constants.CLIENT_ROLE_BROADCASTER
            } else {
                Constants.CLIENT_ROLE_AUDIENCE
            }
            channelProfile = Constants.CHANNEL_PROFILE_LIVE_BROADCASTING
            publishMicrophoneTrack = role == "host"
            publishCameraTrack = role == "host"
        }
        
        rtcEngine?.joinChannel(token, channelName, uid, options)
    }
    
    // RTC Event Handler
    private val rtcEventHandler = object : IRtcEngineEventHandler() {
        override fun onUserJoined(uid: Int, elapsed: Int) {
            runOnUiThread {
                // Setup remote video
                val surfaceView = SurfaceView(this@LiveStreamActivity)
                remoteVideoContainer.addView(surfaceView)
                rtcEngine?.setupRemoteVideo(
                    VideoCanvas(surfaceView, VideoCanvas.RENDER_MODE_FIT, uid)
                )
            }
        }
        
        override fun onUserOffline(uid: Int, reason: Int) {
            runOnUiThread {
                // Remove remote video
                remoteVideoContainer.removeAllViews()
            }
        }
        
        override fun onJoinChannelSuccess(channel: String?, uid: Int, elapsed: Int) {
            Log.d("RTC", "Joined channel successfully: $channel, uid: $uid")
        }
        
        override fun onError(err: Int) {
            Log.e("RTC", "Error: $err")
        }
    }
}
```

#### 3. Initialize RTM Client

```kotlin
import io.agora.rtm.*

private fun initializeRTM(appId: String, uid: String, token: String) {
    try {
        rtmClient = RtmClient.createInstance(this, appId, object : RtmClientListener {
            override fun onConnectionStateChanged(state: Int, reason: Int) {
                when (state) {
                    RtmClientConnectionState.CONNECTED -> {
                        Log.d("RTM", "Connected")
                        joinRTMChannel(channelName, token)
                    }
                    RtmClientConnectionState.DISCONNECTED -> {
                        Log.d("RTM", "Disconnected")
                    }
                }
            }
            
            override fun onMessageReceived(message: RtmMessage, peerId: String?) {
                // Handle peer-to-peer messages if needed
            }
        })
        
        // Login
        rtmClient?.login(token, object : ResultCallback<Void> {
            override fun onSuccess(responseInfo: Void?) {
                Log.d("RTM", "Login successful")
                joinRTMChannel(channelName, token)
            }
            
            override fun onFailure(errorInfo: ErrorInfo) {
                Log.e("RTM", "Login failed: ${errorInfo.errorDescription}")
            }
        })
    } catch (e: Exception) {
        Log.e("RTM", "Initialization failed: ${e.message}")
    }
}

private fun joinRTMChannel(channelName: String, token: String) {
    rtmChannel = rtmClient?.createChannel(channelName, object : RtmChannelListener {
        override fun onMessageReceived(message: RtmMessage, fromMember: RtmChannelMember?) {
            // Parse and handle message
            val messageText = message.text
            try {
                val data = JSONObject(messageText)
                val type = data.optString("type", "comment")
                
                when (type) {
                    "comment" -> {
                        val comment = Comment(
                            id = data.optString("id"),
                            username = data.optString("userName"),
                            text = data.optString("msg"),
                            userId = data.optString("userId"),
                            timestamp = data.optLong("timestamp")
                        )
                        // Update UI with comment
                        runOnUiThread {
                            addCommentToUI(comment)
                        }
                    }
                    "like" -> {
                        val action = data.optString("action")
                        if (action == "add") {
                            // Increment like count
                            runOnUiThread {
                                incrementLikes()
                            }
                        }
                    }
                }
            } catch (e: JSONException) {
                // Handle plain text message
                val comment = Comment(
                    id = UUID.randomUUID().toString(),
                    username = fromMember?.userId ?: "Unknown",
                    text = messageText,
                    userId = fromMember?.userId ?: "",
                    timestamp = System.currentTimeMillis()
                )
                runOnUiThread {
                    addCommentToUI(comment)
                }
            }
        }
        
        override fun onMemberJoined(member: RtmChannelMember?) {
            Log.d("RTM", "Member joined: ${member?.userId}")
        }
        
        override fun onMemberLeft(member: RtmChannelMember?) {
            Log.d("RTM", "Member left: ${member?.userId}")
        }
    })
    
    rtmChannel?.join(object : ResultCallback<Void> {
        override fun onSuccess(responseInfo: Void?) {
            Log.d("RTM", "Joined RTM channel successfully")
        }
        
        override fun onFailure(errorInfo: ErrorInfo) {
            Log.e("RTM", "Failed to join RTM channel: ${errorInfo.errorDescription}")
        }
    })
}

// Send comment
fun sendComment(text: String, userInfo: UserInfo) {
    val payload = JSONObject().apply {
        put("type", "comment")
        put("msg", text)
        put("userId", userInfo.userId)
        put("userName", userInfo.username)
        put("profilePicture", userInfo.profilePicture)
        put("timestamp", System.currentTimeMillis())
        put("platform", "android") // Identify platform
    }
    
    val message = rtmClient?.createMessage(payload.toString())
    rtmChannel?.sendMessage(message, object : ResultCallback<Void> {
        override fun onSuccess(responseInfo: Void?) {
            Log.d("RTM", "Comment sent successfully")
        }
        
        override fun onFailure(errorInfo: ErrorInfo) {
            Log.e("RTM", "Failed to send comment: ${errorInfo.errorDescription}")
        }
    })
}

// Send like
fun sendLike(action: String) {
    val payload = JSONObject().apply {
        put("type", "like")
        put("action", action) // "add" or "remove"
        put("userId", currentUserId)
        put("timestamp", System.currentTimeMillis())
        put("platform", "android")
    }
    
    val message = rtmClient?.createMessage(payload.toString())
    rtmChannel?.sendMessage(message, object : ResultCallback<Void> {
        override fun onSuccess(responseInfo: Void?) {
            Log.d("RTM", "Like sent successfully")
        }
        
        override fun onFailure(errorInfo: ErrorInfo) {
            Log.e("RTM", "Failed to send like: ${errorInfo.errorDescription}")
        }
    })
}
```

## Message Format

### Standard Message Structure

All messages should follow this JSON structure for cross-platform compatibility:

```json
{
  "type": "comment" | "like" | "gift" | "reaction" | "notification",
  "msg": "Message text (for comments)",
  "userId": "user123",
  "userName": "John Doe",
  "profilePicture": "https://...",
  "timestamp": 1234567890,
  "platform": "web" | "android" | "ios",
  "action": "add" | "remove" (for likes)
}
```

### Type Defaults

- If `type` is missing and message has `msg`, `text`, or `comment` field → defaults to `"comment"`
- Plain text messages without JSON → treated as `"comment"` type

## Testing Guide

### Web ↔ Web Testing

1. **Same Device, Different Browsers:**
   - Open Chrome and Firefox on the same computer
   - Join the same channel from both browsers
   - Each browser should get a unique UID (handled by backend)
   - Messages should sync between browsers

2. **Different Devices:**
   - Open browser on Device A and Device B
   - Join the same channel
   - Verify video/audio streaming works
   - Verify comments sync in real-time

### Web ↔ App Testing

1. **Web Host, App Audience:**
   - Start stream from Web browser (host)
   - Join from mobile app (audience)
   - Verify app receives video/audio
   - Verify comments from web appear in app

2. **App Host, Web Audience:**
   - Start stream from mobile app (host)
   - Join from Web browser (audience)
   - Verify web receives video/audio
   - Verify comments from app appear in web

3. **Cross-platform Comments:**
   - Send comment from Web → verify it appears in App
   - Send comment from App → verify it appears in Web
   - Test likes sync across platforms

## Troubleshooting

### Issue: Messages not received

**Check:**
1. RTM token is valid and not expired
2. Channel name matches exactly (case-sensitive)
3. UID is correct and unique
4. RTM client is connected (`isConnected === true`)
5. Channel is joined successfully

**Debug:**
```javascript
console.log("RTM Status:", {
  isConnected,
  channelName,
  uid,
  hasToken: !!token,
  error
});
```

### Issue: Infinite API calls

**Solution:**
- Ensure singleton pattern is working (check console for "Reusing existing client")
- Verify `isInitializingRef` guards are in place
- Check that cleanup function is called on unmount

### Issue: Same browser can't join twice

**Solution:**
- Each join should use a unique UID from backend
- Backend should generate unique `accountNumber` for each session
- If testing, use different user accounts or clear session storage

### Issue: Video not showing

**Check:**
1. RTC token is valid
2. Camera/microphone permissions granted
3. Role is set correctly (host vs audience)
4. Video tracks are published (host only)

## Best Practices

1. **Always use backend-generated tokens**: Never hardcode tokens
2. **Unique UIDs**: Ensure backend provides unique UIDs per session
3. **Error handling**: Always handle errors and show user-friendly messages
4. **Cleanup**: Always cleanup resources on component unmount
5. **Connection state**: Monitor connection state and handle reconnection
6. **Message deduplication**: The hooks handle this automatically, but ensure backend doesn't send duplicates

## API Reference

### useAgora Hook

```typescript
interface UseAgoraParams {
  pageId: string;
  role: "host" | "audience";
  appId: string;
  token: string | null;
  uid: number | null;
  backendChannelName: string | null;
}

interface UseAgoraReturn {
  join: () => Promise<void>;
  leave: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  localVideo: ILocalVideoTrack | null;
  localAudio: ILocalAudioTrack | null;
  remoteUsers: IRemoteUser[];
  isJoined: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### useRTM Hook

```typescript
interface UseRTMParams {
  appId: string;
  uid: string;
  token: string;
  channelName: string;
}

interface UseRTMReturn {
  isConnected: boolean;
  comments: Comment[];
  likesCount: number;
  userLiked: boolean;
  error: string | null;
  sendComment: (text: string, userInfo: UserInfo, type?: string) => Promise<boolean>;
  sendLike: (action: "add" | "remove") => Promise<boolean>;
}
```

## Support

For issues or questions:
1. Check Agora documentation: https://docs.agora.io
2. Review console logs for error messages
3. Verify token generation on backend
4. Test with Agora's sample apps
