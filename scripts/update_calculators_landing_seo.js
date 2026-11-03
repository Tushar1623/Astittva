const fs = require("fs");

function updateCalculatorsPage(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // 1. Update H1 and subtext
  const oldH1 = `<h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1C1C] max-w-3xl mx-auto leading-tight">
          Property Calculators
        </h1>

        <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl text-[#5F5F5F] max-w-2xl mx-auto font-sans leading-relaxed">
          Make smarter property decisions with simple, practical calculators.
        </p>`;

  const newH1 = `<h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1C1C] max-w-3xl mx-auto leading-tight">
          Real Estate &amp; Property Calculators
        </h1>

        <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl text-[#5F5F5F] max-w-3xl mx-auto font-sans leading-relaxed">
          Make smarter investment decisions with Astittva Marketing&apos;s financial property calculators. Estimate home loan EMIs, West Bengal stamp duty, rental yields, affordability, and capital gains tax tailored for Kolkata real estate buyers.
        </p>`;

  content = content.replace(oldH1, newH1);

  // 2. Add Financial Planning Advisory section right before `{/* Bottom CTA Banner */}`
  const guideSection = `
      {/* ===================== FINANCIAL PLANNING ADVISORY GUIDE ===================== */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-16 mb-16">
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E8DED2]">
          <div className="text-[10px] tracking-[0.35em] uppercase text-[#B87333] font-semibold mb-3">
            Real Estate Financial Planning Guide
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1C1C] mb-5 font-normal">
            Financial Planning for Your Kolkata Property Acquisition
          </h2>

          <div className="space-y-5 text-[#5F5F5F] text-sm sm:text-base leading-relaxed font-light">
            <p>
              Evaluating a real estate purchase requires precise financial modeling beyond the quoted base price. Whether buying a luxury apartment on EM Bypass, a smart home in New Town, or a residential plot in Rajarhat, our interactive property calculators provide transparent projections for acquisition costs, borrowing capacity, and long-term investment yields.
            </p>

            <div>
              <h3 className="font-serif text-lg text-[#1C1C1C] mb-2 font-normal text-[#B87333]">
                Understanding West Bengal Stamp Duty &amp; Registration Costs
              </h3>
              <p>
                In West Bengal, statutory property registration charges comprise stamp duty and registration fees. For properties valued up to ₹1 Crore in municipal corporations (such as KMC), stamp duty is currently 5%, while properties above ₹1 Crore incur 6%. Outside municipal limits, rates are typically 1% lower. An additional 1% is payable as the state registration fee. Use our dedicated <strong>Stamp Duty Calculator</strong> to calculate exact registry fees before booking.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-lg text-[#1C1C1C] mb-2 font-normal text-[#B87333]">
                Balancing Home Loan EMIs with Debt-to-Income (DTI)
              </h3>
              <p>
                Financial prudence suggests keeping total monthly debt obligations (including your proposed home loan EMI) within 35% to 40% of net monthly household income. Our <strong>Home Loan EMI Calculator</strong> and <strong>Affordability Calculator</strong> allow you to simulate different tenure and interest rate scenarios to identify your optimal budget envelope without straining long-term savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}`;

  content = content.replace(/\{\/\* Bottom CTA Banner \*\/\}/, guideSection);

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated CalculatorsLandingPage in " + filePath);
}

updateCalculatorsPage("frontend/src/pages/calculators/CalculatorsLandingPage.jsx");
updateCalculatorsPage("web/src/pages/calculators/CalculatorsLandingPage.jsx");

