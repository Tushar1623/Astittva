const fs = require("fs");

function updateMarketIntelPage(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // 1. Update H1 and subtext
  const oldHeader = `<h1 className="section-title text-[2rem] sm:text-5xl lg:text-7xl leading-[1.05]">Market Intelligence</h1>
            <p className="mt-6 sm:mt-8 text-muted-fg text-base sm:text-lg max-w-3xl leading-[1.75] font-light">
              Actionable insights, investment trends, infrastructure developments, and real estate opportunities — curated from Kolkata, India and global markets.
            </p>`;

  const newHeader = `<h1 className="section-title text-[2rem] sm:text-5xl lg:text-7xl leading-[1.05]">Kolkata Real Estate Market Intelligence</h1>
            <p className="mt-6 sm:mt-8 text-muted-fg text-base sm:text-lg max-w-3xl leading-[1.75] font-light">
              Actionable market intelligence, urban infrastructure developments, investment trends, and property updates across New Town, Rajarhat, EM Bypass, and Greater Kolkata — curated continuously by Astittva Marketing advisors.
            </p>`;

  content = content.replace(oldHeader, newHeader);

  // 2. Add Macro Infrastructure & Market Briefing section right before `{/* ============== ROADMAP SECTION ============== */}`
  const guideSection = `
      {/* ============== MACRO INFRASTRUCTURE & MARKET BRIEFING ============== */}
      <section className="relative py-16 sm:py-24 border-t border-[#E8DED2] bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <div className="text-[10px] tracking-[0.35em] uppercase text-[#B87333] font-semibold mb-3">
            Urban Infrastructure Radar
          </div>
          <h2 className="font-serif-display text-2xl sm:text-4xl text-[#1C1C1C] mb-6 leading-tight font-normal">
            Tracking Kolkata&apos;s Infrastructure Growth &amp; Real Estate Valuations
          </h2>

          <div className="space-y-6 text-[#5F5F5F] text-sm sm:text-base leading-relaxed font-light">
            <p>
              The real estate market in Kolkata is experiencing an unprecedented structural transformation driven by state-of-the-art transit arteries. For property buyers and institutional investors, monitoring real-time market intelligence on transit expansion, commercial SEZ leasing, and statutory planning is vital to timing market entry.
            </p>

            <div>
              <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2 font-normal text-[#B87333]">
                Mass Rapid Transit &amp; Metro Corridor Expansion
              </h3>
              <p>
                The operational expansion of Kolkata&apos;s metro network represents the single most powerful driver of residential appreciation. The <strong>Orange Line (Line 6)</strong>, linking Kavi Subhash through Ruby (Hemanta Mukhopadhyay) and the VIP Road corridor directly to Netaji Subhash Chandra Bose International Airport, is transforming connectivity along the entire Eastern Metropolitan Bypass. Concurrently, the <strong>Green Line (East-West Metro)</strong> connects Howrah to Sector V, while the <strong>Purple Line</strong> extends transit through Majerhat, Taratala, and South Kolkata.
              </p>
            </div>

            <div>
              <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2 font-normal text-[#B87333]">
                Commercial IT Clusters &amp; Silicon Valley SEZ
              </h3>
              <p>
                Commercial demand anchors residential capital stability. The ongoing expansion of New Town Action Area III as Eastern India&apos;s Silicon Valley Tech Hub — housing sprawling campuses for major technology enterprises, financial institutions, and educational conglomerates — continues to create sustainable, high-income rental demand for 2, 3, and 4 BHK luxury residences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============== ROADMAP SECTION ============== */}`;

  content = content.replace(/\{\/\* ============== ROADMAP SECTION ============== \*\/\}/, guideSection);

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated MarketIntelligencePage in " + filePath);
}

updateMarketIntelPage("frontend/src/pages/MarketIntelligencePage.jsx");
updateMarketIntelPage("web/src/pages/MarketIntelligencePage.jsx");

