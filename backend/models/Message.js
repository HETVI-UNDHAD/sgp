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
      required: true,
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
  },
  { timestamps: true }
);

// Index for faster queries
messageSchema.index({ groupId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
