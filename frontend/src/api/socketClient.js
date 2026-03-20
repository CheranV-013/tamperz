import { io } from "socket.io-client";

const socket = io("https://ai-iot-tamper-backend.onrender.com", {
  transports: ["websocket", "polling"],
  reconnection: true,
});

socket.on("connect", () => {
  console.log("✅ SOCKET CONNECTED");
});

socket.on("connect_error", (err) => {
  console.log("❌ SOCKET ERROR:", err);
});

export default socket;