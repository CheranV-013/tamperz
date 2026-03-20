import { io } from "socket.io-client";

const socket = io("https://ai-iot-tamper-backend.onrender.com", {
  path: "/socket.io",
  transports: ["polling", "websocket"], // ✅ ALLOW FALLBACK
  withCredentials: true,
});

// make global (optional but fine)
window.socket = socket;

// debug
socket.onAny((event, data) => {
  console.log("🔥 GLOBAL EVENT:", event, data);
});

export default socket;