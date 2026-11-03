const fs = require("fs");

function updateBlogsListPage(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // 1. Expand hero paragraph
  const oldIntro = `<p className="mt-6 sm:mt-8 text-muted-fg text-base sm:text-lg max-w-3xl leading-[1.75] font-light">
              Slow-read essays on Kolkata luxury real estate, investor strategy, and the
              micro-market shifts shaping tomorrow&apos;s premium addresses.
            </p>`;

  const newIntro = `<p className="mt-6 sm:mt-8 text-muted-fg text-base sm:text-lg max-w-3xl leading-[1.75] font-light">
              Welcome to the Astittva Real Estate Blog and Journal. Read authoritative research essays, market price analyses, WBRERA regulatory guides, and investor intelligence shaping luxury property acquisitions across Kolkata, New Town, and Rajarhat.
            </p>`;

  content = content.replace(oldIntro, newIntro);

  // 2. Add Editorial Overview section after `{/* ============== BLOG GRID ============== */}` block
  const guideSection = `
          {/* ===================== EDITORIAL OVERVIEW & RESEARCH PILLARS ===================== */}
          <div className="mt-20 pt-16 border-t border-[#E8DED2]">
            <div className="max-w-4xl mx-auto">
              <div className="text-[10px] tracking-[0.35em] uppercase text-[#B87333] font-semibold mb-3">
                Kolkata Property Research &amp; Advisory
              </div>
              <h2 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C] mb-6 font-normal">
                About the Astittva Real Estate Blog &amp; Insights Journal
              </h2>

              <div className="space-y-6 text-[#5F5F5F] text-sm sm:text-base leading-relaxed font-light">
                <p>
                  The Astittva Real Estate Blog delivers independent, data-driven market intelligence for homebuyers, NRI investors, and corporate professionals in Kolkata. Real estate is one of the most significant financial commitments an individual or family undertakes; our editorial mission is to demystify complex transaction mechanics, legal title verifications, and micro-market pricing trends with uncompromised clarity.
                </p>

                <div>
                  <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2 font-normal text-[#B87333]">
                    Key Editorial Themes &amp; Market Intelligence
                  </h3>
                  <p>
                    Our research essays focus on four fundamental pillars: <strong>Micro-Market Pricing &amp; Appreciation</strong> (tracking price per sq.ft. movements across New Town Action Areas, Rajarhat, EM Bypass, and South Kolkata), <strong>WBRERA &amp; Legal Diligence</strong> (deed examination checklists, sanctioned plan verifications, and promoter track records), <strong>Financial Planning</strong> (home loan interest rate trends, West Bengal stamp duty calculations, rental yields, and capital gains exemptions), and <strong>Urban Infrastructure</strong> (metro corridor expansions including the Orange Line, Green Line, and airport linkages).
                  </p>
                </div>

                <div>
                  <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2 font-normal text-[#B87333]">
                    Grounded in On-the-Ground Advisory Experience
                  </h3>
                  <p>
                    Unlike generic property portals, every article published in our real estate blog is authored and reviewed in collaboration with Astittva Marketing&apos;s active property advisory desk. We draw on actual transaction histories, developer negotiations, and on-site physical evaluations to ensure our readers receive actionable, authentic insights.
                  </p>
                </div>
              </div>

              <div className="mt-10 p-6 bg-[#F5F1EC] rounded-xl border border-[#E8DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[#1C1C1C] font-medium text-sm">Have a Question About a Kolkata Property?</div>
                  <div className="text-[#5F5F5F] text-xs mt-0.5">Speak with our editorial research team or book an advisor consultation.</div>
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/contact" className="btn-primary text-xs py-2 px-5">Contact Advisory</Link>
                  <Link to="/properties" className="btn-outline text-xs py-2 px-4">Browse Properties</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>`;

  content = content.replace(/\s*<\/div>\r?\n\s*<\/section>\r?\n\s*<\/div>\r?\n\s*\);\r?\n}/, `${guideSection}\n    </div>\n  );\n}`);

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated BlogsListPage in " + filePath);
}

updateBlogsListPage("frontend/src/pages/BlogsListPage.jsx");
updateBlogsListPage("web/src/pages/BlogsListPage.jsx");

