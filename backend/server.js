// ================= LOAD ENV =================
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  }
});

/* =====================================================
   MIDDLEWARE
===================================================== */

// ✅ CORS CONFIG (Development + Production Ready)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
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

  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  socket.on("fileUploaded", (data) => {
    io.to(data.groupId).emit("newFile", data.file);
  });

  socket.on("fileDeleted", (data) => {
    io.to(data.groupId).emit("fileDeleted", data);
  });

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

/* =====================================================
   ROUTES
===================================================== */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/group", require("./routes/group"));
app.use("/api/files", require("./routes/fileRoutes"));

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
   DATABASE CONNECTION
===================================================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

/* =====================================================
   START SERVER
===================================================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


