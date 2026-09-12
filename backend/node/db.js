/**
 * Astittva Real Estate - MongoDB Atlas Database Connector
 *
 * Configured for Hostinger Node.js 22.x deployment and local development.
 * Supports MONGODB_URI (Hostinger default) and MONGO_URL.
 * Maintains a persistent, reusable connection pool across all requests.
 */

const { MongoClient, createClient: _createClient } = require("mongodb");
// Hostinger snippet compatibility
const createClient = _createClient || ((uri, options) => new MongoClient(uri, options));
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const rawUri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  "mongodb://localhost:27017/astitva_db";

let cachedClient = null;
let cachedDb = null;
let connectPromise = null;
let lastFailTime = 0;
let lastFailError = null;
const RETRY_COOLDOWN_MS = 5000;

/**
 * Cleanly mask credentials in connection URI for safe console logging.
 */
function maskUri(uri) {
  try {
    return uri.replace(/\/\/(.*?)@/, "//***:***@");
  } catch {
    return "[hidden-uri]";
  }
}

/**
 * Extract database name from connection URI or environment variable.
 */
function parseDbNameFromUri(uri) {
  if (process.env.DB_NAME && process.env.DB_NAME.trim() !== "") {
    return process.env.DB_NAME.trim();
  }
  try {
    const urlObj = new URL(
      uri.replace(/^mongodb\+srv:\/\//, "http://").replace(/^mongodb:\/\//, "http://")
    );
    const dbPath = urlObj.pathname.replace(/^\//, "").split("?")[0];
    if (dbPath && dbPath.trim() !== "") {
      return dbPath.trim();
    }
  } catch {
    // If URL parsing fails, fallback
  }
  return null;
}

/**
 * Connect to MongoDB Atlas (or return existing cached connection pool).
 */
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (lastFailTime && Date.now() - lastFailTime < RETRY_COOLDOWN_MS) {
    throw lastFailError || new Error("[MongoDB] Connection in retry cooldown");
  }

  if (!connectPromise) {
    console.log(`[MongoDB] Initializing connection to Atlas: ${maskUri(rawUri)}`);

    const client = new MongoClient(rawUri, {
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      retryWrites: true,
      writeConcern: { w: "majority" },
    });

    connectPromise = (async () => {
      await client.connect();

      // Resolve database name
      let resolvedDbName = parseDbNameFromUri(rawUri);

      if (!resolvedDbName) {
        try {
          // Check available databases on cluster to attach to existing collections
          const adminDb = client.db().admin();
          const dbList = await adminDb.listDatabases();
          const existingNames = dbList.databases.map((d) => d.name);

          if (existingNames.includes("astitva_realestate")) {
            resolvedDbName = "astitva_realestate";
          } else if (existingNames.includes("astitva_db")) {
            resolvedDbName = "astitva_db";
          } else {
            resolvedDbName = "astitva_db";
          }
        } catch (err) {
          console.warn("[MongoDB] Could not list databases; falling back to default astitva_db:", err.message);
          resolvedDbName = "astitva_db";
        }
      }

      const database = client.db(resolvedDbName);
      console.log(`[MongoDB] Connected successfully. Active database: "${resolvedDbName}"`);

      cachedClient = client;
      cachedDb = database;
      return { client: cachedClient, db: cachedDb };
    })().catch((err) => {
      connectPromise = null;
      lastFailTime = Date.now();
      lastFailError = err;
      console.error("[MongoDB] Connection failed:", err.message);
      throw err;
    });
  }

  return connectPromise;
}

/**
 * Synchronously retrieve the active database instance (or null if connecting).
 */
function getDb() {
  return cachedDb;
}

function isConnected() {
  return Boolean(cachedDb && cachedClient);
}

function getClient() {
  return cachedClient;
}

module.exports = {
  createClient,
  connectToDatabase,
  getDb,
  isConnected,
  getClient,
  get client() {
    return cachedClient;
  },
  get db() {
    return cachedDb;
  },
};
