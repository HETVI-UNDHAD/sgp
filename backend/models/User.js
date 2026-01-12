const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  enrollment: String,
  course: String,
  semester: String,
  college: String,
  otp: String,
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
