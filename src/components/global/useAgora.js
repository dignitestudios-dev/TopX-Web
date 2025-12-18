import { useEffect, useRef, useState, useCallback } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

export const useAgora = ({ pageId, role }) => {
  const clientRef = useRef(null);

  const [localVideo, setLocalVideo] = useState(null);
  const [localAudio, setLocalAudio] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);

  const channelName = `page_${pageId}`;

  useEffect(() => {
    clientRef.current = AgoraRTC.createClient({
      mode: "live",
      codec: "vp8",
    });

    const client = clientRef.current;

    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      setRemoteUsers((prev) => [...prev, user]);

      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    });

    client.on("user-left", (user) => {
      setRemoteUsers((prev) =>
        prev.filter((u) => u.uid !== user.uid)
      );
    });

    return () => {
      client.leave();
    };
  }, [pageId]);

  const join = useCallback(async () => {
    const client = clientRef.current;

    await client.setClientRole(role);
    await client.join(
      "d2049131656f4ef389a7e743effcbeec", // APP ID
      channelName,
      null,
      null
    );

    if (role === "host") {
      const [audio, video] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      setLocalAudio(audio);
      setLocalVideo(video);

      await client.publish([audio, video]);
    }
  }, [role, channelName]);

  const leave = async () => {
    localAudio?.close();
    localVideo?.close();
    await clientRef.current.leave();
  };

  return {
    join,
    leave,
    localVideo,
    remoteUsers,
  };
};
