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

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const client = targetUrl.startsWith("https") ? https : http;
    client
      .get(targetUrl, { timeout: 15000 }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function getSitemapXml() {
  // Strategy 1: Attempt from local running Node backend
  try {
    const localXml = await fetchUrl("http://localhost:8000/sitemap.xml");
    if (localXml && localXml.includes("<urlset")) {
      console.log("[Sitemap Generator] Successfully fetched dynamic XML from local backend");
      return localXml;
    }
  } catch (err) {
    // Continue to next strategy
  }

  // Strategy 2: Attempt from live Render backend
  try {
    const remoteXml = await fetchUrl("https://astittva-backend.onrender.com/sitemap.xml");
    if (remoteXml && remoteXml.includes("<urlset")) {
      console.log("[Sitemap Generator] Successfully fetched dynamic XML from Render backend");
      return remoteXml;
    }
  } catch (err) {
    // Continue to next strategy
  }

  // Strategy 3: Built-in static catalog fallback
  console.log("[Sitemap Generator] Using static fallback catalogue");
  const today = new Date().toISOString().split("T")[0];
  const urls = STATIC_URLS.map(
    (entry) => `  <url>
    <loc>${SITE_DOMAIN}${entry.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
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
