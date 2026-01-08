import React, { createContext, useEffect, useState, useMemo } from "react";
import createSocket from "../socket";
import Cookies from "js-cookie";
import { SOCKET_EVENTS } from "../constants/socketEvents";

const SocketContext = createContext(null);

export const SocketProvider = ({ children, url }) => {
  const [client, setClient] = useState(null);
  const [token, setToken] = useState(Cookies.get("access_token"));

  // Check token changes periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newToken = Cookies.get("access_token");
      if (newToken !== token) {
        setToken(newToken);
      }
    }, 1000); // check every second

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) {
      // Disconnect if no token
      if (client) {
        client.disconnect();
        setClient(null);
      }
      return;
    }

    const { socket, connect, disconnect, emit } = createSocket({ url, token });

    setClient({ socket, connect, disconnect, emit });

    // auto connect
    connect();

    // Add event listeners
    socket.on(SOCKET_EVENTS.INDIVIDUAL.MESSAGE_RECEIVED, (data) => {
      console.log("Message received:", data);
      // Handle message: dispatch to Redux, update state, show notification, etc.
    });

    socket.on(SOCKET_EVENTS.INDIVIDUAL.CHAT_BLOCKED, (data) => {
      console.log("Chat blocked:", data);
      // Handle chat block: update UI, show alert, etc.
    });

    socket.on(SOCKET_EVENTS.INDIVIDUAL.CHAT_DELETED, (data) => {
      console.log("Chat deleted:", data);
      // Handle chat deletion: update UI, remove chat, etc.
    });

    socket.on(SOCKET_EVENTS.LIVE.USER_JOINED, (data) => {
      console.log("User joined live chat:", data);
      // Handle user joined: update participant list, etc.
    });

    socket.on(SOCKET_EVENTS.LIVE.MESSAGE_RECEIVED, (data) => {
      console.log("Live message received:", data);
      // Handle live message: add to chat, etc.
    });

    socket.on(SOCKET_EVENTS.LIVE.USER_LEFT, (data) => {
      console.log("User left live chat:", data);
      // Handle user left: update participant list, etc.
    });

    socket.on(SOCKET_EVENTS.LIVE.ENDED, (data) => {
      console.log("Live chat ended:", data);
      // Handle live ended: close chat, show message, etc.
    });

    socket.on(SOCKET_EVENTS.GROUP.MESSAGE_RECEIVED, (data) => {
      console.log("Group message received:", data);
      // Handle group message: add to chat, etc.
    });

    socket.on(SOCKET_EVENTS.GROUP.GROUP_DELETED, (data) => {
      console.log("Group deleted:", data);
      // Handle group deletion: remove group from UI, etc.
    });

    socket.on(SOCKET_EVENTS.GROUP.ADDED_TO_GROUP, (data) => {
      console.log("Added to group:", data);
      // Handle added to group: show notification, add group to list, etc.
    });

    socket.on(SOCKET_EVENTS.GROUP.ADMIN_REMOVED_YOU, (data) => {
      console.log("Admin removed you from group:", data);
      // Handle removal: remove group from UI, show message, etc.
    });

    function handleVisibility() {
      if (document.visibilityState === "hidden") {
        // keep socket but optionally emit away/on events
      } else {
        // try to reconnect when user returns
        if (socket && !socket.connected) socket.connect();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      socket.off(SOCKET_EVENTS.INDIVIDUAL.MESSAGE_RECEIVED);
      socket.off(SOCKET_EVENTS.INDIVIDUAL.CHAT_BLOCKED);
      socket.off(SOCKET_EVENTS.INDIVIDUAL.CHAT_DELETED);
      socket.off(SOCKET_EVENTS.LIVE.USER_JOINED);
      socket.off(SOCKET_EVENTS.LIVE.MESSAGE_RECEIVED);
      socket.off(SOCKET_EVENTS.LIVE.USER_LEFT);
      socket.off(SOCKET_EVENTS.LIVE.ENDED);
      socket.off(SOCKET_EVENTS.GROUP.MESSAGE_RECEIVED);
      socket.off(SOCKET_EVENTS.GROUP.GROUP_DELETED);
      socket.off(SOCKET_EVENTS.GROUP.ADDED_TO_GROUP);
      socket.off(SOCKET_EVENTS.GROUP.ADMIN_REMOVED_YOU);
      try {
        disconnect();
      } catch (e) {
        // ignore
      }
    };
  }, [token, url]);

  const value = useMemo(
    () => ({
      socket: client?.socket,
      connect: client?.connect,
      disconnect: client?.disconnect,
      emit: client?.emit,
      // Individual chat event emitters
      requestIndividualChat: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.INDIVIDUAL.REQUEST, payload, callback);
      },
      sendMessage: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.INDIVIDUAL.MESSAGE_SEND, payload, callback);
      },
      readChats: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.INDIVIDUAL.READ_CHATS, payload, callback);
      },
      leaveChats: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.INDIVIDUAL.LEAVE_CHATS, payload, callback);
      },
      deleteChat: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.INDIVIDUAL.DELETE_CHAT, payload, callback);
      },
      shareContent: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.INDIVIDUAL.SHARE_CONTENT, payload, callback);
      },
      blockUser: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.INDIVIDUAL.BLOCK_USER, payload, callback);
      },
      comment: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.INDIVIDUAL.COMMENT, payload, callback);
      },
      // Live chat event emitters
      joinLive: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.LIVE.JOIN, payload, callback);
      },
      sendLiveMessage: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.LIVE.MESSAGE_SEND, payload, callback);
      },
      leaveLive: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.LIVE.LEAVE, payload, callback);
      },
      endLive: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.LIVE.END, payload, callback);
      },
      // Group chat event emitters
      joinGroup: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.GROUP.JOIN, payload, callback);
      },
      sendGroupMessage: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.GROUP.SEND_MESSAGE, payload, callback);
      },
      leaveGroupRoom: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.GROUP.LEAVE_ROOM, payload, callback);
      },
      leaveGroup: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.GROUP.LEAVE_GROUP, payload, callback);
      },
      deleteGroup: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.GROUP.DELETE_GROUP, payload, callback);
      },
      addGroupMembers: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.GROUP.ADD_MEMBERS, payload, callback);
      },
      removeGroupMember: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.GROUP.REMOVE_MEMBER, payload, callback);
      },
      shareGroupContent: (payload, callback) => {
        client?.emit(SOCKET_EVENTS.GROUP.SHARE_CONTENT, payload, callback);
      },
    }),
    [client]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
