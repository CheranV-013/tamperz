import { io } from "socket.io-client";

const socket = io("https://ai-iot-tamper-backend.onrender.com", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  forceNew: true,   // 🔥 ADD THIS
});

socket.on("connect", () => {
  console.log("✅ SOCKET CONNECTED:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ SOCKET DISCONNECTED");
});

export default socket;