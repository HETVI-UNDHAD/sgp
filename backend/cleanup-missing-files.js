/**
 * Run once to remove DB records for files that no longer exist on disk:
 *   node cleanup-missing-files.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const File = require("./models/File");

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const files = await File.find({});
  let removed = 0;

  for (const f of files) {
    const filePath = path.join(__dirname, "uploads", f.filename);
    if (!fs.existsSync(filePath)) {
      console.log(`🗑️  Removing orphaned record: ${f.originalName} (${f.filename})`);
      await File.findByIdAndDelete(f._id);
      removed++;
    }
  }

  console.log(`\n✅ Done. Removed ${removed} orphaned record(s) out of ${files.length} total.`);
  await mongoose.disconnect();
}

cleanup().catch(err => { console.error(err); process.exit(1); });
