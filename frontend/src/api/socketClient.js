import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 2000,
  timeout: 20000,
});

export default socket;