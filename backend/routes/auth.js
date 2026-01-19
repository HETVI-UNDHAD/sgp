const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");

/* ---------- EMAIL SETUP ---------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ---------- REGISTER ---------- */
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      enrollment,
      course,
      semester,
      college,
    } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Email & password required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      enrollment,
      course,
      semester,
      college,
      otp,
      isVerified: false,
    });

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    res.json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error("REGISTER ERROR ❌", err);
    res.status(500).json({ msg: "Register error" });
  }
});

/* ---------- VERIFY OTP ---------- */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ msg: "Invalid OTP" });

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.json({ msg: "OTP verified successfully" });
  } catch (err) {
    console.error("OTP ERROR ❌", err);
    res.status(500).json({ msg: "OTP error" });
  }
});

/* ---------- LOGIN (🔥 FIXED 🔥) ---------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "User not found" });

    if (!user.isVerified)
      return res.status(400).json({ msg: "Please verify OTP first" });

    // ✅ VERY IMPORTANT (hashed password check)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid password" });

    res.json({
      msg: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR ❌", err);
    res.status(500).json({ msg: "Login error" });
  }
});

module.exports = router;
