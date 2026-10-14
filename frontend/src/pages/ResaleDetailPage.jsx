import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  Home,
  Layers,
  Sparkles,
  Share2,
  Calendar,
  Compass,
} from "lucide-react";
import Seo from "@/components/Seo";
import { buildBreadcrumbSchema } from "@/lib/seoConfig";
import api, { formatApiErrorDetail, isGoogleDriveImage, driveImageUrl } from "@/lib/api";
import { toast } from "sonner";
import { PHONE_DISPLAY, EMAIL } from "@/lib/site";

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

export default function ResaleDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState("");

  // Enquiry Form State
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get(`/resale/${id}`)
      .then(({ data }) => {
        setProperty(data);
        const first = data.featuredImage || (Array.isArray(data.images) && data.images[0]) || "";
        setSelectedImg(first);
      })
      .catch((err) => {
        console.error("Failed to fetch resale property:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please enter your name and contact phone number");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      await api.post("/leads/resale", {
        resalePropertyId: id,
        propertyTitle: property?.title || "Resale Property Enquiry",
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim() || `Interested in resale property: ${property?.title || id}`,
        source: "resale-detail-page",
      });
      setSubmitted(true);
      toast.success("Enquiry sent! Our secondary market advisory desk will contact you.");
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || "Failed to submit enquiry. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: property?.title || "Resale Property at Astittva",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Property link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-[120px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#B87333] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#888]">
            Loading Resale Listing…
          </span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-[140px] px-4 text-center">
        <h1 className="font-serif-display text-3xl text-[#1C1C1C] mb-3">
          Property Not Found
        </h1>
        <p className="text-[#666] text-sm max-w-md mx-auto mb-6">
          This secondary listing may have been sold or unpublished from the marketplace.
        </p>
        <Link
          to="/resale"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-[#35050A] text-white text-xs uppercase tracking-wider font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Active Resale Homes
        </Link>
      </div>
    );
  }

  const gallery = Array.isArray(property.images) && property.images.length > 0 ? property.images : [property.featuredImage].filter(Boolean);

  const resaleBreadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Resale", path: "/resale" },
    { name: property.title, path: `/resale/${property.id}` },
  ];

  const resaleSchema = {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    name: property.title,
    description: property.description || property.title,
    url: `https://astittva.in/resale/${property.id}`,
    image: gallery.length > 0 ? gallery : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address || property.location || "",
      addressLocality: property.locality || property.location || "Kolkata",
      addressRegion: "West Bengal",
      postalCode: property.pincode || "700156",
      addressCountry: "IN",
    },
    numberOfRooms: property.bedrooms || undefined,
    numberOfBathroomsTotal: property.bathrooms || undefined,
    floorSize: property.area
      ? { "@type": "QuantitativeValue", value: property.area, unitText: property.areaUnit || "SQFT" }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: property.price || undefined,
      url: `https://astittva.in/resale/${property.id}`,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "RealEstateAgent",
        "@id": "https://astittva.in/#organization",
        name: "Astittva Marketing",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-[90px] sm:pt-[105px] lg:pt-[115px]">
      <Seo
        title={`${property.title} in ${property.locality || property.location || "Kolkata"} | Astittva Marketing`}
        description={`Explore ${property.title}, a verified ${property.bedrooms ? property.bedrooms + " BHK " : ""}${property.propertyType || "resale property"} in ${property.locality || property.location || "Kolkata"}, listed at ${formatPriceINR(property.price)} with title verification by Astittva Marketing.`}
        path={`/resale/${property.id}`}
        type="product"
        image={gallery[0]}
        schema={[resaleSchema, buildBreadcrumbSchema(resaleBreadcrumbs)]}
      />

      {/* Top Breadcrumb & Share Navigation */}
      <div className="bg-white border-b border-[#E8DED2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#666] truncate font-sans">
            <Link to="/" className="hover:text-[#B87333] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/resale" className="hover:text-[#B87333] transition-colors">Resale</Link>
            <span>/</span>
            <span className="text-[#1C1C1C] font-medium truncate max-w-[200px] sm:max-w-[400px]">
              {property.title}
            </span>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-[#555] hover:text-[#B87333] transition-colors font-medium ml-2 shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Left Content: Gallery + Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Title & Key Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#B87333]/15 text-[#B87333] border border-[#B87333]/30">
                  Verified Resale
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {property.possessionStatus || "Ready to Move"}
                </span>
                {property.featured && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-300">
                    ★ Featured
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-zinc-100 text-zinc-700">
                  {property.propertyType || "Apartment"}
                </span>
              </div>

              <h1 className="font-serif-display text-2xl sm:text-4xl text-[#1C1C1C] leading-tight mb-3">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-[#5F5F5F]">
                <MapPin className="w-4 h-4 text-[#B87333] shrink-0" />
                <span>
                  {[property.locality, property.location, property.city].filter(Boolean).join(", ") || "Kolkata"}
                  {property.pincode ? ` - ${property.pincode}` : ""}
                </span>
              </div>
            </div>

            {/* Gallery Component */}
            <div className="bg-white rounded-xl border border-[#E8DED2] p-3 shadow-sm overflow-hidden">
              <div className="relative aspect-[16/10] bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center">
                {selectedImg ? (
                  <img
                    src={isGoogleDriveImage(selectedImg) ? driveImageUrl(selectedImg, 1200) : selectedImg}
                    alt={property.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="text-white/40 text-xs tracking-widest uppercase">
                    No Photo Preview
                  </div>
                )}
              </div>

              {/* Thumbnails list */}
              {gallery.length > 1 && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImg(img)}
                      className={`relative w-20 h-14 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                        selectedImg === img ? "border-[#B87333] shadow-md scale-[1.02]" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={isGoogleDriveImage(img) ? driveImageUrl(img, 180) : img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Specification Matrix */}
            <div className="bg-white rounded-xl border border-[#E8DED2] p-6 shadow-sm">
              <h2 className="font-serif-display text-xl text-[#1C1C1C] mb-5 pb-3 border-b border-[#E8DED2]">
                Property Overview
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#888] block mb-1">
                    Super Built-up Area
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[#1C1C1C]">
                    {property.area ? `${property.area} ${property.areaUnit || "sq.ft."}` : "Contact for Area"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#888] block mb-1">
                    Configuration
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[#1C1C1C]">
                    {property.bedrooms ? `${property.bedrooms} BHK` : "Spacious"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#888] block mb-1">
                    Floor Level
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[#1C1C1C]">
                    {property.floor ? `${property.floor}${property.totalFloors ? ` of ${property.totalFloors}` : ""}` : "Multiple"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#888] block mb-1">
                    Furnishing Status
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[#1C1C1C]">
                    {property.furnishingStatus || "Unfurnished"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#888] block mb-1">
                    Bathrooms
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[#1C1C1C]">
                    {property.bathrooms ? `${property.bathrooms} Baths` : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#888] block mb-1">
                    Balconies
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[#1C1C1C]">
                    {property.balconies ? `${property.balconies} Balcony` : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#888] block mb-1">
                    Reserved Parking
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[#1C1C1C]">
                    {property.parking || "None"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#888] block mb-1">
                    Age of Property
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[#1C1C1C]">
                    {property.ageOfProperty || "Recently Handed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-xl border border-[#E8DED2] p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif-display text-xl text-[#1C1C1C] mb-4 pb-3 border-b border-[#E8DED2]">
                  About This Resale Property
                </h2>
                <div className="text-[14px] sm:text-[15px] leading-relaxed text-[#4A4A4A] whitespace-pre-line font-light">
                  {property.description}
                </div>
              </div>
            )}

            {/* Amenities Grid */}
            {Array.isArray(property.amenities) && property.amenities.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E8DED2] p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif-display text-xl text-[#1C1C1C] mb-4 pb-3 border-b border-[#E8DED2]">
                  Amenities &amp; Lifestyle Features
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8DED2] text-xs text-[#2A2A2A] font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#B87333] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Astittva Trust & Title Clearance Pillar */}
            <div className="bg-gradient-to-br from-[#2D0407] to-[#1E0205] text-white rounded-xl p-6 sm:p-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#B87333]/20 border border-[#B87333]/40 text-[#D2A15D] shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-serif-display text-xl text-[#F5ECE5] mb-1.5">
                    Astittva Institutional Due-Diligence
                  </h3>
                  <p className="text-xs sm:text-sm text-[#D8CCC4] leading-relaxed font-light">
                    This secondary market residence is legally vetted by Astittva’s legal advisory. We ensure complete title verification, encumbrance check, clear chain of ownership deeds, and seamless society NOC transfers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Right Sidebar: Pricing & Enquiry Lead Form */}
          <div className="lg:col-span-4 lg:sticky lg:top-[125px] space-y-6">
            <div className="bg-white rounded-xl border border-[#E8DED2] p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              {/* Pricing Box */}
              <div className="pb-5 mb-6 border-b border-[#E8DED2]">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[#888] block mb-1">
                  Resale Asking Price
                </span>
                <div className="font-serif-display text-3xl sm:text-4xl text-[#1C1C1C] font-semibold text-[#B87333]">
                  {formatPriceINR(property.price)}
                </div>
                {property.pricePerSqFt ? (
                  <div className="text-xs text-[#666] mt-1 font-sans">
                    Estimated rate: ₹{Number(property.pricePerSqFt).toLocaleString("en-IN")} / {property.areaUnit || "sq.ft."}
                  </div>
                ) : null}
              </div>

              {/* Lead Form */}
              <div>
                <h3 className="font-serif-display text-xl text-[#1C1C1C] mb-1.5">
                  Enquire About This Property
                </h3>
                <p className="text-xs text-[#666] mb-5">
                  Connect with our dedicated Resale Advisor for property inspections and confidential negotiations.
                </p>

                {submitted ? (
                  <div className="text-center py-6 bg-emerald-50 border border-emerald-200 rounded-lg p-5">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <h4 className="font-serif-display text-lg text-emerald-900 mb-1">
                      Enquiry Registered
                    </h4>
                    <p className="text-xs text-emerald-700 mb-4">
                      Thank you! Our Resale Desk has received your request regarding this property and will connect with you within 2 business hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: "", phone: "", email: "", message: "" });
                      }}
                      className="text-xs font-semibold uppercase tracking-wider text-[#B87333] hover:underline"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-4">
                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                        {errorMsg}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anirban Roy"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. anirban@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full h-11 px-3 bg-[#FAF8F5] border border-[#E8DED2] rounded text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#555] mb-1">
                        Message / Query
                      </label>
                      <textarea
                        rows={3}
                        placeholder="I would like to schedule a site visit or know more details..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full p-3 bg-[#FAF8F5] border border-[#E8DED2] rounded text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-11 font-sans text-xs font-semibold uppercase tracking-widest text-white rounded transition-all shadow-md flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #B77B3E 0%, #D2A15D 100%)",
                      }}
                    >
                      {submitting ? "Sending Request…" : "Schedule Private Inspection"}
                    </button>
                  </form>
                )}
              </div>

              {/* Direct Call / Contact Bar */}
              <div className="pt-6 mt-6 border-t border-[#E8DED2] flex items-center justify-between text-xs">
                <span className="text-[#777]">Direct Resale Desk:</span>
                <a
                  href={`tel:${PHONE_DISPLAY}`}
                  className="font-medium text-[#B87333] hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{PHONE_DISPLAY}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
