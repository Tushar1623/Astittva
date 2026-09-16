/**
 * Astittva Real Estate - Database Connection & Health Verification Script
 *
 * Tests the connection to MongoDB Atlas and verifies existing collections:
 * properties, blogs, users, leads, etc.
 */

const { connectToDatabase } = require("../db");

async function testConnection() {
  console.log("=== Testing Astittva MongoDB Atlas Connection ===");
  try {
    const { client, db } = await connectToDatabase();
    console.log(`[PASS] Successfully connected to database: "${db.databaseName}"`);

    // Verify collections
    const collections = await db.listCollections().toArray();
    console.log("\nExisting collections in database:");
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(` - ${c.name}: ${count} documents`);
    }

    // Verify properties
    const sampleProperty = await db.collection("properties").findOne();
    if (sampleProperty) {
      console.log(`\n[PASS] Sample property found: "${sampleProperty.project_name || sampleProperty.title || 'Untitled'}" (ID: ${sampleProperty._id})`);
    } else {
      console.log("\n[INFO] Properties collection is currently empty.");
    }

    // Verify users / admin
    const userCount = await db.collection("users").countDocuments();
    console.log(`[PASS] Total users in system: ${userCount}`);

    console.log("\n=== Database Connection Test PASSED ===");
    process.exit(0);
  } catch (err) {
    console.error("\n[FAIL] Database Connection Test FAILED:", err.message);
    process.exit(1);
  }
}

testConnection();
