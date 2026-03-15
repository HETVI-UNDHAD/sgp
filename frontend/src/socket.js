import io from "socket.io-client";
import { API_URL } from "./config";

const socket = io(API_URL, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
  // Rejoin any active group room after reconnect
  const activeGroupId = socket._activeGroupId;
  if (activeGroupId) {
    socket.emit("joinGroup", activeGroupId);
  }
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

export default socket;
