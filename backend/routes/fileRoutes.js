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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // allow by extension OR by mimetype substring for common file types
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|xls|xlsx|ppt|pptx|mp4|mpeg|webm|bmp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error("Invalid file type"));
  }
});

/* ================= UPLOAD FILE ================= */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const groupId = req.body.groupId || req.body.group || req.query.groupId;
    const userEmail = req.body.userEmail || req.body.email || req.body.senderEmail || req.body.uploadedByEmail;
    const userName = req.body.userName || req.body.uploadedBy || req.body.senderName || req.body.name;

    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    if (!groupId) return res.status(400).json({ msg: "Group ID required" });

    // Verify user is member of group
    const group = await Group.findById(groupId)
      .populate("admin", "email")
      .populate("members", "email");
      
    if (!group) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ msg: "Group not found" });
    }

    const memberEmails = group.members.map(m => m.email);
    const adminEmail = group.admin?.email;

    if (userEmail && (memberEmails.includes(userEmail) || adminEmail === userEmail)) {
      // authorized
    } else if (userEmail) {
      // fallback: check by userId if email check fails
      const memberIds = group.members.map(m => m._id?.toString());
      const adminId = group.admin?._id?.toString();
      const userId = req.body.userId || req.body.sender;
      if (!userId || (!memberIds.includes(userId) && adminId !== userId)) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(403).json({ msg: "Not authorized" });
      }
    }

    const newFile = new File({
      groupId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: userName || userEmail || "Unknown",
      uploadedByEmail: userEmail
    });

    await newFile.save();
    console.log("✅ File saved to DB:", newFile._id, newFile.originalName);
    res.json({ success: true, file: newFile });
  } catch (err) {
    console.error("Upload error:", err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
});

/* ================= GET FILES BY GROUP ================= */
router.get("/group/:groupId", async (req, res) => {
  try {
    const files = await File.find({ groupId: req.params.groupId }).sort({ createdAt: -1 });
    // Annotate each file with whether it physically exists on disk
    const result = files.map(f => {
      const obj = f.toJSON();
      obj.exists = fs.existsSync(path.join(__dirname, "..", "uploads", f.filename));
      return obj;
    });
    res.json(result);
  } catch (err) {
    console.error("Error fetching files:", err);
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

/* ================= DOWNLOAD ALL FILES AS ZIP ================= */
router.get("/download-all/:groupId", async (req, res) => {
  try {
    const archiver = require("archiver");
    const files = await File.find({ groupId: req.params.groupId });
    if (!files.length) return res.status(404).json({ msg: "No files found" });

    const group = await Group.findById(req.params.groupId);
    const groupName = group ? group.name.replace(/[^a-zA-Z0-9_\-]/g, "_") : "group";
    const zipName = `${groupName}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipName}"; filename*=UTF-8''${encodeURIComponent(zipName)}`);
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("error", (err) => { console.error("Archive error:", err); res.end(); });
    archive.pipe(res);

    const imageExts = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
    const seenNames = { images: {}, documents: {} };

    for (const file of files) {
      const filePath = path.join(__dirname, "..", "uploads", file.filename);
      if (!fs.existsSync(filePath)) continue;

      const folder = imageExts.test(path.extname(file.originalName)) ? "images" : "documents";
      let name = file.originalName;
      if (seenNames[folder][name]) {
        const ext = path.extname(name);
        const base = path.basename(name, ext);
        name = `${base}_${seenNames[folder][name]}${ext}`;
      }
      seenNames[folder][file.originalName] = (seenNames[folder][file.originalName] || 1) + 1;
      archive.file(filePath, { name: `${folder}/${name}` });
    }

    await archive.finalize();
  } catch (err) {
    console.error("ZIP error:", err);
    if (!res.headersSent) res.status(500).json({ msg: "ZIP download failed" });
  }
});

/* ================= DELETE FILE ================= */
router.delete("/delete/:id", async (req, res) => {
  try {
    const userEmail = req.body.userEmail || req.body.email || req.body.senderEmail || req.body.uploadedByEmail;
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ msg: "File not found" });

    // Only uploader or admin can delete
    const group = await Group.findById(file.groupId).populate("admin", "email");
    if (file.uploadedByEmail !== userEmail && group.admin.email !== userEmail) {
      return res.status(403).json({ msg: "Not authorized to delete" });
    }

    const filePath = path.join(__dirname, "..", "uploads", file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await File.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "File deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
});

module.exports = router;
