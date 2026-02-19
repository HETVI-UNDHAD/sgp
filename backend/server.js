// ================= LOAD ENV =================
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


