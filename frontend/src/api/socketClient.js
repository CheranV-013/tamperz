import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  path: "/socket.io",              // ✅ important for Render
  transports: ["websocket"],       // force websocket
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 2000,
  timeout: 20000,
  withCredentials: true,           // ✅ helps with CORS/session
});

export default socket;