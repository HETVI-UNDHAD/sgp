const express = require("express");
const router = express.Router();

const Group = require("../models/Group");
const User = require("../models/User");

const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

/* ================= EMAIL SETUP ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error("❌ EMAIL ERROR:", err.message);
  else console.log("✅ EMAIL READY");
});

/* ================= CREATE GROUP ================= */
// POST /api/group/create
router.post("/create", async (req, res) => {
  try {
    const { groupName, adminId } = req.body;

    if (!groupName || !adminId) {
      return res.status(400).json({ msg: "groupName and adminId required" });
    }

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ msg: "Invalid adminId" });
    }

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ msg: "Admin user not found" });
    }

    const exists = await Group.findOne({
      name: groupName,
      admin: adminId,
    });

    if (exists) {
      return res.status(400).json({
        msg: "You already created a group with this name",
      });
    }

    const group = new Group({
      name: groupName,
      admin: admin._id,          // ✅ ObjectId
      members: [admin._id],      // ✅ admin is member
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error("CREATE GROUP ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ================= SEND INVITE ================= */
// POST /api/group/invite
router.post("/invite", async (req, res) => {
  try {
    const { email, groupId } = req.body;

    if (!email || !groupId) {
      return res.status(400).json({ msg: "Email and groupId required" });
    }

    const token = jwt.sign(
      { email, groupId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const link = `http://localhost:3000/accept-invite/${token}`;

    await transporter.sendMail({
      from: `"Team Collaboration App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Group Invitation",
      html: `
        <h3>You are invited to join a group</h3>
        <a href="${link}">Accept Invitation</a>
        <p>Link valid for 24 hours</p>
      `,
    });

    res.json({ msg: "Invitation sent successfully" });
  } catch (err) {
    console.error("INVITE ERROR ❌", err);
    res.status(500).json({ msg: "Failed to send invite" });
  }
});

/* ================= ACCEPT INVITE ================= */
// GET /api/group/accept/:token
router.get("/accept/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const { email, groupId } = decoded;

    const user = await User.findOne({ email });

    // 🟡 USER NOT REGISTERED → REGISTER FLOW
    if (!user) {
      return res.json({
        status: "NOT_REGISTERED",
        email,
        groupId,
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    // add member only once
    if (!group.members.includes(user._id)) {
      group.members.push(user._id);
      await group.save();
    }

    // 🔑 AUTO LOGIN TOKEN
    const loginToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      status: "ACCEPTED",
      token: loginToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      groupId,
    });
  } catch (err) {
    res.status(400).json({
      status: "INVALID",
      msg: "Invite expired or invalid",
    });
  }
});


/* ================= GET USER GROUPS ================= */
// GET /api/group/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid userId" });
    }

    const groups = await Group.find({
      members: userId, // ✅ correct
    })
      .populate("admin", "email")
      .populate("members", "email");

    const result = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      memberCount: g.members.length,
      memberEmails: g.members.map((m) => m.email),
      adminEmail: g.admin.email,
    }));

    res.json(result);
  } catch (err) {
    console.error("USER GROUP FETCH ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ================= GROUP DETAILS ================= */
// GET /api/group/:groupId
router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ msg: "Invalid groupId" });
    }

    const group = await Group.findById(groupId)
      .populate("admin", "email")
      .populate("members", "email");

    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    res.json({
      groupName: group.name,
      adminEmail: group.admin.email,
      memberCount: group.members.length,
      memberEmails: group.members.map((m) => m.email),
      createdAt: group.createdAt,
    });
  } catch (err) {
    console.error("GROUP DETAILS ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
