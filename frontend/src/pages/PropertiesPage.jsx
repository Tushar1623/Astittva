import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Filter, X, SlidersHorizontal } from "lucide-react";
import api, { fileUrl } from "@/lib/api";
import Seo from "@/components/Seo";

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
        className="w-full bg-charcoal-2/60 border border-copper/15 hover:border-copper/35 focus:border-copper/60 focus:outline-none text-ivory text-sm px-3.5 py-2.5 tracking-wide font-light transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2210%22%20height=%226%22%20viewBox=%220%200%2010%206%22><path%20d=%22M1%201l4%204%204-4%22%20stroke=%22%23C68642%22%20fill=%22none%22%20stroke-width=%221.5%22/></svg>')] bg-no-repeat bg-[right_0.85rem_center] pr-9"
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
  "/images/luxe/luxury_villa.jpg",
  "/images/luxe/property_tower.jpg",
  "/images/luxe/property_villa_garden.jpg",
  "/images/luxe/property_heritage_estate.jpg",
];

function pickFallback(id) {
  const key = String(id || "");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return FALLBACK_IMAGES[h % FALLBACK_IMAGES.length];
}

export default function PropertiesPage() {
  const [params, setParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
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
    api.get("/properties", { params: q })
      .then(({ data }) => setProperties(data))
      .catch(() => setProperties([]))
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

  return (
    <div data-testid="properties-page" className="relative pt-28 pb-16 sm:pt-32 sm:pb-24 text-ivory">
      <Seo
        title="Luxury Properties for Sale in Kolkata · New Town · Rajarhat"
        description="Browse Astittva Marketing's curated portfolio of luxury residential, commercial and investment properties across New Town, Rajarhat, Salt Lake, Alipore and other premium Kolkata destinations. Filter by location, builder, budget and category."
        path="/properties"
        keywords="properties for sale Kolkata, New Town flats, Rajarhat apartments, luxury homes Kolkata, PS Group Merlin Siddha Shrachi properties"
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="mb-12 sm:mb-14"
        >
          <div className="overline mb-4">Curated Portfolio</div>
          <h1 className="font-display font-light text-3xl sm:text-5xl lg:text-6xl text-ivory tracking-tight">
            Properties
          </h1>
          <p className="text-ivory/55 font-light mt-4 max-w-2xl text-sm sm:text-base">
            Every listing is verified, RERA-compliant where applicable, and curated by our advisory desk.
            Refine by micro-market, budget or builder to surface the right opportunity.
          </p>
          <div className="copper-divider mt-8" />
        </motion.div>

        {/* Filters — desktop */}
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
        </div>

        {/* Filters — mobile (collapsible) */}
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
        </div>

        {/* Active filter chips + count */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8" data-testid="filter-summary">
          <span className="text-[10px] tracking-[0.35em] uppercase text-ivory/55">
            {loading ? "Loading…" : <>Showing <span className="text-copper">{properties.length}</span> {properties.length === 1 ? "Property" : "Properties"}</>}
          </span>
          {activeFilters.length > 0 && <span className="h-px w-6 bg-copper/30" />}
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
                className="group inline-flex items-center gap-1.5 bg-copper/10 hover:bg-copper/20 border border-copper/25 text-copper text-[10px] tracking-[0.25em] uppercase px-2.5 py-1.5 transition-colors"
              >
                {f.v}
                <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="properties-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="luxury-card animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="aspect-[4/3] bg-white/[0.04]" />
                <div className="p-7 space-y-4">
                  <div className="h-3 w-24 bg-white/[0.05]" />
                  <div className="h-5 w-4/5 bg-white/[0.06]" />
                  <div className="h-3 w-3/4 bg-white/[0.04]" />
                  <div className="h-3 w-2/3 bg-white/[0.03]" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            data-testid="empty-state"
            className="relative border border-copper/15 bg-charcoal-2/30 py-16 sm:py-20 px-6 sm:px-10 text-center overflow-hidden"
          >
            <div
              className="absolute inset-0 -z-0 opacity-40"
              style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(90,10,20,0.35) 0%, transparent 70%)" }}
            />
            <div className="relative z-10">
              <div className="text-[10px] tracking-[0.45em] uppercase text-copper mb-5">No Direct Matches</div>
              <h3 className="font-display text-2xl sm:text-3xl text-ivory mb-4 font-light">
                Our advisors curate beyond the listing.
              </h3>
              <p className="text-ivory/55 font-light max-w-md mx-auto text-sm sm:text-base leading-relaxed mb-8">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {properties.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.4) }}
                className="luxury-card group"
                data-testid={`property-card-${p.id}`}
              >
                <Link to={`/properties/${p.id}`}>
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      loading="lazy"
                      src={p.images?.[0] ? fileUrl(p.images[0]) : pickFallback(p.id)}
                      alt={p.project_name}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                    />
                    {p.is_featured && (
                      <div className="absolute top-4 left-4 bg-copper text-charcoal text-[10px] tracking-[0.3em] uppercase px-3 py-1.5">
                        Featured
                      </div>
                    )}
                    {p.availability && p.availability !== "Under Construction" && (
                      <div className="absolute top-4 right-4 bg-charcoal/85 backdrop-blur-sm border border-copper/40 text-copper text-[9px] tracking-[0.3em] uppercase px-2.5 py-1.5">
                        {p.availability}
                      </div>
                    )}
                  </div>
                  <div className="p-7">
                    <div className="flex items-center gap-2 text-copper text-[10px] tracking-[0.3em] uppercase mb-3">
                      <MapPin className="w-3 h-3" /> {p.location || p.city}
                    </div>
                    <h3 className="font-display text-xl text-ivory mb-2 font-normal group-hover:text-copper transition">{p.project_name}</h3>
                    {p.builder && <p className="text-ivory/50 text-xs uppercase tracking-wider mb-3">{p.builder}</p>}
                    <p className="text-ivory/60 text-sm font-light line-clamp-2">{p.description}</p>
                    <div className="mt-5 flex items-center justify-between pt-5 border-t border-copper/10">
                      <span className="text-rose-gold font-display text-sm">{p.price_label || "Price on request"}</span>
                      <span className="text-copper text-xs tracking-[0.25em] uppercase flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
