/* eslint-disable react-hooks/refs */
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const useSocket = () => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      timeout: 8000,
    });
    socketRef.current = socket;

    // Connection event
    socket.on("connect", () => {
      setConnected(true);
    });

    // Disconnection event
    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Server welcome message
    socket.on("connect_error", () => setConnected(false));

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
  };
};
