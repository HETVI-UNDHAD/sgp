const express = require("express");
const router = express.Router();

const Group = require("../models/Group");
const User = require("../models/User");
const Message = require("../models/Message");

const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

/* ================= HELPER: save + broadcast system message ================= */
const sendSystemMessage = async (req, groupId, text) => {
  try {
    const msg = await Message.create({
      content: text,
      groupId,
      isSystem: true,
      status: "read",
      timestamp: new Date(),
    });
    const io = req.app.get("io");
    if (io) io.to(groupId.toString()).emit("receiveMessage", msg);
  } catch (e) {
    console.error("System message error:", e.message);
  }
};

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

    const adminName = admin.fullName || admin.email || "Admin";
    await sendSystemMessage(req, group._id, `${adminName} created the group`);

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

    const alreadyMember = group.members.map(m => m.toString()).includes(user._id.toString());
    if (!alreadyMember) {
      group.members.push(user._id);
      await group.save();
      const joinedName = user.fullName || user.email || "Someone";
      await sendSystemMessage(req, group._id, `${joinedName} joined the group`);
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
      .populate("admin", "email fullName")
      .populate("members", "email fullName");

    const result = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      memberCount: g.members.length,
      adminEmail: g.admin.email,
      members: g.members.map((m) => ({
        id: m._id,
        email: m.email,
        fullName: m.fullName,
      })),
    }));

    res.json(result);
  } catch (err) {
    console.error("USER GROUP FETCH ERROR ❌", err);
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

    const removedUser = await User.findById(memberId).select("email fullName");
    const adminUser = await User.findById(adminId).select("email fullName");
    const removedName = removedUser?.fullName || removedUser?.email || "A member";
    const adminName = adminUser?.fullName || adminUser?.email || "Admin";
    await sendSystemMessage(req, groupId, `${adminName} removed ${removedName} from the group`);

    res.json({ msg: "Member removed successfully" });
  } catch (err) {
    console.error("REMOVE MEMBER ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});
/* =====================================================
   TRANSFER ADMIN (ADMIN ONLY)
===================================================== */
router.post("/:groupId/transfer-admin", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { adminId, newAdminId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(adminId) ||
      !mongoose.Types.ObjectId.isValid(newAdminId)
    ) return res.status(400).json({ msg: "Invalid IDs" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (group.admin.toString() !== adminId)
      return res.status(403).json({ msg: "Only admin can transfer" });

    if (!group.members.map(m => m.toString()).includes(newAdminId))
      return res.status(400).json({ msg: "New admin must be a group member" });

    group.admin = newAdminId;
    await group.save();

    const newAdmin = await User.findById(newAdminId).select("email fullName");
    const newAdminName = newAdmin?.fullName || newAdmin?.email || "A member";
    await sendSystemMessage(req, groupId, `${newAdminName} is now the admin`);

    res.json({ msg: "Admin transferred successfully" });
  } catch (err) {
    console.error("TRANSFER ADMIN ERROR ❌", err);
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

    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) return res.status(400).json({ msg: "Invalid IDs" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (group.admin.toString() === userId)
      return res.status(400).json({ msg: "Transfer admin before leaving" });

    if (!group.members.map(m => m.toString()).includes(userId))
      return res.status(404).json({ msg: "User not in group" });

    group.members = group.members.filter(id => id.toString() !== userId);
    await group.save();

    const leavingUser = await User.findById(userId).select("email fullName");
    const leavingName = leavingUser?.fullName || leavingUser?.email || "A member";
    await sendSystemMessage(req, groupId, `${leavingName} left the group`);

    res.json({ msg: "You left the group successfully" });
  } catch (err) {
    console.error("EXIT GROUP ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* =====================================================
   GROUP DETAILS — must be last to avoid shadowing other routes
===================================================== */
router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId))
      return res.status(400).json({ msg: "Invalid groupId" });

    const group = await Group.findById(groupId)
      .populate("admin", "email fullName")
      .populate("members", "email fullName");

    if (!group) return res.status(404).json({ msg: "Group not found" });

    res.json({
      groupName: group.name,
      adminEmail: group.admin.email,
      adminId: group.admin._id,
      memberCount: group.members.length,
      members: group.members.map((m) => ({ id: m._id, email: m.email, fullName: m.fullName })),
      createdAt: group.createdAt,
    });
  } catch (err) {
    console.error("GROUP DETAILS ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
