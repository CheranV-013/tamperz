import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  path: "/socket.io",
  transports: ["polling", "websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
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

socket.on("reconnect_attempt", (attempt) => {
  console.log("🔁 RECONNECT ATTEMPT:", attempt);
});

socket.on("reconnect", () => {
  console.log("✅ SOCKET RECONNECTED");
});

export default socket;
