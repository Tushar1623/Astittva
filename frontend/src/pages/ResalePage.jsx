import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Filter,
  X,
  SlidersHorizontal,
  Star,
  Search,
  RotateCcw,
} from "lucide-react";
import Seo from "@/components/Seo";
import { buildBreadcrumbSchema } from "@/lib/seoConfig";
import api, { formatApiErrorDetail, isGoogleDriveImage, driveImageUrl } from "@/lib/api";
import { toast } from "sonner";
import { PHONE_DISPLAY, EMAIL } from "@/lib/site";

// ---------- Filter catalogues ----------
const LOCATIONS = [
  "New Town",
  "Rajarhat",
  "Salt Lake",
  "Action Area I",
  "Action Area II",
  "Action Area III",
  "EM Bypass",
  "Alipore",
  "Ballygunge",
  "Park Street",
];

const PROPERTY_TYPES = [
  "Apartment",
  "Flat",
  "Villa",
  "Independent House",
  "Builder Floor",
  "Plot",
  "Commercial Property",
  "Office",
  "Shop",
];

const BEDROOMS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];

const BUDGETS = [
  { id: "all", label: "Any Budget", min: null, max: null },
  { id: "u60", label: "Under ₹60 Lakh", min: 0, max: 6000000 },
  { id: "60-100", label: "₹60 Lakh – ₹1 Cr", min: 6000000, max: 10000000 },
  { id: "1-2cr", label: "₹1 Cr – ₹2 Cr", min: 10000000, max: 20000000 },
  { id: "2-3cr", label: "₹2 Cr – ₹3 Cr", min: 20000000, max: 30000000 },
  { id: "3cr-plus", label: "₹3 Cr+", min: 30000000, max: null },
];

const FURNISHING_OPTIONS = ["Any Furnishing", "Unfurnished", "Semi-Furnished", "Fully Furnished"];

function formatPriceINR(val) {
  if (!val || isNaN(val)) return "Price on Request";
  const num = Number(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} Lakh`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function ResalePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "");
  const [bedroom, setBedroom] = useState(searchParams.get("bedrooms") || "");
  const [budgetIdx, setBudgetIdx] = useState(searchParams.get("budget") || "all");
  const [furnishing, setFurnishing] = useState(searchParams.get("furnishing") || "Any Furnishing");
  const [sort, setSort] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Data States (strictly from resale_properties)
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Seller Consultation Form State
  const [sellerForm, setSellerForm] = useState({
    name: "",
    phone: "",
    email: "",
    propertyTitle: "",
    locality: "New Town",
    expectedPrice: "",
    message: "",
  });
  const [submittingSeller, setSubmittingSeller] = useState(false);
  const [submittedSeller, setSubmittedSeller] = useState(false);

  const fetchResaleListings = () => {
    setLoading(true);

    const selectedBudget = BUDGETS.find((b) => b.id === budgetIdx);
    const params = {};
    if (location.trim()) params.location = location.trim();
    if (propertyType.trim()) params.propertyType = propertyType.trim();
    if (bedroom.trim()) params.bedrooms = bedroom.replace(/[^0-9]/g, "");
    if (furnishing && furnishing !== "Any Furnishing") params.furnishingStatus = furnishing;
    if (selectedBudget?.min != null) params.minPrice = selectedBudget.min;
    if (selectedBudget?.max != null) params.maxPrice = selectedBudget.max;
    if (sort) params.sort = sort;

    api.get("/resale", { params })
      .then(({ data }) => {
        setProperties(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch resale properties:", err);
        toast.error("Failed to load resale properties");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResaleListings();
  }, [location, propertyType, bedroom, budgetIdx, furnishing, sort]);

  const handleResetFilters = () => {
    setLocation("");
    setPropertyType("");
    setBedroom("");
    setBudgetIdx("all");
    setFurnishing("Any Furnishing");
    setSort("newest");
  };

  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    if (!sellerForm.name.trim() || !sellerForm.phone.trim()) {
      toast.error("Please provide your name and phone number");
      return;
    }

    setSubmittingSeller(true);
    try {
      await api.post("/leads/resale", {
        resalePropertyId: "",
        propertyTitle: sellerForm.propertyTitle || `Resale Listing Request - ${sellerForm.locality}`,
        name: sellerForm.name.trim(),
        phone: sellerForm.phone.trim(),
        email: sellerForm.email.trim(),
        message: `Seller Listing Request | Locality: ${sellerForm.locality} | Expected: ${sellerForm.expectedPrice || "Negotiable"} | Notes: ${sellerForm.message || "None"}`,
        source: "resale-seller-desk",
      });
      setSubmittedSeller(true);
      toast.success("Listing enquiry received! Our Resale Desk will contact you.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to submit request");
    } finally {
      setSubmittingSeller(false);
    }
  };

  // Dedicated featured properties section
  const featuredProperties = properties.filter((p) => p.featured);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-[90px] sm:pt-[105px] lg:pt-[115px]">
      <Seo
        title="Resale Properties in Kolkata | Flats & Homes | Astittva Marketing"
        description="Discover verified resale flats and apartments in Kolkata, New Town, and Rajarhat. Transparent pricing, clear titles, and ready-to-move secondary market inventory."
        path="/resale"
        keywords="resale properties Kolkata, resale flats New Town, resale apartments Rajarhat, ready to move flats Kolkata, secondary real estate market"
        schema={buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Resale", path: "/resale" }])}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#250306] via-[#35050A] to-[#1F0205] text-white py-16 sm:py-20 lg:py-24">
        {/* Ambient lighting & subtle grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 20%, rgba(200, 154, 85, 0.35), transparent 70%), radial-gradient(circle at 85% 80%, rgba(183, 123, 62, 0.2), transparent 50%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-[11px] sm:text-[12px] font-sans tracking-[0.2em] uppercase text-[#E8DCD5]/70 mb-5">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C89A55]">Resale Marketplace</span>
          </nav>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C89A55]/30 bg-[#C89A55]/10 backdrop-blur-md mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#C89A55] animate-pulse" />
            <span className="font-sans text-[11px] sm:text-[12px] font-semibold tracking-[0.22em] uppercase text-[#F1E7E0]">
              Verified Secondary Market
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.15] mb-5"
          >
            Curated Resale Residences &amp; <br className="hidden sm:inline" />
            <span className="italic font-light text-[#E8DCD5]">Secondary Market Advisory</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-[14px] sm:text-[16px] font-sans text-[#E8DCD5]/85 leading-relaxed font-light mb-10"
          >
            Institutional-grade due diligence, verified chain of deeds, and transparent negotiations for ready-to-move homes across Kolkata.
          </motion.p>

          {/* Hero Quick Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/95 backdrop-blur-md rounded-xl p-4 sm:p-5 text-left border border-white/20 shadow-2xl max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Location Select */}
              <div>
                <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#666] mb-1.5">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Property Type Select */}
              <div>
                <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#666] mb-1.5">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                >
                  <option value="">All Property Types</option>
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>

              {/* Bedrooms Select */}
              <div>
                <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#666] mb-1.5">
                  Bedrooms
                </label>
                <select
                  value={bedroom}
                  onChange={(e) => setBedroom(e.target.value)}
                  className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                >
                  <option value="">Any Bedrooms</option>
                  {BEDROOMS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Budget Select */}
              <div>
                <label className="block text-[10.5px] uppercase tracking-wider font-semibold text-[#666] mb-1.5">
                  Price Range
                </label>
                <select
                  value={budgetIdx}
                  onChange={(e) => setBudgetIdx(e.target.value)}
                  className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                >
                  {BUDGETS.map((b) => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Row */}
            {(location || propertyType || bedroom || budgetIdx !== "all" || furnishing !== "Any Furnishing") && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#E8DED2]/60 text-xs">
                <span className="text-[#888] text-[11px] uppercase tracking-wider font-semibold">
                  Active Filters:
                </span>
                {location && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#B87333]/10 text-[#B87333] border border-[#B87333]/30">
                    Location: {location}
                    <button type="button" onClick={() => setLocation("")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {propertyType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#B87333]/10 text-[#B87333] border border-[#B87333]/30">
                    Type: {propertyType}
                    <button type="button" onClick={() => setPropertyType("")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {bedroom && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#B87333]/10 text-[#B87333] border border-[#B87333]/30">
                    Bedrooms: {bedroom}
                    <button type="button" onClick={() => setBedroom("")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {budgetIdx !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#B87333]/10 text-[#B87333] border border-[#B87333]/30">
                    Budget: {BUDGETS.find((b) => b.id === budgetIdx)?.label}
                    <button type="button" onClick={() => setBudgetIdx("all")} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#888] hover:text-[#B87333] ml-auto font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Marketplace Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* SECTION 1: FEATURED RESALE PROPERTIES (Requirement 6 & 12) */}
        {featuredProperties.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-sans text-[11px] font-semibold tracking-[0.25em] uppercase text-[#B87333] block mb-1">
                  Spotlight Portfolio
                </span>
                <h2 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C]">
                  Featured Resale Properties
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredProperties.map((p) => {
                const img = p.featuredImage || (Array.isArray(p.images) && p.images[0]) || "";
                const isDrive = isGoogleDriveImage(img);

                return (
                  <Link
                    key={p.id}
                    to={`/resale/${p.id}`}
                    className="group bg-white rounded-xl border border-[#E8DED2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#B87333]/50 transition-all duration-300 flex flex-col"
                  >
                    {/* Image Box */}
                    <div className="relative aspect-[16/10] bg-[#1a1a1a] overflow-hidden">
                      {img ? (
                        <img
                          src={isDrive ? driveImageUrl(img, 600) : img}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-xs tracking-widest uppercase">
                          No Photo
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded bg-[#B87333] text-white text-[10px] font-semibold tracking-wider uppercase shadow-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </span>
                        <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium tracking-wider uppercase">
                          {p.propertyType || "Apartment"}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-white/95 backdrop-blur-sm text-[#1C1C1C] text-xs font-semibold shadow">
                        {formatPriceINR(p.price)}
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#777] mb-2 font-sans">
                          <MapPin className="w-3.5 h-3.5 text-[#B87333] shrink-0" />
                          <span className="truncate">
                            {[p.locality, p.city].filter(Boolean).join(", ") || "Kolkata"}
                          </span>
                        </div>
                        <h3 className="font-serif-display text-lg text-[#1C1C1C] group-hover:text-[#B87333] transition-colors line-clamp-1 mb-3">
                          {p.title}
                        </h3>
                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#E8DED2] text-xs text-[#555] font-sans">
                          <div>
                            <span className="block text-[10px] text-[#888] uppercase">BHK</span>
                            <span className="font-semibold text-[#1C1C1C]">{p.bedrooms ? `${p.bedrooms} BHK` : "—"}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-[#888] uppercase">Area</span>
                            <span className="font-semibold text-[#1C1C1C]">{p.area ? `${p.area} ${p.areaUnit || "sq.ft."}` : "—"}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-[#888] uppercase">Status</span>
                            <span className="font-semibold text-[#1C1C1C] truncate">{p.possessionStatus || "Ready"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between text-xs font-semibold text-[#B87333] group-hover:translate-x-1 transition-transform">
                        <span>View Details &amp; Enquire</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 2: ALL RESALE PROPERTIES GRID & FILTER HEADER */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E8DED2]">
            <div>
              <h2 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C]">
                All Resale Listings
              </h2>
              <p className="text-xs text-[#777] mt-0.5 font-sans">
                Showing {properties.length} verified secondary market property {properties.length === 1 ? "listing" : "listings"}
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#777] uppercase tracking-wider font-semibold">
                Sort By:
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="area_desc">Largest Area</option>
              </select>
            </div>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="text-center py-24">
              <div className="w-8 h-8 border-2 border-[#B87333] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#888]">
                Loading Properties…
              </span>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E8DED2] p-12 text-center max-w-xl mx-auto my-8">
              <Building2 className="w-12 h-12 text-[#B87333]/50 mx-auto mb-3" />
              <h3 className="font-serif-display text-2xl text-[#1C1C1C] mb-2">
                No Properties Found
              </h3>
              <p className="text-xs text-[#666] leading-relaxed mb-6 font-sans">
                We couldn’t find any published resale properties matching your selected filters. Try broadening your location, budget, or configuration criteria.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#35050A] text-white text-xs uppercase tracking-wider font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {properties.map((p) => {
                const img = p.featuredImage || (Array.isArray(p.images) && p.images[0]) || "";
                const isDrive = isGoogleDriveImage(img);

                return (
                  <Link
                    key={p.id}
                    to={`/resale/${p.id}`}
                    className="group bg-white rounded-xl border border-[#E8DED2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#B87333]/50 transition-all duration-300 flex flex-col"
                  >
                    {/* Image box */}
                    <div className="relative aspect-[16/10] bg-[#1a1a1a] overflow-hidden">
                      {img ? (
                        <img
                          loading="lazy"
                          src={isDrive ? driveImageUrl(img, 600) : img}
                          alt={`${p.title} - ${p.bedrooms ? p.bedrooms + " BHK " : ""}${p.propertyType || "Resale Property"} in ${p.locality || p.location || "Kolkata"}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-xs tracking-widest uppercase">
                          No Photo
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded bg-[#35050A]/90 backdrop-blur-sm text-[#F1E7E0] text-[10px] font-semibold tracking-wider uppercase">
                          Resale
                        </span>
                        <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium tracking-wider uppercase">
                          {p.propertyType || "Apartment"}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-white/95 backdrop-blur-sm text-[#1C1C1C] text-xs font-semibold shadow">
                        {formatPriceINR(p.price)}
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#777] mb-2 font-sans">
                          <MapPin className="w-3.5 h-3.5 text-[#B87333] shrink-0" />
                          <span className="truncate">
                            {[p.locality, p.city].filter(Boolean).join(", ") || "Kolkata"}
                          </span>
                        </div>
                        <h3 className="font-serif-display text-lg text-[#1C1C1C] group-hover:text-[#B87333] transition-colors line-clamp-1 mb-3">
                          {p.title}
                        </h3>
                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#E8DED2] text-xs text-[#555] font-sans">
                          <div>
                            <span className="block text-[10px] text-[#888] uppercase">BHK</span>
                            <span className="font-semibold text-[#1C1C1C]">{p.bedrooms ? `${p.bedrooms} BHK` : "—"}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-[#888] uppercase">Area</span>
                            <span className="font-semibold text-[#1C1C1C]">{p.area ? `${p.area} ${p.areaUnit || "sq.ft."}` : "—"}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-[#888] uppercase">Furnishing</span>
                            <span className="font-semibold text-[#1C1C1C] truncate">{p.furnishingStatus || "Unfurnished"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between text-xs font-semibold text-[#B87333] group-hover:translate-x-1 transition-transform">
                        <span>Explore Property</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 3: SELLER REGISTRATION & LISTING DESK */}
        <section className="mt-20 sm:mt-24 bg-gradient-to-br from-[#F5F1EC] to-[#EAE3D9] rounded-2xl p-8 sm:p-12 border border-[#E8DED2] shadow-sm">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="font-sans text-[11px] font-semibold tracking-[0.28em] uppercase text-[#B87333]">
                Seller Private Advisory
              </span>
              <h2 className="font-serif-display text-2xl sm:text-4xl text-[#1C1C1C] mt-2 mb-3">
                Want to Sell Your Property via Astittva?
              </h2>
              <p className="text-xs sm:text-sm text-[#5F5F5F] font-sans leading-relaxed max-w-xl mx-auto">
                Benefit from pre-qualified HNI buyers, institutional title evaluation, and discreet off-market matching without unsolicited broker spam.
              </p>
            </div>

            {submittedSeller ? (
              <div className="bg-white rounded-xl p-8 text-center border border-[#E8DED2]">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-serif-display text-2xl text-[#1C1C1C] mb-2">
                  Seller Request Registered
                </h3>
                <p className="text-xs sm:text-sm text-[#555] max-w-md mx-auto mb-6">
                  Thank you! Our private client secondary desk has received your property details. An advisor will contact you shortly to schedule an appraisal.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedSeller(false);
                    setSellerForm({ name: "", phone: "", email: "", propertyTitle: "", locality: "New Town", expectedPrice: "", message: "" });
                  }}
                  className="text-xs uppercase tracking-wider font-semibold text-[#B87333] hover:underline"
                >
                  Submit Another Property
                </button>
              </div>
            ) : (
              <form onSubmit={handleSellerSubmit} className="bg-white rounded-xl p-6 sm:p-8 border border-[#E8DED2] shadow-md space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suman Sengupta"
                      value={sellerForm.name}
                      onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
                      className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98300 00000"
                      value={sellerForm.phone}
                      onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                      className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. suman@example.com"
                      value={sellerForm.email}
                      onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                      className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                      Property Locality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Action Area I, New Town"
                      value={sellerForm.locality}
                      onChange={(e) => setSellerForm({ ...sellerForm, locality: e.target.value })}
                      className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                      Property / Society Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3 BHK in Uniworld City"
                      value={sellerForm.propertyTitle}
                      onChange={(e) => setSellerForm({ ...sellerForm, propertyTitle: e.target.value })}
                      className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                      Expected Asking Price
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹85 Lakh"
                      value={sellerForm.expectedPrice}
                      onChange={(e) => setSellerForm({ ...sellerForm, expectedPrice: e.target.value })}
                      className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                    Additional Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Area, floor, furnishing status, parking, or any specific remarks..."
                    value={sellerForm.message}
                    onChange={(e) => setSellerForm({ ...sellerForm, message: e.target.value })}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#E8DED2] rounded text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingSeller}
                  className="w-full h-12 font-sans text-xs font-semibold uppercase tracking-widest text-white rounded shadow-md transition-all flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #B77B3E 0%, #D2A15D 100%)",
                  }}
                >
                  {submittingSeller ? "Registering Property Request…" : "Submit Resale Listing Request"}
                  {!submittingSeller && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* SECTION 4: THREE TRUST PILLARS */}
        <section className="mt-16 sm:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-7 rounded-xl border border-[#E8DED2] shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2">
                Title-Cleared Due Diligence
              </h3>
              <p className="text-xs text-[#555] leading-relaxed font-sans">
                Every secondary home undergoes exhaustive legal deed audits, land tenure validation, and encumbrance verification before listing.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#E8DED2] shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2">
                True Market Valuations
              </h3>
              <p className="text-xs text-[#555] leading-relaxed font-sans">
                We benchmark against actual registry records and micro-market square-foot trends to deliver realistic, fair valuation discovery.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border border-[#E8DED2] shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2">
                Discreet Private Matchmaking
              </h3>
              <p className="text-xs text-[#555] leading-relaxed font-sans">
                Direct buyer-seller matchmaking without circular broker syndicates, protecting seller privacy and buyer purchase dignity.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: CONTACT FOOTER */}
        <section className="mt-16 py-10 bg-white rounded-xl border border-[#E8DED2] text-center">
          <p className="text-xs text-[#666] mb-3 font-sans">
            Have questions about secondary market registrations or property inspections?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#1C1C1C]">
            <a href={`tel:${PHONE_DISPLAY}`} className="flex items-center gap-1.5 text-[#B87333] hover:underline">
              <Phone className="w-3.5 h-3.5" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <span className="text-[#DDD]">•</span>
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-1.5 text-[#B87333] hover:underline">
              <Mail className="w-3.5 h-3.5" />
              <span>{EMAIL}</span>
            </a>
            <span className="text-[#DDD]">•</span>
            <Link to="/contact" className="hover:text-[#B87333] transition-colors">
              Schedule Consultation
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
