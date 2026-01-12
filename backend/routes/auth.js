const express = require("express");
const router = express.Router(); // ✅ YE LINE MISSING THI
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");

// 📧 Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📝 REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    console.log("REQ BODY 👉", req.body);

    const {
      fullName,
      email,
      password,
      enrollment,
      course,
      semester,
      college,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email & password required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Email already registered" });
    }

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
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router; // ✅ YE BHI ZAROORI HAI
