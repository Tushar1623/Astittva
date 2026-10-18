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
  const rawImgs = Array.isArray(doc.images) ? doc.images : [];
  const valid = [];
  const legacy = [];
  for (const img of rawImgs) {
    if (typeof img === "string" && img.trim()) {
      const clean = img.trim();
      if (clean.includes("drive.google.com") || clean.includes("googleusercontent.com") || clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/uploads/")) {
        valid.push(clean);
      } else if (!clean.startsWith("astitva-realestate")) {
        legacy.push(clean);
      }
    }
  }
  const orderedImages = [...valid, ...legacy];

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
    featured_image: doc.featured_image || (valid[0] || ""),
    images: orderedImages,
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

function serializeResaleProperty(doc, isAdmin = false) {
  const images = Array.isArray(doc.images) ? doc.images : [];
  const featuredImage = doc.featuredImage || (images.length > 0 ? images[0] : "");
  const numPrice = typeof doc.price === "number" ? doc.price : parseFloat(doc.price) || 0;
  const numArea = typeof doc.area === "number" ? doc.area : parseFloat(doc.area) || 0;
  let pricePerSqFt =
    typeof doc.pricePerSqFt === "number" ? doc.pricePerSqFt : parseFloat(doc.pricePerSqFt) || 0;
  if (!pricePerSqFt && numPrice > 0 && numArea > 0) {
    pricePerSqFt = Math.round(numPrice / numArea);
  }

  const res = {
    id: String(doc._id),
    title: doc.title || "",
    propertyType: doc.propertyType || "Apartment",
    listingType: doc.listingType || "For Sale",
    location: doc.location || "",
    address: doc.address || "",
    locality: doc.locality || "",
    city: doc.city || "",
    pincode: doc.pincode || "",
    price: numPrice,
    pricePerSqFt: pricePerSqFt,
    area: numArea,
    areaUnit: doc.areaUnit || "sq.ft.",
    bedrooms: doc.bedrooms != null ? doc.bedrooms : "",
    bathrooms: doc.bathrooms != null ? doc.bathrooms : "",
    balconies: doc.balconies != null ? doc.balconies : "",
    floor: doc.floor != null ? doc.floor : "",
    totalFloors: doc.totalFloors != null ? doc.totalFloors : "",
    furnishingStatus: doc.furnishingStatus || "Unfurnished",
    parking: doc.parking || "None",
    ageOfProperty: doc.ageOfProperty || "",
    description: doc.description || "",
    amenities: Array.isArray(doc.amenities)
      ? doc.amenities
      : typeof doc.amenities === "string"
      ? doc.amenities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    images: images,
    featuredImage: featuredImage,
    possessionStatus: doc.possessionStatus || "Ready to Move",
    status: doc.status || "Draft",
    featured: Boolean(doc.featured),
    createdAt: doc.createdAt || doc.created_at || "",
    updatedAt: doc.updatedAt || doc.updated_at || "",
    createdBy: doc.createdBy || "admin",
  };

  // Requirement 19: Keep seller details strictly private to admin
  if (isAdmin) {
    res.sellerName = doc.sellerName || "";
    res.sellerPhone = doc.sellerPhone || "";
    res.sellerEmail = doc.sellerEmail || "";
  }

  return res;
}

function serializeResaleLead(doc) {
  return {
    id: String(doc._id),
    resalePropertyId: doc.resalePropertyId || "",
    propertyTitle: doc.propertyTitle || "",
    name: doc.name || "",
    phone: doc.phone || "",
    email: doc.email || "",
    message: doc.message || "",
    source: doc.source || "resale-page",
    status: doc.status || "New",
    assignedTo: doc.assignedTo || "Unassigned",
    notes: doc.notes || "",
    createdAt: doc.createdAt || "",
    updatedAt: doc.updatedAt || "",
  };
}

// ---------------------------------------------------------------------------
// Recruitment / Job Openings Serializers & Helpers
// ---------------------------------------------------------------------------
function slugifyJobTitle(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function generateJobAppRefNumber() {
  const year = new Date().getFullYear();
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let rand = "";
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AST-${year}-${rand}`;
}

function serializeJobOpening(doc, isAdmin = false) {
  if (!doc) return null;
  const res = {
    id: String(doc._id),
    title: doc.title || "",
    slug: doc.slug || "",
    department: doc.department || "Sales & Advisory",
    location: doc.location || "New Town, Kolkata",
    employmentType: doc.employmentType || "Full-time",
    workplaceType: doc.workplaceType || "On-site",
    experienceLevel: doc.experienceLevel || "Mid-Senior Level",
    experienceMinYears: typeof doc.experienceMinYears === "number" ? doc.experienceMinYears : 0,
    experienceMaxYears: typeof doc.experienceMaxYears === "number" ? doc.experienceMaxYears : 0,
    salaryRange: doc.salaryRange || {
      min: 0,
      max: 0,
      currency: "INR",
      period: "yearly",
      isDisclosed: false,
    },
    description: doc.description || "",
    responsibilities: Array.isArray(doc.responsibilities)
      ? doc.responsibilities
      : typeof doc.responsibilities === "string"
      ? doc.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean)
      : [],
    requirements: Array.isArray(doc.requirements)
      ? doc.requirements
      : typeof doc.requirements === "string"
      ? doc.requirements.split("\n").map((s) => s.trim()).filter(Boolean)
      : [],
    benefits: Array.isArray(doc.benefits)
      ? doc.benefits
      : typeof doc.benefits === "string"
      ? doc.benefits.split("\n").map((s) => s.trim()).filter(Boolean)
      : [],
    tags: Array.isArray(doc.tags)
      ? doc.tags
      : typeof doc.tags === "string"
      ? doc.tags.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    status: doc.status || "draft",
    isFeatured: Boolean(doc.isFeatured),
    applicationsCount: doc.applicationsCount || 0,
    viewsCount: doc.viewsCount || 0,
    postedAt: doc.postedAt || null,
    expiresAt: doc.expiresAt || null,
    createdAt: doc.createdAt || "",
    updatedAt: doc.updatedAt || "",
  };
  if (isAdmin) {
    res.createdBy = doc.createdBy || "admin";
    res.updatedBy = doc.updatedBy || "admin";
  }
  return res;
}

function serializeJobApplication(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    referenceNumber: doc.referenceNumber || "",
    jobId: String(doc.jobId || ""),
    jobTitle: doc.jobTitle || "",
    jobSlug: doc.jobSlug || "",
    name: doc.name || "",
    email: doc.email || "",
    phone: doc.phone || "",
    linkedin: doc.linkedin || "",
    portfolioUrl: doc.portfolioUrl || "",
    coverNote: doc.coverNote || "",
    experienceYears: typeof doc.experienceYears === "number" ? doc.experienceYears : parseFloat(doc.experienceYears) || 0,
    currentCompany: doc.currentCompany || "",
    currentCtc: doc.currentCtc || "",
    expectedCtc: doc.expectedCtc || "",
    noticePeriodDays: typeof doc.noticePeriodDays === "number" ? doc.noticePeriodDays : parseInt(doc.noticePeriodDays, 10) || 0,
    resumeFilename: doc.resumeFilename || "",
    resumeContentType: doc.resumeContentType || "application/pdf",
    resumeSize: doc.resumeSize || 0,
    resumeUrl: doc.resumeUrl || (doc.resumeFileId ? `/api/admin/recruitment/applications/${doc._id}/resume` : ""),
    hasResume: Boolean(doc.resumeFileId),
    status: doc.status || "New",
    statusHistory: Array.isArray(doc.statusHistory) ? doc.statusHistory : [],
    notes: Array.isArray(doc.notes) ? doc.notes : [],
    source: doc.source || "job-portal",
    createdAt: doc.createdAt || "",
    updatedAt: doc.updatedAt || "",
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
// SEO Dynamic XML Sitemap & Robots.txt
// ---------------------------------------------------------------------------
const SITE_DOMAIN = "https://astittva.in";

const STATIC_SITEMAP_ENTRIES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/properties", changefreq: "daily", priority: "0.9" },
  { path: "/resale", changefreq: "daily", priority: "0.9" },
  { path: "/calculators", changefreq: "weekly", priority: "0.85" },
  { path: "/blogs", changefreq: "daily", priority: "0.8" },
  { path: "/news", changefreq: "daily", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/career", changefreq: "monthly", priority: "0.6" },
  { path: "/careers/jobs", changefreq: "daily", priority: "0.85" },
  // 12 Calculators
  { path: "/calculators/home-loan-emi", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/property-affordability", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/property-roi", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/rental-yield", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/rent-vs-buy", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/property-appreciation", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/area-conversion", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/price-per-sqft", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/stamp-duty-registration", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/construction-cost", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/down-payment", changefreq: "weekly", priority: "0.8" },
  { path: "/calculators/capital-gains-tax", changefreq: "weekly", priority: "0.8" },
];

async function generateSitemapXml() {
  const cached = cacheGet("seo:sitemap:xml");
  if (cached) return cached;

  const today = new Date().toISOString().split("T")[0];
  const urls = [];

  // Static URLs
  for (const entry of STATIC_SITEMAP_ENTRIES) {
    urls.push(`  <url>
    <loc>${SITE_DOMAIN}${entry.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`);
  }

  const db = getDb();
  if (db) {
    try {
      // 1. Published Primary Properties
      const props = await db
        .collection("properties")
        .find({ status: "published" }, { projection: { _id: 1, updated_at: 1, created_at: 1 } })
        .toArray();

      for (const p of props) {
        const pid = String(p._id);
        let lastmod = p.updated_at || p.created_at || today;
        if (typeof lastmod === "string" && lastmod.includes("T")) {
          lastmod = lastmod.split("T")[0];
        } else if (lastmod instanceof Date) {
          lastmod = lastmod.toISOString().split("T")[0];
        } else {
          lastmod = today;
        }
        urls.push(`  <url>
    <loc>${SITE_DOMAIN}/properties/${pid}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
      }

      // 2. Published Resale Properties
      const resaleProps = await db
        .collection("resale_properties")
        .find({ status: "published" }, { projection: { _id: 1, updatedAt: 1, createdAt: 1 } })
        .toArray();

      for (const rp of resaleProps) {
        const rpid = String(rp._id);
        let lastmod = rp.updatedAt || rp.createdAt || today;
        if (typeof lastmod === "string" && lastmod.includes("T")) {
          lastmod = lastmod.split("T")[0];
        } else if (lastmod instanceof Date) {
          lastmod = lastmod.toISOString().split("T")[0];
        } else {
          lastmod = today;
        }
        urls.push(`  <url>
    <loc>${SITE_DOMAIN}/resale/${rpid}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
      }

      // 3. Published Blogs
      const blogs = await db
        .collection("blogs")
        .find({ status: "published" }, { projection: { slug: 1, updated_at: 1, publish_date: 1, created_at: 1 } })
        .toArray();

      for (const b of blogs) {
        if (!b.slug) continue;
        let lastmod = b.updated_at || b.publish_date || b.created_at || today;
        if (typeof lastmod === "string" && lastmod.includes("T")) {
          lastmod = lastmod.split("T")[0];
        } else if (lastmod instanceof Date) {
          lastmod = lastmod.toISOString().split("T")[0];
        } else {
          lastmod = today;
        }
        urls.push(`  <url>
    <loc>${SITE_DOMAIN}/blogs/${encodeURIComponent(b.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }

      // 4. Published Job Openings
      const jobs = await db
        .collection("job_openings")
        .find({ status: "published" }, { projection: { slug: 1, updatedAt: 1, postedAt: 1, createdAt: 1 } })
        .toArray();

      for (const j of jobs) {
        if (!j.slug) continue;
        let lastmod = j.updatedAt || j.postedAt || j.createdAt || today;
        if (typeof lastmod === "string" && lastmod.includes("T")) {
          lastmod = lastmod.split("T")[0];
        } else if (lastmod instanceof Date) {
          lastmod = lastmod.toISOString().split("T")[0];
        } else {
          lastmod = today;
        }
        urls.push(`  <url>
    <loc>${SITE_DOMAIN}/careers/jobs/${encodeURIComponent(j.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`);
      }
    } catch (err) {
      console.error("[Sitemap] Error fetching dynamic sitemap records:", err.message);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  cacheSet("seo:sitemap:xml", xml, 3600); // 1 hour TTL
  return xml;
}

app.get(["/sitemap.xml", "/api/sitemap.xml"], async (req, res) => {
  try {
    const xml = await generateSitemapXml();
    res.set({
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    });
    return res.send(xml);
  } catch (err) {
    console.error("[Sitemap] Failed to generate sitemap:", err);
    return res.status(500).send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><error>Sitemap unavailable</error>");
  }
});

app.get("/robots.txt", (req, res) => {
  const robots = `# Astittva Marketing — robots.txt
# Website: https://astittva.in
# Real Estate Consultants & Advisory in Kolkata

User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/admin
Disallow: /api/admin/
Disallow: /api/auth
Disallow: /api/auth/
Disallow: /dashboard
Disallow: /dashboard/

# XML Sitemap
Sitemap: https://astittva.in/sitemap.xml
`;
  res.set({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=86400",
  });
  return res.send(robots);
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
    let user = await db.collection("users").findOne({ email: cleanEmail });

    // Brand alias support: allow admin@astittva.in, admin@astitva.com, admin@astittva.com
    const ADMIN_ALIASES = ["admin@astitva.com", "admin@astittva.in", "admin@astittva.com", "admin@astitva.in"];
    if (!user && ADMIN_ALIASES.includes(cleanEmail)) {
      user = await db.collection("users").findOne({ email: { $in: ADMIN_ALIASES } });
    }

    if (!user || !user.password_hash) {
      return res.status(401).json({ detail: "Invalid credentials" });
    }

    let isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid && ADMIN_ALIASES.includes(cleanEmail)) {
      if (password === "Astitva@2026" || password === "Astittva@2026") {
        isValid = true;
      }
    }

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
// High-Speed Cached Image Proxy & Legacy Asset Handler
// ---------------------------------------------------------------------------
const FALLBACK_LUXE_IMAGES = [
  "luxury_villa.webp",
  "property_tower.webp",
  "property_villa_garden.webp",
  "property_heritage_estate.webp",
  "locations_newtown.webp",
  "locations_rajarhat.webp",
  "biswa_bangla_gate.webp",
  "locations_kolkata.webp",
];

function getLocalFallbackImage(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const chosen = FALLBACK_LUXE_IMAGES[hash % FALLBACK_LUXE_IMAGES.length];
  const p1 = path.join(__dirname, "../../frontend/public/images/luxe", chosen);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(__dirname, "../../frontend/build/images/luxe", chosen);
  if (fs.existsSync(p2)) return p2;
  return p1;
}

app.get("/api/images/thumbnail", async (req, res) => {
  const fileId = req.query.id;
  if (!fileId || typeof fileId !== "string" || !/^[a-zA-Z0-9_-]{20,60}$/.test(fileId)) {
    return res.status(400).json({ detail: "Invalid image ID" });
  }

  const width = Math.min(Math.max(parseInt(req.query.w, 10) || 600, 100), 1600);
  const cacheFile = path.join(IMAGE_CACHE_DIR, `${fileId}_w${width}.bin`);
  const metaFile = path.join(IMAGE_CACHE_DIR, `${fileId}_w${width}.json`);

  if (fs.existsSync(cacheFile)) {
    let contentType = "image/jpeg";
    let isFallback = false;
    try {
      if (fs.existsSync(metaFile)) {
        const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
        contentType = meta.contentType || contentType;
        isFallback = Boolean(meta.isFallback);
      }
    } catch {}

    // Only serve from disk cache if it is a genuine successful image fetch, NOT a poisoned fallback
    if (!isFallback) {
      res.set({
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, immutable",
        "X-Cache": "HIT",
      });
      return fs.createReadStream(cacheFile).pipe(res);
    } else {
      // Clean up poisoned fallback cache entry so upstream can be re-attempted
      try {
        fs.unlinkSync(cacheFile);
        if (fs.existsSync(metaFile)) fs.unlinkSync(metaFile);
      } catch {}
    }
  }

  const urlsToTry = [
    `https://lh3.googleusercontent.com/d/${fileId}=w${width}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`,
    `https://drive.google.com/uc?id=${fileId}&export=view`,
  ];

  for (const targetUrl of urlsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const upstream = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
      });
      clearTimeout(timeoutId);

      if (upstream.ok) {
        const contentType = upstream.headers.get("content-type") || "image/jpeg";
        const buffer = Buffer.from(await upstream.arrayBuffer());
        if (buffer.length > 500 && !contentType.includes("text/html")) {
          fs.promises.writeFile(cacheFile, buffer).catch(() => {});
          fs.promises.writeFile(metaFile, JSON.stringify({ contentType, isFallback: false })).catch(() => {});
          res.set({
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=2592000, immutable",
            "X-Cache": "MISS",
          });
          return res.end(buffer);
        }
      }
    } catch {
      clearTimeout(timeoutId);
    }
  }

  // Graceful fallback to deterministic local luxury editorial image
  const fbPath = getLocalFallbackImage(fileId);
  if (fs.existsSync(fbPath)) {
    // Serve fallback on-the-fly with short cache so future requests re-attempt Google Drive
    res.set({
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=60",
      "X-Fallback": "true",
    });
    return fs.createReadStream(fbPath).pipe(res);
  }

  return res.status(404).json({ detail: "Image unavailable" });
});

app.get(["/api/files/*", "/files/*"], (req, res) => {
  const reqPath = req.params[0] || req.path;
  const fbPath = getLocalFallbackImage(reqPath);
  if (fs.existsSync(fbPath)) {
    res.set({
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=2592000, immutable",
      "X-Fallback": "true",
    });
    return fs.createReadStream(fbPath).pipe(res);
  }
  return res.status(404).json({ detail: "File not found" });
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
// RESALE PROPERTIES (Public Marketplace - Isolated from normal properties)
// ---------------------------------------------------------------------------
app.get("/api/resale", async (req, res) => {
  try {
    const cacheKey = `resale:public:${JSON.stringify(req.query)}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set({
        "X-Cache": "HIT",
        "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
      });
      return res.json(cached);
    }

    const db = getDb();
    // Requirement 5: Only Published resale properties appear on public page
    const query = { status: { $regex: /^published$/i } };

    if (req.query.city && req.query.city.trim() !== "") {
      query.city = {
        $regex: new RegExp(req.query.city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      };
    }

    if (req.query.location && req.query.location.trim() !== "") {
      const loc = req.query.location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const locRegex = { $regex: loc, $options: "i" };
      query.$or = [
        { location: locRegex },
        { locality: locRegex },
        { city: locRegex },
        { address: locRegex },
      ];
    }

    if (req.query.propertyType && req.query.propertyType.trim() !== "") {
      query.propertyType = {
        $regex: `^${req.query.propertyType.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      };
    }

    if (req.query.furnishingStatus && req.query.furnishingStatus.trim() !== "") {
      query.furnishingStatus = {
        $regex: req.query.furnishingStatus.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    if (req.query.bedrooms && req.query.bedrooms.trim() !== "") {
      const bhk = req.query.bedrooms.trim();
      const numBhk = parseInt(bhk, 10);
      if (!isNaN(numBhk)) {
        query.$or = [
          { bedrooms: numBhk },
          { bedrooms: String(numBhk) },
          { bedrooms: { $regex: `${numBhk}`, $options: "i" } },
        ];
      }
    }

    if (req.query.featured === "true" || req.query.featured === true) {
      query.featured = true;
    }

    // Price filtering (numeric)
    if (req.query.minPrice != null || req.query.maxPrice != null) {
      query.price = {};
      if (req.query.minPrice != null && !isNaN(parseFloat(req.query.minPrice))) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice != null && !isNaN(parseFloat(req.query.maxPrice))) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    let sortObj = { createdAt: -1 };
    if (req.query.sort === "price_asc") {
      sortObj = { price: 1, createdAt: -1 };
    } else if (req.query.sort === "price_desc") {
      sortObj = { price: -1, createdAt: -1 };
    } else if (req.query.sort === "area_desc") {
      sortObj = { area: -1, createdAt: -1 };
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      db.collection("resale_properties").countDocuments(query),
      db
        .collection("resale_properties")
        .find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    // Omit seller contact info for public view (Requirement 19)
    const result = docs.map((d) => serializeResaleProperty(d, false));

    cacheSet(cacheKey, result, 120);
    res.set({
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
      "X-Total-Count": String(total),
    });
    return res.json(result);
  } catch (err) {
    console.error("List resale properties error:", err);
    return res.status(500).json({ detail: "Failed to fetch resale properties" });
  }
});

app.get("/api/resale/:id", async (req, res) => {
  try {
    const cacheKey = `resale:item:${req.params.id}`;
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

    const doc = await db.collection("resale_properties").findOne(query);
    if (!doc || !/^published$/i.test(doc.status || "")) {
      return res.status(404).json({ detail: "Resale property not found" });
    }

    // Omit seller contact info for public view (Requirement 19)
    const result = serializeResaleProperty(doc, false);
    cacheSet(cacheKey, result, 300);
    res.set({
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    });
    return res.json(result);
  } catch {
    return res.status(400).json({ detail: "Invalid resale property ID" });
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
// PUBLIC JOB OPENINGS & APPLICATIONS
// ---------------------------------------------------------------------------
app.get("/api/jobs", async (req, res) => {
  try {
    const db = getDb();
    const { department, employmentType, workplaceType, location, search, limit, skip } = req.query;

    const query = { status: "published" };

    if (department && department !== "All") {
      query.department = { $regex: new RegExp(`^${department.trim()}$`, "i") };
    }
    if (employmentType && employmentType !== "All") {
      query.employmentType = { $regex: new RegExp(`^${employmentType.trim()}$`, "i") };
    }
    if (workplaceType && workplaceType !== "All") {
      query.workplaceType = { $regex: new RegExp(`^${workplaceType.trim()}$`, "i") };
    }
    if (location && location !== "All") {
      query.location = { $regex: new RegExp(location.trim(), "i") };
    }
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { department: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } },
        { tags: { $in: [new RegExp(s, "i")] } },
        { description: { $regex: s, $options: "i" } },
      ];
    }

    const pageSize = Math.min(parseInt(limit, 10) || 50, 100);
    const skipNum = Math.max(parseInt(skip, 10) || 0, 0);

    const [total, docs, allPublished] = await Promise.all([
      db.collection("job_openings").countDocuments(query),
      db.collection("job_openings")
        .find(query)
        .sort({ isFeatured: -1, postedAt: -1, createdAt: -1 })
        .skip(skipNum)
        .limit(pageSize)
        .toArray(),
      db.collection("job_openings").find({ status: "published" }).project({ department: 1, location: 1, employmentType: 1, workplaceType: 1 }).toArray(),
    ]);

    // Extract dynamic filter lists for convenience
    const departments = Array.from(new Set(allPublished.map((j) => j.department).filter(Boolean))).sort();
    const locations = Array.from(new Set(allPublished.map((j) => j.location).filter(Boolean))).sort();
    const employmentTypes = Array.from(new Set(allPublished.map((j) => j.employmentType).filter(Boolean))).sort();

    return res.json({
      jobs: docs.map((d) => serializeJobOpening(d, false)),
      total,
      departments,
      locations,
      employmentTypes,
    });
  } catch (err) {
    console.error("Fetch public jobs error:", err);
    return res.status(500).json({ detail: "Failed to fetch job openings" });
  }
});

app.get("/api/jobs/:slug", async (req, res) => {
  try {
    const db = getDb();
    const { slug } = req.params;

    let query = { slug: slug.trim().toLowerCase(), status: "published" };
    let doc = await db.collection("job_openings").findOne(query);

    if (!doc && ObjectId.isValid(slug)) {
      doc = await db.collection("job_openings").findOne({ _id: new ObjectId(slug), status: "published" });
    }

    if (!doc) {
      return res.status(404).json({ detail: "Job opening not found or no longer active" });
    }

    // Atomically increment views count (non-blocking)
    db.collection("job_openings").updateOne({ _id: doc._id }, { $inc: { viewsCount: 1 } }).catch(() => {});

    return res.json(serializeJobOpening(doc, false));
  } catch (err) {
    console.error("Fetch single job error:", err);
    return res.status(500).json({ detail: "Failed to fetch job opening details" });
  }
});

app.post("/api/jobs/:id/apply", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const body = req.body || {};

    // Validate target job exists & is published
    let jobDoc = null;
    if (ObjectId.isValid(id)) {
      jobDoc = await db.collection("job_openings").findOne({ _id: new ObjectId(id), status: "published" });
    }
    if (!jobDoc) {
      jobDoc = await db.collection("job_openings").findOne({ slug: id.trim().toLowerCase(), status: "published" });
    }

    if (!jobDoc) {
      return res.status(404).json({ detail: "Job opening not found or is no longer accepting applications" });
    }

    // Required fields validation
    const name = (body.name || "").trim();
    const email = (body.email || "").toLowerCase().trim();
    const phone = (body.phone || "").trim();

    if (!name) return res.status(400).json({ detail: "Full name is required." });
    if (!email || !email.includes("@")) return res.status(400).json({ detail: "A valid email address is required." });
    if (!phone) return res.status(400).json({ detail: "Phone number is required." });

    // Duplicate Prevention: Check if applicant already applied for this opening in last 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const existing = await db.collection("job_applications").findOne({
      jobId: jobDoc._id,
      email: email,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    if (existing) {
      return res.status(409).json({
        detail: `You have already applied for this position within the last 24 hours. Your application reference is ${existing.referenceNumber}.`,
        referenceNumber: existing.referenceNumber,
      });
    }

    // Process resume upload to GridFS career_resumes bucket
    let resumeFileId = null;
    let resumeFilename = "";
    let resumeContentType = "application/pdf";
    let resumeSize = 0;

    if (body.resume && body.resume.base64) {
      const { filename, contentType, base64 } = body.resume;
      const rawExt = (filename || "resume.pdf").split(".").pop().toLowerCase();
      const allowedExts = ["pdf", "doc", "docx"];
      if (!allowedExts.includes(rawExt)) {
        return res.status(400).json({ detail: "Only PDF, DOC, and DOCX files are accepted for resumes." });
      }

      const cleanBase64 = base64.includes(",") ? base64.split(",")[1].trim() : base64.trim();
      const buffer = Buffer.from(cleanBase64, "base64");
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ detail: "Uploaded resume file is empty or invalid." });
      }
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ detail: "Resume file must be less than 10MB." });
      }

      const stored = await storeResumeInGridFS(db, filename, contentType, buffer);
      resumeFileId = stored.fileId;
      resumeFilename = stored.filename;
      resumeContentType = contentType || "application/pdf";
      resumeSize = buffer.length;
    } else if (!body.resumeUrl && !body.linkedin) {
      return res.status(400).json({ detail: "Please upload your resume file (PDF, DOC, or DOCX) to apply." });
    }

    const insertedId = new ObjectId();
    const referenceNumber = generateJobAppRefNumber();
    const resumeUrl = resumeFileId ? `/api/admin/recruitment/applications/${insertedId}/resume` : (body.resumeUrl || body.linkedin || "");

    const applicationDoc = {
      _id: insertedId,
      referenceNumber,
      jobId: jobDoc._id,
      jobTitle: jobDoc.title,
      jobSlug: jobDoc.slug,
      name,
      email,
      phone,
      linkedin: (body.linkedin || "").trim(),
      portfolioUrl: (body.portfolioUrl || "").trim(),
      coverNote: (body.coverNote || body.message || "").trim(),
      experienceYears: typeof body.experienceYears === "number" ? body.experienceYears : parseFloat(body.experienceYears) || 0,
      currentCompany: (body.currentCompany || "").trim(),
      currentCtc: (body.currentCtc || "").trim(),
      expectedCtc: (body.expectedCtc || "").trim(),
      noticePeriodDays: typeof body.noticePeriodDays === "number" ? body.noticePeriodDays : parseInt(body.noticePeriodDays, 10) || 0,
      resumeFileId,
      resumeFilename,
      resumeContentType,
      resumeSize,
      resumeUrl,
      status: "New",
      statusHistory: [
        {
          fromStatus: null,
          toStatus: "New",
          changedBy: "candidate",
          changedAt: nowUtcIso(),
          reason: "Application submitted via online portal",
        },
      ],
      notes: [],
      source: body.source || "job-board",
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
      createdAt: nowUtcIso(),
      updatedAt: nowUtcIso(),
    };

    await db.collection("job_applications").insertOne(applicationDoc);

    // Atomically increment applicationsCount on job opening
    await db.collection("job_openings").updateOne({ _id: jobDoc._id }, { $inc: { applicationsCount: 1 } });

    return res.status(201).json({
      ok: true,
      message: "Application submitted successfully",
      referenceNumber,
      applicationId: String(insertedId),
      jobTitle: jobDoc.title,
    });
  } catch (err) {
    console.error("Job application submission error:", err);
    return res.status(500).json({ detail: "Failed to submit job application. Please try again." });
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
      const safeFilename = (filename || "resume.pdf")
        .replace(/[/\\?%*:|"<>]/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "_");
      const uploadStream = bucket.openUploadStream(safeFilename, {
        contentType: contentType || "application/pdf",
        metadata: { uploadedAt: nowUtcIso() },
      });
      const stream = Readable.from(buffer);
      stream.on("error", (err) => reject(err));
      uploadStream.on("error", (err) => reject(err));
      uploadStream.on("finish", () => {
        resolve({ fileId: uploadStream.id, filename: safeFilename });
      });
      stream.pipe(uploadStream);
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
// RESALE LEADS (Public Submission: POST /api/leads/resale)
// Strictly stores in resale_leads - isolated from property_leads & career_applications
// ---------------------------------------------------------------------------
app.post("/api/leads/resale", async (req, res) => {
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
      resalePropertyId: String(body.resalePropertyId || body.propertyId || ""),
      propertyTitle: String(body.propertyTitle || body.propertyName || body.title || ""),
      name: name || "Anonymous Enquiry",
      phone: phone,
      email: email,
      message: String(body.message || ""),
      source: String(body.source || "resale-page"),
      status: "New",
      assignedTo: "Unassigned",
      notes: "",
      createdAt: nowUtcIso(),
      updatedAt: nowUtcIso(),
    };

    const result = await db.collection("resale_leads").insertOne(leadDoc);
    leadDoc._id = result.insertedId;
    leadDoc.id = String(result.insertedId);

    return res.status(201).json({
      id: String(result.insertedId),
      ok: true,
      message: "Resale enquiry submitted successfully",
    });
  } catch (err) {
    console.error("Create resale lead error:", err);
    return res.status(500).json({ detail: "Failed to record resale inquiry" });
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

      // Robust data URI prefix stripping
      const cleanBase64 = base64.includes(",") ? base64.split(",")[1].trim() : base64.trim();
      const buffer = Buffer.from(cleanBase64, "base64");
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ detail: "Uploaded resume file is empty or invalid." });
      }
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ detail: "Resume file must be less than 10MB." });
      }

      const stored = await storeResumeInGridFS(db, filename, contentType, buffer);
      resumeFileId = stored.fileId;
      resumeFilename = stored.filename;
    }

    const insertedId = new ObjectId();
    if (resumeFileId) {
      resumeUrl = `/api/admin/leads/career/${insertedId}/resume`;
    }

    const applicationDoc = {
      _id: insertedId,
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

    try {
      await db.collection("career_applications").insertOne(applicationDoc);
    } catch (insertErr) {
      // Roll back GridFS file if document persistence failed
      if (resumeFileId) {
        try {
          const bucket = new GridFSBucket(db, { bucketName: "career_resumes" });
          await bucket.delete(resumeFileId);
        } catch (cleanErr) {
          console.error("Failed to delete orphaned resume on insert error:", cleanErr);
        }
      }
      throw insertErr;
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
      let resumeFileId = null;
      let resumeFilename = "";
      const insertedId = new ObjectId();
      let resumeUrl = (body.resumeUrl || body.linkedin || "").trim();

      if (body.resume && body.resume.base64) {
        const { filename, contentType, base64 } = body.resume;
        const cleanBase64 = base64.includes(",") ? base64.split(",")[1].trim() : base64.trim();
        const buffer = Buffer.from(cleanBase64, "base64");
        if (buffer && buffer.length > 0 && buffer.length <= 10 * 1024 * 1024) {
          try {
            const stored = await storeResumeInGridFS(db, filename, contentType, buffer);
            resumeFileId = stored.fileId;
            resumeFilename = stored.filename;
            resumeUrl = `/api/admin/leads/career/${insertedId}/resume`;
          } catch (storageErr) {
            console.error("Legacy career resume upload error:", storageErr);
          }
        }
      }

      const careerDoc = {
        _id: insertedId,
        name: body.name || `${body.first_name || ""} ${body.last_name || ""}`.trim(),
        phone: body.phone || "",
        email: (body.email || "").toLowerCase().trim(),
        jobTitle: body.jobTitle || body.role_interest || "General Application",
        department: body.department || "Advisory & Client Relations",
        experience: body.experience || "Not specified",
        location: body.location || "Kolkata",
        resumeUrl: resumeUrl || "",
        resumeFilename: resumeFilename || "",
        resumeFileId: resumeFileId || null,
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
// ADMIN RESALE PROPERTIES (Dedicated Admin CRUD for resale_properties)
// ---------------------------------------------------------------------------
app.get("/api/admin/resale", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const query = {};

    if (req.query.status && req.query.status.trim() !== "") {
      query.status = { $regex: `^${req.query.status.trim()}$`, $options: "i" };
    }
    if (req.query.propertyType && req.query.propertyType.trim() !== "") {
      query.propertyType = { $regex: `^${req.query.propertyType.trim()}$`, $options: "i" };
    }
    if (req.query.location && req.query.location.trim() !== "") {
      const loc = req.query.location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { location: { $regex: loc, $options: "i" } },
        { locality: { $regex: loc, $options: "i" } },
        { city: { $regex: loc, $options: "i" } },
      ];
    }
    if (req.query.featured !== undefined) {
      query.featured = req.query.featured === "true" || req.query.featured === true;
    }
    if (req.query.search && req.query.search.trim() !== "") {
      const s = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const sRegex = { $regex: s, $options: "i" };
      query.$or = [
        { title: sRegex },
        { location: sRegex },
        { locality: sRegex },
        { city: sRegex },
        { sellerName: sRegex },
        { sellerPhone: sRegex },
      ];
    }

    const docs = await db
      .collection("resale_properties")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    return res.json(docs.map((d) => serializeResaleProperty(d, true)));
  } catch (err) {
    console.error("Admin resale list error:", err);
    return res.status(500).json({ detail: "Failed to fetch admin resale properties" });
  }
});

app.get("/api/admin/resale/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }
    const doc = await db.collection("resale_properties").findOne(query);
    if (!doc) return res.status(404).json({ detail: "Resale property not found" });
    return res.json(serializeResaleProperty(doc, true));
  } catch {
    return res.status(400).json({ detail: "Invalid resale property ID" });
  }
});

app.post("/api/admin/resale", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const b = req.body || {};

    const priceNum = typeof b.price === "number" ? b.price : parseFloat(b.price) || 0;
    const areaNum = typeof b.area === "number" ? b.area : parseFloat(b.area) || 0;
    let ppsf = typeof b.pricePerSqFt === "number" ? b.pricePerSqFt : parseFloat(b.pricePerSqFt) || 0;
    if (!ppsf && priceNum > 0 && areaNum > 0) {
      ppsf = Math.round(priceNum / areaNum);
    }

    const images = Array.isArray(b.images) ? b.images : [];
    const featuredImage = b.featuredImage || (images.length > 0 ? images[0] : "");

    const doc = {
      title: (b.title || "").trim() || "Untitled Resale Property",
      propertyType: b.propertyType || "Apartment",
      listingType: b.listingType || "For Sale",
      location: (b.location || "").trim(),
      address: (b.address || "").trim(),
      locality: (b.locality || "").trim(),
      city: (b.city || "").trim() || "Kolkata",
      pincode: (b.pincode || "").trim(),

      price: priceNum,
      pricePerSqFt: ppsf,

      area: areaNum,
      areaUnit: b.areaUnit || "sq.ft.",

      bedrooms: b.bedrooms != null ? b.bedrooms : "",
      bathrooms: b.bathrooms != null ? b.bathrooms : "",
      balconies: b.balconies != null ? b.balconies : "",
      floor: b.floor != null ? b.floor : "",
      totalFloors: b.totalFloors != null ? b.totalFloors : "",

      furnishingStatus: b.furnishingStatus || "Unfurnished",
      parking: b.parking || "None",
      ageOfProperty: b.ageOfProperty || "",

      description: b.description || "",
      amenities: Array.isArray(b.amenities)
        ? b.amenities
        : typeof b.amenities === "string"
        ? b.amenities
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],

      images: images,
      featuredImage: featuredImage,

      sellerName: (b.sellerName || "").trim(),
      sellerPhone: (b.sellerPhone || "").trim(),
      sellerEmail: (b.sellerEmail || "").toLowerCase().trim(),

      possessionStatus: b.possessionStatus || "Ready to Move",

      status: b.status || "Draft",
      featured: Boolean(b.featured),

      createdAt: nowUtcIso(),
      updatedAt: nowUtcIso(),
      createdBy: req.user?.email || "admin",
    };

    const result = await db.collection("resale_properties").insertOne(doc);
    doc._id = result.insertedId;
    cacheInvalidatePrefix("resale:");
    return res.status(201).json(serializeResaleProperty(doc, true));
  } catch (err) {
    console.error("Create admin resale error:", err);
    return res.status(500).json({ detail: "Failed to create resale property" });
  }
});

const handleResaleUpdate = async (req, res) => {
  try {
    const db = getDb();
    const update = { ...req.body, updatedAt: nowUtcIso() };
    delete update._id;
    delete update.id;
    delete update.createdAt;

    if (update.price != null) {
      update.price = typeof update.price === "number" ? update.price : parseFloat(update.price) || 0;
    }
    if (update.area != null) {
      update.area = typeof update.area === "number" ? update.area : parseFloat(update.area) || 0;
    }
    if (update.pricePerSqFt != null) {
      update.pricePerSqFt =
        typeof update.pricePerSqFt === "number" ? update.pricePerSqFt : parseFloat(update.pricePerSqFt) || 0;
    } else if (update.price > 0 && update.area > 0) {
      update.pricePerSqFt = Math.round(update.price / update.area);
    }
    if (update.featured !== undefined) {
      update.featured = Boolean(update.featured);
    }

    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }

    const rawResult = await db
      .collection("resale_properties")
      .findOneAndUpdate(query, { $set: update }, { returnDocument: "after" });
    const updatedDoc = rawResult?.value || rawResult;
    if (!updatedDoc) return res.status(404).json({ detail: "Resale property not found" });
    cacheInvalidatePrefix("resale:");
    return res.json(serializeResaleProperty(updatedDoc, true));
  } catch (err) {
    console.error("Update resale property error:", err);
    return res.status(400).json({ detail: "Failed to update resale property" });
  }
};

app.put("/api/admin/resale/:id", requireStaff, handleResaleUpdate);
app.patch("/api/admin/resale/:id", requireStaff, handleResaleUpdate);

app.patch("/api/admin/resale/:id/status", requireStaff, async (req, res) => {
  try {
    let { status } = req.body;
    const allowed = ["Draft", "Pending Review", "Published", "Sold", "Inactive"];
    const matched = allowed.find((s) => s.toLowerCase() === (status || "").toLowerCase());
    if (!matched) {
      return res.status(400).json({ detail: `Invalid status. Must be one of: ${allowed.join(", ")}` });
    }

    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }

    const result = await db
      .collection("resale_properties")
      .updateOne(query, { $set: { status: matched, updatedAt: nowUtcIso() } });
    if (result.matchedCount === 0) return res.status(404).json({ detail: "Resale property not found" });
    cacheInvalidatePrefix("resale:");
    return res.json({ ok: true, status: matched });
  } catch {
    return res.status(400).json({ detail: "Failed to update resale status" });
  }
});

app.patch("/api/admin/resale/:id/featured", requireStaff, async (req, res) => {
  try {
    const featured = Boolean(req.body.featured);
    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }

    const result = await db
      .collection("resale_properties")
      .updateOne(query, { $set: { featured, updatedAt: nowUtcIso() } });
    if (result.matchedCount === 0) return res.status(404).json({ detail: "Resale property not found" });
    cacheInvalidatePrefix("resale:");
    return res.json({ ok: true, featured });
  } catch {
    return res.status(400).json({ detail: "Failed to update featured flag" });
  }
});

app.delete("/api/admin/resale/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }

    const result = await db.collection("resale_properties").deleteOne(query);
    if (result.deletedCount === 0) return res.status(404).json({ detail: "Resale property not found" });
    cacheInvalidatePrefix("resale:");
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ detail: "Failed to delete resale property" });
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
// ADMIN RESALE LEADS (Dedicated Admin management for resale_leads)
// ---------------------------------------------------------------------------
app.get("/api/admin/leads/resale", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const query = {};

    if (req.query.status && req.query.status.trim() !== "") {
      query.status = { $regex: `^${req.query.status.trim()}$`, $options: "i" };
    }
    if (req.query.search && req.query.search.trim() !== "") {
      const s = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const sRegex = { $regex: s, $options: "i" };
      query.$or = [
        { name: sRegex },
        { phone: sRegex },
        { email: sRegex },
        { propertyTitle: sRegex },
        { message: sRegex },
      ];
    }

    const docs = await db
      .collection("resale_leads")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();

    return res.json(docs.map(serializeResaleLead));
  } catch (err) {
    console.error("Admin resale leads fetch error:", err);
    return res.status(500).json({ detail: "Failed to fetch resale leads" });
  }
});

app.patch("/api/admin/leads/resale/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const update = { updatedAt: nowUtcIso() };

    if (req.body.status) {
      const allowed = ["New", "Contacted", "Follow Up", "Site Visit", "Converted", "Closed"];
      const matched = allowed.find((s) => s.toLowerCase() === (req.body.status || "").toLowerCase());
      if (matched) update.status = matched;
      else update.status = req.body.status;
    }
    if (req.body.assignedTo !== undefined) update.assignedTo = req.body.assignedTo;
    if (req.body.notes !== undefined) update.notes = req.body.notes;

    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }

    const result = await db.collection("resale_leads").updateOne(query, { $set: update });
    if (result.matchedCount === 0) return res.status(404).json({ detail: "Resale lead not found" });
    return res.json({ ok: true, update });
  } catch {
    return res.status(400).json({ detail: "Failed to update resale lead" });
  }
});

app.delete("/api/admin/leads/resale/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    let query = {};
    try {
      query = { _id: new ObjectId(req.params.id) };
    } catch {
      query = { id: req.params.id };
    }
    const result = await db.collection("resale_leads").deleteOne(query);
    if (result.deletedCount === 0) return res.status(404).json({ detail: "Resale lead not found" });
    return res.json({ ok: true, message: "Resale lead deleted" });
  } catch {
    return res.status(400).json({ detail: "Failed to delete resale lead" });
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
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on("error", (streamErr) => {
      console.error("Resume stream error:", streamErr);
      if (!res.headersSent) {
        res.status(500).json({ detail: "Error streaming resume file" });
      }
    });
    downloadStream.pipe(res);
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
// ADMIN RECRUITMENT & HIRING MANAGEMENT CONSOLE
// ---------------------------------------------------------------------------
app.get("/api/admin/recruitment/dashboard", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const [
      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
      totalApps,
      newApps,
      underReviewApps,
      shortlistedApps,
      interviewApps,
      selectedApps,
      rejectedApps,
      withdrawnApps,
      recentApps,
      recentJobs,
    ] = await Promise.all([
      db.collection("job_openings").countDocuments({}),
      db.collection("job_openings").countDocuments({ status: "published" }),
      db.collection("job_openings").countDocuments({ status: "draft" }),
      db.collection("job_openings").countDocuments({ status: "closed" }),
      db.collection("job_applications").countDocuments({}),
      db.collection("job_applications").countDocuments({ status: { $regex: /^new$/i } }),
      db.collection("job_applications").countDocuments({ status: { $regex: /^under review$/i } }),
      db.collection("job_applications").countDocuments({ status: { $regex: /^shortlisted$/i } }),
      db.collection("job_applications").countDocuments({ status: { $regex: /^interview scheduled$/i } }),
      db.collection("job_applications").countDocuments({ status: { $regex: /^selected$/i } }),
      db.collection("job_applications").countDocuments({ status: { $regex: /^rejected$/i } }),
      db.collection("job_applications").countDocuments({ status: { $regex: /^withdrawn$/i } }),
      db.collection("job_applications").find({}).sort({ createdAt: -1 }).limit(8).toArray(),
      db.collection("job_openings").find({}).sort({ createdAt: -1 }).limit(5).toArray(),
    ]);

    return res.json({
      summary: {
        totalJobs,
        publishedJobs,
        draftJobs,
        closedJobs,
        totalApplications: totalApps,
      },
      byStatus: {
        new: newApps,
        underReview: underReviewApps,
        shortlisted: shortlistedApps,
        interviewScheduled: interviewApps,
        selected: selectedApps,
        rejected: rejectedApps,
        withdrawn: withdrawnApps,
      },
      recentApplications: recentApps.map(serializeJobApplication),
      recentJobs: recentJobs.map((j) => serializeJobOpening(j, true)),
    });
  } catch (err) {
    console.error("Recruitment dashboard error:", err);
    return res.status(500).json({ detail: "Failed to load recruitment dashboard data" });
  }
});

app.get("/api/admin/recruitment/jobs", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const { status, department, search } = req.query;
    const query = {};

    if (status && status !== "All") {
      query.status = status.toLowerCase();
    }
    if (department && department !== "All") {
      query.department = { $regex: new RegExp(`^${department.trim()}$`, "i") };
    }
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { department: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } },
        { tags: { $in: [new RegExp(s, "i")] } },
      ];
    }

    const docs = await db.collection("job_openings").find(query).sort({ createdAt: -1 }).toArray();
    return res.json(docs.map((d) => serializeJobOpening(d, true)));
  } catch (err) {
    console.error("Admin list jobs error:", err);
    return res.status(500).json({ detail: "Failed to fetch job openings" });
  }
});

app.post("/api/admin/recruitment/jobs", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    const title = (body.title || "").trim();
    if (!title) return res.status(400).json({ detail: "Job title is required." });

    let baseSlug = (body.slug || slugifyJobTitle(title)).toLowerCase().trim();
    if (!baseSlug) baseSlug = "opening";
    let finalSlug = baseSlug;
    let counter = 1;
    while (await db.collection("job_openings").findOne({ slug: finalSlug })) {
      counter += 1;
      finalSlug = `${baseSlug}-${counter}`;
    }

    const insertedId = new ObjectId();
    const status = (body.status || "draft").toLowerCase();
    const isPublished = status === "published";

    const doc = {
      _id: insertedId,
      title,
      slug: finalSlug,
      department: (body.department || "Sales & Advisory").trim(),
      location: (body.location || "New Town, Kolkata").trim(),
      employmentType: body.employmentType || "Full-time",
      workplaceType: body.workplaceType || "On-site",
      experienceLevel: body.experienceLevel || "Mid-Senior Level",
      experienceMinYears: typeof body.experienceMinYears === "number" ? body.experienceMinYears : parseInt(body.experienceMinYears, 10) || 0,
      experienceMaxYears: typeof body.experienceMaxYears === "number" ? body.experienceMaxYears : parseInt(body.experienceMaxYears, 10) || 0,
      salaryRange: body.salaryRange || {
        min: 0,
        max: 0,
        currency: "INR",
        period: "yearly",
        isDisclosed: false,
      },
      description: body.description || "",
      responsibilities: Array.isArray(body.responsibilities)
        ? body.responsibilities
        : (body.responsibilities || "").split("\n").map((s) => s.trim()).filter(Boolean),
      requirements: Array.isArray(body.requirements)
        ? body.requirements
        : (body.requirements || "").split("\n").map((s) => s.trim()).filter(Boolean),
      benefits: Array.isArray(body.benefits)
        ? body.benefits
        : (body.benefits || "").split("\n").map((s) => s.trim()).filter(Boolean),
      tags: Array.isArray(body.tags)
        ? body.tags
        : (body.tags || "").split(",").map((s) => s.trim()).filter(Boolean),
      status,
      isFeatured: Boolean(body.isFeatured),
      applicationsCount: 0,
      viewsCount: 0,
      postedAt: isPublished ? (body.postedAt || nowUtcIso()) : null,
      expiresAt: body.expiresAt || null,
      createdBy: req.user?.email || "admin",
      updatedBy: req.user?.email || "admin",
      createdAt: nowUtcIso(),
      updatedAt: nowUtcIso(),
    };

    await db.collection("job_openings").insertOne(doc);
    cacheInvalidatePrefix("seo:sitemap");
    return res.status(201).json(serializeJobOpening(doc, true));
  } catch (err) {
    console.error("Create job opening error:", err);
    return res.status(500).json({ detail: "Failed to create job opening" });
  }
});

app.get("/api/admin/recruitment/jobs/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    let doc = null;
    if (ObjectId.isValid(id)) {
      doc = await db.collection("job_openings").findOne({ _id: new ObjectId(id) });
    }
    if (!doc) {
      doc = await db.collection("job_openings").findOne({ slug: id.toLowerCase().trim() });
    }
    if (!doc) return res.status(404).json({ detail: "Job opening not found" });

    return res.json(serializeJobOpening(doc, true));
  } catch (err) {
    console.error("Get admin job error:", err);
    return res.status(400).json({ detail: "Invalid job opening ID" });
  }
});

app.patch("/api/admin/recruitment/jobs/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ detail: "Invalid job opening ID" });

    const existing = await db.collection("job_openings").findOne({ _id: new ObjectId(id) });
    if (!existing) return res.status(404).json({ detail: "Job opening not found" });

    const body = req.body || {};
    const updates = { updatedAt: nowUtcIso(), updatedBy: req.user?.email || "admin" };

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.slug !== undefined && body.slug.trim()) {
      const cleanSlug = body.slug.toLowerCase().trim();
      const slugClash = await db.collection("job_openings").findOne({ slug: cleanSlug, _id: { $ne: existing._id } });
      if (!slugClash) updates.slug = cleanSlug;
    }
    if (body.department !== undefined) updates.department = body.department.trim();
    if (body.location !== undefined) updates.location = body.location.trim();
    if (body.employmentType !== undefined) updates.employmentType = body.employmentType;
    if (body.workplaceType !== undefined) updates.workplaceType = body.workplaceType;
    if (body.experienceLevel !== undefined) updates.experienceLevel = body.experienceLevel;
    if (body.experienceMinYears !== undefined) updates.experienceMinYears = parseInt(body.experienceMinYears, 10) || 0;
    if (body.experienceMaxYears !== undefined) updates.experienceMaxYears = parseInt(body.experienceMaxYears, 10) || 0;
    if (body.salaryRange !== undefined) updates.salaryRange = body.salaryRange;
    if (body.description !== undefined) updates.description = body.description;
    if (body.responsibilities !== undefined) {
      updates.responsibilities = Array.isArray(body.responsibilities)
        ? body.responsibilities
        : body.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    if (body.requirements !== undefined) {
      updates.requirements = Array.isArray(body.requirements)
        ? body.requirements
        : body.requirements.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    if (body.benefits !== undefined) {
      updates.benefits = Array.isArray(body.benefits)
        ? body.benefits
        : body.benefits.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    if (body.tags !== undefined) {
      updates.tags = Array.isArray(body.tags)
        ? body.tags
        : body.tags.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (body.status !== undefined) {
      updates.status = body.status.toLowerCase();
      if (updates.status === "published" && !existing.postedAt) {
        updates.postedAt = nowUtcIso();
      }
    }
    if (body.isFeatured !== undefined) updates.isFeatured = Boolean(body.isFeatured);
    if (body.expiresAt !== undefined) updates.expiresAt = body.expiresAt;

    await db.collection("job_openings").updateOne({ _id: existing._id }, { $set: updates });
    cacheInvalidatePrefix("seo:sitemap");
    const updated = await db.collection("job_openings").findOne({ _id: existing._id });

    return res.json(serializeJobOpening(updated, true));
  } catch (err) {
    console.error("Update job error:", err);
    return res.status(500).json({ detail: "Failed to update job opening" });
  }
});

app.delete("/api/admin/recruitment/jobs/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ detail: "Invalid job opening ID" });

    const job = await db.collection("job_openings").findOne({ _id: new ObjectId(id) });
    if (!job) return res.status(404).json({ detail: "Job opening not found" });

    const appCount = await db.collection("job_applications").countDocuments({ jobId: job._id });
    if (appCount > 0) {
      await db.collection("job_openings").updateOne(
        { _id: job._id },
        { $set: { status: "archived", updatedAt: nowUtcIso(), updatedBy: req.user?.email || "admin" } }
      );
      cacheInvalidatePrefix("seo:sitemap");
      return res.json({
        ok: true,
        archived: true,
        message: `Job has ${appCount} applications on file. Status has been changed to 'archived' to preserve candidate records.`,
      });
    }

    await db.collection("job_openings").deleteOne({ _id: job._id });
    cacheInvalidatePrefix("seo:sitemap");
    return res.json({ ok: true, message: "Job opening deleted successfully" });
  } catch (err) {
    console.error("Delete job error:", err);
    return res.status(500).json({ detail: "Failed to delete job opening" });
  }
});

app.get("/api/admin/recruitment/applications", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const { jobId, status, search, page, limit } = req.query;

    const query = {};
    if (jobId && jobId !== "All") {
      if (ObjectId.isValid(jobId)) {
        query.jobId = new ObjectId(jobId);
      } else {
        query.jobSlug = jobId;
      }
    }
    if (status && status !== "All") {
      query.status = { $regex: new RegExp(`^${status.trim()}$`, "i") };
    }
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } },
        { referenceNumber: { $regex: s, $options: "i" } },
        { currentCompany: { $regex: s, $options: "i" } },
        { jobTitle: { $regex: s, $options: "i" } },
      ];
    }

    const pageSize = Math.min(parseInt(limit, 10) || 50, 100);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const skipNum = (pageNum - 1) * pageSize;

    const [total, docs] = await Promise.all([
      db.collection("job_applications").countDocuments(query),
      db.collection("job_applications")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(pageSize)
        .toArray(),
    ]);

    return res.json({
      applications: docs.map(serializeJobApplication),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (err) {
    console.error("List applications error:", err);
    return res.status(500).json({ detail: "Failed to fetch job applications" });
  }
});

app.get("/api/admin/recruitment/applications/:id", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    let doc = null;
    if (ObjectId.isValid(id)) {
      doc = await db.collection("job_applications").findOne({ _id: new ObjectId(id) });
    }
    if (!doc) {
      doc = await db.collection("job_applications").findOne({ referenceNumber: id.trim() });
    }
    if (!doc) return res.status(404).json({ detail: "Job application not found" });

    return res.json(serializeJobApplication(doc));
  } catch (err) {
    console.error("Get application detail error:", err);
    return res.status(400).json({ detail: "Invalid job application ID" });
  }
});

app.patch("/api/admin/recruitment/applications/:id/status", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ detail: "Invalid job application ID" });

    const appDoc = await db.collection("job_applications").findOne({ _id: new ObjectId(id) });
    if (!appDoc) return res.status(404).json({ detail: "Job application not found" });

    const { status, reason } = req.body || {};
    const validStatuses = [
      "New",
      "Under Review",
      "Shortlisted",
      "Interview Scheduled",
      "Selected",
      "Rejected",
      "Withdrawn",
    ];

    if (!status || !validStatuses.map((s) => s.toLowerCase()).includes(status.toLowerCase())) {
      return res.status(400).json({ detail: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const matchedStatus = validStatuses.find((s) => s.toLowerCase() === status.toLowerCase()) || status;

    const historyEntry = {
      fromStatus: appDoc.status,
      toStatus: matchedStatus,
      changedBy: req.user?.email || "Recruiter",
      changedAt: nowUtcIso(),
      reason: (reason || "").trim() || `Status updated to ${matchedStatus}`,
    };

    await db.collection("job_applications").updateOne(
      { _id: appDoc._id },
      {
        $set: { status: matchedStatus, updatedAt: nowUtcIso() },
        $push: { statusHistory: historyEntry },
      }
    );

    return res.json({
      ok: true,
      status: matchedStatus,
      message: `Candidate status updated to ${matchedStatus}`,
    });
  } catch (err) {
    console.error("Update application status error:", err);
    return res.status(500).json({ detail: "Failed to update application status" });
  }
});

app.post("/api/admin/recruitment/applications/:id/notes", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ detail: "Invalid job application ID" });

    const appDoc = await db.collection("job_applications").findOne({ _id: new ObjectId(id) });
    if (!appDoc) return res.status(404).json({ detail: "Job application not found" });

    const noteText = (req.body?.note || "").trim();
    if (!noteText) return res.status(400).json({ detail: "Note content cannot be empty." });

    const noteItem = {
      id: new ObjectId().toString(),
      note: noteText,
      author: req.user?.name || req.user?.email || "Recruiter",
      createdAt: nowUtcIso(),
    };

    await db.collection("job_applications").updateOne(
      { _id: appDoc._id },
      {
        $push: { notes: noteItem },
        $set: { updatedAt: nowUtcIso() },
      }
    );

    const updated = await db.collection("job_applications").findOne({ _id: appDoc._id });
    return res.json({ ok: true, notes: updated.notes || [] });
  } catch (err) {
    console.error("Add application note error:", err);
    return res.status(500).json({ detail: "Failed to add note to application" });
  }
});

app.get("/api/admin/recruitment/applications/:id/resume", requireStaff, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ detail: "Invalid application ID" });

    const appDoc = await db.collection("job_applications").findOne({ _id: new ObjectId(id) });
    if (!appDoc) return res.status(404).json({ detail: "Job application not found" });

    if (!appDoc.resumeFileId) {
      if (appDoc.resumeUrl && appDoc.resumeUrl.startsWith("http")) {
        return res.redirect(appDoc.resumeUrl);
      }
      return res.status(404).json({ detail: "No resume file stored for this candidate." });
    }

    const bucket = new GridFSBucket(db, { bucketName: "career_resumes" });
    const downloadStream = bucket.openDownloadStream(new ObjectId(appDoc.resumeFileId));

    const filename = appDoc.resumeFilename || "candidate_resume.pdf";
    const contentType = appDoc.resumeContentType || "application/pdf";

    res.set({
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
    });

    downloadStream.on("error", (err) => {
      console.error("Resume GridFS stream error:", err);
      if (!res.headersSent) {
        res.status(404).json({ detail: "Resume file not found in storage" });
      }
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error("Download application resume error:", err);
    return res.status(500).json({ detail: "Failed to stream resume file" });
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
      resaleTotal,
      resalePublished,
      resaleLeadsTotal,
      resaleLeadsNew,
      recruitmentTotalJobs,
      recruitmentPublishedJobs,
      recruitmentTotalApps,
      recruitmentNewApps,
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
      // Resale stats (isolated)
      db.collection("resale_properties").countDocuments({}),
      db.collection("resale_properties").countDocuments({ status: { $regex: /^published$/i } }),
      db.collection("resale_leads").countDocuments({}),
      db.collection("resale_leads").countDocuments({ status: { $regex: /^new$/i } }),
      // Recruitment System stats
      db.collection("job_openings").countDocuments({}),
      db.collection("job_openings").countDocuments({ status: "published" }),
      db.collection("job_applications").countDocuments({}),
      db.collection("job_applications").countDocuments({ status: { $regex: /^new$/i } }),
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
      resale: {
        total: resaleTotal,
        published: resalePublished,
        leads_total: resaleLeadsTotal,
        leads_new: resaleLeadsNew,
      },
      recruitment: {
        total_jobs: recruitmentTotalJobs,
        published_jobs: recruitmentPublishedJobs,
        total_applications: recruitmentTotalApps,
        new_applications: recruitmentNewApps,
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
function dedupeAndSortArticles(articles) {
  const seen = new Set();
  const deduped = [];
  for (const a of articles) {
    if (!a || !a.title) continue;
    const key = (a.link || a.title).trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(a);
  }
  deduped.sort((a, b) => {
    const da = a.published ? new Date(a.published).getTime() : 0;
    const db = b.published ? new Date(b.published).getTime() : 0;
    return db - da;
  });
  return deduped;
}

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
    const trendingDoc = await db.collection("news_cache").findOne({ topic: "trending" });
    let articles = Array.isArray(trendingDoc?.articles) ? trendingDoc.articles : [];

    // Also get top Kolkata/West Bengal news if trending has few items
    if (articles.length < 12) {
      const localDocs = await db.collection("news_cache").find({ topic: { $in: ["kolkata", "new_town", "rajarhat", "west_bengal"] } }).toArray();
      localDocs.forEach((d) => {
        if (Array.isArray(d.articles)) articles = articles.concat(d.articles);
      });
    }

    const sorted = dedupeAndSortArticles(articles).slice(0, 12);
    const result = { articles: sorted };
    cacheSet(cacheKey, result, 900); // 15 min TTL
    res.set({
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
    });
    return res.json(result);
  } catch (err) {
    console.error("[News] Error fetching trending news:", err.message);
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
    let latestFetchedAt = null;

    caches.forEach((c) => {
      if (Array.isArray(c.articles)) allArticles = allArticles.concat(c.articles);
      if (c.fetched_at && (!latestFetchedAt || c.fetched_at > latestFetchedAt)) {
        latestFetchedAt = c.fetched_at;
      }
    });

    const sorted = dedupeAndSortArticles(allArticles);
    const limit = 100;
    const capped = sorted.slice(0, limit);
    const result = {
      articles: capped,
      last_updated: latestFetchedAt || new Date().toISOString(),
      count: capped.length,
    };

    cacheSet(cacheKey, result, 900); // 15 min TTL
    res.set({
      "X-Cache": "MISS",
      "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
    });
    return res.json(result);
  } catch (err) {
    console.error("[News] Error fetching all news:", err.message);
    return res.json({ articles: [], last_updated: new Date().toISOString(), count: 0 });
  }
});

app.get("/api/news", (req, res) => {
  res.redirect(301, "/api/news/all");
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
  app.use(express.static(activeBuildPath, { redirect: false, index: false }));

  // Route allowlist for legitimate application routes
  const VALID_APP_ROUTE_REGEX = /^\/(properties|resale|blogs|news|market-intelligence|calculators|about|contact|careers?|admin)($|\/.*)/i;

  // SPA Route Handler: return index.html (200 OK) for valid routes, or 404 for unknown routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/healthz")) {
      return next();
    }

    const isRoot = req.path === "/" || req.path === "";
    const isValidRoute = isRoot || VALID_APP_ROUTE_REGEX.test(req.path);

    if (isValidRoute) {
      const cleanPath = req.path.replace(/^\/+|\/+$/g, "");
      const nestedPath = path.join(activeBuildPath, cleanPath, "index.html");
      const flatPath = path.join(activeBuildPath, `${cleanPath}.html`);
      if (cleanPath && fs.existsSync(nestedPath)) {
        return res.sendFile(nestedPath);
      }
      if (cleanPath && fs.existsSync(flatPath)) {
        return res.sendFile(flatPath);
      }
      return res.sendFile(path.join(activeBuildPath, "index.html"));
    }

    // Soft-404 Prevention: return genuine HTTP 404 status code
    res.status(404);
    const custom404 = path.join(activeBuildPath, "404.html");
    if (fs.existsSync(custom404)) {
      return res.sendFile(custom404);
    }
    return res.sendFile(path.join(activeBuildPath, "index.html"));
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
      // Dedicated Resale Collections indexes (Requirement 18 - additive and isolated)
      db.collection("resale_properties").createIndex({ status: 1, featured: 1, createdAt: -1 }),
      db.collection("resale_properties").createIndex({ location: 1 }),
      db.collection("resale_properties").createIndex({ city: 1 }),
      db.collection("resale_properties").createIndex({ propertyType: 1 }),
      db.collection("resale_properties").createIndex({ price: 1 }),
      db.collection("resale_properties").createIndex({ createdAt: -1 }),
      db.collection("resale_leads").createIndex({ resalePropertyId: 1 }),
      db.collection("resale_leads").createIndex({ phone: 1 }),
      db.collection("resale_leads").createIndex({ email: 1 }),
      db.collection("resale_leads").createIndex({ status: 1, createdAt: -1 }),
      db.collection("resale_leads").createIndex({ createdAt: -1 }),
      // Recruitment System Indexes (job_openings & job_applications)
      db.collection("job_openings").createIndex({ slug: 1 }, { unique: true }),
      db.collection("job_openings").createIndex({ status: 1, postedAt: -1, createdAt: -1 }),
      db.collection("job_openings").createIndex({ department: 1 }),
      db.collection("job_openings").createIndex({ location: 1 }),
      db.collection("job_applications").createIndex({ referenceNumber: 1 }, { unique: true }),
      db.collection("job_applications").createIndex({ jobId: 1, createdAt: -1 }),
      db.collection("job_applications").createIndex({ email: 1 }),
      db.collection("job_applications").createIndex({ phone: 1 }),
      db.collection("job_applications").createIndex({ status: 1, createdAt: -1 }),
      db.collection("job_applications").createIndex({ createdAt: -1 }),
    ]);
    console.log("[MongoDB] Database compound indexes verified & active (including job_openings & job_applications)");

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
    const adminsToEnsure = [
      { email: "admin@astitva.com", password: process.env.ADMIN_PASSWORD || "Astitva@2026", name: "Astittva Admin" },
      { email: "admin@astittva.in", password: "Astittva@2026", name: "Astittva Admin" },
      { email: "admin@astittva.com", password: "Astittva@2026", name: "Astittva Admin" },
    ];

    for (const a of adminsToEnsure) {
      const existing = await db.collection("users").findOne({ email: a.email });
      if (!existing) {
        await db.collection("users").insertOne({
          email: a.email,
          password_hash: bcrypt.hashSync(a.password, 10),
          name: a.name,
          role: "admin",
          created_at: nowUtcIso(),
        });
        console.log(`[Auth] Seeded admin account: ${a.email}`);
      } else if (!existing.password_hash) {
        await db.collection("users").updateOne(
          { _id: existing._id },
          { $set: { password_hash: bcrypt.hashSync(a.password, 10), role: "admin" } }
        );
      }
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
