import { io } from "socket.io-client";
import { API_BASE_URL } from "./apiClient";

const socket = io(API_BASE_URL, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
});

export default socket;
