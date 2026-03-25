const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invitation", invitationSchema);