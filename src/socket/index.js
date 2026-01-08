import { io } from "socket.io-client";
import Cookies from "js-cookie";

const DEFAULT_URL = "https://api.my-topx.com";

export function createSocket({ url = DEFAULT_URL, token } = {}) {
  const authToken = token || Cookies.get("access_token");

  const socket = io(url, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    // Provide token in several places to maximize compatibility with different server setups
    auth: { token: authToken },
    query: { token: authToken },
    transportOptions: {
      polling: {
        extraHeaders: authToken
          ? {
              token: authToken,
              authorization: `Bearer ${authToken}`,
            }
          : {},
      },
    },
  });

  socket.on("connect", () => console.log("Socket connected"));

  const connect = () => socket.connect();
  const disconnect = () => socket.disconnect();

  // Safe emit wrapper
  const emit = (event, ...args) => {
    if (socket && socket.connected) socket.emit(event, ...args);
  };

  return {
    socket,
    connect,
    disconnect,
    emit,
  };
}

export default createSocket;
