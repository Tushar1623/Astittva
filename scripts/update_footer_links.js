const fs = require("fs");

function updateFooter(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Update brand line mentioning areas
  content = content.replace(
    /Across <span style=\{\{ color: "#E5C68C", fontWeight: 500 \}\}>New Town, Rajarhat &amp; Kolkata<\/span>/,
    'Across <span style={{ color: "#E5C68C", fontWeight: 500 }}>EM Bypass, New Alipore, New Town &amp; Rajarhat</span>'
  );

  // Update Markets column to Locality Hubs
  const oldMarkets = content.match(/<div className="md:col-span-2">\r?\n\s*<h4 className="text-\[10px\] tracking-\[0\.4em\] uppercase text-\[#C78B47\] mb-6 font-semibold">Markets<\/h4>[\s\S]*?<\/div>/);
  if (oldMarkets) {
    const newMarkets = `<div className="md:col-span-2">
              <h4 className="text-[10px] tracking-[0.4em] uppercase text-[#C78B47] mb-6 font-semibold">Locality Hubs</h4>
              <ul className="space-y-3.5 text-[14px] text-[#F5EFE7]/90 font-normal">
                <li><Link to="/locations/new-town-rajarhat" className="hover:text-[#C78B47] transition">New Town &amp; Rajarhat</Link></li>
                <li><Link to="/locations/em-bypass" className="hover:text-[#C78B47] transition">EM Bypass</Link></li>
                <li><Link to="/locations/new-alipore" className="hover:text-[#C78B47] transition">New Alipore</Link></li>
                <li><Link to="/properties?location=Salt+Lake" className="hover:text-[#C78B47] transition">Salt Lake Sector V</Link></li>
                <li><Link to="/properties" className="hover:text-[#C78B47] transition">All Kolkata Properties</Link></li>
                <li className="text-[#F5EFE7]/55 italic font-serif-display text-xs pt-2">Greater Kolkata · India · Global</li>
              </ul>
            </div>`;
    content = content.replace(oldMarkets[0], newMarkets);
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated footer in " + filePath);
}

updateFooter("frontend/src/components/Footer.jsx");
updateFooter("web/src/components/Footer.jsx");
