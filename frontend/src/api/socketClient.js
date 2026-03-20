import { io } from "socket.io-client";

// ✅ LOCAL TEST URL
const BASE_URL = "http://localhost:5001";

console.log("🚀 Connecting to:", BASE_URL);

const socket = io(BASE_URL, {
  path: "/socket.io",
  transports: ["websocket"],
});

// 🔥 DEBUG (important)
socket.onAny((event, data) => {
  console.log("📡 EVENT:", event, data);
});

export default socket;