const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Message content
    content: {
      type: String,
      required: true,
    },

    // Sender info
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    senderName: String,
    senderEmail: String,

    // Group this message belongs to
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    // Message status: sent, delivered, read
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    // Group read receipts — tracks who has read the message
    readBy: [
      {
        userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: String,
        readAt:   { type: Date, default: Date.now },
      }
    ],

    // Timestamp for display
    timestamp: {
      type: Date,
      default: Date.now,
    },

    // File attachments (optional)
    fileUrl: String,
    fileType: String, // "document", "photo", "video"

    // Poll data (optional)
    poll: {
      question: String,
      options: [
        {
          text: String,
          votes: [String],
          count: { type: Number, default: 0 }
        }
      ]
    },

    // System message (e.g. member left, removed, admin changed)
    isSystem: { type: Boolean, default: false },

    // Reply-to reference
    replyTo: {
      _id: String,
      senderName: String,
      content: String,
    },

    // Soft delete — users who deleted this message for themselves
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Hard delete for everyone
    deletedForEveryone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for faster queries
messageSchema.index({ groupId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
