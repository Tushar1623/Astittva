/**
 * Astittva Marketing — Static Pre-renderer & Build-Time Snapshot Generator
 * 
 * Generates crawlable, SEO-compliant HTML snapshots for all public routes:
 * - Directs title (max 60 chars), description (max 155 chars), self-referencing canonical
 * - Injects semantic <h1> and main page body text into initial HTML
 * - Retains compiled React script & CSS links for zero-friction client hydration
 * - No cloaking: initial snapshot content matches React rendered content
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const SITE_DOMAIN = "https://astittva.in";
const BRAND_SUFFIX = " | Astittva Marketing";
const OG_IMAGE = "https://astittva.in/og-image.png";

function clampTitle(title, brandSuffix = BRAND_SUFFIX) {
  let clean = (title || "").replace(/\s+/g, " ").trim();
  clean = clean.replace(/\s*\|\s*Astittva.*$/i, "").trim();
  const maxPrefix = 60 - brandSuffix.length;
  if (clean.length > maxPrefix) {
    clean = clean.slice(0, maxPrefix - 3).trim() + "...";
  }
  return `${clean}${brandSuffix}`;
}

function clampDescription(desc) {
  let clean = (desc || "").replace(/\s+/g, " ").trim();
  if (clean.length > 155) {
    const truncated = clean.slice(0, 152);
    const lastSpace = truncated.lastIndexOf(" ");
    return (lastSpace > 110 ? truncated.slice(0, lastSpace) : truncated) + "...";
  }
  return clean;
}

function fetchJson(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { timeout: 10000 }, (res) => {
        if (res.statusCode !== 200) return resolve(null);
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      })
      .on("error", () => resolve(null));
  });
}

const STATIC_PAGES = [
  {
    path: "/",
    title: "Astittva Marketing | Property Consultants in Kolkata",
    rawTitle: "Property Consultants in Kolkata",
    description: "Explore properties in Kolkata, New Town, Rajarhat and Salt Lake with Astittva Marketing. Expert advisory for buying and investing in real estate.",
    h1: "Find Your Astittva. Build Your Legacy.",
    lead: "Curated luxury and premium real estate opportunities across Kolkata, New Town, Rajarhat, and Salt Lake. Transparent guidance, RERA-verified developments, and end-to-end investment advisory.",
    sections: [
      {
        h2: "Premier Real Estate Corridors in Kolkata",
        content: "From the high-tech smart city corridors of New Town Action Area I, II & III to the rapidly appreciating residential townships of Rajarhat and prestigious addresses in Salt Lake, Astittva Marketing curates vetted developments from Kolkata's most reputable builders.",
      },
      {
        h2: "Our Advisory Pillars",
        content: "Every property in our portfolio undergoes thorough RERA diligence, title verification, and developer pedigree evaluation. We provide transparent pricing, floor plan analysis, and advisor-led site visits.",
      },
    ],
  },
  {
    path: "/properties",
    rawTitle: "Properties in Kolkata",
    description: "Explore luxury and premium properties in Kolkata, New Town, and Rajarhat with Astittva Marketing. Verified projects with complete RERA compliance.",
    h1: "Properties in Kolkata",
    lead: "Discover verified residential and commercial developments across New Town, Rajarhat, and Salt Lake. Handpicked luxury sky-residences, modern apartments, and premium township homes.",
    sections: [
      {
        h2: "Verified Residential Developments",
        content: "Browse Kolkata's most coveted residential projects featuring 2, 3, and 4 BHK luxury residences by premier builders including Srijan Realty, Vinayak Group, Sattvik Homes, and Shrachi Keventer.",
      },
      {
        h2: "Key Investment Locations",
        content: "New Town Action Area I, Action Area II, Action Area III, Rajarhat Chowmatha, Chinar Park, and Salt Lake Sector V.",
      },
    ],
  },
  {
    path: "/resale",
    rawTitle: "Resale Properties in Kolkata",
    description: "Browse verified resale flats and houses in Kolkata, New Town, and Rajarhat. Title-checked secondary market properties ready for immediate possession.",
    h1: "Curated Resale Homes in Kolkata",
    lead: "Secondary market homes with verified ownership, transparent legal documentation, and immediate possession across Kolkata's top residential hubs.",
    sections: [
      {
        h2: "Secondary Market Advisory",
        content: "Astittva Marketing's resale desk provides end-to-end legal title verification, physical inspection support, accurate secondary market valuation, and seamless registry assistance.",
      },
    ],
  },
  {
    path: "/calculators",
    rawTitle: "Real Estate Calculators",
    description: "Free real estate and home loan calculators by Astittva Marketing. Calculate EMI, affordability, property ROI, rental yield, and West Bengal stamp duty.",
    h1: "Real Estate Financial Calculators",
    lead: "Plan your Kolkata property purchase with precision. Instant financial calculators for home loan EMIs, rental yield, property affordability, and West Bengal stamp duty.",
    sections: [
      {
        h2: "Available Calculators",
        content: "Home Loan EMI Calculator, Property Affordability Calculator, Property ROI Calculator, Rental Yield Calculator, Rent vs Buy Comparison, Stamp Duty & Registration in West Bengal, Capital Gains Tax Calculator.",
      },
    ],
  },
  {
    path: "/blogs",
    rawTitle: "Real Estate Journal",
    description: "Read real estate insights, market analyses, and Kolkata property buying guides from the editorial team at Astittva Marketing.",
    h1: "Astittva Real Estate Journal",
    lead: "In-depth market intelligence, buyer checklists, and locality price guides for Kolkata, New Town, and Rajarhat.",
    sections: [
      {
        h2: "Editorial Themes",
        content: "Micro-market appreciation trends, WBRERA compliance checklists, infrastructure expansion along Kolkata Metro corridors, and comparative analyses between New Town, Rajarhat, and Salt Lake.",
      },
    ],
  },
  {
    path: "/news",
    rawTitle: "Market Intelligence",
    description: "Latest Kolkata real estate news, infrastructure developments, metro corridor expansions, and property market updates curated by Astittva Marketing.",
    h1: "Kolkata Real Estate Market Intelligence",
    lead: "Curated news and infrastructure developments shaping property values across New Town, Rajarhat, Salt Lake, and Greater Kolkata.",
    sections: [
      {
        h2: "Infrastructure & Growth Drivers",
        content: "Tracking airport metro connectivity, commercial IT SEZ developments, East-West metro expansion, and urban infrastructure projects influencing residential demand in West Bengal.",
      },
    ],
  },
  {
    path: "/about",
    rawTitle: "About Astittva",
    description: "Learn about Astittva Marketing, trusted real estate advisory in Kolkata. Expert guidance for residential purchases and investments across New Town and Rajarhat.",
    h1: "About Astittva Marketing",
    lead: "Astittva Marketing is a premier real estate advisory firm headquartered in New Town, Kolkata. We guide discerning buyers and investors toward exceptional properties with absolute transparency.",
    sections: [
      {
        h2: "Our Philosophy & Mission",
        content: "We believe a property purchase is far more than a transaction — it is the foundation of a family's legacy or a portfolio's resilience. Every relationship we build starts with that gravity in mind.",
      },
      {
        h2: "Office & Leadership",
        content: "Registered Office: PS IXL Building, 5th Floor, Room 511, Biswa Bangla Sarani, Atghara, New Town, Kolkata 700136. Telephone: +91 92303 74700. Email: sales@astittva.in.",
      },
    ],
  },
  {
    path: "/contact",
    rawTitle: "Contact Us",
    description: "Contact Astittva Marketing for real estate advisory in Kolkata, New Town and Rajarhat. Schedule a consultation with our experienced property consultants.",
    h1: "Contact Astittva Marketing",
    lead: "Schedule a private property consultation with our senior advisory team. Most conversations begin within 30 minutes by phone, WhatsApp, or at our New Town office.",
    sections: [
      {
        h2: "Advisory Office Address",
        content: "PS IXL Building, 5th Floor, Room 511, Biswa Bangla Sarani, Atghara, New Town, Kolkata, West Bengal 700136, India.",
      },
      {
        h2: "Direct Advisory Channels",
        content: "Telephone: +91 92303 74700 | Email: sales@astittva.in | Consultation Hours: Monday to Saturday, 10:00 AM – 7:00 PM IST.",
      },
    ],
  },
  {
    path: "/career",
    rawTitle: "Careers at Astittva",
    description: "Join the Astittva Marketing advisory team in Kolkata. Explore career opportunities in luxury real estate consulting, marketing, and client relations.",
    h1: "Careers at Astittva Marketing",
    lead: "Build your career with Kolkata's fastest-growing real estate advisory firm. We are looking for passionate property consultants, marketing professionals, and relationship managers.",
    sections: [
      {
        h2: "Why Join Astittva",
        content: "Work with premier developers, guide high-net-worth investors, and benefit from competitive compensation and structured professional mentorship.",
      },
    ],
  },
  {
    path: "/careers/jobs",
    rawTitle: "Job Openings & Vacancies in Kolkata",
    description: "Explore published career opportunities at Astittva Marketing. Join Kolkata's premier luxury real estate advisory team in New Town and Salt Lake.",
    h1: "Career Opportunities & Job Vacancies at Astittva",
    lead: "Browse active job openings across Private Client Advisory, Digital Growth, and Strategic Investments in Kolkata.",
    sections: [
      {
        h2: "Explore Active Vacancies",
        content: "View full role profiles, candidate requirements, compensation packages, and apply online with your resume.",
      },
    ],
  },
];

const CALCULATOR_PAGES = [
  {
    path: "/calculators/home-loan-emi",
    rawTitle: "Home Loan EMI Calculator",
    description: "Calculate your monthly home loan EMI, total interest, and complete loan amortization schedule for Kolkata property purchases.",
    h1: "Home Loan EMI Calculator",
    lead: "Estimate your monthly loan payments and total interest payable based on loan amount, interest rate, and tenure.",
  },
  {
    path: "/calculators/property-affordability",
    rawTitle: "Affordability Calculator",
    description: "Determine the maximum property price you can comfortably afford in Kolkata based on monthly income, existing debts, and down payment.",
    h1: "Property Affordability Calculator",
    lead: "Calculate your maximum home loan eligibility and comfortable budget based on your monthly household income and existing EMIs.",
  },
  {
    path: "/calculators/property-roi",
    rawTitle: "Property ROI Calculator",
    description: "Calculate return on investment (ROI) and annualized IRR for residential and commercial property investments in Kolkata.",
    h1: "Property ROI Calculator",
    lead: "Evaluate capital appreciation, rental income returns, and total return on investment over your planned holding period.",
  },
  {
    path: "/calculators/rental-yield",
    rawTitle: "Rental Yield Calculator",
    description: "Calculate gross and net rental yield for residential flats in New Town, Rajarhat, and Kolkata.",
    h1: "Rental Yield Calculator",
    lead: "Compare property rental yields against purchase price, maintenance costs, and annual rental earnings in Kolkata.",
  },
  {
    path: "/calculators/rent-vs-buy",
    rawTitle: "Rent vs Buy Calculator",
    description: "Compare the total long-term financial cost of renting versus buying a home in Kolkata over 5 to 25 years.",
    h1: "Rent vs Buy Comparison Calculator",
    lead: "Make an informed decision between renting and owning property with inflation-adjusted wealth and equity projections.",
  },
  {
    path: "/calculators/property-appreciation",
    rawTitle: "Appreciation Calculator",
    description: "Project future property value based on historical Kolkata real estate annual appreciation rates.",
    h1: "Property Appreciation Calculator",
    lead: "Forecast the compounding future valuation of your property across New Town, Rajarhat, and Greater Kolkata.",
  },
  {
    path: "/calculators/area-conversion",
    rawTitle: "Area Conversion Calculator",
    description: "Convert land and apartment area between Cottah, Sq Ft, Sq Yards, Bigha, Acres, and Sq Meters in West Bengal.",
    h1: "Real Estate Area Conversion Calculator",
    lead: "Convert traditional West Bengal land units (Cottah, Bigha, Chatak) to modern Square Feet and Square Meters instantly.",
  },
  {
    path: "/calculators/price-per-sqft",
    rawTitle: "Price Per Sq Ft Calculator",
    description: "Calculate price per square foot from total property price and carpet or super built-up area in Kolkata.",
    h1: "Price Per Square Foot Calculator",
    lead: "Quickly determine the effective rate per square foot for comparing residential and commercial properties.",
  },
  {
    path: "/calculators/stamp-duty-registration",
    rawTitle: "Stamp Duty Calculator",
    description: "Calculate West Bengal stamp duty and registration fees for property purchases in Kolkata and New Town.",
    h1: "West Bengal Stamp Duty & Registration Calculator",
    lead: "Compute exact government stamp duty and registration charges applicable for property deeds in Kolkata and West Bengal.",
  },
  {
    path: "/calculators/construction-cost",
    rawTitle: "Construction Cost Calculator",
    description: "Estimate house and villa construction costs in Kolkata based on built-up area and construction quality grade.",
    h1: "House Construction Cost Calculator",
    lead: "Calculate estimated material, civil, and finishing costs for residential construction in Greater Kolkata.",
  },
  {
    path: "/calculators/down-payment",
    rawTitle: "Down Payment Calculator",
    description: "Calculate required down payment, initial upfront cash, and loan financing balance for buying property in Kolkata.",
    h1: "Down Payment Calculator",
    lead: "Plan your upfront savings requirement for property booking, stamp duty, and bank margin requirements.",
  },
  {
    path: "/calculators/capital-gains-tax",
    rawTitle: "Capital Gains Tax Calculator",
    description: "Calculate short-term and long-term capital gains tax (LTCG / STCG) on real estate property sales in India.",
    h1: "Capital Gains Tax Calculator",
    lead: "Estimate capital gains tax liabilities and discover reinvestment exemptions under Section 54 for property sellers.",
  },
];

function buildCrawlableBody(page) {
  const sectionsHtml = (page.sections || [])
    .map(
      (sec) => `
      <section style="margin:28px 0;padding:24px;background:#FAF8F5;border:1px solid #EAE0D5;border-radius:6px;">
        <h2 style="font-family:'Cinzel',serif;font-size:22px;color:#3B0A11;margin-bottom:12px;">${sec.h2}</h2>
        <p style="font-family:'Manrope',sans-serif;font-size:16px;line-height:1.7;color:#3A3A3A;">${sec.content}</p>
      </section>`
    )
    .join("\n");

  return `
    <div class="prerender-shell" style="max-width:1140px;margin:0 auto;padding:120px 24px 60px;font-family:'Manrope',sans-serif;color:#1C1C1C;">
      <header style="margin-bottom:40px;border-bottom:1px solid #EAE0D5;padding-bottom:30px;">
        <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#B4773F;margin-bottom:12px;font-weight:600;">
          Astittva Marketing · Kolkata Property Advisory
        </div>
        <h1 style="font-family:'Cinzel',serif;font-size:36px;color:#3B0A11;line-height:1.2;margin:0 0 16px;">
          ${page.h1}
        </h1>
        <p style="font-size:18px;line-height:1.7;color:#4A4A4A;max-width:820px;margin:0;">
          ${page.lead}
        </p>
      </header>

      <main>
        ${sectionsHtml}
      </main>

      <footer style="margin-top:60px;padding-top:30px;border-top:1px solid #EAE0D5;font-size:14px;color:#666;line-height:1.8;">
        <p><strong>Astittva Marketing Private Limited</strong> — Real Estate Consultants & Advisory</p>
        <p>Office: PS IXL Building, 5th Floor, Room 511, Biswa Bangla Sarani, Atghara, New Town, Kolkata 700136</p>
        <p>Direct Advisory: +91 92303 74700 · Email: sales@astittva.in</p>
        <p style="color:#B4773F;font-weight:600;margin-top:10px;">WBRERA Registration No: [FILL IN]</p>
      </footer>
    </div>
  `;
}

function renderHtml(templateHtml, page) {
  const finalTitle = page.title || clampTitle(page.rawTitle);
  const finalDesc = clampDescription(page.description);
  const canonicalUrl = `${SITE_DOMAIN}${page.path === "/" ? "/" : page.path}`;
  const crawlableBody = buildCrawlableBody(page);

  let html = templateHtml;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${finalTitle}</title>`);

  // Replace Meta Description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${finalDesc}" />`
  );

  // Replace Canonical Link
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Replace Open Graph Tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${finalTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${finalDesc}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image" content="${OG_IMAGE}" />`
  );

  // Replace Twitter Tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${finalTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${finalDesc}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`
  );

  // Inject crawlable content inside <div id="root">
  html = html.replace(
    /<div id="root">\s*<\/div>/i,
    `<div id="root">${crawlableBody}</div>`
  );

  return html;
}

async function fetchDynamicPages() {
  const pages = [];

  // Fetch properties
  const properties = (await fetchJson("http://localhost:8000/api/properties?limit=100")) ||
    (await fetchJson("https://astittva-backend.onrender.com/api/properties?limit=100")) || [];

  for (const p of properties) {
    if (p.id && p.status === "published") {
      const loc = p.location || p.city || "Kolkata";
      const rawTitle = `${p.project_name} in ${loc}`;
      pages.push({
        path: `/properties/${p.id}`,
        rawTitle,
        description: `Explore ${p.project_name} in ${loc}, Kolkata by ${p.builder || "Astittva Marketing"}. RERA-verified luxury homes with detailed floor plans.`,
        h1: `${p.project_name} in ${loc}, Kolkata`,
        lead: p.description || `Luxury residential project in ${loc} by ${p.builder || "Astittva Marketing"}.`,
        sections: [
          {
            h2: "Property Highlights",
            content: `Bedrooms: ${p.bedrooms || "Luxury configurations"} | Price: ${p.price_label || "Price on Request"} | Possession: ${p.possession_date || "Contact Advisor"} | RERA: ${p.rera_number || "Verified"}`,
          },
          {
            h2: "Location & Connectivity",
            content: `Situated in ${loc}, Kolkata with seamless connectivity to IT corridors, airports, and premier lifestyle destinations.`,
          },
        ],
      });
    }
  }

  // Fetch blogs
  const blogs = (await fetchJson("http://localhost:8000/api/blogs?limit=100")) ||
    (await fetchJson("https://astittva-backend.onrender.com/api/blogs?limit=100")) || [];

  for (const b of blogs) {
    if (b.slug && b.status === "published") {
      const matchedArea = ["New Town", "Rajarhat", "Salt Lake", "EM Bypass", "Kolkata"].find((a) =>
        `${b.title} ${b.short_description || ""}`.toLowerCase().includes(a.toLowerCase())
      ) || "Kolkata";

      const hasArea = new RegExp(`\\bin\\s+(${matchedArea}|Kolkata)\\b`, "i").test(b.title);
      const rawTitle = hasArea ? b.title : `${b.title} in ${matchedArea}`;

      pages.push({
        path: `/blogs/${b.slug}`,
        rawTitle,
        description: b.short_description || `Read ${b.title} from the real estate editorial team at Astittva Marketing Kolkata.`,
        h1: b.title,
        lead: b.short_description || `Astittva Editorial analysis for Kolkata real estate buyers and investors.`,
        sections: [
          {
            h2: "Editorial Summary",
            content: `Published on ${b.publish_date || "2026"} by ${b.author || "Astittva Editorial"}. Focus area: ${matchedArea}, Greater Kolkata.`,
          },
        ],
      });
    }
  }

  return pages;
}

async function main() {
  console.log("==========================================================");
  console.log("🚀 Starting Astittva Static Pre-Renderer (Task 4)");
  console.log("==========================================================");

  const baseBuildDir = path.resolve(__dirname, "../build");
  const templatePath = path.join(baseBuildDir, "index.html");

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template not found at: ${templatePath}. Run 'craco build' first.`);
    return;
  }

  const templateHtml = fs.readFileSync(templatePath, "utf8");
  console.log(`✓ Loaded base template (${templateHtml.length} bytes)`);

  const dynamicPages = await fetchDynamicPages();
  console.log(`✓ Loaded ${dynamicPages.length} dynamic property & blog pages`);

  const allPages = [...STATIC_PAGES, ...CALCULATOR_PAGES, ...dynamicPages];
  console.log(`✓ Pre-rendering total of ${allPages.length} public routes`);

  const targetDirs = [
    baseBuildDir,
    path.resolve(__dirname, "../../web/build"),
    "C:\\Users\\lenovo\\Downloads\\astittva marketing\\frontend\\build",
  ];

  let generatedCount = 0;

  for (const page of allPages) {
    const renderedHtml = renderHtml(templateHtml, page);
    const cleanPath = page.path.replace(/^\/+|\/+$/g, "");

    for (const buildDir of targetDirs) {
      if (!fs.existsSync(buildDir)) continue;

      if (cleanPath === "") {
        // Root index.html
        fs.writeFileSync(path.join(buildDir, "index.html"), renderedHtml, "utf8");
      } else {
        // Nested route: {buildDir}/{route}/index.html
        const routeDir = path.join(buildDir, cleanPath);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        fs.writeFileSync(path.join(routeDir, "index.html"), renderedHtml, "utf8");

        // Flat fallback: {buildDir}/{route}.html
        fs.writeFileSync(path.join(buildDir, `${cleanPath}.html`), renderedHtml, "utf8");
      }
    }

    generatedCount++;
  }

  console.log(`✅ Successfully generated ${generatedCount} static pre-rendered routes.`);
  console.log("==========================================================");
}

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Pre-rendering failed:", err);
    process.exit(1);
  });
}

module.exports = { main, renderHtml };
