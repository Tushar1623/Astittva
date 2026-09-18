const { connectToDatabase } = require("../db");
const { GridFSBucket } = require("mongodb");
const http = require("http");

async function main() {
  const { db } = await connectToDatabase();
  const bucket = new GridFSBucket(db);
  const uploadStream = bucket.openUploadStream("verify.png", {
    metadata: { content_type: "image/png" }
  });
  const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  
  uploadStream.end(pixel, () => {
    const testId = uploadStream.id.toString();
    console.log("[PASS] Uploaded test file to GridFS with ID:", testId);
    
    http.get("http://127.0.0.1:8000/api/files/mongo/" + testId, (res) => {
      console.log("[PASS] Status code:", res.statusCode);
      console.log("[PASS] Content-Type:", res.headers["content-type"]);
      console.log("[PASS] Cache-Control:", res.headers["cache-control"]);
      
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", async () => {
        const body = Buffer.concat(chunks);
        console.log("[PASS] Received bytes:", body.length);
        if (res.statusCode === 200 && body.length === pixel.length) {
          console.log("\n=== GRIDFS STREAMING FLOW TEST PASSED 100% ===");
        } else {
          console.error("[FAIL] Bad response");
        }
        await bucket.delete(uploadStream.id);
        console.log("[PASS] Cleaned up test GridFS document.");
        process.exit(0);
      });
    }).on("error", err => {
      console.error("[FAIL]", err.message);
      process.exit(1);
    });
  });
}

main();
