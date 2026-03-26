const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Group = require("../models/Group");
const User = require("../models/User");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Store active calls in memory (use Redis in production)
const activeCalls = new Map();

// Generate unique meeting code
router.post("/start", async (req, res) => {
  try {
    const { groupId, initiatorEmail, initiatorName, meetingName, timeLimit } = req.body;

    if (!groupId || !initiatorEmail) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const roomName = `SquadUp-${groupId}-${Date.now()}`;
    const meetingCode = roomName;
    const meetingLink = `https://meet.jit.si/${roomName}`;
    const timeLimitMins = Number(timeLimit) || 30;
    const displayName = meetingName || "Group Meeting";

    activeCalls.set(meetingCode, {
      groupId, initiatorEmail, initiatorName,
      meetingName: displayName, timeLimit: timeLimitMins,
      startTime: new Date(), participants: [initiatorEmail], meetingLink
    });

    // Auto-end after timeLimit
    const autoEndTimer = setTimeout(async () => {
      activeCalls.delete(meetingCode);
      const io = req.app.get("io");
      io.to(groupId).emit("callEnded", { meetingCode });
    }, timeLimitMins * 60 * 1000);

    // Store timer ref so manual end can clear it
    activeCalls.get(meetingCode).autoEndTimer = autoEndTimer;

    const group = await Group.findById(groupId).populate("members", "email fullName");

    if (group && group.members) {
      for (const member of group.members) {
        if (member.email && member.email !== initiatorEmail) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: member.email,
            subject: `📹 "${displayName}" — Video Call in ${group.name}`,
            html: `
              <div style="font-family:Arial,sans-serif;padding:20px;background:#f4f8ff;border-radius:10px;">
                <h2 style="color:#0b3e71;">📹 Video Call Invitation</h2>
                <p><strong>${initiatorName}</strong> has started a video call in <strong>${group.name}</strong></p>
                <div style="background:white;padding:20px;border-radius:8px;margin:20px 0;">
                  <h3 style="color:#0b3e71;margin:0 0 8px;">Meeting: ${displayName}</h3>
                  <p style="color:#666;margin:0;">⏱ Duration: ${timeLimitMins} minutes</p>
                </div>
                <a href="${meetingLink}" style="display:inline-block;background:#34a853;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:bold;margin:10px 0;">
                  🎥 Join Meeting Now
                </a>
                <p style="color:#666;font-size:14px;margin-top:20px;">Or copy this link: <a href="${meetingLink}">${meetingLink}</a></p>
                <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
                <p style="color:#999;font-size:12px;">This is an automated message from SquadUp</p>
              </div>
            `,
          };
          try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${member.email}`);
          } catch (err) {
            console.error(`❌ Failed to send email to ${member.email}:`, err.message);
          }
        }
      }
    }

    const io = req.app.get("io");
    io.to(groupId).emit("callStarted", {
      meetingCode, meetingLink, initiatorName, initiatorEmail, groupId,
      meetingName: displayName, timeLimit: timeLimitMins
    });

    res.json({ success: true, meetingCode, meetingLink, message: "Call started and invitations sent" });
  } catch (err) {
    console.error("Start call error:", err);
    res.status(500).json({ msg: "Failed to start call" });
  }
});

// Join existing call
router.post("/join", async (req, res) => {
  try {
    const { meetingCode, userEmail } = req.body;

    const callInfo = activeCalls.get(meetingCode);

    if (!callInfo) {
      return res.status(404).json({ msg: "Meeting not found or ended" });
    }

    if (!callInfo.participants.includes(userEmail)) {
      callInfo.participants.push(userEmail);
    }

    res.json({
      success: true,
      callInfo
    });
  } catch (err) {
    console.error("Join call error:", err);
    res.status(500).json({ msg: "Failed to join call" });
  }
});

// End call
router.post("/end", async (req, res) => {
  try {
    const { meetingCode, groupId } = req.body;
    const callInfo = activeCalls.get(meetingCode);
    if (callInfo?.autoEndTimer) clearTimeout(callInfo.autoEndTimer);
    activeCalls.delete(meetingCode);
    const io = req.app.get("io");
    io.to(groupId).emit("callEnded", { meetingCode });
    res.json({ success: true, message: "Call ended" });
  } catch (err) {
    console.error("End call error:", err);
    res.status(500).json({ msg: "Failed to end call" });
  }
});

module.exports = router;
