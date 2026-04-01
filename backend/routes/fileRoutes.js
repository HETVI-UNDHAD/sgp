const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const File = require("../models/File");
const Group = require("../models/Group");

// ── Always-correct local uploads dir ──────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── Choose storage: Cloudinary (cloud) or local disk ─────────────────────────
const USE_CLOUD =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_KEY !== "your_api_key";

let upload;

if (USE_CLOUD) {
  const cloudinary = require("cloudinary").v2;
  const { CloudinaryStorage } = require("multer-storage-cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: "squadup_uploads",
      resource_type: "auto",
      public_id: Date.now() + "-" + Math.round(Math.random() * 1e9),
      use_filename: false,
    }),
  });

  upload = multer({ storage: cloudStorage, limits: { fileSize: 50 * 1024 * 1024 } });
  console.log("☁️  File storage: Cloudinary");
} else {
  const storage = multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
      const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
      cb(null, name);
    },
  });
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|xls|xlsx|ppt|pptx|mp4|mpeg|webm|bmp|svg/;
  upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ok = allowed.test(path.extname(file.originalname).toLowerCase()) || allowed.test(file.mimetype);
      ok ? cb(null, true) : cb(new Error("Invalid file type"));
    },
  });
  console.log("💾  File storage: Local disk →", UPLOADS_DIR);
}

// ── Helper: build the public URL for a saved file ────────────────────────────
function buildFileUrl(req, file) {
  if (USE_CLOUD) {
    // Cloudinary returns the full URL in file.path
    return file.path;
  }
  // Local: build absolute URL using the server's own host
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${protocol}://${host}/uploads/${file.filename}`;
}

/* ================= UPLOAD FILE ================= */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const groupId   = req.body.groupId || req.body.group || req.query.groupId;
    const userEmail = req.body.userEmail || req.body.email || req.body.senderEmail;
    const userName  = req.body.userName  || req.body.uploadedBy || req.body.senderName;

    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    if (!groupId)  return res.status(400).json({ msg: "Group ID required" });

    const group = await Group.findById(groupId)
      .populate("admin", "email")
      .populate("members", "email");

    if (!group) {
      if (!USE_CLOUD && req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ msg: "Group not found" });
    }

    const fileUrl = buildFileUrl(req, req.file);
    // For Cloudinary, filename is the public_id; for local it's the disk filename
    const filename = USE_CLOUD
      ? (req.file.filename || path.basename(req.file.path))
      : req.file.filename;

    const newFile = new File({
      groupId,
      filename,
      originalName:    req.file.originalname,
      fileUrl,
      fileType:        req.file.mimetype,
      fileSize:        req.file.size,
      uploadedBy:      userName || userEmail || "Unknown",
      uploadedByEmail: userEmail,
    });

    await newFile.save();
    console.log("✅ File saved:", filename, "→", fileUrl);
    res.json({ success: true, file: newFile });
  } catch (err) {
    console.error("Upload error:", err);
    if (!USE_CLOUD && req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
});

/* ================= GET FILES BY GROUP ================= */
router.get("/group/:groupId", async (req, res) => {
  try {
    const files = await File.find({ groupId: req.params.groupId }).sort({ createdAt: -1 });
    const result = files.map(f => {
      const obj = f.toJSON();
      // For local files check disk; cloud files are always available
      obj.exists = USE_CLOUD
        ? true
        : fs.existsSync(path.join(UPLOADS_DIR, f.filename));
      return obj;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching files" });
  }
});

/* ================= DOWNLOAD SINGLE FILE ================= */
router.get("/download/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ msg: "File not found" });

    if (USE_CLOUD) {
      // Redirect to Cloudinary URL
      return res.redirect(file.fileUrl);
    }

    const filePath = path.join(UPLOADS_DIR, file.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ msg: "File not found on server" });
    res.download(filePath, file.originalName);
  } catch {
    res.status(500).json({ msg: "Download failed" });
  }
});

/* ================= DOWNLOAD ALL AS ZIP ================= */
router.get("/download-all/:groupId", async (req, res) => {
  try {
    const archiver = require("archiver");
    const axios    = require("axios");
    const files    = await File.find({ groupId: req.params.groupId });
    if (!files.length) return res.status(404).json({ msg: "No files found" });

    const group    = await Group.findById(req.params.groupId);
    const zipName  = `${(group?.name || "group").replace(/[^a-zA-Z0-9_-]/g, "_")}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("error", err => { console.error(err); res.end(); });
    archive.pipe(res);

    const imageExts = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
    const seen = { images: {}, documents: {} };

    for (const file of files) {
      const folder = imageExts.test(path.extname(file.originalName)) ? "images" : "documents";
      let name = file.originalName;
      if (seen[folder][name]) {
        const ext  = path.extname(name);
        const base = path.basename(name, ext);
        name = `${base}_${seen[folder][name]}${ext}`;
      }
      seen[folder][file.originalName] = (seen[folder][file.originalName] || 1) + 1;

      if (USE_CLOUD) {
        // Stream from Cloudinary URL
        try {
          const resp = await axios.get(file.fileUrl, { responseType: "stream" });
          archive.append(resp.data, { name: `${folder}/${name}` });
        } catch { /* skip unreachable files */ }
      } else {
        const filePath = path.join(UPLOADS_DIR, file.filename);
        if (fs.existsSync(filePath)) archive.file(filePath, { name: `${folder}/${name}` });
      }
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
    const userEmail = req.body.userEmail || req.body.email;
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ msg: "File not found" });

    const group = await Group.findById(file.groupId).populate("admin", "email");
    if (file.uploadedByEmail !== userEmail && group?.admin?.email !== userEmail) {
      return res.status(403).json({ msg: "Not authorized to delete" });
    }

    if (USE_CLOUD) {
      try {
        const cloudinary = require("cloudinary").v2;
        await cloudinary.uploader.destroy(file.filename, { resource_type: "auto" });
      } catch {}
    } else {
      const filePath = path.join(UPLOADS_DIR, file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await File.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "File deleted" });
  } catch {
    res.status(500).json({ msg: "Delete failed" });
  }
});

module.exports = router;
