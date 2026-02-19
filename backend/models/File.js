const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: String,
  fileSize: Number,
  uploadedBy: { type: String, required: true },
  uploadedByEmail: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("File", fileSchema);
