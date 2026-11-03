const fs = require("fs");

function updateResalePage(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // 1. Expand hero subtext
  const oldSubtext = `<motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-[14px] sm:text-[16px] font-sans text-[#E8DCD5]/85 leading-relaxed font-light mb-10"
          >
            Institutional-grade due diligence, verified chain of deeds, and transparent negotiations for ready-to-move homes across Kolkata.
          </motion.p>`;

  const newSubtext = `<motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-[14px] sm:text-[16px] font-sans text-[#E8DCD5]/90 leading-relaxed font-light mb-10"
          >
            Explore verified resale residences and ready-to-move flats in Kolkata with Astittva Marketing. Our specialized secondary market advisory desk provides complete legal title verification, physical property inspections, and transparent seller negotiations across New Town, Rajarhat, EM Bypass, and South Kolkata.
          </motion.p>`;

  content = content.replace(oldSubtext, newSubtext);

  // 2. Add Resale Buyer Guide section right before `{/* SECTION 3: SELLER REGISTRATION & LISTING DESK */}`
  const guideSection = `
        {/* ===================== RESALE BUYER GUIDE & DUE DILIGENCE ===================== */}
        <section className="mt-20 pt-16 border-t border-[#E8DED2]">
          <div className="max-w-4xl mx-auto">
            <div className="text-[10px] tracking-[0.35em] uppercase text-[#B87333] font-semibold mb-3">
              Secondary Market Due Diligence
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C] mb-6 font-normal">
              Navigating Resale Residences &amp; Secondary Properties in Kolkata
            </h2>

            <div className="space-y-6 text-[#5F5F5F] text-sm sm:text-base leading-relaxed font-light">
              <p>
                Purchasing a resale residence in Kolkata offers compelling advantages for discerning families and real estate investors. Unlike under-construction developments, ready-to-move secondary market flats provide immediate occupancy, tangible verification of construction quality, zero GST liability, and an established residential community with functional amenities.
              </p>

              <div>
                <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2 font-normal text-[#B87333]">
                  Essential Due Diligence for Resale Flats
                </h3>
                <p>
                  Acquiring property in the secondary market requires meticulous legal scrutiny. At Astittva Marketing, our in-house advisory desk conducts end-to-end title diligence before onboarding any resale property. This includes verifying the uninterrupted chain of title deeds spanning 30 years, examining non-encumbrance certificates (Form 15 &amp; Form 16 from the Directorate of Registration), confirming municipal mutation with the Kolkata Municipal Corporation (KMC) or New Town Kolkata Development Authority (NKDA), and obtaining official No-Objection Certificates (NOC) from the cooperative housing society or apartment association.
                </p>
              </div>

              <div>
                <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2 font-normal text-[#B87333]">
                  Valuation, Taxation &amp; Registration Guidance
                </h3>
                <p>
                  Fair market valuation in the secondary real estate market depends on structural age, undivided share of land (UDS), interior woodwork, and micro-market appreciation. In West Bengal, resale properties incur stamp duty (currently 5% for properties valued up to ₹1 Crore in municipal areas, and 6% above ₹1 Crore) plus 1% registration fees. Our team coordinates property valuation, bank home loan balance transfers, legal deed drafting, and physical accompaniment at the local ADSR or District Registrar office.
                </p>
              </div>
            </div>

            <div className="mt-10 p-6 bg-[#F5F1EC] rounded-xl border border-[#E8DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[#1C1C1C] font-medium text-sm">Need Title Scrutiny for a Resale Home?</div>
                <div className="text-[#5F5F5F] text-xs mt-0.5">Our legal and resale advisory team provides independent document verification.</div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/contact" className="btn-primary text-xs py-2 px-5">Consult Resale Desk</Link>
                <Link to="/calculators/stamp-duty-registration" className="btn-outline text-xs py-2 px-4">Stamp Duty Tool</Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SELLER REGISTRATION & LISTING DESK */}`;

  content = content.replace(/\{\/\* SECTION 3: SELLER REGISTRATION & LISTING DESK \*\/\}/, guideSection);

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated ResalePage in " + filePath);
}

updateResalePage("frontend/src/pages/ResalePage.jsx");
updateResalePage("web/src/pages/ResalePage.jsx");

