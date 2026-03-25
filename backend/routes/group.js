const express = require("express");
const router = express.Router();

const Group = require("../models/Group");
const User = require("../models/User");
const Message = require("../models/Message");
const Invitation = require("../models/Invitation");

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

    // Save invitation to DB
    const invitation = new Invitation({
      email,
      groupId,
      token,
    });
    await invitation.save();

    const link = `http://localhost:3000/accept-invite?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
      from: `"SquadUp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "You're invited to join a group on SquadUp",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#07070f;font-family:Arial,sans-serif;">
          <div style="max-width:480px;margin:40px auto;background:#1a1a2e;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
            <div style="background:linear-gradient(135deg,#3b0764,#7c3aed);padding:32px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:24px;">SquadUp</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Group Invitation</p>
            </div>
            <div style="padding:32px;text-align:center;">
              <p style="color:#f1f5f9;font-size:16px;margin-bottom:8px;">You have been invited to join a group!</p>
              <p style="color:#94a3b8;font-size:14px;margin-bottom:32px;">Click the button below to accept. Link valid for 24 hours.</p>
              <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;">Accept Invitation</a>
              <p style="color:#64748b;font-size:12px;margin-top:28px;">If button doesn't work, copy this link:</p>
              <p style="color:#a855f7;font-size:11px;word-break:break-all;">${link}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.json({ msg: "Invitation sent successfully" });
  } catch (err) {
    console.error("INVITE ERROR ❌", err);
    res.status(500).json({ msg: "Failed to send invite" });
  }
});

/* =====================================================
   GET PENDING INVITATIONS FOR USER
===================================================== */
router.get("/invitations/:email", async (req, res) => {
  try {
    const invitations = await Invitation.find({
      email: req.params.email,
      status: "pending",
    }).populate({
      path: "groupId",
      populate: {
        path: "admin",
        select: "email",
      },
    });

    res.json(invitations);
  } catch (err) {
    console.error("GET INVITATIONS ERROR ❌", err);
    res.status(500).json({ msg: "Server error" });
  }
});
router.get("/accept", async (req, res) => {
  try {
    const rawToken = decodeURIComponent(req.query.token || "");
    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
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

    // Update invitation status
    await Invitation.findOneAndUpdate(
      { token: rawToken },
      { status: "accepted" }
    );

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
   DELETE GROUP (ADMIN ONLY)
===================================================== */
router.delete("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { adminId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(adminId))
      return res.status(400).json({ msg: "Invalid IDs" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Group not found" });

    if (group.admin.toString() !== adminId)
      return res.status(403).json({ msg: "Only admin can delete the group" });

    await Message.deleteMany({ groupId });
    await Invitation.deleteMany({ groupId });
    await Group.findByIdAndDelete(groupId);

    const io = req.app.get("io");
    if (io) io.to(groupId.toString()).emit("groupDeleted", { groupId });

    res.json({ msg: "Group deleted successfully" });
  } catch (err) {
    console.error("DELETE GROUP ERROR ❌", err);
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
