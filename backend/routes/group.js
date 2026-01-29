const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

/* ================= EMAIL SETUP ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔍 VERIFY EMAIL CONFIG ON SERVER START
transporter.verify((err) => {
  if (err) {
    console.error("❌ EMAIL CONFIG ERROR:", err.message);
  } else {
    console.log("✅ EMAIL SERVER READY");
  }
});

/* ================= CREATE GROUP ================= */
// POST /api/group/create
router.post("/create", async (req, res) => {
  try {
    const { groupName, adminId } = req.body;

    if (!groupName || !adminId) {
      return res.status(400).json({ msg: "Missing data" });
    }

    const group = new Group({
      name: groupName,
      admin: adminId,
      members: [adminId],
    });

    await group.save();
    res.json(group);
  } catch (err) {
    console.error("CREATE GROUP ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ================= SEND INVITE ================= */
// POST /api/group/invite
router.post("/invite", async (req, res) => {
  try {
    console.log("📩 INVITE API HIT");
    console.log("BODY:", req.body);

    const { email, groupId } = req.body;

    if (!email || !groupId) {
      return res.status(400).json({ msg: "Email and groupId required" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: "JWT secret missing" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ msg: "Email credentials missing" });
    }

    // 🔐 CREATE TOKEN
    const token = jwt.sign(
      { email, groupId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const link = `http://localhost:3000/accept-invite/${token}`;

    // 📧 SEND EMAIL
    await transporter.sendMail({
      from: `"Team Collaboration App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Group Invitation",
      html: `
        <h2>You are invited to join a group</h2>
        <p>Click below to accept the invitation:</p>
        <a href="${link}"
           style="display:inline-block;
                  padding:10px 16px;
                  background:#4CAF50;
                  color:white;
                  text-decoration:none;
                  border-radius:6px;">
          Accept Invitation
        </a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    console.log("✅ EMAIL SENT TO:", email);
    res.json({ msg: `Invitation sent to ${email}` });

  } catch (err) {
    console.error("❌ INVITE ERROR FULL:", err);
    res.status(500).json({
      msg: "Failed to send invitation",
      error: err.message,
    });
  }
});

/* ================= ACCEPT INVITE ================= */
// GET /api/group/accept/:token
router.get("/accept/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, groupId } = decoded;

    const user = await User.findOne({ email });

    // 🔁 If user not registered
    if (!user) {
      return res.send(`
        <h3>User not registered</h3>
        <p>Please register using <b>${email}</b> first.</p>
        <p>After registering, click the invite link again.</p>
      `);
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.send("Group not found");
    }

    if (!group.members.includes(user._id)) {
      group.members.push(user._id);
      await group.save();
    }

    res.send(`
      <h2>🎉 You have joined the group successfully</h2>
      <p>You can now login and view the group.</p>
    `);

  } catch (err) {
    console.error("ACCEPT ERROR ❌", err);
    res.send("Invalid or expired invite link");
  }
});

module.exports = router;
