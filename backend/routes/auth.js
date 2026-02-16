const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Group = require("../models/Group");

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

/* =====================================================
   REGISTER - SEND OTP
===================================================== */
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
      return res.status(400).json({
        success: false,
        msg: "Required fields missing",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: "Email already registered",
      });
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
      from: `"SquadUp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SquadUp - OTP Verification",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({
      success: true,
      msg: "OTP sent successfully",
    });

  } catch (err) {
    console.error("REGISTER ERROR ❌", err.message);
    res.status(500).json({
      success: false,
      msg: "Email service error",
    });
  }
});

/* =====================================================
   VERIFY OTP
===================================================== */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const pending = pendingUsers[email];
    if (!pending) {
      return res.status(400).json({
        success: false,
        msg: "OTP expired or invalid",
      });
    }

    if (Date.now() > pending.expiresAt) {
      delete pendingUsers[email];
      return res.status(400).json({
        success: false,
        msg: "OTP expired",
      });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }

    const newUser = new User({
      ...pending.userData,
      isVerified: true,
    });

    await newUser.save();
    delete pendingUsers[email];

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      msg: "OTP verified successfully",
      token,
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });

  } catch (err) {
    console.error("OTP ERROR ❌", err.message);
    res.status(500).json({
      success: false,
      msg: "OTP verification failed",
    });
  }
});

/* =====================================================
   LOGIN
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email & password required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        msg: "Please verify OTP first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      msg: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR ❌", err.message);
    res.status(500).json({
      success: false,
      msg: "Login error",
    });
  }
});

/* =====================================================
   FORGOT PASSWORD
===================================================== */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        msg: "Email required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found",
      });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: email,
      subject: "SquadUp - Password Reset",
      text: `Reset your password using this link:\n${resetLink}\n\nThis link expires in 15 minutes.`,
    });

    res.json({
      success: true,
      msg: "Password reset link sent",
    });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR ❌", err.message);
    res.status(500).json({
      success: false,
      msg: "Email service error",
    });
  }
});

/* =====================================================
   RESET PASSWORD
===================================================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        msg: "Invalid request",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({
      success: true,
      msg: "Password reset successful",
    });

  } catch (err) {
    console.error("RESET PASSWORD ERROR ❌", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        msg: "Reset link expired",
      });
    }

    res.status(500).json({
      success: false,
      msg: "Reset password failed",
    });
  }
});

/* =====================================================
   STATS API (FOR LANDING PAGE COUNTER)
===================================================== */
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGroups = await Group.countDocuments();

    res.json({
      success: true,
      totalUsers,
      totalGroups,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching stats",
    });
  }
});

module.exports = router;
