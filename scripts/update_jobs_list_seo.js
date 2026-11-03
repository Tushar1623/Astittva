const fs = require("fs");

function updateJobsListPage(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Expand the intro paragraph
  const oldIntro = `<p className="text-ivory/70 text-base sm:text-lg leading-relaxed mb-6 font-sans">
            We are curating Kolkata’s most trusted real estate advisory team. Explore published openings across Private Client Advisory, Digital Growth, and Strategic Investments in New Town &amp; Salt Lake.
          </p>`;

  const newIntro = `<p className="text-ivory/80 text-base sm:text-lg leading-relaxed mb-6 font-sans max-w-3xl mx-auto">
            Astittva Marketing is curating Kolkata’s foremost luxury real estate advisory team. Explore career opportunities and job openings across Private Client Advisory, Developer Representation, Market Intelligence, and Investment Advisory in New Town, Rajarhat, and South Kolkata.
          </p>`;

  content = content.replace(oldIntro, newIntro);

  // Add the career guide section right before `{/* General Talent Banner */}`
  const guideSection = `
      {/* ===================== CAREER OVERVIEW & ADVISORY CULTURE ===================== */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-20 pt-16 border-t border-copper/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-[10px] tracking-[0.35em] uppercase text-copper font-semibold mb-3">
            Real Estate Careers in Kolkata
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-ivory mb-6 font-normal">
            Building a Career in Luxury Real Estate Advisory at Astittva
          </h2>

          <div className="space-y-6 text-ivory/70 text-sm sm:text-base leading-relaxed font-light">
            <p>
              At Astittva Marketing, we are redefining property consulting across Eastern India. Our advisory practice operates on principles of institutional integrity, fiduciary responsibility, and discreet client management. Unlike traditional brokerage firms, our advisors build lifelong relationships with high-net-worth individuals, NRI investors, and leading corporate leadership across Kolkata, New Town, and Rajarhat.
            </p>

            <div>
              <h3 className="font-display text-lg text-ivory mb-2 font-normal text-copper">
                Core Practice Areas &amp; Specialisations
              </h3>
              <p>
                Our team spans distinct functional desks: <strong>Private Client Advisory</strong> (representing buyers and investors for ultra-luxury residences and penthouses), <strong>Developer Representation</strong> (partnering with Kolkata&apos;s premier builders for mandate marketing and sales strategy), <strong>Market Research &amp; Intelligence</strong> (tracking macro infrastructure, metro expansions, and price per sq.ft. appreciation), and <strong>Secondary Market Advisory</strong> (curating verified resale properties with legal title scrutiny).
              </p>
            </div>

            <div>
              <h3 className="font-display text-lg text-ivory mb-2 font-normal text-copper">
                Professional Growth, Mentorship &amp; Culture
              </h3>
              <p>
                We provide our advisory consultants with institutional-grade technology, verified inventory data, and continuous mentorship under senior real estate leaders. Team members enjoy structured career progression, competitive base compensation, transparent performance-linked commissions, and direct exposure to Kolkata&apos;s most prestigious architectural projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* General Talent Banner */}`;

  content = content.replace(/\{\/\* General Talent Banner \*\/\}/, guideSection);

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated JobsListPage in " + filePath);
}

updateJobsListPage("frontend/src/pages/careers/JobsListPage.jsx");
updateJobsListPage("web/src/pages/careers/JobsListPage.jsx");

