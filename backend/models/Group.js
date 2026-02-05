const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    // Group name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Group creator (admin)
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Group members
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

/* ================= UNIQUE GROUP PER ADMIN ================= */
/*
  Same admin ❌ same group name
  Different admin ✅ same group name allowed
*/
groupSchema.index({ name: 1, admin: 1 }, { unique: true });

/* ================= VIRTUAL FIELDS ================= */

// Number of members
groupSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

// Enable virtuals in JSON
groupSchema.set("toJSON", { virtuals: true });
groupSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Group", groupSchema);
