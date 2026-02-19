require("dotenv").config();
const mongoose = require("mongoose");

console.log("Testing MongoDB connection...");
console.log("URI:", process.env.MONGO_URI.replace(/:[^:@]+@/, ":****@")); // Hide password

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    console.log("\nPossible solutions:");
    console.log("1. Check MongoDB Atlas Network Access (whitelist your IP)");
    console.log("2. Verify credentials in .env file");
    console.log("3. Use local MongoDB: mongodb://localhost:27017/teamchat");
    process.exit(1);
  });
