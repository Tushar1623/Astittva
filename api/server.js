/**
 * Astittva Real Estate - Production Node.js Server for Hostinger & Local Development
 *
 * Full API support matching existing Python FastAPI endpoints:
 * - Public properties & blogs (with Indian price parsing & location hierarchy)
 * - Leads collection
 * - Admin authentication & CRUD
 * - Static frontend serving for React SPA
 * - Connects to MongoDB Atlas via reusable connection in db.js
 */

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ObjectId, GridFSBucket } = require("mongodb");
const { Readable } = require("stream");
const http = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");
const { connectToDatabase, getDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 8000;

// Security & Auth configuration
const JWT_SECRET = process.env.JWT_SECRET || "astitva-secret-key-change-in-prod";
const ACCESS_EXPIRES_MIN = 60 * 12; // 12 hours
const REFRESH_EXPIRES_DAYS = 7;
const VALID_ROLES = ["admin", "sales", "marketing"];

// ---------------------------------------------------------------------------
// High-Speed In-Memory Cache System (Sub-millisecond API response)
// ---------------------------------------------------------------------------
const memoryCache = new Map();

function cacheGet(key) {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key, data, ttlSeconds = 300) {
  if (memoryCache.size > 1000) {
    const oldestKey = memoryCache.keys().next().value;
    memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function cacheInvalidatePrefix(prefix) {
  for (const k of memoryCache.keys()) {
    if (k.startsWith(prefix)) {
      memoryCache.delete(k);
    }
  }
}

const IMAGE_CACHE_DIR = path.join(__dirname, ".image_cache");
if (!fs.existsSync(IMAGE_CACHE_DIR)) {
  try {
    fs.mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
  } catch {}
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins with credentials (browser CORS requirement)
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

// Auto-connect to MongoDB for API endpoints that query the database
app.use(async (req, res, next) => {
  if (
    req.path === "/healthz" ||
    req.path === "/api" ||
    req.path === "/api/" ||
    req.path.startsWith("/api/images/")
  ) {
    return next();
  }

  if (req.path.startsWith("/api/")) {
    try {
      if (!getDb()) {
        await connectToDatabase();
        await seedDefaultAdmin();
      }
    } catch (err) {
      return res.status(503).json({
        detail: "Database connection unavailable, please retry",
        error: err.message,
      });
    }
  }
  next();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function nowUtcIso() {
  return new Date().toISOString();
}

function createAccessToken(userId, email, role) {
  return jwt.sign(
    {
      sub: String(userId),
      email,
      role,
      type: "access",
    },
    JWT_SECRET,
    { expiresIn: `${ACCESS_EXPIRES_MIN}m` }
  );
}

function createRefreshToken(userId) {
  return jwt.sign(
    {
      sub: String(userId),
      type: "refresh",
    },
    JWT_SECRET,
    { expiresIn: `${REFRESH_EXPIRES_DAYS}d` }
  );
}

function setAuthCookies(res, accessToken, refreshToken) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: ACCESS_EXPIRES_MIN * 60 * 1000,
    path: "/",
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearAuthCookies(res) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
}

async function authenticateUser(req, res, next) {
  let token = req.cookies?.access_token;
  if (!token) {
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type !== "access") {
      return res.status(401).json({ detail: "Invalid token type" });
    }
    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(payload.sub) };
    } catch {
      query = { id: payload.sub };
    }
    const user = await db.collection("users").findOne(query);
    if (!user) {
      return res.status(401).json({ detail: "User not found" });
    }

    user.id = String(user._id);
    delete user.password_hash;
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ detail: "Token expired" });
    }
    return res.status(401).json({ detail: "Invalid token" });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ detail: "Insufficient privileges" });
    }
    next();
  };
}

const requireAdmin = [authenticateUser, requireRole("admin")];
const requireStaff = [authenticateUser, requireRole("admin", "sales", "marketing")];

// ---------- Indian Price parsing & property serialization ----------
const PRICE_NUMBER_RE = /(\d+(?:[.,]\d+)?)/;

function parsePriceLabel(label) {
  if (!label || typeof label !== "string") return null;
  const cleaned = label.replace(/,/g, "").replace(/₹/g, "").trim().toLowerCase();
  const m = cleaned.match(PRICE_NUMBER_RE);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (isNaN(n)) return null;
  if (cleaned.includes("cr") || cleaned.includes("crore")) return n * 10000000;
  if (cleaned.includes("lac") || cleaned.includes("lakh")) return n * 100000;
  return n;
}

function effectivePrice(doc) {
  const sp = doc.starting_price;
  if (typeof sp === "number" && sp > 0) return sp;
  return parsePriceLabel(doc.price_label);
}

function serializeProperty(doc) {
  return {
    id: String(doc._id),
    project_name: doc.project_name || "",
    builder: doc.builder || "",
    location: doc.location || "",
    city: doc.city || "",
    starting_price: doc.starting_price != null ? doc.starting_price : null,
    price_label: doc.price_label || "",
    property_type: doc.property_type || "",
    property_category: doc.property_category || "",
    description: doc.description || "",
    images: Array.isArray(doc.images) ? doc.images : [],
    rera_number: doc.rera_number || "",
    possession_date: doc.possession_date || "",
    availability: doc.availability || "",
    google_maps_url: doc.google_maps_url || "",
    bedrooms: doc.bedrooms || "",
    area_sqft: doc.area_sqft || "",
    amenities: Array.isArray(doc.amenities) ? doc.amenities : [],
    status: doc.status || "draft",
    is_featured: Boolean(doc.is_featured),
    created_at: doc.created_at || "",
    updated_at: doc.updated_at || "",
  };
}

function serializeBlog(doc) {
  return {
    id: String(doc._id),
    title: doc.title || "",
    slug: doc.slug || "",
    featured_image: doc.featured_image || "",
    short_description: doc.short_description || "",
    body: doc.body || "",
    seo_title: doc.seo_title || "",
    seo_description: doc.seo_description || "",
    seo_keywords: doc.seo_keywords || "",
    status: doc.status || "draft",
    publish_date: doc.publish_date || "",
    author: doc.author || "Astittva Editorial",
    created_at: doc.created_at || "",
    updated_at: doc.updated_at || "",
  };
}

function serializeBlogSummary(doc) {
  return {
    id: String(doc._id),
    title: doc.title || "",
    slug: doc.slug || "",
    featured_image: doc.featured_image || "",
    short_description: doc.short_description || "",
    status: doc.status || "draft",
    publish_date: doc.publish_date || "",
    author: doc.author || "Astittva Editorial",
    created_at: doc.created_at || "",
    updated_at: doc.updated_at || "",
  };
}

function slugify(text) {
  if (!text) return "blog";
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.substring(0, 120) || "blog";
}

// ---------------------------------------------------------------------------
// Health & API Root
// ---------------------------------------------------------------------------
app.get("/healthz", (req, res) => {
  res.json({
    status: "ok",
    service: "Astitva Real Estate API",
    time: nowUtcIso(),
    mongodb: getDb() ? "connected" : "connecting",
  });
});

app.get(["/api", "/api/"], (req, res) => {
  res.json({ service: "Astitva Real Estate API", ok: true });
});

// ---------------------------------------------------------------------------
// Auth Routes
// ---------------------------------------------------------------------------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ detail: "Email and password required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    const db = getDb();
    const user = await db.collection("users").findOne({ email: cleanEmail });

    if (!user || !user.password_hash) {
      return res.status(401).json({ detail: "Invalid credentials" });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ detail: "Invalid credentials" });
    }

    const uid = String(user._id);
    const access = createAccessToken(uid, user.email, user.role);
    const refresh = createRefreshToken(uid);
    setAuthCookies(res, access, refresh);

    return res.json({
      user: {
        id: uid,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      access_token: access,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ detail: "Authentication failed" });
  }
});

app.post("/api/auth/logout", authenticateUser, (req, res) => {
  clearAuthCookies(res);
  return res.json({ ok: true });
});

app.get("/api/auth/me", authenticateUser, (req, res) => {
  return res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
  });
});

app.post("/api/auth/refresh", async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ detail: "No refresh token" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type !== "refresh") {
      return res.status(401).json({ detail: "Invalid token type" });
    }
    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(payload.sub) };
    } catch {
      query = { id: payload.sub };
    }
    const user = await db.collection("users").findOne(query);
    if (!user) {
      return res.status(401).json({ detail: "User not found" });
    }
    const access = createAccessToken(String(user._id), user.email, user.role);
    setAuthCookies(res, access, token);
    return res.json({ access_token: access });
  } catch {
    return res.status(401).json({ detail: "Invalid refresh token" });
  }
});

// ---------------------------------------------------------------------------
// High-Speed Cached Image Proxy (Optimized size & 30-day HTTP caching)
// ---------------------------------------------------------------------------
app.get("/api/images/thumbnail", async (req, res) => {
  const fileId = req.query.id;
  if (!fileId || typeof fileId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return res.status(400).json({ detail: "Invalid image ID" });
  }

  const width = Math.min(Math.max(parseInt(req.query.w, 10) || 600, 100), 1600);
  const cacheFile = path.join(IMAGE_CACHE_DIR, `${fileId}_w${width}.jpg`);

  if (fs.existsSync(cacheFile)) {
    res.set({
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=2592000, immutable",
      "X-Cache": "HIT",
    });
    return fs.createReadStream(cacheFile).pipe(res);
  }

  const driveUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const upstream = await fetch(driveUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    clearTimeout(timeoutId);

    if (upstream.ok) {
      const contentType = upstream.headers.get("content-type") || "image/jpeg";
      const buffer = Buffer.from(await upstream.arrayBuffer());
      if (buffer.length > 500 && !contentType.includes("text/html")) {
        fs.promises.writeFile(cacheFile, buffer).catch((err) => {
          console.error("[ImageProxy] Cache write error:", err.message);
        });
        res.set({
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=2592000, immutable",
          "X-Cache": "MISS",
        });
        return res.end(buffer);
      }
    }
  } catch (err) {
    clearTimeout(timeoutId);
  }

  // Graceful fallback to direct Google Drive redirect if proxy fetch encounters issues
  return res.redirect(302, driveUrl);
});

// ---------------------------------------------------------------------------
// Properties (Public - Cached & Accelerated)
// ---------------------------------------------------------------------------
app.get("/api/properties", async (req, res) => {
  try {
    const cacheKey = `prop:list:${JSON.stringify(req.query)}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set({
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
      });
      return res.json(cached);
    }

    const db = getDb();
    const query = { status: "published" };

    if (req.query.city) {
      query.city = req.query.city;
    }

    if (req.query.location) {
      const LOCATION_HIERARCHY = {
        Kolkata: [
          "Kolkata", "New Town", "Rajarhat",
          "Action Area I", "Action Area II", "Action Area III",
          "Action Area 1", "Action Area 2", "Action Area 3",
        ],
        "New Town": [
          "New Town",
          "Action Area I", "Action Area II", "Action Area III",
          "Action Area 1", "Action Area 2", "Action Area 3",
        ],
        "Action Area I": ["Action Area I", "Action Area 1", "New Town"],
        "Action Area II": ["Action Area II", "Action Area 2", "New Town"],
        "Action Area III": ["Action Area III", "Action Area 3", "New Town"],
        "Action Area 1": ["Action Area I", "Action Area 1", "New Town"],
        "Action Area 2": ["Action Area II", "Action Area 2", "New Town"],
        "Action Area 3": ["Action Area III", "Action Area 3", "New Town"],
      };
      const loc = req.query.location;
      const values = LOCATION_HIERARCHY[loc] || [loc];
      query.$or = [{ location: { $in: values } }, { city: { $in: values } }];
    }

    if (req.query.property_type) {
      query.property_type = {
        $regex: `^${req.query.property_type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }

    if (req.query.category) {
      query.property_category = {
        $regex: `^${req.query.category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }

    if (req.query.builder) {
      const norm = req.query.builder.trim();
      if (norm) {
        query.builder = { $regex: norm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      }
    }

    if (req.query.availability) {
      query.availability = {
        $regex: `^${req.query.availability.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }

    if (req.query.featured !== undefined) {
      query.is_featured = req.query.featured === "true" || req.query.featured === true;
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    let docs = await db
      .collection("properties")
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    // In-memory price normalization
    const minPrice = req.query.min_price != null ? parseFloat(req.query.min_price) : null;
    const maxPrice = req.query.max_price != null ? parseFloat(req.query.max_price) : null;

    if (minPrice != null || maxPrice != null) {
      docs = docs.filter((d) => {
        const p = effectivePrice(d);
        if (p == null) return false;
        if (minPrice != null && p < minPrice) return false;
        if (maxPrice != null && p > maxPrice) return false;
        return true;
      });
    }

    const result = docs.map(serializeProperty);
    cacheSet(cacheKey, result, 300); // 5 min TTL
    res.set({
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
    });
    return res.json(result);
  } catch (err) {
    console.error("List properties error:", err);
    return res.status(500).json({ detail: "Failed to fetch properties" });
  }
});

app.get("/api/properties/:id", async (req, res) => {
  try {
    const cacheKey = `prop:item:${req.params.id}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set({
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      });
      return res.json(cached);
    }

    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }
    const doc = await db.collection("properties").findOne(query);
    if (!doc || doc.status !== "published") {
      return res.status(404).json({ detail: "Property not found" });
    }
    const result = serializeProperty(doc);
    cacheSet(cacheKey, result, 600); // 10 min TTL
    res.set({
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    });
    return res.json(result);
  } catch {
    return res.status(400).json({ detail: "Invalid property ID" });
  }
});

// ---------------------------------------------------------------------------
// Blogs (Public - Cached & Accelerated)
// ---------------------------------------------------------------------------
app.get("/api/blogs", async (req, res) => {
  try {
    const cacheKey = `blog:list:${req.query.limit || 50}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set({
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      });
      return res.json(cached);
    }

    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const docs = await db
      .collection("blogs")
      .find({ status: "published" })
      .sort({ publish_date: -1, created_at: -1 })
      .limit(limit)
      .toArray();
    const result = docs.map(serializeBlogSummary);
    cacheSet(cacheKey, result, 600); // 10 min TTL
    res.set({
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    });
    return res.json(result);
  } catch (err) {
    console.error("List blogs error:", err);
    return res.status(500).json({ detail: "Failed to fetch blogs" });
  }
});

app.get("/api/blogs/:slug", async (req, res) => {
  try {
    const cacheKey = `blog:item:${req.params.slug}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set({
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
      });
      return res.json(cached);
    }

    const db = getDb();
    const slug = req.params.slug;
    let doc = await db.collection("blogs").findOne({ slug, status: "published" });
    if (!doc) {
      try {
        doc = await db.collection("blogs").findOne({ _id: new ObjectId(slug), status: "published" });
      } catch {
        // Not an ObjectId
      }
    }
    if (!doc) {
      return res.status(404).json({ detail: "Blog not found" });
    }
    const result = serializeBlog(doc);
    cacheSet(cacheKey, result, 600);
    res.set({
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
    });
    return res.json(result);
  } catch (err) {
    console.error("Get blog error:", err);
    return res.status(500).json({ detail: "Failed to fetch blog" });
  }
});

// ---------------------------------------------------------------------------
// Outbound CRM Forwarding (Property Leads Only)
// ---------------------------------------------------------------------------
function forwardPropertyLeadToCrm(doc) {
  const crmBaseUrl = (process.env.CRM_BASE_URL || "").trim().replace(/\/+$/, "");
  const crmApiKey = (process.env.CRM_API_KEY || "").trim();
  if (!crmBaseUrl || !crmApiKey) {
    return Promise.resolve({ status: "skipped", reason: "CRM not configured" });
  }

  return new Promise((resolve) => {
    try {
      const url = new URL(`${crmBaseUrl}/leads`);
      const postData = JSON.stringify({
        prefix: doc.prefix || "Mr",
        firstName: doc.first_name || doc.name || "",
        lastName: doc.last_name || "",
        phoneCode: doc.phone_code || "+91",
        phone: doc.phone || "",
        email: doc.email || "",
        leadType: doc.leadType || doc.interest || "Property Enquiry",
        source: doc.source || "Website",
        property: doc.propertyName || doc.project || "",
        location: doc.location || doc.preferred_locality || "",
        additionalNotes: [
          `Lead Type: ${doc.leadType || doc.interest || "Property Enquiry"}`,
          `Source: ${doc.source || "Website"}`,
          doc.propertyName ? `Property: ${doc.propertyName}` : null,
          doc.location ? `Location: ${doc.location}` : null,
          doc.message ? `Message: ${doc.message}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        environment: process.env.CRM_ENV || "development",
        platform: process.env.CRM_PLATFORM || "astittva-website",
      });

      const client = url.protocol === "https:" ? https : http;
      const req = client.request(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
            "x-api-key": crmApiKey,
          },
          timeout: 15000,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            resolve({
              status: res.statusCode < 300 ? "forwarded" : "failed",
              statusCode: res.statusCode,
              body: data,
            });
          });
        }
      );
      req.on("error", (err) => {
        console.warn("[CRM] Outbound forward error:", err.message);
        resolve({ status: "error", error: err.message });
      });
      req.on("timeout", () => {
        req.destroy();
        resolve({ status: "timeout" });
      });
      req.write(postData);
      req.end();
    } catch (err) {
      resolve({ status: "error", error: err.message });
    }
  });
}

// ---------------------------------------------------------------------------
// Resume Storage in MongoDB GridFS (Career Applications)
// ---------------------------------------------------------------------------
function storeResumeInGridFS(db, filename, contentType, buffer) {
  return new Promise((resolve, reject) => {
    try {
      const bucket = new GridFSBucket(db, { bucketName: "career_resumes" });
      const safeFilename = (filename || "resume.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
      const uploadStream = bucket.openUploadStream(safeFilename, {
        contentType: contentType || "application/pdf",
        metadata: { uploadedAt: nowUtcIso() },
      });
      const stream = Readable.from(buffer);
      stream
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", () => {
          resolve({ fileId: uploadStream.id, filename: safeFilename });
        });
    } catch (err) {
      reject(err);
    }
  });
}

// ---------------------------------------------------------------------------
// PROPERTY LEADS (Public Submission: POST /api/leads/property)
// ---------------------------------------------------------------------------
app.post("/api/leads/property", async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    const name = (body.name || `${body.first_name || ""} ${body.last_name || ""}`).trim();
    const phone = (body.phone || "").trim();
    const email = (body.email || "").toLowerCase().trim();

    if (!name && !phone && !email) {
      return res.status(400).json({ detail: "Please provide your name, phone number, or email." });
    }

    const leadDoc = {
      name: name || "Anonymous Enquiry",
      phone: phone,
      email: email,
      propertyId: body.propertyId || body.property_id || "",
      propertyName: body.propertyName || body.project || body.project_name || "",
      location: body.location || body.preferred_locality || body.property_location || body.preferred_city || "",
      leadType: body.leadType || body.lead_type || body.interest || "Property Enquiry",
      message: body.message || "",
      source: body.source || "property-form",
      status: "New",
      assignedTo: body.assignedTo || "Unassigned",
      notes: "",
      createdAt: nowUtcIso(),
      updatedAt: nowUtcIso(),
    };

    // 1. Insert into dedicated property_leads collection
    const result = await db.collection("property_leads").insertOne(leadDoc);
    const insertedId = result.insertedId;
    leadDoc._id = insertedId;
    leadDoc.id = String(insertedId);

    // 2. Also keep in legacy leads collection so existing external consumers/backups remain unharmed
    try {
      await db.collection("leads").insertOne({
        ...leadDoc,
        _id: insertedId,
        first_name: body.first_name || "",
        last_name: body.last_name || "",
        interest: leadDoc.leadType,
        project: leadDoc.propertyName,
        property_location: leadDoc.location,
        preferred_locality: leadDoc.location,
        created_at: leadDoc.createdAt,
        status: "new",
      });
    } catch {}

    // 3. Outbound CRM forwarding (asynchronous & failure-isolated)
    forwardPropertyLeadToCrm(leadDoc).catch(() => {});

    return res.status(201).json({
      id: String(insertedId),
      ok: true,
      leadType: leadDoc.leadType,
      message: "Property enquiry submitted successfully",
    });
  } catch (err) {
    console.error("Create property lead error:", err);
    return res.status(500).json({ detail: "Failed to record property inquiry" });
  }
});

// ---------------------------------------------------------------------------
// CAREER APPLICATIONS (Public Submission: POST /api/leads/career)
// ---------------------------------------------------------------------------
app.post("/api/leads/career", async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    const name = (body.name || "").trim();
    const phone = (body.phone || "").trim();
    const email = (body.email || "").toLowerCase().trim();
    const jobTitle = (body.jobTitle || body.role_interest || body.position || "").trim();

    if (!name) {
      return res.status(400).json({ detail: "Full name is required." });
    }
    if (!phone) {
      return res.status(400).json({ detail: "Phone number is required." });
    }
    if (!email) {
      return res.status(400).json({ detail: "Email address is required." });
    }
    if (!jobTitle) {
      return res.status(400).json({ detail: "Position applying for is required." });
    }

    // Process resume upload if provided (base64 or link)
    let resumeFileId = null;
    let resumeFilename = "";
    let resumeUrl = (body.resumeUrl || body.linkedin || "").trim();

    if (body.resume && body.resume.base64) {
      const { filename, contentType, base64 } = body.resume;
      const rawExt = (filename || "cv.pdf").split(".").pop().toLowerCase();
      const allowedExts = ["pdf", "doc", "docx"];
      if (!allowedExts.includes(rawExt)) {
        return res.status(400).json({ detail: "Only PDF, DOC, and DOCX files are accepted for resumes." });
      }

      // Strip data URI prefix if present
      const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ detail: "Resume file must be less than 10MB." });
      }

      const stored = await storeResumeInGridFS(db, filename, contentType, buffer);
      resumeFileId = stored.fileId;
      resumeFilename = stored.filename;
    }

    const applicationDoc = {
      name,
      phone,
      email,
      jobTitle,
      department: (body.department || "Advisory & Client Relations").trim(),
      experience: (body.experience || "Not specified").trim(),
      location: (body.location || body.currentLocation || "Kolkata").trim(),
      resumeUrl: resumeUrl || "",
      resumeFilename: resumeFilename || "",
      resumeFileId: resumeFileId || null,
      coverLetter: (body.coverLetter || body.message || "").trim(),
      source: body.source || "career-portal",
      status: "New",
      notes: "",
      createdAt: nowUtcIso(),
      updatedAt: nowUtcIso(),
    };

    const result = await db.collection("career_applications").insertOne(applicationDoc);
    const insertedId = result.insertedId;

    if (resumeFileId) {
      // Set the secure admin download URL
      const secureDownloadUrl = `/api/admin/leads/career/${insertedId}/resume`;
      await db.collection("career_applications").updateOne(
        { _id: insertedId },
        { $set: { resumeUrl: secureDownloadUrl } }
      );
    }

    // Career applications are NEVER forwarded to property CRM per requirements.
    return res.status(201).json({
      id: String(insertedId),
      ok: true,
      message: "Application submitted successfully. Our talent team will review your profile.",
    });
  } catch (err) {
    console.error("Create career application error:", err);
    return res.status(500).json({ detail: "Failed to submit career application" });
  }
});

// ---------------------------------------------------------------------------
// Backward-Compatible Generic Leads Endpoint (POST /api/leads)
// ---------------------------------------------------------------------------
app.post("/api/leads", async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    // Check if this looks like a career submission from an older client
    const isCareer =
      body.investment_purpose === "Career / Employment" ||
      (body.property_type && body.property_type.toLowerCase().includes("career")) ||
      (body.source && body.source.toLowerCase().includes("career"));

    if (isCareer) {
      const careerDoc = {
        name: body.name || `${body.first_name || ""} ${body.last_name || ""}`.trim(),
        phone: body.phone || "",
        email: (body.email || "").toLowerCase().trim(),
        jobTitle: body.jobTitle || body.role_interest || "General Application",
        department: body.department || "Advisory & Client Relations",
        experience: body.experience || "Not specified",
        location: body.location || "Kolkata",
        resumeUrl: body.resumeUrl || body.linkedin || "",
        resumeFilename: "",
        resumeFileId: null,
        coverLetter: body.coverLetter || body.message || "",
        source: body.source || "career-portal-legacy",
        status: "New",
        notes: "",
        createdAt: nowUtcIso(),
        updatedAt: nowUtcIso(),
      };
      const result = await db.collection("career_applications").insertOne(careerDoc);
      return res.status(201).json({ id: String(result.insertedId), ok: true, type: "career" });
    }

    // Otherwise, route to property_leads
    const propDoc = {
      name: body.name || `${body.first_name || ""} ${body.last_name || ""}`.trim(),
      phone: body.phone || "",
      email: (body.email || "").toLowerCase().trim(),
      propertyId: body.propertyId || body.property_id || "",
      propertyName: body.propertyName || body.project || body.project_name || "",
      location:
        body.location ||
        body.preferred_locality ||
        body.property_location ||
        body.preferred_city ||
        "Kolkata",
      leadType: body.leadType || body.interest || "Property Enquiry",
      message: body.message || "",
      source: body.source || "homepage",
      status: "New",
      assignedTo: "Unassigned",
      notes: "",
      createdAt: nowUtcIso(),
      updatedAt: nowUtcIso(),
    };
    const result = await db.collection("property_leads").insertOne(propDoc);
    const insertedId = result.insertedId;
    propDoc._id = insertedId;
    propDoc.id = String(insertedId);

    // Also mirror to legacy leads
    try {
      await db.collection("leads").insertOne({
        ...propDoc,
        _id: insertedId,
        status: "new",
        created_at: propDoc.createdAt,
      });
    } catch {}

    forwardPropertyLeadToCrm(propDoc).catch(() => {});
    return res.status(201).json(propDoc);
  } catch (err) {
    console.error("Create legacy lead error:", err);
    return res.status(500).json({ detail: "Failed to record inquiry" });
  }
});

// ---------------------------------------------------------------------------
// Admin Properties
// ---------------------------------------------------------------------------
app.get("/api/admin/properties", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const docs = await db.collection("properties").find().sort({ created_at: -1 }).limit(500).toArray();
    return res.json(docs.map(serializeProperty));
  } catch (err) {
    return res.status(500).json({ detail: "Failed to fetch admin properties" });
  }
});

app.get("/api/admin/properties/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection("properties").findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ detail: "Property not found" });
    return res.json(serializeProperty(doc));
  } catch {
    return res.status(400).json({ detail: "Invalid ID" });
  }
});

app.post("/api/admin/properties", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const doc = { ...req.body, created_at: nowUtcIso(), updated_at: nowUtcIso() };
    const result = await db.collection("properties").insertOne(doc);
    doc._id = result.insertedId || result.inserted_id;
    cacheInvalidatePrefix("prop:");
    return res.status(201).json(serializeProperty(doc));
  } catch (err) {
    return res.status(500).json({ detail: "Failed to create property" });
  }
});

app.put("/api/admin/properties/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const update = { ...req.body, updated_at: nowUtcIso() };
    delete update._id;
    delete update.id;

    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }

    const rawResult = await db
      .collection("properties")
      .findOneAndUpdate(query, { $set: update }, { returnDocument: "after" });
    const updatedDoc = rawResult?.value || rawResult;
    if (!updatedDoc) return res.status(404).json({ detail: "Property not found" });
    cacheInvalidatePrefix("prop:");
    return res.json(serializeProperty(updatedDoc));
  } catch (err) {
    console.error("[Admin] Update property error:", err);
    return res.status(400).json({ detail: "Failed to update property" });
  }
});

app.patch("/api/admin/properties/:id/status", requireStaff, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["draft", "published", "unpublished"].includes(status)) {
      return res.status(400).json({ detail: "Invalid status" });
    }
    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }
    const result = await db
      .collection("properties")
      .updateOne(query, { $set: { status, updated_at: nowUtcIso() } });
    if (result.matchedCount === 0) return res.status(404).json({ detail: "Property not found" });
    cacheInvalidatePrefix("prop:");
    return res.json({ ok: true, status });
  } catch {
    return res.status(400).json({ detail: "Failed to update status" });
  }
});

app.delete("/api/admin/properties/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }
    const result = await db.collection("properties").deleteOne(query);
    if (result.deletedCount === 0) return res.status(404).json({ detail: "Property not found" });
    cacheInvalidatePrefix("prop:");
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ detail: "Failed to delete property" });
  }
});

// ---------------------------------------------------------------------------
// Admin Blogs
// ---------------------------------------------------------------------------
app.get("/api/admin/blogs", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const docs = await db.collection("blogs").find().sort({ created_at: -1 }).limit(500).toArray();
    return res.json(docs.map(serializeBlogSummary));
  } catch {
    return res.status(500).json({ detail: "Failed to fetch admin blogs" });
  }
});

app.get("/api/admin/blogs/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { slug: req.params.id };
    }
    const doc = await db.collection("blogs").findOne(query);
    if (!doc) return res.status(404).json({ detail: "Blog not found" });
    return res.json(serializeBlog(doc));
  } catch {
    return res.status(400).json({ detail: "Invalid ID" });
  }
});

app.post("/api/admin/blogs", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const doc = { ...req.body };
    const baseSlug = slugify(doc.slug || doc.title || "blog");
    let uniqueSlug = baseSlug;
    let n = 2;
    while (await db.collection("blogs").findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${n}`;
      n++;
    }
    doc.slug = uniqueSlug;
    doc.created_at = nowUtcIso();
    doc.updated_at = doc.created_at;
    if (doc.status === "published" && !doc.publish_date) {
      doc.publish_date = doc.created_at.substring(0, 10);
    }
    const result = await db.collection("blogs").insertOne(doc);
    doc._id = result.insertedId || result.inserted_id;
    cacheInvalidatePrefix("blog:");
    return res.status(201).json(serializeBlog(doc));
  } catch (err) {
    return res.status(500).json({ detail: "Failed to create blog" });
  }
});

app.put("/api/admin/blogs/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const update = { ...req.body, updated_at: nowUtcIso() };
    delete update._id;
    delete update.id;

    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { slug: req.params.id };
    }

    const rawResult = await db
      .collection("blogs")
      .findOneAndUpdate(query, { $set: update }, { returnDocument: "after" });
    const updatedDoc = rawResult?.value || rawResult;
    if (!updatedDoc) return res.status(404).json({ detail: "Blog not found" });
    cacheInvalidatePrefix("blog:");
    return res.json(serializeBlog(updatedDoc));
  } catch (err) {
    console.error("[Admin] Update blog error:", err);
    return res.status(400).json({ detail: "Failed to update blog" });
  }
});

app.patch("/api/admin/blogs/:id/status", requireStaff, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({ detail: "Invalid status" });
    }
    const db = getDb();
    const update = { status, updated_at: nowUtcIso() };
    if (status === "published") {
      const existing = await db.collection("blogs").findOne({ _id: new ObjectId(req.params.id) });
      if (existing && !existing.publish_date) {
        update.publish_date = update.updated_at.substring(0, 10);
      }
    }
    const result = await db
      .collection("blogs")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    if (result.matchedCount === 0) return res.status(404).json({ detail: "Blog not found" });
    cacheInvalidatePrefix("blog:");
    return res.json({ ok: true, status });
  } catch {
    return res.status(400).json({ detail: "Failed to update status" });
  }
});

app.delete("/api/admin/blogs/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection("blogs").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ detail: "Blog not found" });
    cacheInvalidatePrefix("blog:");
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ detail: "Failed to delete blog" });
  }
});

// ---------------------------------------------------------------------------
// ADMIN PROPERTY LEADS
// ---------------------------------------------------------------------------
app.get("/api/admin/leads/property", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const docs = await db
      .collection("property_leads")
      .find()
      .sort({ createdAt: -1, created_at: -1 })
      .limit(1000)
      .toArray();

    return res.json(
      docs.map((d) => ({
        id: String(d._id),
        _id: String(d._id),
        name: d.name || "",
        phone: d.phone || "",
        email: d.email || "",
        propertyId: d.propertyId || "",
        propertyName: d.propertyName || d.project || "",
        location: d.location || d.preferred_locality || "",
        leadType: d.leadType || d.interest || "Property Enquiry",
        message: d.message || "",
        source: d.source || "website",
        status: d.status || "New",
        assignedTo: d.assignedTo || "Unassigned",
        notes: d.notes || "",
        createdAt: d.createdAt || d.created_at || nowUtcIso(),
        updatedAt: d.updatedAt || d.updated_at || d.createdAt || nowUtcIso(),
      }))
    );
  } catch (err) {
    console.error("Fetch property leads error:", err);
    return res.status(500).json({ detail: "Failed to fetch property leads" });
  }
});

app.get("/api/admin/leads/property/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const d = await db.collection("property_leads").findOne({ _id: new ObjectId(req.params.id) });
    if (!d) return res.status(404).json({ detail: "Property lead not found" });

    return res.json({
      id: String(d._id),
      _id: String(d._id),
      name: d.name || "",
      phone: d.phone || "",
      email: d.email || "",
      propertyId: d.propertyId || "",
      propertyName: d.propertyName || d.project || "",
      location: d.location || d.preferred_locality || "",
      leadType: d.leadType || d.interest || "Property Enquiry",
      message: d.message || "",
      source: d.source || "website",
      status: d.status || "New",
      assignedTo: d.assignedTo || "Unassigned",
      notes: d.notes || "",
      createdAt: d.createdAt || d.created_at,
      updatedAt: d.updatedAt || d.updated_at,
    });
  } catch {
    return res.status(400).json({ detail: "Invalid property lead ID" });
  }
});

app.patch("/api/admin/leads/property/:id", requireStaff, async (req, res) => {
  try {
    const { status, assignedTo, notes } = req.body || {};
    const db = getDb();
    const updateFields = { updatedAt: nowUtcIso() };
    if (status !== undefined) updateFields.status = status;
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;
    if (notes !== undefined) updateFields.notes = notes;

    const result = await db
      .collection("property_leads")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: "Property lead not found" });
    }

    if (status !== undefined) {
      try {
        await db.collection("leads").updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { status: status.toLowerCase(), updated_at: nowUtcIso() } }
        );
      } catch {}
    }

    return res.json({ ok: true, message: "Property lead updated successfully" });
  } catch (err) {
    return res.status(400).json({ detail: "Failed to update property lead" });
  }
});

app.delete("/api/admin/leads/property/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection("property_leads").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Property lead not found" });
    }
    try {
      await db.collection("leads").deleteOne({ _id: new ObjectId(req.params.id) });
    } catch {}
    return res.json({ ok: true, message: "Property lead deleted" });
  } catch {
    return res.status(400).json({ detail: "Failed to delete property lead" });
  }
});

// ---------------------------------------------------------------------------
// ADMIN CAREER APPLICATIONS
// ---------------------------------------------------------------------------
app.get("/api/admin/leads/career", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const docs = await db
      .collection("career_applications")
      .find()
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();

    return res.json(
      docs.map((d) => ({
        id: String(d._id),
        _id: String(d._id),
        name: d.name || "",
        phone: d.phone || "",
        email: d.email || "",
        jobTitle: d.jobTitle || "",
        department: d.department || "",
        experience: d.experience || "",
        location: d.location || "",
        resumeUrl: d.resumeUrl || (d.resumeFileId ? `/api/admin/leads/career/${d._id}/resume` : ""),
        resumeFilename: d.resumeFilename || "",
        hasResumeFile: Boolean(d.resumeFileId),
        coverLetter: d.coverLetter || "",
        source: d.source || "career-portal",
        status: d.status || "New",
        notes: d.notes || "",
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }))
    );
  } catch (err) {
    console.error("Fetch career applications error:", err);
    return res.status(500).json({ detail: "Failed to fetch career applications" });
  }
});

app.get("/api/admin/leads/career/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const d = await db.collection("career_applications").findOne({ _id: new ObjectId(req.params.id) });
    if (!d) return res.status(404).json({ detail: "Career application not found" });

    return res.json({
      id: String(d._id),
      _id: String(d._id),
      name: d.name || "",
      phone: d.phone || "",
      email: d.email || "",
      jobTitle: d.jobTitle || "",
      department: d.department || "",
      experience: d.experience || "",
      location: d.location || "",
      resumeUrl: d.resumeUrl || (d.resumeFileId ? `/api/admin/leads/career/${d._id}/resume` : ""),
      resumeFilename: d.resumeFilename || "",
      hasResumeFile: Boolean(d.resumeFileId),
      coverLetter: d.coverLetter || "",
      source: d.source || "career-portal",
      status: d.status || "New",
      notes: d.notes || "",
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    });
  } catch {
    return res.status(400).json({ detail: "Invalid career application ID" });
  }
});

app.get("/api/admin/leads/career/:id/resume", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const appDoc = await db.collection("career_applications").findOne({ _id: new ObjectId(req.params.id) });
    if (!appDoc) return res.status(404).json({ detail: "Application not found" });

    if (!appDoc.resumeFileId) {
      if (appDoc.resumeUrl && appDoc.resumeUrl.startsWith("http")) {
        return res.redirect(appDoc.resumeUrl);
      }
      return res.status(404).json({ detail: "No resume file stored for this application" });
    }

    const bucket = new GridFSBucket(db, { bucketName: "career_resumes" });
    const fileId = new ObjectId(appDoc.resumeFileId);
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) return res.status(404).json({ detail: "Resume file not found in storage" });

    const file = files[0];
    const filename = appDoc.resumeFilename || file.filename || "applicant-resume.pdf";
    res.setHeader("Content-Type", file.contentType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    console.error("Download resume error:", err);
    return res.status(500).json({ detail: "Failed to download resume" });
  }
});

app.patch("/api/admin/leads/career/:id", requireStaff, async (req, res) => {
  try {
    const { status, notes } = req.body || {};
    const db = getDb();
    const updateFields = { updatedAt: nowUtcIso() };
    if (status !== undefined) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const result = await db
      .collection("career_applications")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: "Career application not found" });
    }
    return res.json({ ok: true, message: "Career application updated" });
  } catch (err) {
    return res.status(400).json({ detail: "Failed to update career application" });
  }
});

app.delete("/api/admin/leads/career/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const appDoc = await db.collection("career_applications").findOne({ _id: new ObjectId(req.params.id) });
    if (!appDoc) return res.status(404).json({ detail: "Career application not found" });

    if (appDoc.resumeFileId) {
      try {
        const bucket = new GridFSBucket(db, { bucketName: "career_resumes" });
        await bucket.delete(new ObjectId(appDoc.resumeFileId));
      } catch {}
    }

    await db.collection("career_applications").deleteOne({ _id: new ObjectId(req.params.id) });
    return res.json({ ok: true, message: "Career application deleted" });
  } catch {
    return res.status(400).json({ detail: "Failed to delete career application" });
  }
});

// ---------------------------------------------------------------------------
// Backward-Compatible Generic Admin Leads Endpoints
// ---------------------------------------------------------------------------
app.get("/api/admin/leads", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const docs = await db
      .collection("property_leads")
      .find()
      .sort({ createdAt: -1, created_at: -1 })
      .limit(1000)
      .toArray();

    return res.json(
      docs.map((d) => ({
        id: String(d._id),
        name: d.name,
        email: d.email,
        phone: d.phone,
        interest: d.leadType || d.propertyName || "",
        location: d.location || "",
        source: d.source || "",
        status: d.status ? d.status.toLowerCase() : "new",
        created_at: d.createdAt || d.created_at,
      }))
    );
  } catch {
    return res.status(500).json({ detail: "Failed to fetch leads" });
  }
});

app.patch("/api/admin/leads/:id", requireStaff, async (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    await db
      .collection("property_leads")
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status: status, updatedAt: nowUtcIso() } }
      );
    await db
      .collection("leads")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: status.toLowerCase() } });
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ detail: "Failed to update lead" });
  }
});

app.delete("/api/admin/leads/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    await db.collection("property_leads").deleteOne({ _id: new ObjectId(req.params.id) });
    await db.collection("leads").deleteOne({ _id: new ObjectId(req.params.id) });
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ detail: "Failed to delete lead" });
  }
});

// ---------------------------------------------------------------------------
// Separated Dashboard Statistics
// ---------------------------------------------------------------------------
app.get("/api/admin/stats", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const [
      propertiesTotal,
      propertiesPublished,
      propTotal,
      propNew,
      propContacted,
      propSiteVisit,
      propConverted,
      careerTotal,
      careerNew,
      careerReviewing,
      careerShortlisted,
      careerInterview,
      careerSelected,
      usersTotal,
    ] = await Promise.all([
      db.collection("properties").countDocuments({}),
      db.collection("properties").countDocuments({ status: "published" }),
      // Property leads stats
      db.collection("property_leads").countDocuments({}),
      db.collection("property_leads").countDocuments({ status: { $regex: /^new$/i } }),
      db.collection("property_leads").countDocuments({ status: { $regex: /^contacted$/i } }),
      db.collection("property_leads").countDocuments({ status: { $regex: /^site visit$/i } }),
      db.collection("property_leads").countDocuments({ status: { $regex: /^converted$/i } }),
      // Career applications stats
      db.collection("career_applications").countDocuments({}),
      db.collection("career_applications").countDocuments({ status: { $regex: /^new$/i } }),
      db.collection("career_applications").countDocuments({ status: { $regex: /^reviewing$/i } }),
      db.collection("career_applications").countDocuments({ status: { $regex: /^shortlisted$/i } }),
      db.collection("career_applications").countDocuments({ status: { $regex: /^interview$/i } }),
      db.collection("career_applications").countDocuments({ status: { $regex: /^selected$/i } }),
      db.collection("users").countDocuments({}),
    ]);

    return res.json({
      properties_total: propertiesTotal,
      properties_published: propertiesPublished,
      property_leads: {
        total: propTotal,
        new: propNew,
        contacted: propContacted,
        site_visit: propSiteVisit,
        converted: propConverted,
      },
      career_applications: {
        total: careerTotal,
        new: careerNew,
        reviewing: careerReviewing,
        shortlisted: careerShortlisted,
        interview: careerInterview,
        selected: careerSelected,
      },
      leads_total: propTotal,
      leads_new: propNew,
      users_total: usersTotal,
    });
  } catch (err) {
    console.error("Fetch stats error:", err);
    return res.status(500).json({ detail: "Failed to fetch stats" });
  }
});

// ---------------------------------------------------------------------------
// Users (Admin only)
// ---------------------------------------------------------------------------
app.get("/api/users", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const users = await db.collection("users").find().sort({ created_at: -1 }).limit(500).toArray();
    return res.json(
      users.map((u) => ({
        id: String(u._id),
        email: u.email,
        name: u.name,
        role: u.role,
        created_at: u.created_at,
      }))
    );
  } catch {
    return res.status(500).json({ detail: "Failed to list users" });
  }
});

app.post("/api/users", requireAdmin, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!VALID_ROLES.includes(role)) return res.status(400).json({ detail: "Invalid role" });
    const cleanEmail = (email || "").toLowerCase().trim();
    const db = getDb();
    if (await db.collection("users").findOne({ email: cleanEmail })) {
      return res.status(409).json({ detail: "Email already in use" });
    }
    const doc = {
      email: cleanEmail,
      password_hash: bcrypt.hashSync(password, 10),
      name,
      role,
      created_at: nowUtcIso(),
    };
    const result = await db.collection("users").insertOne(doc);
    const insertedId = result.insertedId || result.inserted_id;
    return res.status(201).json({
      id: String(insertedId),
      email: doc.email,
      name: doc.name,
      role: doc.role,
      created_at: doc.created_at,
    });
  } catch {
    return res.status(500).json({ detail: "Failed to create user" });
  }
});

app.delete("/api/users/:id", requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ detail: "Cannot delete self" });
    const db = getDb();
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ detail: "User not found" });
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ detail: "Failed to delete user" });
  }
});

// ---------------------------------------------------------------------------
// News / Market Intelligence
// ---------------------------------------------------------------------------
app.get("/api/news/trending", async (req, res) => {
  try {
    const cacheKey = "news:trending";
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set({
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
      });
      return res.json(cached);
    }

    const db = getDb();
    const cache = await db.collection("news_cache").findOne({ topic: "trending" });
    const result = { articles: cache?.articles ? cache.articles.slice(0, 12) : [] };
    cacheSet(cacheKey, result, 900); // 15 min TTL
    res.set({
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
    });
    return res.json(result);
  } catch {
    return res.json({ articles: [] });
  }
});

app.get("/api/news/all", async (req, res) => {
  try {
    const cacheKey = "news:all";
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set({
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
      });
      return res.json(cached);
    }

    const db = getDb();
    const caches = await db.collection("news_cache").find().toArray();
    let allArticles = [];
    caches.forEach((c) => {
      if (Array.isArray(c.articles)) allArticles = allArticles.concat(c.articles);
    });
    const result = { articles: allArticles, count: allArticles.length };
    cacheSet(cacheKey, result, 900); // 15 min TTL
    res.set({
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
    });
    return res.json(result);
  } catch {
    return res.json({ articles: [], count: 0 });
  }
});

// ---------------------------------------------------------------------------
// Static Frontend Serving (React SPA)
// ---------------------------------------------------------------------------
const buildPaths = [
  path.join(__dirname, "..", "..", "frontend", "build"),
  path.join(__dirname, "frontend", "build"),
  path.join(__dirname, "build"),
  path.join(__dirname, "public"),
];

let activeBuildPath = null;
for (const p of buildPaths) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
    activeBuildPath = p;
    break;
  }
}

// Explicit 404 for unhandled API and health routes (never fall through to SPA HTML)
app.all(["/api/*", "/healthz/*"], (req, res) => {
  res.status(404).json({ detail: "Endpoint not found", path: req.path });
});

if (activeBuildPath) {
  console.log(`[Static] Serving React frontend build from: ${activeBuildPath}`);
  app.use(express.static(activeBuildPath));

  // Catch-all non-API routes to index.html for client-side routing
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/healthz")) {
      return next();
    }
    res.sendFile(path.join(activeBuildPath, "index.html"));
  });
} else {
  console.warn("[Static] Warning: No compiled frontend build found. Run 'npm run build' to generate static assets.");
}

// Global API error handler
app.use((err, req, res, next) => {
  console.error("[Error] Unhandled request error:", err);
  if (req.path.startsWith("/api") || req.path.startsWith("/healthz")) {
    return res.status(500).json({ detail: "Internal server error", error: err.message });
  }
  next(err);
});

// ---------------------------------------------------------------------------
// Server Startup & Database Seeding
// ---------------------------------------------------------------------------
async function ensureDatabaseIndexes() {
  try {
    const db = getDb();
    if (!db) return;
    await Promise.allSettled([
      db.collection("properties").createIndex({ status: 1, is_featured: 1, created_at: -1 }),
      db.collection("properties").createIndex({ status: 1, city: 1, location: 1 }),
      db.collection("properties").createIndex({ status: 1, property_type: 1 }),
      db.collection("properties").createIndex({ status: 1, property_category: 1 }),
      db.collection("blogs").createIndex({ slug: 1 }),
      db.collection("blogs").createIndex({ status: 1, publish_date: -1, created_at: -1 }),
      db.collection("news_cache").createIndex({ topic: 1 }),
      db.collection("leads").createIndex({ status: 1, created_at: -1 }),
      // Dedicated Property Leads indexes
      db.collection("property_leads").createIndex({ phone: 1 }),
      db.collection("property_leads").createIndex({ email: 1 }),
      db.collection("property_leads").createIndex({ propertyId: 1 }),
      db.collection("property_leads").createIndex({ status: 1, createdAt: -1 }),
      db.collection("property_leads").createIndex({ createdAt: -1 }),
      // Dedicated Career Applications indexes
      db.collection("career_applications").createIndex({ email: 1 }),
      db.collection("career_applications").createIndex({ phone: 1 }),
      db.collection("career_applications").createIndex({ jobTitle: 1 }),
      db.collection("career_applications").createIndex({ status: 1, createdAt: -1 }),
      db.collection("career_applications").createIndex({ createdAt: -1 }),
    ]);
    console.log("[MongoDB] Database compound indexes verified & active (including property_leads & career_applications)");

    // Safe preservation: initialize property_leads from existing leads if property_leads is empty
    const propCount = await db.collection("property_leads").countDocuments();
    if (propCount === 0) {
      const existingLeads = await db.collection("leads").find().toArray();
      if (existingLeads.length > 0) {
        const seedDocs = existingLeads.map((l) => ({
          _id: l._id,
          name: l.name || `${l.first_name || ""} ${l.last_name || ""}`.trim() || "Anonymous Enquiry",
          phone: l.phone || "",
          email: (l.email || "").toLowerCase().trim(),
          propertyId: l.project || "",
          propertyName: l.project || l.interest || "",
          location: l.preferred_locality || l.property_location || l.preferred_city || "Kolkata",
          leadType: l.interest || (l.source === "resale-coming-soon" ? "Resale Enquiry" : "Property Enquiry"),
          message: l.message || "",
          source: l.source || "legacy",
          status: l.status ? l.status.charAt(0).toUpperCase() + l.status.slice(1).toLowerCase() : "New",
          assignedTo: "Unassigned",
          notes: "",
          createdAt: l.created_at || nowUtcIso(),
          updatedAt: l.created_at || nowUtcIso(),
        }));
        await db.collection("property_leads").insertMany(seedDocs);
        console.log(`[MongoDB] Preserved and initialized ${seedDocs.length} property lead(s) into property_leads`);
      }
    }
  } catch (err) {
    console.warn("[MongoDB] Index verification notice:", err.message);
  }
}

async function seedDefaultAdmin() {
  try {
    const db = getDb();
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@astitva.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "Astitva@2026";
    const adminName = process.env.ADMIN_NAME || "Astitva Admin";

    const existing = await db.collection("users").findOne({ email: adminEmail });
    if (!existing) {
      await db.collection("users").insertOne({
        email: adminEmail,
        password_hash: bcrypt.hashSync(adminPassword, 10),
        name: adminName,
        role: "admin",
        created_at: nowUtcIso(),
      });
      console.log(`[Auth] Seeded initial admin account: ${adminEmail}`);
    }
  } catch (err) {
    console.error("[Auth] Admin seed check error:", err.message);
  }
}

async function startServer() {
  try {
    await connectToDatabase();
    await seedDefaultAdmin();
    ensureDatabaseIndexes().catch(() => {});

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`====================================================`);
      console.log(`🚀 Astittva Server running at http://0.0.0.0:${PORT}`);
      console.log(`📁 Health Check: http://localhost:${PORT}/healthz`);
      console.log(`📁 Properties:   http://localhost:${PORT}/api/properties`);
      console.log(`📁 Blogs:        http://localhost:${PORT}/api/blogs`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error("[Server] Fatal startup error:", err);
    // Still start Express server so health check / diagnostics can respond even if DB is retrying
    app.listen(PORT, "0.0.0.0", () => {
      console.warn(`[Server] Started on port ${PORT} with DB error. Waiting for DB connection.`);
    });
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
