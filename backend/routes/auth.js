const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

/* ================= TEMP OTP STORAGE ================= */
const pendingUsers = {};

/* ================= EMAIL CONFIG ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= REGISTER ================= */
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

    if (!fullName || !email || !password) {
      return res.status(400).json({ msg: "Required fields missing" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    pendingUsers[email] = {
      userData: {
        fullName,
        email,
        password: hashedPassword,
        enrollment,
        course,
        semester,
        college,
      },
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    await transporter.sendMail({
      from: `"Team Chat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ msg: "OTP sent to email" });
  } catch (err) {
    console.error("REGISTER ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ================= VERIFY OTP (AUTO LOGIN) ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const pending = pendingUsers[email];
    if (!pending) {
      return res.status(400).json({ msg: "OTP expired or invalid" });
    }

    if (Date.now() > pending.expiresAt) {
      delete pendingUsers[email];
      return res.status(400).json({ msg: "OTP expired" });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    const newUser = new User({
      ...pending.userData,
      isVerified: true,
    });

    await newUser.save();
    delete pendingUsers[email];

    // 🔑 AUTO LOGIN TOKEN
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "OTP verified & logged in",
      token,
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("OTP ERROR ❌", err);
    res.status(500).json({ msg: "OTP error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email & password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify OTP first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    // 🔑 LOGIN TOKEN
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: {
        _id: user._id,
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
