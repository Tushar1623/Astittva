const fs = require("fs");

function updateBlogDetail(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  const oldBox = content.match(/\{\/\* Contextual Internal Linking \*\/\}[\s\S]*?<\/div>\r?\n\s*<\/div>/);
  if (oldBox) {
    const newBox = `{/* Contextual Locality & Investment Linking */}
          <div className="mt-12 p-6 rounded-[8px] bg-white border border-[#E8DED2] text-[#1C1C1C]">
            <h3 className="font-serif text-lg font-bold mb-2">Explore Kolkata's Key Real Estate Corridors</h3>
            <p className="text-sm text-[#5F5F5F] mb-4">
              Planning to buy or invest? Explore our comprehensive locality intelligence guides, price benchmarks, and verified developments across Kolkata:
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/locations/em-bypass" className="btn-outline text-xs py-2 px-4">EM Bypass Hub</Link>
              <Link to="/locations/new-town-rajarhat" className="btn-outline text-xs py-2 px-4">New Town &amp; Rajarhat Hub</Link>
              <Link to="/locations/new-alipore" className="btn-outline text-xs py-2 px-4">New Alipore Hub</Link>
              <Link to="/properties" className="btn-primary text-xs py-2 px-4">Browse Properties</Link>
              <Link to="/calculators/home-loan-emi" className="btn-outline text-xs py-2 px-4">EMI Calculator</Link>
            </div>
          </div>`;
    content = content.replace(oldBox[0], newBox);
    fs.writeFileSync(filePath, content, "utf8");
    console.log("Updated " + filePath);
  } else {
    console.error("Contextual Internal Linking box not found in " + filePath);
  }
}

updateBlogDetail("frontend/src/pages/BlogDetailPage.jsx");
updateBlogDetail("web/src/pages/BlogDetailPage.jsx");
