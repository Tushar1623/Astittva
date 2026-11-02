import { useEffect, useState, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Building2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Train,
  CheckCircle2,
  Phone,
  MessageCircle,
  Stethoscope,
  GraduationCap,
  Hotel,
  ShoppingBag,
  Compass,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import Seo from "@/components/Seo";
import PropertyCard from "@/components/PropertyCard";
import { LOCATIONS_DATA } from "@/data/locationsData";
import { buildBreadcrumbSchema, buildFaqSchema, SITE_URL } from "@/lib/seoConfig";
import seedProperties from "@/data/seedProperties.json";
import { whatsappLink, PHONE_DISPLAY } from "@/lib/site";
import api from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 25 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

export default function LocationDetailPage({ locationKey }) {
  const { slug } = useParams();
  const activeSlug = locationKey || slug;
  const locationData = LOCATIONS_DATA[activeSlug];

  const [openFaq, setOpenFaq] = useState(0);
  const [properties, setProperties] = useState(() => {
    try {
      const cached = localStorage.getItem("astitva_cache_properties");
      if (cached) return JSON.parse(cached);
    } catch {}
    return seedProperties || [];
  });

  // Fetch fresh properties in background
  useEffect(() => {
    let mounted = true;
    api
      .get("/properties?limit=100")
      .then((res) => {
        if (mounted && Array.isArray(res.data) && res.data.length > 0) {
          setProperties(res.data);
          try {
            localStorage.setItem("astitva_cache_properties", JSON.stringify(res.data));
          } catch {}
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Filter properties matching this location
  const matchingProperties = useMemo(() => {
    if (!locationData) return [];
    const all = properties || [];

    // 1. First priority: explicitly featured IDs
    const featured = (locationData.featuredPropertyIds || [])
      .map((id) => all.find((p) => String(p.id) === String(id) || String(p._id) === String(id)))
      .filter(Boolean);

    // 2. Second priority: keyword matching in location, project_name, or description
    const keywords = locationData.propertyFilterKeywords || [];
    const matchedByKeyword = all.filter((p) => {
      if (featured.some((f) => f.id === p.id)) return false;
      const haystack = `${p.location || ""} ${p.city || ""} ${p.project_name || ""} ${p.description || ""}`.toLowerCase();
      return keywords.some((kw) => haystack.includes(kw.toLowerCase()));
    });

    const combined = [...featured, ...matchedByKeyword];
    return combined.length > 0 ? combined.slice(0, 6) : all.slice(0, 3);
  }, [locationData, properties]);

  if (!locationData) {
    return <Navigate to="/properties" replace />;
  }

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Locations", path: "/properties" },
    { name: locationData.name, path: `/locations/${locationData.slug}` },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
  const faqSchema = buildFaqSchema(locationData.faqs);

  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: locationData.fullName,
    description: locationData.seoDescription,
    url: `${SITE_URL}/locations/${locationData.slug}`,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Kolkata, West Bengal, India",
    },
  };

  return (
    <div className="bg-[#FAF8F5] text-[#1C1C1C] min-h-screen pt-[72px]">
      <Seo
        title={locationData.seoTitle}
        description={locationData.seoDescription}
        path={`/locations/${locationData.slug}`}
        image={locationData.heroImage}
        schema={[breadcrumbSchema, faqSchema, placeSchema]}
      />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden bg-[#1a0e10]">
        {/* Background Image with subtle parallax feel */}
        <div className="absolute inset-0 z-0">
          <img
            src={locationData.heroImage}
            alt={locationData.fullName}
            className="w-full h-full object-cover object-center opacity-40 scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E080C]/95 via-[#2A0E13]/85 to-[#1E080C]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E080C] via-transparent to-black/40" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-20 w-full">
          {/* Breadcrumb row */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-white/60 mb-6">
            <Link to="/" className="hover:text-copper transition">Home</Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-copper transition">Locations</Link>
            <span>/</span>
            <span className="text-copper font-medium">{locationData.name}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-copper/20 border border-copper/35 text-white text-[10px] tracking-[0.3em] uppercase font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-copper animate-pulse" />
              {locationData.badge}
            </div>

            <h1 className="font-serif-display text-white text-3xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-[-0.02em] mb-6">
              {locationData.headline}
            </h1>

            <p className="text-white/85 text-base sm:text-lg leading-[1.75] font-light max-w-2xl mb-8">
              {locationData.tagline}. Discover handpicked residential developments, market trends, and expert property advisory with Astittva Marketing.
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#available-properties"
                className="btn-primary inline-flex items-center gap-2 px-7 py-3.5"
              >
                View Available Properties <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#advisory-contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs tracking-[0.25em] uppercase font-semibold text-white bg-white/10 hover:bg-white hover:text-[#1C1C1C] border border-white/40 transition-all duration-300"
              >
                Book Locality Consultation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== QUICK STATS STRIP ===================== */}
      <section className="relative border-y border-[#E8DED2] bg-[#F5F1EC] py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {locationData.quickStats.map((stat, i) => (
              <div key={i} className="flex flex-col border-l-2 border-copper/50 pl-4">
                <span className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#737373] font-medium">
                  {stat.label}
                </span>
                <span className="font-serif-display text-xl sm:text-2xl lg:text-3xl text-[#1C1C1C] font-semibold mt-1">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== LOCALITY OVERVIEW ===================== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <motion.div {...fadeUp} className="lg:col-span-7">
              <div className="eyebrow-line mb-6">
                <span className="text-[10px] tracking-[0.45em] uppercase text-[#737373]">
                  Locality Intelligence
                </span>
              </div>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] leading-[1.12] mb-6">
                A Strategic Address in Kolkata&apos;s Urban Landscape
              </h2>
              {locationData.overview.map((para, i) => (
                <p key={i} className="text-[#3A3A3A] text-base sm:text-lg leading-[1.8] mb-5 font-light">
                  {para}
                </p>
              ))}

              <div className="mt-8 pt-8 border-t border-[#E8DED2] flex flex-wrap gap-6 text-sm text-[#4A4A4A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-copper shrink-0" />
                  <span>100% WBRERA Verified Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-copper shrink-0" />
                  <span>Dedicated Area Specialists</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-copper shrink-0" />
                  <span>Comprehensive Title Due Diligence</span>
                </div>
              </div>
            </motion.div>

            {/* Side Card: Market Outlook */}
            <motion.div
              {...fadeUp}
              className="lg:col-span-5 bg-white border border-[#E8DED2] p-8 sm:p-10 shadow-sm"
            >
              <div className="text-[10px] tracking-[0.35em] uppercase text-copper font-semibold mb-2">
                2026 Micro-Market Matrix
              </div>
              <h3 className="font-serif-display text-2xl text-[#1C1C1C] mb-6">
                {locationData.name} Investment Benchmark
              </h3>

              <div className="space-y-5 text-sm divide-y divide-[#E8DED2]">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[#666]">Starting Capital</span>
                  <span className="font-medium text-[#1C1C1C]">{locationData.startingPrice}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-[#666]">Avg Price Range</span>
                  <span className="font-medium text-[#1C1C1C]">{locationData.avgSqftRate}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-[#666]">Expected Rental Yield</span>
                  <span className="font-medium text-emerald-700">{locationData.rentalYield}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-[#666]">Historical Capital Growth</span>
                  <span className="font-medium text-copper">{locationData.appreciationRate}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E8DED2]">
                <a
                  href="#advisory-contact"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1C1C1C] hover:bg-copper text-white text-xs tracking-[0.25em] uppercase font-semibold transition-colors duration-300"
                >
                  Request Locality Price Report <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================== CONNECTIVITY & INFRASTRUCTURE ===================== */}
      <section className="py-16 sm:py-24 bg-[#F5F1EC] border-y border-[#E8DED2]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="max-w-2xl mb-12 sm:mb-16">
            <div className="eyebrow-line mb-6">
              <span className="text-[10px] tracking-[0.45em] uppercase text-[#737373]">
                Transit & Arteries
              </span>
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] leading-[1.12]">
              Connectivity &amp; Infrastructure Radar
            </h2>
            <p className="mt-4 text-[#555] text-base leading-relaxed">
              Strategic transit corridors, upcoming metro expansions, and express boulevards that anchor long-term capital value in {locationData.name}.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {locationData.connectivity.map((conn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white border border-[#E8DED2] p-7 sm:p-8 hover:border-copper transition-colors duration-300 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-copper/10 border border-copper/30 flex items-center justify-center shrink-0">
                    <Train className="w-5 h-5 text-copper" />
                  </div>
                  <div>
                    <h3 className="font-serif-display text-xl text-[#1C1C1C] mb-2 font-medium">
                      {conn.title}
                    </h3>
                    <p className="text-[#4A4A4A] text-sm leading-relaxed font-light">
                      {conn.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== AVAILABLE PROPERTIES SHOWCASE ===================== */}
      <section id="available-properties" className="py-16 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <div className="eyebrow-line mb-6">
                <span className="text-[10px] tracking-[0.45em] uppercase text-[#737373]">
                  Curated Portfolio
                </span>
              </div>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] leading-[1.12]">
                Featured Residences in {locationData.name}
              </h2>
            </div>
            <Link
              to={`/properties?location=${encodeURIComponent(locationData.name)}`}
              className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-copper hover:text-[#1C1C1C] font-semibold border-b border-copper/40 pb-1 transition-colors"
            >
              Explore All {locationData.name} Properties <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {matchingProperties.map((property, idx) => (
              <PropertyCard
                key={property.id || property._id || idx}
                property={property}
                index={idx}
                variant="grid"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SOCIAL INFRASTRUCTURE ===================== */}
      <section className="py-16 sm:py-24 bg-[#F5F1EC] border-y border-[#E8DED2]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="max-w-2xl mb-12 sm:mb-16">
            <div className="eyebrow-line mb-6">
              <span className="text-[10px] tracking-[0.45em] uppercase text-[#737373]">
                Social Fabric
              </span>
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] leading-[1.12]">
              Living in {locationData.name}
            </h2>
            <p className="mt-4 text-[#555] text-base leading-relaxed">
              Every address we represent is evaluated through the lens of family lifestyle, healthcare accessibility, educational excellence, and elite recreation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Healthcare */}
            <div className="bg-white border border-[#E8DED2] p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Stethoscope className="w-5 h-5 text-copper" />
                <h3 className="font-serif-display text-lg text-[#1C1C1C] font-semibold">Super-Specialty Care</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#555]">
                {locationData.socialInfrastructure.healthcare.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-copper mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Education */}
            <div className="bg-white border border-[#E8DED2] p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-5 h-5 text-copper" />
                <h3 className="font-serif-display text-lg text-[#1C1C1C] font-semibold">Schools &amp; Campuses</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#555]">
                {locationData.socialInfrastructure.education.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-copper mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hospitality */}
            <div className="bg-white border border-[#E8DED2] p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Hotel className="w-5 h-5 text-copper" />
                <h3 className="font-serif-display text-lg text-[#1C1C1C] font-semibold">Luxury Hotels &amp; Dining</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#555]">
                {locationData.socialInfrastructure.hospitality.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-copper mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Retail */}
            <div className="bg-white border border-[#E8DED2] p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="w-5 h-5 text-copper" />
                <h3 className="font-serif-display text-lg text-[#1C1C1C] font-semibold">Retail &amp; Leisure</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-[#555]">
                {locationData.socialInfrastructure.retail.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-copper mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BUYER & INVESTOR GUIDE ===================== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="bg-[#2A0E13] text-white p-8 sm:p-12 lg:p-16 border border-copper/30">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-7">
                <div className="text-[10px] tracking-[0.4em] uppercase text-copper font-semibold mb-3">
                  Investment Advisory
                </div>
                <h2 className="font-serif-display text-3xl sm:text-4xl text-white leading-[1.15] mb-5">
                  Buyer &amp; Investor Guide for {locationData.name}
                </h2>
                <p className="text-white/80 text-base leading-relaxed mb-6 font-light">
                  {locationData.investorConsiderations.summary}
                </p>
                <div className="space-y-3.5">
                  {locationData.investorConsiderations.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-copper mt-1 shrink-0" />
                      <span className="text-sm text-white/90 font-light">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white/5 border border-white/10 p-6 sm:p-8 rounded-sm">
                <h3 className="font-serif-display text-xl text-white mb-4">
                  Planning a Purchase in {locationData.name}?
                </h3>
                <p className="text-white/70 text-xs leading-relaxed mb-6">
                  Astittva Marketing is Kolkata&apos;s leading property consultancy. We provide comprehensive legal verification, developer negotiation, floor plan optimization, and home loan advisory.
                </p>
                <div className="space-y-3">
                  <a
                    href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-copper hover:bg-copper/90 text-white text-xs tracking-wider uppercase font-semibold transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Advisory: {PHONE_DISPLAY}
                  </a>
                  <a
                    href={whatsappLink(`Hi Astittva, I want investment guidance for properties in ${locationData.name}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs tracking-wider uppercase font-semibold transition border border-white/20"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Locality Desk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FREQUENTLY ASKED QUESTIONS ===================== */}
      <section className="py-16 sm:py-24 bg-[#F5F1EC] border-t border-[#E8DED2]">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="eyebrow-line justify-center mb-4">
              <span className="text-[10px] tracking-[0.45em] uppercase text-[#737373]">
                Knowledge &amp; Clarity
              </span>
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-[#1C1C1C]">
              Frequently Asked Questions: {locationData.name}
            </h2>
            <p className="mt-3 text-[#555] text-sm">
              Critical buyer questions on pricing, metro connectivity, stamp duty, and investment safety answered by Astittva Marketing advisors.
            </p>
          </motion.div>

          <div className="space-y-4">
            {locationData.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E8DED2] transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left p-5 sm:p-6 gap-4"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif-display text-base sm:text-lg text-[#1C1C1C] font-medium">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-copper shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-[#444] leading-relaxed border-t border-[#F5F1EC]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== CONTEXTUAL INTERNAL LINKS ===================== */}
      <section className="py-12 bg-white border-t border-[#E8DED2]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <span className="text-[10px] tracking-[0.35em] uppercase text-[#737373] font-semibold">
              Related Guides &amp; Locality Hubs
            </span>
            <Link to="/properties" className="text-xs text-copper hover:underline font-medium">
              View All Kolkata Locations →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {locationData.internalLinks.map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className="p-3.5 bg-[#FAF8F5] border border-[#E8DED2] hover:border-copper text-xs text-[#2A2A2A] hover:text-copper transition flex items-center justify-between group"
              >
                <span className="truncate">{link.label}</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ADVISORY CONTACT ANCHOR ===================== */}
      <section id="advisory-contact" className="py-16 bg-[#F8F6F2] border-t border-[#E8DED2]">
        <div className="max-w-[900px] mx-auto px-6 sm:px-8 text-center">
          <div className="eyebrow-line justify-center mb-4">
            <span className="text-[10px] tracking-[0.45em] uppercase text-[#737373]">
              Astittva Advisory
            </span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl text-[#1C1C1C] mb-4">
            Connect with our {locationData.name} Area Specialist
          </h2>
          <p className="text-sm text-[#555] max-w-xl mx-auto mb-8">
            Whether you are evaluating property investments, seeking an exclusive luxury flat, or requiring RERA due diligence, our advisors are here to help.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="btn-primary inline-flex items-center gap-2 px-8 py-3.5"
            >
              Book an Appointment <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-xs tracking-wider uppercase font-semibold text-[#1C1C1C] bg-white border border-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition"
            >
              <Phone className="w-3.5 h-3.5" /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
