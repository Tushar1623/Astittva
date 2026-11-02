const fs = require("fs");

function updateHome(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // 1. LOCATIONS
  const oldLoc = content.match(/const LOCATIONS = \[\r?\n[\s\S]*?\r?\n\];/);
  if (!oldLoc) {
    console.error("LOCATIONS block not found in " + filePath);
    return;
  }
  const newLoc = `const LOCATIONS = [
  {
    name: "New Town & Rajarhat",
    tag: "Smart City & IT Hub",
    img: "/images/luxe/locations_newtown.webp",
    blurb: "India's planned smart-city — Silicon Valley IT corridors, Eco Park, and landmark luxury residences like Town Square.",
    starting: "₹55 L",
    category: "Luxury · Investment",
    link: "/locations/new-town-rajarhat",
  },
  {
    name: "EM Bypass",
    tag: "Lifeline Corridor",
    img: "/images/luxe/property_tower.webp",
    blurb: "Kolkata's high-speed growth artery — Orange Line Metro, super-specialty healthcare, and luxury high-rises.",
    starting: "₹1.87 Cr",
    category: "High-Rise · Luxury",
    link: "/locations/em-bypass",
  },
  {
    name: "New Alipore",
    tag: "Heritage Prestige",
    img: "/images/luxe/property_heritage_estate.webp",
    blurb: "South Kolkata's serene heritage enclave — planned green avenues, Majerhat Purple Line metro, and bespoke residences.",
    starting: "₹2.25 Cr",
    category: "Heritage · Elite",
    link: "/locations/new-alipore",
  },
];`;
  content = content.replace(oldLoc[0], newLoc);

  // 2. SEO Title & Description
  content = content.replace(
    /title="Astittva Marketing \| Property Consultants in Kolkata"/,
    'title="Astittva Marketing | Real Estate Company in Kolkata"'
  );
  content = content.replace(
    /description="Explore properties in Kolkata, New Town, Rajarhat and Salt Lake with Astittva Marketing\. Get guidance for buying and investing in real estate\."/,
    'description="Premier real estate company in Kolkata. Astittva Marketing provides trusted advisory for luxury properties, flats & investments across EM Bypass & New Town."'
  );

  // 3. Hero Overline
  content = content.replace(
    />Astittva Marketing · Est\. 2026<\/span>/,
    ">Premier Real Estate Company in Kolkata · Est. 2026</span>"
  );

  // 4. Hero Lead Paragraph
  content = content.replace(
    /Discover verified residential and commercial opportunities across Kolkata&apos;s fastest-growing real estate destinations — curated by advisors who measure success in decades, not deals\./,
    "As a premier real estate company in Kolkata, Astittva Marketing curates verified residential and commercial opportunities across EM Bypass, New Town, and South Kolkata — guided by advisors who measure success in decades, not deals."
  );

  // 5. Why Astittva Eyebrow
  content = content.replace(
    /<span className="text-\[10px\] tracking-\[0\.5em\] uppercase text-\[#5F5F5F\]">The Astittva Difference<\/span>/,
    '<span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">Leading Real Estate Company in Kolkata</span>'
  );

  // 6. Location Card Link
  content = content.replace(
    /<Link to={`\/properties\?city=\${encodeURIComponent\(loc\.name\)}`} data-testid={`location-card-\${loc\.name\.toLowerCase\(\)\.replace\(' ', '-'\)}`}>/,
    '<Link to={loc.link || `/properties?city=${encodeURIComponent(loc.name)}`} data-testid={`location-card-${loc.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>'
  );

  // 7. Location Card Action Button text
  content = content.replace(
    /Discover <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" \/>/,
    'Explore Locality <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />'
  );

  // 8. Why Invest in Kolkata copy
  content = content.replace(
    /Kolkata — and Greater Kolkata in particular — is experiencing a quiet renaissance\. Lower entry points than Mumbai or Bangalore, strong rental yields, and a wave of infrastructure that&apos;s redrawing the map of Eastern India\./,
    "As a leading real estate company in Kolkata, Astittva Marketing guides clients through the city&apos;s quiet renaissance. From high-growth corridors along EM Bypass and New Town to heritage enclaves in New Alipore, Kolkata offers lower entry points than Mumbai or Bangalore, strong rental yields, and transformative metro infrastructure."
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Successfully updated " + filePath);
}

updateHome("frontend/src/pages/HomePage.jsx");
updateHome("web/src/pages/HomePage.jsx");
