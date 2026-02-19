const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const File = require("../models/File");
const Group = require("../models/Group");

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Multer config with file validation
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Invalid file type"));
  }
});

/* ================= UPLOAD FILE ================= */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { groupId, userEmail, userName } = req.body;
    
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    if (!groupId) return res.status(400).json({ msg: "Group ID required" });

    // Verify user is member of group
    const group = await Group.findById(groupId)
      .populate("admin", "email")
      .populate("members", "email");
      
    if (!group) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ msg: "Group not found" });
    }

    const memberEmails = group.members.map(m => m.email);
    const adminEmail = group.admin.email;
    
    if (!memberEmails.includes(userEmail) && adminEmail !== userEmail) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ msg: "Not authorized" });
    }

    const newFile = new File({
      groupId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: userName || userEmail,
      uploadedByEmail: userEmail
    });

    await newFile.save();
    res.json({ success: true, file: newFile });
  } catch (err) {
    console.error("Upload error:", err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
});

/* ================= GET FILES BY GROUP ================= */
router.get("/group/:groupId", async (req, res) => {
  try {
    const files = await File.find({ groupId: req.params.groupId }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching files" });
  }
});

/* ================= DOWNLOAD FILE ================= */
router.get("/download/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ msg: "File not found" });
    
    const filePath = path.join(__dirname, "..", "uploads", file.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ msg: "File not found on server" });
    
    res.download(filePath, file.originalName);
  } catch (err) {
    res.status(500).json({ msg: "Download failed" });
  }
});

module.exports = router;
