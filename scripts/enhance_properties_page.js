const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/pages/PropertiesPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Add PropertyCard import
if (!content.includes('import PropertyCard')) {
  content = content.replace(
    'import SafeImage from "@/components/SafeImage";',
    'import SafeImage from "@/components/SafeImage";\nimport PropertyCard from "@/components/PropertyCard";'
  );
}

// 2. FilterSelect upgrade
const oldFilterSelectRegex = /function FilterSelect\(\{[\s\S]*?\}\n\}/;
const newFilterSelect = `function FilterSelect({ label, value, onChange, options, allLabel, testId }) {
  return (
    <div className="flex-1 min-w-[150px]">
      <label className="block text-[10px] tracking-[0.25em] uppercase text-[#737373] font-medium mb-2">{label}</label>
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-[#E8DED2] hover:border-[#D4A359] focus:border-[#D4A359] focus:outline-none focus:ring-2 focus:ring-[#D4A359]/15 text-[#1C1C1C] text-sm px-3.5 py-2.5 rounded-lg tracking-normal font-normal transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2210%22%20height=%226%22%20viewBox=%220%200%2010%206%22><path%20d=%22M1%201l4%204%204-4%22%20stroke=%22%23B87333%22%20fill=%22none%22%20stroke-width=%221.5%22/></svg>')] bg-no-repeat bg-[right_0.85rem_center] pr-9 shadow-2xs"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.id;
          const l = typeof o === "string" ? o : o.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </div>
  );
}`;
content = content.replace(oldFilterSelectRegex, newFilterSelect);

// 3. Desktop Filters Container
const oldDesktopFilters = `{/* Filters — desktop */}
        <div className="hidden md:block mb-6">
          <div className="border border-copper/15 bg-charcoal-2/40 backdrop-blur-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <Filter className="w-4 h-4 text-copper" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-copper">Refine</span>
              <span className="h-px flex-1 bg-copper/15" />
              {activeFilters.length > 0 && (
                <button
                  data-testid="clear-filters-btn"
                  onClick={clearAll}
                  className="text-[10px] tracking-[0.3em] uppercase text-rose-gold hover:text-copper transition-colors flex items-center gap-1.5"
                >
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>
            {filterRow}
          </div>
        </div>`;

const newDesktopFilters = `{/* Filters — desktop */}
        <div className="hidden md:block mb-8">
          <div className="bg-white rounded-2xl border border-[#E8DED2] p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <SlidersHorizontal className="w-4 h-4 text-[#B87333]" />
              <span className="text-[10.5px] tracking-[0.3em] uppercase text-[#1C1C1C] font-semibold">Refine Collection</span>
              <span className="h-px flex-1 bg-[#E8DED2]" />
              {activeFilters.length > 0 && (
                <button
                  data-testid="clear-filters-btn"
                  onClick={clearAll}
                  className="text-[10px] tracking-[0.25em] uppercase text-[#B87333] hover:text-[#5E1F28] transition-colors flex items-center gap-1.5 font-semibold"
                >
                  <X className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>
            {filterRow}
          </div>
        </div>`;
content = content.replace(oldDesktopFilters, newDesktopFilters);

// 4. Mobile Filters Container
const oldMobileFilters = `{/* Filters — mobile (collapsible) */}
        <div className="md:hidden mb-6">
          <button
            data-testid="mobile-filters-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            className="w-full flex items-center justify-between border border-copper/20 bg-charcoal-2/40 px-4 py-3.5 text-[10px] tracking-[0.35em] uppercase text-ivory/85"
          >
            <span className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-copper" /> Filters {activeFilters.length > 0 && <span className="text-copper ml-1">({activeFilters.length})</span>}</span>
            <span className="text-copper text-xs">{mobileOpen ? "−" : "+"}</span>
          </button>
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="border border-t-0 border-copper/15 bg-charcoal-2/40 p-4 space-y-4">
                  {filterRow}
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="w-full text-[10px] tracking-[0.3em] uppercase text-rose-gold border border-rose-gold/30 py-2.5 hover:bg-rose-gold/5 transition"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>`;

const newMobileFilters = `{/* Filters — mobile (collapsible) */}
        <div className="md:hidden mb-6">
          <button
            data-testid="mobile-filters-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            className="w-full flex items-center justify-between bg-white border border-[#E8DED2] rounded-xl px-5 py-3.5 text-[11px] tracking-[0.25em] uppercase text-[#1C1C1C] font-semibold shadow-xs"
          >
            <span className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-[#B87333]" /> Filters {activeFilters.length > 0 && <span className="text-[#B87333] ml-1">({activeFilters.length})</span>}</span>
            <span className="text-[#B87333] text-sm">{mobileOpen ? "−" : "+"}</span>
          </button>
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="bg-white border border-t-0 border-[#E8DED2] rounded-b-xl p-5 space-y-4 shadow-xs">
                  {filterRow}
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="w-full text-[10px] tracking-[0.25em] uppercase text-[#B87333] border border-[#B87333]/30 py-2.5 rounded-lg hover:bg-[#B87333]/5 font-semibold transition"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>`;
content = content.replace(oldMobileFilters, newMobileFilters);

// 5. Active filter chips
const oldChips = `<div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8" data-testid="filter-summary">
          <span className="text-[10px] tracking-[0.35em] uppercase text-ivory/55">
            {loading ? "Loading…" : <>Showing <span className="text-copper">{properties.length}</span> {properties.length === 1 ? "Property" : "Properties"}</>}
          </span>
          {activeFilters.length > 0 && <span className="h-px w-6 bg-copper/30" />}
          <AnimatePresence>
            {activeFilters.map((f) => (
              <motion.button
                key={\`\${f.k}-\${f.v}\`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setParam(f.k, "")}
                data-testid={\`chip-\${f.k}\`}
                className="group inline-flex items-center gap-1.5 bg-copper/10 hover:bg-copper/20 border border-copper/25 text-copper text-[10px] tracking-[0.25em] uppercase px-2.5 py-1.5 transition-colors"
              >
                {f.v}
                <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>`;

const newChips = `<div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8" data-testid="filter-summary">
          <span className="text-[10.5px] tracking-[0.3em] uppercase text-[#737373] font-medium">
            {loading ? "Loading…" : <>Showing <span className="text-[#B87333] font-semibold">{properties.length}</span> {properties.length === 1 ? "Property" : "Properties"}</>}
          </span>
          {activeFilters.length > 0 && <span className="h-px w-6 bg-[#E8DED2]" />}
          <AnimatePresence>
            {activeFilters.map((f) => (
              <motion.button
                key={\`\${f.k}-\${f.v}\`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setParam(f.k, "")}
                data-testid={\`chip-\${f.k}\`}
                className="group inline-flex items-center gap-1.5 bg-white hover:bg-[#FAF8F5] border border-[#E8DED2] hover:border-[#D4A359] text-[#1C1C1C] text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full transition-colors shadow-2xs font-medium"
              >
                <span>{f.v}</span>
                <X className="w-3 h-3 text-[#737373] group-hover:text-[#B87333]" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>`;
content = content.replace(oldChips, newChips);

// 6. Property cards list: replace with PropertyCard component
const oldGridRegex = /\{loading \? \([\s\S]*?\{\/\* ===================== BUYER ADVISORY/;
const newGrid = `{loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" data-testid="properties-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E8DED2] overflow-hidden animate-pulse shadow-xs" style={{ animationDelay: \`\${i * 80}ms\` }}>
                <div className="aspect-[4/3] bg-[#FAF8F5]" />
                <div className="p-7 space-y-4">
                  <div className="h-3 w-24 bg-[#E8DED2]/50 rounded" />
                  <div className="h-5 w-4/5 bg-[#E8DED2]/60 rounded" />
                  <div className="h-3 w-3/4 bg-[#E8DED2]/40 rounded" />
                  <div className="h-3 w-2/3 bg-[#E8DED2]/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            data-testid="empty-state"
            className="relative bg-white rounded-2xl border border-[#E8DED2] py-16 sm:py-20 px-6 sm:px-10 text-center shadow-xs overflow-hidden"
          >
            <div className="relative z-10">
              <div className="text-[10px] tracking-[0.45em] uppercase text-[#B87333] font-semibold mb-4">No Direct Matches</div>
              <h3 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C] mb-4 font-normal">
                Our advisors curate beyond the listing.
              </h3>
              <p className="text-[#5F5F5F] font-light max-w-md mx-auto text-sm sm:text-base leading-relaxed mb-8">
                Tell us what you&apos;re seeking — micro-market, configuration, intended use — and we&apos;ll surface
                off-market and pre-launch opportunities aligned to your brief.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button onClick={clearAll} className="btn-outline" data-testid="empty-clear-btn">
                  Reset Filters
                </button>
                <Link to="/contact" className="btn-primary" data-testid="empty-advisor-btn">
                  Speak To Advisor
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeFilters.map((f) => \`\${f.k}:\${f.v}\`).join("|") || "all"}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} variant="grid" />
            ))}
          </motion.div>
        )}
        {/* ===================== BUYER ADVISORY`;
content = content.replace(oldGridRegex, newGrid);

// 7. Bottom Guide
const oldGuideRegex = /\{\/\* ===================== BUYER ADVISORY & LOCALITY GUIDE ===================== \*\/\}[\s\S]*?<\/section>/;
const newGuide = `{/* ===================== BUYER ADVISORY & LOCALITY GUIDE ===================== */}
        <section className="mt-20 pt-16 border-t border-[#E8DED2]">
          <div className="max-w-4xl mx-auto">
            <div className="text-[10px] tracking-[0.35em] uppercase text-[#B87333] font-semibold mb-3">
              Kolkata Real Estate Intelligence
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C] mb-6 font-normal">
              Navigating Properties in Kolkata: Key Corridors &amp; Buying Guide
            </h2>

            <div className="space-y-6 text-[#4A4A4A] text-sm sm:text-base leading-relaxed font-light">
              <p>
                Kolkata&apos;s real estate landscape offers a diverse spectrum of residential options, combining long-term capital preservation with steady rental yields. For discerning buyers and NRI investors evaluating properties in Kolkata, understanding micro-market dynamics is essential to making an informed acquisition.
              </p>

              <div>
                <h3 className="font-serif-display text-lg text-[#B87333] mb-2 font-medium">
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
                <h3 className="font-serif-display text-lg text-[#B87333] mb-2 font-medium">
                  WBRERA Due Diligence &amp; Advisory Process
                </h3>
                <p>
                  Every property represented by Astittva Marketing carries verified statutory compliance under the West Bengal Real Estate Regulatory Authority (WBRERA). Our advisory desk scrutinises sanctioned building plans, carpet area disclosures, project escrow accounts, and completion timelines. We guide clients through every stage — from comparative market evaluation and private site inspections to home loan coordination and legal deed registration.
                </p>
              </div>
            </div>

            <div className="mt-10 p-7 bg-white rounded-xl border border-[#E8DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
              <div>
                <div className="text-[#1C1C1C] font-serif-display text-lg font-medium">Require Personalised Property Advisory?</div>
                <div className="text-[#737373] text-xs mt-1">Consult with our senior Kolkata property advisors for tailored shortlists.</div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/contact" className="btn-primary text-xs py-2.5 px-6">Book Consultation</Link>
                <Link to="/calculators/home-loan-emi" className="btn-outline text-xs py-2.5 px-5">EMI Calculator</Link>
              </div>
            </div>
          </div>
        </section>`;
content = content.replace(oldGuideRegex, newGuide);

fs.writeFileSync(filePath, content, 'utf8');
console.log('PropertiesPage successfully enhanced!');

