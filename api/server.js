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
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
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

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

// Auto-connect to MongoDB for API endpoints that query the database
app.use(async (req, res, next) => {
  if (req.path === "/healthz" || req.path === "/api" || req.path === "/api/") {
    return next();
  }

  if (req.path.startsWith("/api/")) {
    try {
      if (!getDb()) {
        await connectToDatabase();
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
// Properties (Public)
// ---------------------------------------------------------------------------
app.get("/api/properties", async (req, res) => {
  try {
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

    return res.json(docs.map(serializeProperty));
  } catch (err) {
    console.error("List properties error:", err);
    return res.status(500).json({ detail: "Failed to fetch properties" });
  }
});

app.get("/api/properties/:id", async (req, res) => {
  try {
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
    return res.json(serializeProperty(doc));
  } catch {
    return res.status(400).json({ detail: "Invalid property ID" });
  }
});

// ---------------------------------------------------------------------------
// Blogs (Public)
// ---------------------------------------------------------------------------
app.get("/api/blogs", async (req, res) => {
  try {
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const docs = await db
      .collection("blogs")
      .find({ status: "published" })
      .sort({ publish_date: -1, created_at: -1 })
      .limit(limit)
      .toArray();
    return res.json(docs.map(serializeBlogSummary));
  } catch (err) {
    console.error("List blogs error:", err);
    return res.status(500).json({ detail: "Failed to fetch blogs" });
  }
});

app.get("/api/blogs/:slug", async (req, res) => {
  try {
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
    return res.json(serializeBlog(doc));
  } catch (err) {
    console.error("Get blog error:", err);
    return res.status(500).json({ detail: "Failed to fetch blog" });
  }
});

// ---------------------------------------------------------------------------
// Leads (Public inquiry submission)
// ---------------------------------------------------------------------------
app.post("/api/leads", async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};
    const leadDoc = {
      prefix: body.prefix || "Mr",
      first_name: body.first_name || "",
      last_name: body.last_name || "",
      phone_code: body.phone_code || "+91",
      name: body.name || `${body.first_name || ""} ${body.last_name || ""}`.trim(),
      email: (body.email || "").toLowerCase().trim(),
      phone: body.phone || "",
      interest: body.interest || "",
      budget: body.budget || "",
      message: body.message || "",
      source: body.source || "homepage",
      preferred_city: body.preferred_city || "Kolkata",
      preferred_locality: body.preferred_locality || "",
      investment_purpose: body.investment_purpose || "",
      property_type: body.property_type || "",
      timeline: body.timeline || "",
      project: body.project || "",
      property_location: body.property_location || "",
      preferred_date: body.preferred_date || "",
      form: body.form || "",
      status: "new",
      created_at: nowUtcIso(),
    };

    const result = await db.collection("leads").insertOne(leadDoc);
    leadDoc.id = String(result.inserted_id);
    return res.status(201).json(leadDoc);
  } catch (err) {
    console.error("Create lead error:", err);
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
    doc._id = result.inserted_id;
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
    const result = await db
      .collection("properties")
      .findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: update }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ detail: "Property not found" });
    return res.json(serializeProperty(result));
  } catch {
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
    const result = await db
      .collection("properties")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status, updated_at: nowUtcIso() } });
    if (result.matchedCount === 0) return res.status(404).json({ detail: "Property not found" });
    return res.json({ ok: true, status });
  } catch {
    return res.status(400).json({ detail: "Failed to update status" });
  }
});

app.delete("/api/admin/properties/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection("properties").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ detail: "Property not found" });
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
    const doc = await db.collection("blogs").findOne({ _id: new ObjectId(req.params.id) });
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
    doc._id = result.inserted_id;
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
    const result = await db
      .collection("blogs")
      .findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: update }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ detail: "Blog not found" });
    return res.json(serializeBlog(result));
  } catch {
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
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ detail: "Failed to delete blog" });
  }
});

// ---------------------------------------------------------------------------
// Admin Leads & Stats
// ---------------------------------------------------------------------------
app.get("/api/admin/leads", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const docs = await db.collection("leads").find().sort({ created_at: -1 }).limit(1000).toArray();
    return res.json(
      docs.map((d) => ({
        id: String(d._id),
        name: d.name,
        email: d.email,
        phone: d.phone,
        interest: d.interest || "",
        budget: d.budget || "",
        preferred_locality: d.preferred_locality || "",
        investment_purpose: d.investment_purpose || "",
        property_type: d.property_type || "",
        timeline: d.timeline || "",
        message: d.message || "",
        source: d.source || "",
        status: d.status || "new",
        created_at: d.created_at,
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
    const result = await db
      .collection("leads")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status } });
    if (result.matchedCount === 0) return res.status(404).json({ detail: "Lead not found" });
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ detail: "Failed to update lead" });
  }
});

app.delete("/api/admin/leads/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection("leads").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ detail: "Lead not found" });
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ detail: "Failed to delete lead" });
  }
});

app.get("/api/admin/stats", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const [propertiesTotal, propertiesPublished, leadsTotal, leadsNew, usersTotal] = await Promise.all([
      db.collection("properties").countDocuments({}),
      db.collection("properties").countDocuments({ status: "published" }),
      db.collection("leads").countDocuments({}),
      db.collection("leads").countDocuments({ status: "new" }),
      db.collection("users").countDocuments({}),
    ]);
    return res.json({
      properties_total: propertiesTotal,
      properties_published: propertiesPublished,
      leads_total: leadsTotal,
      leads_new: leadsNew,
      users_total: usersTotal,
    });
  } catch {
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
    return res.status(201).json({
      id: String(result.inserted_id),
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
    const db = getDb();
    const cache = await db.collection("news_cache").findOne({ topic: "trending" });
    return res.json({ articles: cache?.articles ? cache.articles.slice(0, 12) : [] });
  } catch {
    return res.json({ articles: [] });
  }
});

app.get("/api/news/all", async (req, res) => {
  try {
    const db = getDb();
    const caches = await db.collection("news_cache").find().toArray();
    let allArticles = [];
    caches.forEach((c) => {
      if (Array.isArray(c.articles)) allArticles = allArticles.concat(c.articles);
    });
    return res.json({ articles: allArticles, count: allArticles.length });
  } catch {
    return res.json({ articles: [], count: 0 });
  }
});

// ---------------------------------------------------------------------------
// Static Frontend Serving (React SPA)
// ---------------------------------------------------------------------------
const buildPaths = [
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

// Serve Ridhi Bhoomi build if available
const ridhiBhoomiDistPath = path.join(__dirname, "..", "ridhi bhoomi", "ridhi-bhoomi", "client", "dist");
if (fs.existsSync(ridhiBhoomiDistPath) && fs.existsSync(path.join(ridhiBhoomiDistPath, "index.html"))) {
  console.log(`[Static] Serving Ridhi Bhoomi build from: ${ridhiBhoomiDistPath} at /ridhi-bhoomi`);
  app.use("/ridhi-bhoomi", express.static(ridhiBhoomiDistPath));
  app.get(["/ridhi-bhoomi", "/ridhi-bhoomi/*", "/riddhi-bhumi", "/riddhi-bhumi/*"], (req, res) => {
    res.sendFile(path.join(ridhiBhoomiDistPath, "index.html"));
  });
}

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
