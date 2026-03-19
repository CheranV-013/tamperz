import { io } from "socket.io-client";

const socket = io("https://ai-iot-tamper-backend.onrender.com", {
  path: "/socket.io",
  transports: ["websocket"],   // force websocket only
  upgrade: false,              // 🔥 VERY IMPORTANT
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 2000,
  timeout: 20000,
});

export default socket;