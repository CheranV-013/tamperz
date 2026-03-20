import { io } from "socket.io-client";

const socket = io("https://ai-iot-tamper-backend.onrender.com", {
  path: "/socket.io",
  transports: ["websocket"],
});

// make global
window.socket = socket;

// debug (optional)
socket.onAny((event, data) => {
  console.log("🔥 GLOBAL EVENT:", event, data);
});

export default socket;