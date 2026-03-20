import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  path: "/socket.io",
  transports: ["websocket"],
  withCredentials: true,
});

// 🔥 DEBUG (IMPORTANT)
socket.onAny((event, data) => {
  console.log("📡 SOCKET EVENT:", event, data);
});

socket.on("connect", () => {
  console.log("✅ SOCKET CONNECTED");
});

socket.on("connect_error", (err) => {
  console.log("❌ SOCKET ERROR:", err);
});

export default socket;