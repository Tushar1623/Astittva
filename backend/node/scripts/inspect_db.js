const { connectToDatabase, getDb } = require("../db");

async function inspect() {
  try {
    await connectToDatabase();
    const db = getDb();
    console.log("Database Name:", db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log("--- Existing Collections & Counts ---");
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documents`);
    }
  } catch (err) {
    console.error("Inspection Error:", err);
  } finally {
    process.exit(0);
  }
}

inspect();
