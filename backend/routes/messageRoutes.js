const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");

// ✅ GET presence info for a list of userIds
router.get("/presence", async (req, res) => {
  try {
    const { userIds } = req.query;
    if (!userIds) return res.json([]);
    const ids = userIds.split(",");
    const users = await User.find({ _id: { $in: ids } }, "_id isOnline lastSeen fullName email");
    res.json(users);
  } catch { res.status(500).json([]); }
});

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
    const { userId } = req.query;

    const filter = { groupId, deletedForEveryone: { $ne: true } };
    if (userId) filter.deletedFor = { $ne: userId };

    const messages = await Message.find(filter)
      .populate("sender", "fullName email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
});

// ✅ SAVE a new message
router.post("/send", async (req, res) => {
  try {
    const { content, sender, senderName, senderEmail, groupId, fileUrl, fileType, poll, isSystem, replyTo } = req.body;

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
      replyTo: replyTo || undefined,
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

// ✅ MARK message as read by a specific user (group read receipts)
router.put("/:messageId/readby", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, userName, totalMembers } = req.body;

    // Add user to readBy if not already there
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: { userId, userName, readAt: new Date() } } },
      { new: true }
    );

    if (!message) return res.status(404).json({ message: "Not found" });

    // If everyone (except sender) has read it, mark status as "read"
    const readCount = message.readBy.length;
    if (totalMembers && readCount >= totalMembers - 1) {
      message.status = "read";
      await message.save();
    }

    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ message: "Error updating read receipt", error: err.message });
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

// ✅ BULK DELETE messages (delete for me / delete for everyone)
router.post("/bulk-delete", async (req, res) => {
  try {
    const { messageIds, userId, deleteType, groupId } = req.body;
    if (!messageIds?.length || !userId) return res.status(400).json({ msg: "Missing fields" });

    if (deleteType === "everyone") {
      const msgs = await Message.find({ _id: { $in: messageIds } });
      const notOwned = msgs.filter(m => m.sender?.toString() !== userId.toString());
      if (notOwned.length > 0) return res.status(403).json({ msg: "You can only delete your own messages for everyone" });
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { deletedForEveryone: true, content: "This message was deleted" }
      );
    } else {
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { deletedFor: userId } }
      );
    }

    const io = req.app.get("io");
    if (io && groupId) {
      io.to(groupId).emit("messagesDeleted", { messageIds, deleteType, userId });
    }

    res.json({ msg: "Deleted", messageIds, deleteType });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ CLEAR all messages in a group (MUST come before /:messageId route)
router.delete("/group/:groupId/clear", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    
    console.log('Clear chat request:', { groupId, userId });
    
    const result = await Message.deleteMany({ groupId });
    console.log('Messages deleted:', result.deletedCount);
    
    res.json({ msg: "Chat cleared successfully", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Error clearing chat:", err);
    res.status(500).json({ msg: "Failed to clear chat", error: err.message });
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

module.exports = router;
