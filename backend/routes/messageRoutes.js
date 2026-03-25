const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// ✅ GET unread counts for multiple groups (pass groupIds as comma-separated query param)
router.get("/unread", async (req, res) => {
  try {
    const { groupIds, userEmail } = req.query;
    if (!groupIds || !userEmail) return res.json({});
    const ids = groupIds.split(",");
    const counts = {};
    await Promise.all(ids.map(async (gid) => {
      counts[gid] = await Message.countDocuments({
        groupId: gid,
        senderEmail: { $ne: userEmail },
        status: { $ne: "read" },
      });
    }));
    res.json(counts);
  } catch (err) {
    res.status(500).json({});
  }
});

// ✅ GET all messages for a group
router.get("/group/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.find({ groupId })
      .populate("sender", "fullName email")
      .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
});

// ✅ SAVE a new message
router.post("/send", async (req, res) => {
  try {
    const { content, sender, senderName, senderEmail, groupId, fileUrl, fileType, poll, isSystem } = req.body;

    if (!content || !groupId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // System messages don't need a sender
    if (!isSystem && !sender) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = new Message({
      content,
      sender: isSystem ? undefined : sender,
      senderName,
      senderEmail,
      groupId,
      fileUrl,
      fileType,
      poll,
      isSystem: !!isSystem,
      status: "sent",
      timestamp: new Date(),
    });

    const savedMessage = await newMessage.save();
    const populatedMessage = isSystem ? savedMessage : await savedMessage.populate("sender", "fullName email");

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ message: "Error saving message", error: err.message });
  }
});

// ✅ MARK message as delivered
router.put("/:messageId/delivered", async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { status: "delivered" },
      { new: true }
    );

    res.status(200).json(message);
  } catch (err) {
    console.error("Error updating message:", err);
    res.status(500).json({ message: "Error updating message", error: err.message });
  }
});

// ✅ MARK message as read
router.put("/:messageId/read", async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { status: "read" },
      { new: true }
    );

    res.status(200).json(message);
  } catch (err) {
    console.error("Error updating message:", err);
    res.status(500).json({ message: "Error updating message", error: err.message });
  }
});

// ✅ DELETE single message
router.delete("/:messageId", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ msg: "Message deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ CLEAR all messages in a group
router.delete("/clear/:groupId", async (req, res) => {
  try {
    await Message.deleteMany({ groupId: req.params.groupId });
    res.json({ msg: "Chat cleared" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
