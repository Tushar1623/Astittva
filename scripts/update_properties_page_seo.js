const fs = require("fs");

function updatePropertiesPage(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // 1. Expand intro text
  const oldIntro = `<p className="text-ivory/55 font-light mt-4 max-w-2xl text-sm sm:text-base">
            Every listing is verified, RERA-compliant where applicable, and curated by our advisory desk.
            Refine by micro-market, budget or builder to surface the right opportunity.
          </p>`;

  const newIntro = `<p className="text-ivory/70 font-light mt-4 max-w-3xl text-sm sm:text-base leading-relaxed">
            Discover verified residential properties in Kolkata, curated exclusively by Astittva Marketing. Whether you are exploring luxury apartments in New Town, premium high-rises on EM Bypass, township living in Rajarhat, or heritage enclaves in South Kolkata, every development undergoes rigorous WBRERA compliance, developer track record analysis, and legal title diligence.
          </p>`;

  content = content.replace(oldIntro, newIntro);

  // 2. Add Buyer Advisory & Locality Guide section before line `</div>\r?\n    </div>\r?\n  );\r?\n}`
  const guideSection = `
        {/* ===================== BUYER ADVISORY & LOCALITY GUIDE ===================== */}
        <section className="mt-20 pt-16 border-t border-copper/20">
          <div className="max-w-4xl mx-auto">
            <div className="text-[10px] tracking-[0.35em] uppercase text-copper font-semibold mb-3">
              Kolkata Real Estate Intelligence
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-ivory mb-6 font-normal">
              Navigating Properties in Kolkata: Key Corridors &amp; Buying Guide
            </h2>

            <div className="space-y-6 text-ivory/70 text-sm sm:text-base leading-relaxed font-light">
              <p>
                Kolkata&apos;s real estate landscape offers a diverse spectrum of residential options, combining long-term capital preservation with steady rental yields. For discerning buyers and NRI investors evaluating properties in Kolkata, understanding micro-market dynamics is essential to making an informed acquisition.
              </p>

              <div>
                <h3 className="font-display text-lg text-ivory mb-2 font-normal text-copper">
                  Key Investment Corridors
                </h3>
                <p>
                  <strong>New Town &amp; Rajarhat:</strong> Planned as Eastern India&apos;s satellite smart city, New Town (Action Areas I, II, and III) features wide arterial boulevards, IT and financial tech parks, Eco Park, and premier luxury high-rises like Town Square and Vinayak Amara. Adjacent Rajarhat offers rapidly appreciating township developments and modern residential communities with convenient airport transit.
                </p>
                <p className="mt-2">
                  <strong>EM Bypass Corridor:</strong> Kolkata&apos;s primary growth artery connecting North, Central, and South Kolkata. Boasting panoramic views of the East Kolkata Wetlands, Orange Line metro connectivity, and immediate proximity to super-specialty hospitals and five-star hotels, luxury apartments along EM Bypass (such as Ambuja Utpalaa and Niyasa) command strong capital value and high rental yields.
                </p>
                <p className="mt-2">
                  <strong>South Kolkata Heritage Enclaves:</strong> Neighborhoods such as New Alipore and Alipore represent prestige, low-density green living, and high capital security, served by the newly operational Purple Line metro at Majerhat.
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg text-ivory mb-2 font-normal text-copper">
                  WBRERA Due Diligence &amp; Advisory Process
                </h3>
                <p>
                  Every property represented by Astittva Marketing carries verified statutory compliance under the West Bengal Real Estate Regulatory Authority (WBRERA). Our advisory desk scrutinises sanctioned building plans, carpet area disclosures, project escrow accounts, and completion timelines. We guide clients through every stage — from comparative market evaluation and private site inspections to home loan coordination and legal deed registration.
                </p>
              </div>
            </div>

            <div className="mt-10 p-6 bg-charcoal-2/60 border border-copper/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-ivory font-medium text-sm">Require Personalised Property Advisory?</div>
                <div className="text-ivory/50 text-xs mt-0.5">Consult with our senior Kolkata property advisors for tailored shortlists.</div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/contact" className="btn-primary text-xs py-2 px-5">Book Consultation</Link>
                <Link to="/calculators/home-loan-emi" className="btn-outline text-xs py-2 px-4">EMI Calculator</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}`;

  content = content.replace(/\s*<\/div>\r?\n\s*<\/div>\r?\n\s*\);\r?\n}/, guideSection);

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated PropertiesPage in " + filePath);
}

updatePropertiesPage("frontend/src/pages/PropertiesPage.jsx");
updatePropertiesPage("web/src/pages/PropertiesPage.jsx");

