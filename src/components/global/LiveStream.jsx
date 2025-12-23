import { useEffect, useState } from "react";
import { useAgora } from "./useAgora";

const LiveStreamApp = ({ pageId }) => {
  const [role, setRole] = useState(null);

  if (!role) {
    return (
      <div style={{ padding: 40 }}>
        <button onClick={() => setRole("host")}>
          Start Live
        </button>

        <button onClick={() => setRole("audience")}>
          Join as Viewer
        </button>
      </div>
    );
  }

  return <LiveRoom pageId={pageId} role={role} />;
};

const LiveRoom = ({ pageId, role }) => {
  const { join, leave, localVideo, remoteUsers } =
    useAgora({ pageId, role });

  useEffect(() => {
    join();
    return () => leave();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h3>Live Stream</h3>

      {role === "host" && (
        <div id="local-video" ref={(el) => el && localVideo?.play(el)} style={{ width: 400, height: 300 }} />
      )}

      {remoteUsers.map((user) => (
        <div
          key={user.uid}
          ref={(el) => el && user.videoTrack?.play(el)}
          style={{ width: 400, height: 300 }}
        />
      ))}
    </div>
  );
};

export default LiveStreamApp;
