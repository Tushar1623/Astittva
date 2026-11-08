/**
 * Astittva Marketing — Sitemap XML Generator
 * Fetches dynamic sitemap records (properties, resale, blogs, calculators, static pages)
 * and writes static sitemap.xml to frontend/public and build directories.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const SITE_DOMAIN = "https://astittva.in";

const STATIC_URLS = [
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
  // Location Landing Pages
  { path: "/locations/em-bypass", changefreq: "weekly", priority: "0.9" },
  { path: "/locations/new-alipore", changefreq: "weekly", priority: "0.9" },
  { path: "/locations/new-town-rajarhat", changefreq: "weekly", priority: "0.9" },
  // Calculators
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

function fetchUrl(targetUrl, timeoutMs = 2500) {
  return new Promise((resolve) => {
    let settled = false;
    const client = targetUrl.startsWith("https") ? https : http;
    let hardTimer;

    const finish = (val) => {
      if (!settled) {
        settled = true;
        clearTimeout(hardTimer);
        resolve(val);
      }
    };

    const req = client.get(targetUrl, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return finish(null);
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => finish(data));
    });

    req.on("error", () => finish(null));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      finish(null);
    });

    hardTimer = setTimeout(() => {
      req.destroy();
      finish(null);
    }, timeoutMs + 500);
  });
}

async function getSitemapXml() {
  // Strategy 1: Attempt from local running Node backend (1.5s max)
  try {
    const localXml = await fetchUrl("http://localhost:8000/sitemap.xml", 1500);
    if (localXml && localXml.includes("<urlset")) {
      console.log("[Sitemap Generator] Successfully fetched dynamic XML from local backend");
      return localXml;
    }
  } catch (err) {
    // Continue to next strategy
  }

  // Strategy 2: Attempt from live Render backend (2.5s max)
  try {
    const remoteXml = await fetchUrl("https://astittva-backend.onrender.com/sitemap.xml", 2500);
    if (remoteXml && remoteXml.includes("<urlset")) {
      console.log("[Sitemap Generator] Successfully fetched dynamic XML from Render backend");
      return remoteXml;
    }
  } catch (err) {
    // Continue to next strategy
  }

  // Strategy 3: Built-in catalog fallback (Static + Local Seed Properties & Blogs)
  console.log("[Sitemap Generator] Using static fallback catalogue with local seed data");
  const today = new Date().toISOString().split("T")[0];
  const urlEntries = STATIC_URLS.map(
    (entry) => `  <url>
    <loc>${SITE_DOMAIN}${entry.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  );

  // Add seed properties
  try {
    const seedPropsPath = path.resolve(__dirname, "../src/data/seedProperties.json");
    if (fs.existsSync(seedPropsPath)) {
      const properties = JSON.parse(fs.readFileSync(seedPropsPath, "utf8"));
      for (const p of properties) {
        if (p.id) {
          urlEntries.push(`  <url>
    <loc>${SITE_DOMAIN}/properties/${p.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`);
        }
      }
    }
  } catch (e) {
    console.warn("[Sitemap Generator] Could not read seedProperties:", e.message);
  }

  // Add seed blogs
  try {
    const seedBlogsPath = path.resolve(__dirname, "../src/data/seedBlogs.json");
    if (fs.existsSync(seedBlogsPath)) {
      const blogs = JSON.parse(fs.readFileSync(seedBlogsPath, "utf8"));
      for (const b of blogs) {
        if (b.slug && b.status === "published") {
          urlEntries.push(`  <url>
    <loc>${SITE_DOMAIN}/blogs/${b.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>`);
        }
      }
    }
  } catch (e) {
    console.warn("[Sitemap Generator] Could not read seedBlogs:", e.message);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;
}

async function main() {
  const xml = await getSitemapXml();

  const destinations = [
    path.resolve(__dirname, "../public/sitemap.xml"),
    path.resolve(__dirname, "../build/sitemap.xml"),
    path.resolve(__dirname, "../../web/public/sitemap.xml"),
    path.resolve(__dirname, "../../web/build/sitemap.xml"),
  ];

  for (const dest of destinations) {
    try {
      const dir = path.dirname(dest);
      if (fs.existsSync(dir)) {
        fs.writeFileSync(dest, xml, "utf8");
        console.log(`[Sitemap Generator] Wrote ${dest} (${xml.length} bytes)`);
      }
    } catch (e) {
      console.error(`[Sitemap Generator] Failed writing to ${dest}:`, e.message);
    }
  }
}

main().catch(console.error);
