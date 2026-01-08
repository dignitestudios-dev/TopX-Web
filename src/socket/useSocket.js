import { useContext, useEffect, useRef, useCallback } from "react";
import SocketContext from "../context/SocketContext";

export default function useSocket() {
  const ctx = useContext(SocketContext);
  const handlersRef = useRef([]);

  if (!ctx) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  const { socket, connect, disconnect, emit } = ctx;

  // Subscribe to event and auto-cleanup
  const on = useCallback((event, handler) => {
    if (!socket) return () => {};
    socket.on(event, handler);
    handlersRef.current.push({ event, handler });
    return () => {
      socket.off(event, handler);
      handlersRef.current = handlersRef.current.filter(
        (h) => h.event !== event || h.handler !== handler
      );
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      // cleanup all handlers
      handlersRef.current.forEach(({ event, handler }) => socket?.off(event, handler));
      handlersRef.current = [];
    };
  }, [socket]);

  return {
    socket,
    connect,
    disconnect,
    emit,
    on,
  };
}
