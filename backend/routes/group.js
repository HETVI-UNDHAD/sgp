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

/* =====================================================
   CREATE GROUP
===================================================== */
router.post("/create", async (req, res) => {
  try {
    const { groupName, adminId } = req.body;

    if (!groupName || !adminId)
      return res.status(400).json({ msg: "groupName and adminId required" });

    if (!mongoose.Types.ObjectId.isValid(adminId))
      return res.status(400).json({ msg: "Invalid adminId" });

    const admin = await User.findById(adminId);
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    const exists = await Group.findOne({
      name: groupName,
      admin: adminId,
    });

    if (exists)
      return res
        .status(400)
        .json({ msg: "You already created group with this name" });

    const group = new Group({
      name: groupName,
      admin: admin._id,
      members: [admin._id],
    });

    await group.save();

    res.status(201).json(group);
  } catch (err) {
    console.error("CREATE GROUP ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* =====================================================
   SEND INVITE
===================================================== */
router.post("/invite", async (req, res) => {
  try {
    const { email, groupId } = req.body;

    if (!email || !groupId)
      return res.status(400).json({ msg: "Email and groupId required" });

    const token = jwt.sign({ email, groupId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const link = `http://localhost:3000/accept-invite/${token}`;

    await transporter.sendMail({
      from: `"Team App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Group Invitation",
      html: `
        <h3>You are invited to join a group</h3>
        <a href="${link}">Accept Invitation</a>
        <p>Valid for 24 hours</p>
      `,
    });

    res.json({ msg: "Invitation sent successfully" });
  } catch (err) {
    console.error("INVITE ERROR ❌", err);
    res.status(500).json({ msg: "Failed to send invite" });
  }
});

/* =====================================================
   ACCEPT INVITE + AUTO LOGIN
===================================================== */
router.get("/accept/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const { email, groupId } = decoded;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        status: "NOT_REGISTERED",
        email,
        groupId,
      });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (!group.members.includes(user._id)) {
      group.members.push(user._id);
      await group.save();
    }

    const loginToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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

/* =====================================================
   GET USER GROUPS
===================================================== */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ msg: "Invalid userId" });

    const groups = await Group.find({ members: userId })
      .populate("admin", "email")
      .populate("members", "email");

    const result = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      memberCount: g.members.length,
      adminEmail: g.admin.email,
      members: g.members.map((m) => ({
        id: m._id,
        email: m.email,
      })),
    }));

    res.json(result);
  } catch (err) {
    console.error("USER GROUP FETCH ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* =====================================================
   GROUP DETAILS
===================================================== */
router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId))
      return res.status(400).json({ msg: "Invalid groupId" });

    const group = await Group.findById(groupId)
      .populate("admin", "email")
      .populate("members", "email");

    if (!group) return res.status(404).json({ msg: "Group not found" });

    res.json({
      groupName: group.name,
      adminEmail: group.admin.email,
      adminId: group.admin._id, // ⭐ important for frontend
      memberCount: group.members.length,
      members: group.members.map((m) => ({
        id: m._id,
        email: m.email,
      })),
      createdAt: group.createdAt,
    });
  } catch (err) {
    console.error("GROUP DETAILS ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* =====================================================
   REMOVE MEMBER (ADMIN ONLY)
===================================================== */
router.delete("/:groupId/remove/:memberId", async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const { adminId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(memberId) ||
      !mongoose.Types.ObjectId.isValid(adminId)
    ) {
      return res.status(400).json({ msg: "Invalid IDs" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (group.admin.toString() !== adminId)
      return res.status(403).json({ msg: "Only admin can remove members" });

    if (memberId === adminId)
      return res.status(400).json({ msg: "Admin cannot remove himself" });

    if (!group.members.includes(memberId))
      return res.status(404).json({ msg: "Member not in group" });

    group.members = group.members.filter(
      (id) => id.toString() !== memberId
    );

    await group.save();

    res.json({ msg: "Member removed successfully" });
  } catch (err) {
    console.error("REMOVE MEMBER ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});
/* =====================================================
   LEAVE GROUP (USER LEAVES HIMSELF)
===================================================== */
router.post("/:groupId/exit", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    // validate ids
    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ msg: "Invalid IDs" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    // ❌ admin cannot leave group
    if (group.admin.toString() === userId) {
      return res
        .status(400)
        .json({ msg: "Admin cannot leave group. Transfer admin first." });
    }

    // ❌ user not in group
    if (!group.members.includes(userId)) {
      return res.status(404).json({ msg: "User not in group" });
    }

    // ✅ remove user
    group.members = group.members.filter(
      (id) => id.toString() !== userId
    );

    await group.save();

    res.json({ msg: "You left the group successfully" });
  } catch (err) {
    console.error("EXIT GROUP ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
