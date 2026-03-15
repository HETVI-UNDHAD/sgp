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
    const { groupId, initiatorEmail, initiatorName } = req.body;

    if (!groupId || !initiatorEmail) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Jitsi Meet — free, no account needed, works for everyone
    const roomName = `SquadUp-${groupId}-${Date.now()}`;
    const meetingCode = roomName;
    const meetingLink = `https://meet.jit.si/${roomName}`;

    // Store call info
    activeCalls.set(meetingCode, {
      groupId,
      initiatorEmail,
      initiatorName,
      startTime: new Date(),
      participants: [initiatorEmail],
      meetingLink
    });

    // Get group members with populated user data
    const group = await Group.findById(groupId).populate("members", "email fullName");
    
    if (group && group.members) {
      console.log(`Sending emails to ${group.members.length} members`);
      
      // Send email to all members except initiator
      for (const member of group.members) {
        if (member.email && member.email !== initiatorEmail) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: member.email,
            subject: `📹 Video Call Started in ${group.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f8ff; border-radius: 10px;">
                <h2 style="color: #0b3e71;">Video Call Invitation</h2>
                <p><strong>${initiatorName}</strong> has started a video call in <strong>${group.name}</strong></p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #0b3e71;">Meeting Room:</h3>
                  <p style="font-size: 16px; font-weight: bold; color: #0b3e71;">${meetingCode}</p>
                </div>

                <a href="${meetingLink}" 
                   style="display: inline-block; background: #34a853; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0;">
                  🎥 Join Meeting Now
                </a>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                  Or copy this link: <a href="${meetingLink}">${meetingLink}</a>
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">This is an automated message from SquadUp</p>
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

    // Notify group members via socket
    const io = req.app.get("io");
    io.to(groupId).emit("callStarted", {
      meetingCode,
      meetingLink,
      initiatorName,
      initiatorEmail,
      groupId
    });

    res.json({
      success: true,
      meetingCode,
      meetingLink,
      message: "Call started and invitations sent"
    });
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

    activeCalls.delete(meetingCode);

    // Notify group members
    const io = req.app.get("io");
    io.to(groupId).emit("callEnded", { meetingCode });

    res.json({ success: true, message: "Call ended" });
  } catch (err) {
    console.error("End call error:", err);
    res.status(500).json({ msg: "Failed to end call" });
  }
});

module.exports = router;
