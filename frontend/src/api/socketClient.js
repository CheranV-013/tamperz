import { io } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let socketInstance = null;

const createSocket = () => {
  const socket = io(API_BASE_URL, {
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 2000,
    timeout: 20000,
  });

  socket.onAny((event, ...args) => {
    console.log("EVENT:", event, args);
  });

  return socket;
};

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = createSocket();
  }
  return socketInstance;
};

export default getSocket();
