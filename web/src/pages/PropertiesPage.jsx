import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Filter, X, SlidersHorizontal } from "lucide-react";
import api, { isGoogleDriveImage, driveImageUrl, driveDirectFallbackUrl, fileUrl } from "@/lib/api";
import Seo from "@/components/Seo";
import { buildBreadcrumbSchema } from "@/lib/seoConfig";
import SafeImage from "@/components/SafeImage";
import PropertyCard from "@/components/PropertyCard";
import seedProperties from "@/data/seedProperties.json";

// ---------- Filter option catalogues (per Astittva brand brief) ----------
const LOCATIONS = [
  "New Town", "Rajarhat", "Salt Lake", "Alipore", "EM Bypass",
  "Ballygunge", "Park Street", "Action Area I", "Action Area II", "Action Area III",
];

const TYPES = [
  "Residential", "Commercial", "Retail", "Office Space",
  "Villa", "Apartment", "Penthouse", "Plot",
];

const BUDGETS = [
  { id: "u1", label: "Under ₹1 Cr",  min: 0,             max: 1_00_00_000 },
  { id: "1-2", label: "₹1–2 Cr",     min: 1_00_00_000,   max: 2_00_00_000 },
  { id: "2-3", label: "₹2–3 Cr",     min: 2_00_00_000,   max: 3_00_00_000 },
  { id: "3-4", label: "₹3–4 Cr",     min: 3_00_00_000,   max: 4_00_00_000 },
  { id: "4-5", label: "₹4–5 Cr",     min: 4_00_00_000,   max: 5_00_00_000 },
  { id: "5-10", label: "₹5–10 Cr",   min: 5_00_00_000,   max: 10_00_00_000 },
  { id: "10+", label: "₹10 Cr+",     min: 10_00_00_000,  max: null },
];

const BUILDERS = [
  "PS Group", "Merlin", "Siddha", "Godrej",
  "DLF", "Lodha", "Ambuja Neotia", "Mani Group", "Shrachi",
];

const AVAILABILITIES = ["Ready To Move", "Under Construction", "New Launch", "Sold Out"];

const CATEGORIES = [
  "Luxury", "Ultra Luxury", "Investment", "Commercial",
  "Waterfront", "Golf Facing", "Smart Home",
];

// ---------- Premium select dropdown ----------
function FilterSelect({ label, value, onChange, options, allLabel, testId }) {
  return (
    <div className="flex-1 min-w-[150px]">
      <label className="block text-[9px] tracking-[0.35em] uppercase text-copper/70 mb-2">{label}</label>
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-[#E8DED2] rounded-lg hover:border-[#B87333]/50 focus:border-[#B87333] focus:outline-none text-[#1C1C1C] text-sm px-3.5 py-2.5 tracking-wide font-normal transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2210%22%20height=%226%22%20viewBox=%220%200%2010%206%22><path%20d=%22M1%201l4%204%204-4%22%20stroke=%22%23C68642%22%20fill=%22none%22%20stroke-width=%221.5%22/></svg>')] bg-no-repeat bg-[right_0.85rem_center] pr-9"
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
}

// Distinct luxury fallback images so the grid never repeats when properties have no uploads.
const FALLBACK_IMAGES = [
  "/images/luxe/luxury_villa.webp",
  "/images/luxe/property_tower.webp",
  "/images/luxe/property_villa_garden.webp",
  "/images/luxe/property_heritage_estate.webp",
];

function pickFallback(id) {
  const key = String(id || "");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return FALLBACK_IMAGES[h % FALLBACK_IMAGES.length];
}

export default function PropertiesPage() {
  const [params, setParams] = useSearchParams();
  const [properties, setProperties] = useState(() => {
    try {
      const cached = localStorage.getItem("astitva_cache_properties");
      if (cached) return JSON.parse(cached);
    } catch {}
    return seedProperties || [];
  });
  const [loading, setLoading] = useState(() => properties.length === 0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Current filter values from URL — single source of truth, shareable links work
  const location = params.get("location") || "";
  const property_type = params.get("type") || "";
  const budget = params.get("budget") || "";
  const builder = params.get("builder") || "";
  const availability = params.get("availability") || "";
  const category = params.get("category") || "";

  const activeFilters = useMemo(() => {
    const arr = [];
    if (location) arr.push({ k: "location", v: location });
    if (property_type) arr.push({ k: "type", v: property_type });
    if (budget) {
      const b = BUDGETS.find((x) => x.id === budget);
      arr.push({ k: "budget", v: b?.label || budget });
    }
    if (builder) arr.push({ k: "builder", v: builder });
    if (availability) arr.push({ k: "availability", v: availability });
    if (category) arr.push({ k: "category", v: category });
    return arr;
  }, [location, property_type, budget, builder, availability, category]);

  useEffect(() => {
    const q = {};
    if (location) q.location = location;
    if (property_type) q.property_type = property_type;
    if (category) q.category = category;
    if (builder) q.builder = builder;
    if (availability) q.availability = availability;
    if (budget) {
      const b = BUDGETS.find((x) => x.id === budget);
      if (b) {
        if (b.min != null) q.min_price = b.min;
        if (b.max != null) q.max_price = b.max;
      }
    }
    const hasFilter = Object.keys(q).length > 0;
    if (hasFilter) setLoading(true);

    api.get("/properties", { params: q })
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setProperties(data);
          if (!hasFilter && data.length > 0) {
            try {
              localStorage.setItem("astitva_cache_properties", JSON.stringify(data));
            } catch {}
          }
        }
      })
      .catch(() => {
        if (hasFilter) setProperties([]);
      })
      .finally(() => setLoading(false));
  }, [location, property_type, budget, builder, availability, category]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };
  const clearAll = () => setParams({}, { replace: true });

  const filterRow = (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <FilterSelect testId="filter-location" label="Location" value={location} onChange={(v) => setParam("location", v)} options={LOCATIONS} allLabel="All Locations" />
      <FilterSelect testId="filter-type" label="Property Type" value={property_type} onChange={(v) => setParam("type", v)} options={TYPES} allLabel="All Types" />
      <FilterSelect testId="filter-budget" label="Budget" value={budget} onChange={(v) => setParam("budget", v)} options={BUDGETS} allLabel="Any Budget" />
      <FilterSelect testId="filter-builder" label="Builder" value={builder} onChange={(v) => setParam("builder", v)} options={BUILDERS} allLabel="All Builders" />
      <FilterSelect testId="filter-availability" label="Status" value={availability} onChange={(v) => setParam("availability", v)} options={AVAILABILITIES} allLabel="All Stages" />
      <FilterSelect testId="filter-category" label="Category" value={category} onChange={(v) => setParam("category", v)} options={CATEGORIES} allLabel="All Categories" />
    </div>
  );

  const pageTitle = location
    ? `Properties in ${location} Kolkata | Astittva Marketing`
    : "Properties in Kolkata | Flats & Homes | Astittva Marketing";

  const pageDescription = location
    ? `Explore verified residential and commercial properties in ${location}, Kolkata with Astittva Marketing. Filter by builder, budget, and possession stage.`
    : "Browse curated residential properties, luxury flats, and apartments in Kolkata, New Town, and Rajarhat. Filter by budget, builder, and possession stage.";

  const pageH1 = location
    ? `Properties in ${location}, Kolkata`
    : "Properties in Kolkata";

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
  ];
  if (location) {
    breadcrumbs.push({ name: location, path: `/properties?location=${encodeURIComponent(location)}` });
  }

  return (
    <div data-testid="properties-page" className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 text-[#1C1C1C]">
      <Seo
        title={pageTitle}
        description={pageDescription}
        path="/properties"
        schema={buildBreadcrumbSchema(breadcrumbs)}
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mb-12 sm:mb-14"
        >
          <div className="overline mb-4">Curated Portfolio</div>
          <h1 className="font-serif-display font-medium text-3xl sm:text-5xl lg:text-6xl text-[#1C1C1C] tracking-tight">
            {pageH1}
          </h1>
          <p className="text-[#5F5F5F] font-light mt-4 max-w-2xl text-sm sm:text-base">
            Every listing is verified, RERA-compliant where applicable, and curated by our advisory desk.
            Refine by micro-market, budget or builder to surface the right opportunity.
          </p>
          <div className="copper-divider mt-8" />
        </motion.div>

        {/* Filters — desktop */}
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
        </div>

        {/* Filters — mobile (collapsible) */}
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
        </div>

        {/* Active filter chips + count */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8" data-testid="filter-summary">
          <span className="text-[10.5px] tracking-[0.3em] uppercase text-[#737373] font-medium">
            {loading ? "Loading…" : <>Showing <span className="text-[#B87333] font-semibold">{properties.length}</span> {properties.length === 1 ? "Property" : "Properties"}</>}
          </span>
          {activeFilters.length > 0 && <span className="h-px w-6 bg-[#E8DED2]" />}
          <AnimatePresence>
            {activeFilters.map((f) => (
              <motion.button
                key={`${f.k}-${f.v}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setParam(f.k, "")}
                data-testid={`chip-${f.k}`}
                className="group inline-flex items-center gap-1.5 bg-white hover:bg-[#FAF8F5] border border-[#E8DED2] hover:border-[#D4A359] text-[#1C1C1C] text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full transition-colors shadow-2xs font-medium"
              >
                <span>{f.v}</span>
                <X className="w-3 h-3 text-[#737373] group-hover:text-[#B87333]" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" data-testid="properties-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E8DED2] overflow-hidden animate-pulse shadow-xs" style={{ animationDelay: `${i * 80}ms` }}>
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
            key={activeFilters.map((f) => `${f.k}:${f.v}`).join("|") || "all"}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} variant="grid" />
            ))}
          </motion.div>
        )}
        {/* ===================== BUYER ADVISORY & LOCALITY GUIDE ===================== */}
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
        </section>
      </div>
    </div>
  );
}
