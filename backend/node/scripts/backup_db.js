/**
 * Astittva Real Estate - Database Backup Script
 * Backs up properties, blogs, users, leads, files, news_cache to JSON files.
 */
const { connectToDatabase } = require("../db");
const fs = require("fs");
const path = require("path");

async function runBackup() {
  console.log("=== Starting Astittva Database Backup ===");
  try {
    const { db } = await connectToDatabase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const targetDir = path.join(__dirname, "..", "..", "..", "backups", `backup_${timestamp}`);
    fs.mkdirSync(targetDir, { recursive: true });

    const collections = ["properties", "blogs", "users", "leads", "files", "news_cache", "login_attempts"];

    for (const colName of collections) {
      const docs = await db.collection(colName).find({}).toArray();
      const filePath = path.join(targetDir, `${colName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), "utf-8");
      console.log(`[PASS] Backed up ${colName}: ${docs.length} documents -> ${filePath}`);
    }

    console.log(`\n=== ALL COLLECTIONS BACKED UP SUCCESSFULLY TO: ${targetDir} ===`);
    process.exit(0);
  } catch (err) {
    console.error("[FAIL] Backup failed:", err);
    process.exit(1);
  }
}

runBackup();
