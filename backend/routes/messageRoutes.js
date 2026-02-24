const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

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
    const { content, sender, senderName, senderEmail, groupId } = req.body;

    if (!content || !sender || !groupId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = new Message({
      content,
      sender,
      senderName,
      senderEmail,
      groupId,
      status: "sent",
      timestamp: new Date(),
    });

    const savedMessage = await newMessage.save();
    const populatedMessage = await savedMessage.populate("sender", "fullName email");

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

module.exports = router;
