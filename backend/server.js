// ================= LOAD ENV =================
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true
  }
});

/* =====================================================
   MIDDLEWARE
===================================================== */

// ✅ CORS CONFIG (Development + Production Ready)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ BODY PARSER
app.use(express.json({ limit: "5mb" }));

// ✅ SERVE UPLOADS
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =====================================================
   SOCKET.IO
===================================================== */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ JOIN GROUP ROOM
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    socket.broadcast.to(groupId).emit("userJoined", { userId: socket.id });
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // ✅ SEND MESSAGE — broadcast to others only (sender already has it optimistically)
  socket.on("sendMessage", (messageData) => {
    socket.to(messageData.groupId).emit("receiveMessage", {
      ...messageData,
      timestamp: messageData.timestamp || new Date(),
    });
  });

  // ✅ TYPING INDICATOR
  socket.on("typing", (data) => {
    socket.to(data.groupId).emit("userTyping", { groupId: data.groupId, userId: data.userId, userName: data.userName });
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.groupId).emit("userStoppedTyping", { groupId: data.groupId, userId: data.userId, userName: data.userName });
  });

  // ✅ MARK MESSAGE AS DELIVERED — also persist to DB
  socket.on("messageDelivered", async (data) => {
    try {
      await Message.findByIdAndUpdate(data.messageId, { status: "delivered" });
    } catch (e) { /* ignore */ }
    io.to(data.groupId).emit("updateMessageStatus", {
      messageId: data.messageId,
      status: "delivered",
    });
  });

  // ✅ MARK ALL MESSAGES AS READ (bulk) — when user opens a group
  socket.on("markAllRead", async (data) => {
    try {
      const updated = await Message.updateMany(
        { groupId: data.groupId, senderEmail: { $ne: data.userEmail }, status: { $ne: "read" } },
        { status: "read" }
      );
      if (updated.modifiedCount > 0) {
        io.to(data.groupId).emit("allMessagesRead", { groupId: data.groupId, userEmail: data.userEmail });
      }
    } catch (e) { /* ignore */ }
  });

  // ✅ MARK MESSAGE AS READ (single)
  socket.on("messageRead", async (data) => {
    try {
      await Message.findByIdAndUpdate(data.messageId, { status: "read" });
    } catch (e) { /* ignore */ }
    io.to(data.groupId).emit("updateMessageStatus", {
      messageId: data.messageId,
      status: "read",
    });
  });

  // ✅ FILE UPLOAD
  socket.on("fileUploaded", (data) => {
    io.to(data.groupId).emit("newFile", data.file);
  });

  // ✅ FILE DELETION
  socket.on("fileDeleted", (data) => {
    io.to(data.groupId).emit("fileDeleted", data);
  });

  // ✅ USER DISCONNECT
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io accessible in routes
app.set("io", io);

/* =====================================================
   HEALTH CHECK ROUTE
===================================================== */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 SquadUp Backend is running",
  });
});

/* =====================================================w
   ROUTES
===================================================== */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/group", require("./routes/group"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/call", require("./routes/videoCall"));

/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err.message);

  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
  });
});

/* =====================================================
   DATABASE CONNECTION (OPTIONAL)
===================================================== */
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => {
      console.warn("⚠️ MongoDB Connection Failed:", err.message);
      console.log("📦 Running in IN-MEMORY mode (data will not persist)");
    });
} else {
  console.log("📦 No MONGO_URI found - Running in IN-MEMORY mode");
}

/* =====================================================
   START SERVER
===================================================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


