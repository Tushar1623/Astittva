const fs = require("fs");

const filePath = "frontend/scripts/prerender_routes.js";
let content = fs.readFileSync(filePath, "utf8");

// 1. Update Homepage entry
content = content.replace(
  /title: "Astittva Marketing \| Property Consultants in Kolkata",\r?\n\s*rawTitle: "Property Consultants in Kolkata",\r?\n\s*description: "Explore properties in Kolkata, New Town, Rajarhat and Salt Lake with Astittva Marketing\. Expert advisory for buying and investing in real estate\.",/,
  `title: "Astittva Marketing | Real Estate Company in Kolkata",
    rawTitle: "Real Estate Company in Kolkata",
    description: "Premier real estate company in Kolkata. Astittva Marketing provides trusted advisory for luxury properties, flats & investments across EM Bypass & New Town.",`
);

content = content.replace(
  /lead: "Curated luxury and premium real estate opportunities across Kolkata, New Town, Rajarhat, and Salt Lake\. Transparent guidance, RERA-verified developments, and end-to-end investment advisory\.",/,
  `lead: "Astittva Marketing is Kolkata's premier luxury real estate company and property advisory firm. Curated residential and commercial developments across New Town, Rajarhat, EM Bypass, and South Kolkata.",`
);

// 2. Add Location Landing Pages to STATIC_PAGES right before the closing of STATIC_PAGES
const newLocationPages = `  {
    path: "/locations/em-bypass",
    rawTitle: "Flats & Properties in EM Bypass Kolkata",
    description: "Explore luxury apartments & flats in EM Bypass Kolkata. Discover verified residential projects near Ruby, Science City & Kalikapur with Astittva Marketing.",
    h1: "Luxury Properties & Flats on EM Bypass, Kolkata",
    lead: "The Eastern Metropolitan (EM) Bypass is Kolkata's premier high-velocity growth artery, connecting North, South, and Salt Lake with luxury high-rises, Orange Line Metro, and super-specialty healthcare.",
    sections: [
      {
        h2: "Locality Overview & Transit Advantage",
        content: "Spanning 21+ km from Ultadanga to Garia, EM Bypass offers panoramic views of the East Kolkata Wetlands, Orange Line metro connectivity to the Airport and Ruby Hospital, and signal-free access via Maa Flyover.",
      },
      {
        h2: "Featured Developments on EM Bypass",
        content: "Showcasing premier residences including Ambuja Utpalaa (near Ruby), Niyasa, and luxury condominiums with 100% WBRERA compliance.",
      },
    ],
  },
  {
    path: "/locations/new-alipore",
    rawTitle: "Properties in New Alipore Kolkata",
    description: "Discover luxury residences & flats in New Alipore Kolkata. Expert advisory, RERA-verified developments & South Kolkata property insights with Astittva.",
    h1: "Luxury Real Estate & Residences in New Alipore, Kolkata",
    lead: "New Alipore is South Kolkata's distinguished, green, affluent residential enclave planned with serene tree-lined avenues, boutique condominiums, and Purple Line Majerhat metro connectivity.",
    sections: [
      {
        h2: "South Kolkata's Distinguished Enclave",
        content: "Minutes from Alipore, Chetla, and Taratala, New Alipore represents unparalleled capital preservation, quiet residential blocks A through O, and high-prestige living.",
      },
      {
        h2: "Connectivity & Infrastructure",
        content: "Purple Line Metro station at Majerhat, Taratala Flyover, Durgapur Bridge, and proximity to CMRI, BM Birla Heart Research Centre, Sri Sri Academy, and South City Mall.",
      },
    ],
  },
  {
    path: "/locations/new-town-rajarhat",
    rawTitle: "Properties in New Town & Rajarhat Kolkata",
    description: "Find verified luxury flats & properties in New Town & Rajarhat Kolkata. Explore top projects, RERA verified homes, price trends & metro connectivity.",
    h1: "Luxury Properties & Real Estate in New Town & Rajarhat, Kolkata",
    lead: "India's award-winning planned smart city and Eastern India's largest technology corridor, spanning Action Areas I, II, III and Rajarhat with Silicon Valley IT parks and Eco Park.",
    sections: [
      {
        h2: "Smart City Infrastructure & Connectivity",
        content: "Major Arterial Road, Orange Line Metro connecting directly to Kolkata Airport, and 7-minute signal-free access to Salt Lake Sector V.",
      },
      {
        h2: "Landmark Developments & Town Square Highlights",
        content: "Home to Town Square by Srijan Realty in Action Area I, Vinayak Amara, Vaanya, Sattvik Gateway, Newtown Villa, and premier corporate office complexes including PS New Town Square.",
      },
    ],
  },
];`;

content = content.replace(/\r?\n\];\r?\n\r?\nfunction buildCrawlableBody/, `,\n${newLocationPages}\n\nfunction buildCrawlableBody`);

fs.writeFileSync(filePath, content, "utf8");
console.log("Updated prerender_routes.js successfully!");
