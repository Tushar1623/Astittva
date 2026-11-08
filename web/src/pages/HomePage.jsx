import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Building2,
  Compass,
  ChevronRight,
  MapPin,
  Globe2,
  Award,
  TrendingUp,
  BadgeCheck,
  Handshake,
  Briefcase,
  MessageCircle,
  Check,
  ChevronDown,
  Loader2,
  ExternalLink,
  HelpCircle,
  FileText,
  Scale,
  Share2
} from "lucide-react";
import api, { formatApiErrorDetail, isGoogleDriveImage, driveImageUrl, driveDirectFallbackUrl, fileUrl } from "@/lib/api";
import { pickPropertyFallback } from "@/components/PropertyCard";
import { toast } from "sonner";
import { whatsappLink, PHONE_DISPLAY } from "@/lib/site";
import CinematicHero from "@/components/CinematicHero";
import SafeImage from "@/components/SafeImage";
import Seo from "@/components/Seo";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seoConfig";
import ShareButton from "@/components/ShareButton";
import seedProperties from "@/data/seedProperties.json";

const TEXTURE = "https://static.prod-images.emergentagent.com/jobs/50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/images/1f5da7f44ad5aab6c1f6ab3c12df3ec89723084c1042e95749a6b4658dcffcc6.png";

const TRUST_SIGNALS = [
  { icon: BadgeCheck, label: "RERA-Verified Projects" },
  { icon: Handshake, label: "Trusted Developer Partnerships" },
  { icon: Compass, label: "Senior Expert Advisory" },
  { icon: Briefcase, label: "End-to-End Investment Guidance" },
];

const LOCATIONS = [
  {
    name: "New Town & Rajarhat",
    tag: "Smart City & IT Hub",
    img: "/images/luxe/locations_newtown.webp",
    blurb: "India's planned smart-city — Silicon Valley IT corridors, Eco Park, and landmark luxury residences like Town Square.",
    starting: "₹55 L",
    category: "Luxury · Investment",
    link: "/locations/new-town-rajarhat",
  },
  {
    name: "EM Bypass",
    tag: "Lifeline Corridor",
    img: "/images/luxe/property_tower.webp",
    blurb: "Kolkata's high-speed growth artery — Orange Line Metro, super-specialty healthcare, and luxury high-rises.",
    starting: "₹1.87 Cr",
    category: "High-Rise · Luxury",
    link: "/locations/em-bypass",
  },
  {
    name: "New Alipore",
    tag: "Heritage Prestige",
    img: "/images/luxe/property_heritage_estate.webp",
    blurb: "South Kolkata's serene heritage enclave — planned green avenues, Majerhat Purple Line metro, and bespoke residences.",
    starting: "₹2.25 Cr",
    category: "Heritage · Elite",
    link: "/locations/new-alipore",
  },
];

const PILLARS = [
  { icon: ShieldCheck, title: "RERA-Verified Projects", body: "Every listing is RERA-verified and personally vetted by our advisory team — no surprises, ever." },
  { icon: Sparkles, title: "Verified Developers", body: "We partner only with developers whose craftsmanship and integrity match our standards of luxury." },
  { icon: Compass, title: "Expert Investment Advisory", body: "From legal diligence to investment strategy — invest with complete confidence to build an enduring family legacy." },
  { icon: Award, title: "Legal Support", body: "Complete title, RERA and registration support from our in-house and partner legal network." },
  { icon: MapPin, title: "Site Visit Assistance", body: "Pre-scheduled, comfortable, advisor-led site visits across New Town, Rajarhat and Kolkata." },
  { icon: Briefcase, title: "End-to-End Guidance", body: "From shortlist to handover — and beyond. We remain accountable to outcomes, not just deals." },
];

const SERVICES = [
  {
    icon: Building2,
    title: "Luxury Residential Acquisitions",
    desc: "Curated portfolio of premium apartments, penthouses, and sky villas across Kolkata's premier high-rises. We analyze floor plans, carpet-area efficiency, and developer delivery records.",
  },
  {
    icon: Handshake,
    title: "Secondary Market Resale Advisory",
    desc: "Title-checked resale homes offering immediate handover. Our resale desk handles 30-year mother deed searches, encumbrance certificates, and smooth seller-to-buyer transitions.",
  },
  {
    icon: TrendingUp,
    title: "Real Estate Investment & Rental Yield",
    desc: "Strategic advisory for institutional buyers and NRI investors seeking capital preservation. We target high rental yields across New Town IT hubs and arterial transit corridors.",
  },
  {
    icon: Scale,
    title: "Legal Diligence & WBRERA Compliance",
    desc: "Strict compliance checks on sanctioned municipal plans, fire clearances, and mutation records. We ensure full transparency with West Bengal circle rates and civic authorities.",
  },
];

const EXTERNAL_RESOURCES = [
  {
    title: "West Bengal RERA (WBRERA)",
    url: "https://rera.wb.gov.in",
    tag: "Statutory Authority",
    domain: "rera.wb.gov.in",
    desc: "Official government portal for verifying registered real estate agents and approved projects in West Bengal.",
  },
  {
    title: "Directorate of Registration & Stamp Revenue",
    url: "https://wbregistration.gov.in",
    tag: "Land Registry (e-Nathikaran)",
    domain: "wbregistration.gov.in",
    desc: "Official e-Nathikaran system for circle rate assessment, market valuation, and statutory deed registration in West Bengal.",
  },
  {
    title: "New Town Kolkata Dev. Authority (NKDA)",
    url: "https://nkdamar.org",
    tag: "Smart City Infrastructure",
    domain: "nkdamar.org",
    desc: "Statutory authority overseeing smart city urban planning, building approvals, and civic infrastructure in New Town.",
  },
  {
    title: "Kolkata Metropolitan Dev. Authority (KMDA)",
    url: "https://kmda.wb.gov.in",
    tag: "Metropolitan Planning",
    domain: "kmda.wb.gov.in",
    desc: "Planning body managing comprehensive urban transit corridors, flyovers, and master developments across Greater Kolkata.",
  },
];

const HOMEPAGE_FAQS = [
  {
    q: "What makes Astittva Marketing a leading real estate company in Kolkata?",
    a: "Astittva Marketing operates as an institutional luxury real estate advisory firm rather than a transactional brokerage. We specialize in verified high-rise developments, bespoke residences, and secondary market resales across Kolkata. Our advisory team conducts independent 30-year title diligence and WBRERA scrutiny for every client. This institutional rigor empowers discerning buyers to invest with confidence and build an enduring family legacy.",
  },
  {
    q: "How does Astittva verify property legal title and WBRERA compliance?",
    a: "Every development represented by Astittva undergoes comprehensive regulatory diligence before being shortlisted. We independently verify project registration numbers on the official West Bengal RERA (WBRERA) portal. Our legal team inspects sanctioned architectural blueprints and confirms municipal mutation status with KMC or NKDA. We also review 30-year mother deeds at local registry offices to verify unencumbered freehold title.",
  },
  {
    q: "What are the prevailing stamp duty and property registration rates in West Bengal?",
    a: "In West Bengal, standard stamp duty is 6% for properties valued above ₹40 Lakhs in municipal corporation areas. In panchayat and non-corporation areas, the applicable stamp duty rate is 5%. A mandatory 1% statutory registration fee applies to all property transactions across the state. Stamp duty is calculated on whichever is higher between the registered agreement value and the official e-Nathikaran circle rate.",
  },
  {
    q: "Which Kolkata micro-markets offer the best capital appreciation and rental yield?",
    a: "New Town Action Areas and Rajarhat deliver attractive rental yields averaging 4.5% to 6.2% annually. Strong demand is driven by corporate workforce hiring across Salt Lake Sector V and the Silicon Valley IT corridor. Along EM Bypass, capital appreciation is accelerated by the Orange Line metro and premier healthcare infrastructure. Meanwhile, New Alipore remains South Kolkata's premier enclave for luxury wealth preservation and bespoke residences.",
  },
  {
    q: "Does Astittva Marketing handle secondary market resale properties in Kolkata?",
    a: "Yes, Astittva maintains a specialized secondary market resale desk for buyers and sellers across Kolkata. Our advisors conduct exhaustive 30-year title searches, non-encumbrance certificate reviews, and comparative market valuations. We also handle price negotiations, sale agreement drafting, and municipal mutation updates for a smooth handover.",
  },
];

const KOLKATA_FACTS = [
  { stat: "12–18%", label: "Annual Appreciation" },
  { stat: "₹40K Cr", label: "Infrastructure Investment" },
  { stat: "150+", label: "Global Companies" },
  { stat: "3rd", label: "Largest Metro Region" },
];

const ROADMAP = [
  { phase: "Today", area: "New Town · Rajarhat · Kolkata", icon: MapPin },
  { phase: "Next", area: "Greater Kolkata Metropolitan Region", icon: Building2 },
  { phase: "2027", area: "Tier-1 cities across India", icon: TrendingUp },
  { phase: "Vision", area: "Global investment destinations", icon: Globe2 },
];

const BUDGETS = ["Under ₹50 L", "₹50 L – ₹1 Cr", "₹1 – 3 Cr", "₹3 – 5 Cr", "₹5 Cr+"];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

export default function HomePage() {
  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem("astitva_cache_properties");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const featured = parsed.filter((p) => p.featured || p.is_featured);
          return featured.length > 0 ? featured.slice(0, 6) : parsed.slice(0, 6);
        }
      }
    } catch (e) {}
    const seedFeatured = (seedProperties || []).filter((p) => p.featured || p.is_featured);
    return seedFeatured.length > 0 ? seedFeatured.slice(0, 6) : (seedProperties || []).slice(0, 6);
  });

  const initialForm = { prefix: "Mr", first_name: "", last_name: "", phone_code: "+91", email: "", phone: "", interest: "", budget: "", message: "" };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    api.get("/properties", { params: { featured: true, limit: 6 } })
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const fullName = `${formData.first_name || ""} ${formData.last_name || ""}`.trim() || formData.prefix;
      await api.post("/leads/property", {
        name: fullName,
        phone: formData.phone,
        email: formData.email,
        propertyId: "",
        propertyName: formData.interest || "Astittva Consultation",
        location: "Kolkata",
        leadType: formData.interest ? `Property Enquiry: ${formData.interest}` : "General Enquiry",
        message: formData.message,
        source: "homepage",
        budget: formData.budget,
        interest: formData.interest,
        ...formData,
      });
      setSubmitted(true);
      setFormData(initialForm);
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || "Submission failed. Please try again.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOMEPAGE_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <div data-testid="home-page">
      <Seo
        title="Astittva Marketing | Real Estate Company in Kolkata"
        description="Premier real estate company in Kolkata. Astittva Marketing provides trusted advisory for luxury properties, flats & investments across EM Bypass & New Town."
        path="/"
        schema={[getOrganizationSchema(), getWebSiteSchema(), faqSchema]}
      />

      {/* ===================== HERO ===================== */}
      <section data-testid="hero-section" className="relative min-h-[640px] h-[100svh] sm:min-h-[760px] sm:h-screen w-full overflow-hidden bg-[#FAF8F5]">
        <div className="absolute inset-0">
          <CinematicHero />
        </div>

        {/* Fine vertical rule on the left for editorial framing */}
        <div className="absolute left-8 lg:left-16 top-24 bottom-24 w-px bg-white/10 hidden md:block" />

        {/* Vertical brand label */}
        <div className="absolute left-8 lg:left-16 bottom-12 hidden md:flex flex-col items-center gap-4 text-white/40 z-20" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          <span className="text-[10px] tracking-[0.5em] uppercase">EST · KOLKATA · 2026</span>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-6 sm:px-8 lg:px-16 lg:pl-32 h-full flex flex-col justify-center pt-24 sm:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl relative"
          >
            {/* Localized contrast halo behind hero copy */}
            <div
              aria-hidden="true"
              className="absolute -inset-x-8 -inset-y-10 sm:-inset-x-12 sm:-inset-y-14 -z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 75% 70% at 30% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 45%, transparent 78%)",
                filter: "blur(8px)",
              }}
            />

            <div className="eyebrow-line mb-4 sm:mb-6" data-testid="hero-overline">
              <span
                className="text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white font-semibold"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.18)" }}
              >
                Premier Real Estate Company in Kolkata · Est. 2026
              </span>
            </div>

            <h1
              className="display-headline text-white text-[2rem] leading-[1.06] sm:text-[3.1rem] lg:text-[4.4rem] tracking-[-0.025em]"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.35)" }}
            >
              Real Estate Company in Kolkata <span className="text-white/60 font-light">|</span> <span className="text-white italic font-serif">Astittva</span>
            </h1>

            <p
              className="mt-6 sm:mt-8 text-white text-[15px] sm:text-base lg:text-lg max-w-xl leading-[1.75] font-normal"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.18)" }}
            >
              Astittva Marketing is Kolkata&apos;s premier luxury real estate company and property advisory firm. When you invest with confidence in Kolkata&apos;s finest properties, you build an enduring family legacy for future generations. Headquartered in New Town, our senior property advisors guide homebuyers, investors, and families to thoroughly vetted developments. We curate premier residential, commercial, and secondary market properties across EM Bypass, Rajarhat, New Alipore, and Salt Lake with absolute transparency.
            </p>

            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <Link to="/properties" data-testid="explore-properties-btn" className="btn-primary w-full sm:w-auto">
                Explore Properties <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="#consultation"
                data-testid="book-consultation-btn"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-4 text-[10.5px] tracking-[0.3em] uppercase font-medium bg-white/10 backdrop-blur-md border border-white/70 text-white hover:bg-white hover:text-[#1C1C1C] transition-all duration-300"
              >
                Book a Consultation <ArrowRight className="w-3 h-3" />
              </a>
              <ShareButton
                title="Astittva Marketing | Real Estate Company in Kolkata"
                description="Premier real estate company in Kolkata. Trusted advisory for luxury properties, flats & investments across EM Bypass, New Town & South Kolkata."
                url="https://astittva.in"
                image="https://astittva.in/og-image.png"
                contentType="generic"
                variant="light"
                label="Share Astittva"
                className="w-full sm:w-auto px-5 py-4 text-[10px] tracking-[0.22em] uppercase font-semibold border-white/70"
              />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 right-8 lg:right-16 flex flex-col items-end gap-3 text-white/35 hidden md:flex">
          <div className="text-[10px] tracking-[0.5em] uppercase">Scroll</div>
          <div className="w-px h-12 bg-gradient-to-b from-copper/60 to-transparent" />
        </div>
      </section>

      {/* ===================== TRUST STRIP ===================== */}
      <section data-testid="trust-strip" className="relative border-y border-[#E8DED2] bg-[#F5F1EC]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-8 sm:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-7 gap-x-6 sm:gap-x-10">
            {TRUST_SIGNALS.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <t.icon className="w-5 h-5 sm:w-6 sm:h-6 text-copper shrink-0" strokeWidth={1.2} />
                <span className="text-[#2A2A2A] text-[11px] sm:text-xs tracking-[0.15em] uppercase font-light leading-snug">{t.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHY ASTITTVA ===================== */}
      <section data-testid="why-astitva-section" className="relative py-16 sm:py-24 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="max-w-3xl mb-12 sm:mb-16">
            <div className="eyebrow-line mb-8">
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">Leading Real Estate Company in Kolkata</span>
            </div>
            <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
              A new standard for real estate<br />
              <span className="text-[#5F5F5F] italic font-serif-display">advisory in Eastern India.</span>
            </h2>
            <p className="mt-6 text-[#5F5F5F] leading-[1.8] font-light text-base max-w-2xl">
              As a dedicated real estate company in Kolkata, Astittva Marketing eliminates the confusion and risks associated with conventional property purchases. We align our recommendations with your capital preservation goals, residential aspirations, and regulatory safety.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05]">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white p-7 sm:p-10 lg:p-12 group"
              >
                <p.icon className="w-7 h-7 text-copper mb-10 transition-colors duration-500" strokeWidth={1} />
                <h3 className="font-serif-display text-2xl text-ivory mb-4">{p.title}</h3>
                <p className="text-[#5F5F5F] leading-[1.7] font-light text-[15px]">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== COMPREHENSIVE SERVICES ===================== */}
      <section data-testid="services-section" className="py-16 sm:py-20 bg-[#FAF8F5] border-t border-[#E8DED2]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="max-w-3xl mb-12">
            <div className="eyebrow-line mb-6">
              <span className="text-[10px] tracking-[0.45em] uppercase text-copper font-semibold">Institutional Advisory Scope</span>
            </div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Real Estate Services in Kolkata:<br />
              <span className="italic text-[#5F5F5F] font-serif-display">From Acquisition to Ownership.</span>
            </h2>
            <p className="mt-4 text-[#5F5F5F] text-base leading-relaxed font-light">
              Whether you are acquiring a luxury residential sky residence, liquidating an existing property, or structuring high-yield commercial investments, our practice delivers verifiable data and transparent guidance at every stage.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((srv, idx) => (
              <motion.div
                key={srv.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white p-7 rounded-xl border border-[#E8DED2] shadow-xs flex flex-col justify-between hover:border-copper transition-colors"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-copper mb-5">
                    <srv.icon className="w-6 h-6" strokeWidth={1.4} />
                  </div>
                  <h3 className="font-serif-display text-xl text-[#1C1C1C] mb-3 leading-snug">{srv.title}</h3>
                  <p className="text-xs text-[#5F5F5F] leading-relaxed font-light">{srv.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#E8DED2]/60">
                  <Link to="/properties" className="inline-flex items-center gap-1.5 text-xs text-copper font-medium hover:text-copper-hover">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED LOCATIONS ===================== */}
      <section data-testid="locations-section" className="py-16 sm:py-24 bg-[#F5F1EC]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 sm:mb-16">
            <div className="max-w-2xl">
              <div className="eyebrow-line mb-8">
                <span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">Featured Locations</span>
              </div>
              <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
                Where Kolkata&apos;s future<br /><span className="italic text-[#5F5F5F]">is being built.</span>
              </h2>
            </div>
            <Link to="/properties" className="btn-ghost">
              View All Properties <ChevronRight className="w-3 h-3" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            {LOCATIONS.map((loc, i) => (
              <motion.div
                key={loc.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden cursor-pointer bg-white border border-[#E8DED2] hover:border-[#B87333] transition-all duration-700 shadow-[0_1px_3px_rgba(28,28,28,0.04),0_4px_16px_-8px_rgba(94,31,40,0.06)] hover:shadow-[0_4px_12px_rgba(28,28,28,0.06),0_24px_48px_-16px_rgba(184,115,51,0.22)] hover:-translate-y-1"
              >
                <Link to={loc.link || `/properties?city=${encodeURIComponent(loc.name)}`} data-testid={`location-card-${loc.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F1EC]">
                    <img loading="lazy" src={loc.img} alt={loc.name} className="w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
                    <div className="absolute top-5 left-5 inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#E8DED2] px-3 py-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#B87333]" />
                      <span className="text-[#1C1C1C] text-[9px] tracking-[0.28em] uppercase font-semibold">{loc.category}</span>
                    </div>
                    <div className="absolute bottom-4 left-5 text-white text-[9px] tracking-[0.4em] uppercase font-semibold" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
                      {loc.tag}
                    </div>
                  </div>
                  <div className="p-7 sm:p-8">
                    <h3 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C] mb-3 leading-[1.1] tracking-[-0.01em] group-hover:text-[#B87333] transition-colors duration-500">{loc.name}</h3>
                    <p className="text-[#2A2A2A] text-sm leading-[1.7] font-normal min-h-[3.5rem]">{loc.blurb}</p>
                    <div className="mt-6 flex items-end justify-between gap-4 pt-5 border-t border-[#E8DED2]">
                      <div>
                        <div className="text-[9px] tracking-[0.3em] uppercase text-[#737373] mb-1.5 font-medium">Starting</div>
                        <div className="font-serif-display text-2xl sm:text-[1.7rem] text-[#1C1C1C] font-semibold tracking-tight">{loc.starting}</div>
                      </div>
                      <div className="inline-flex items-center gap-2 text-[#B87333] text-[10px] tracking-[0.35em] uppercase border-b border-[#B87333]/40 group-hover:border-[#B87333] pb-1 transition-all duration-500 font-semibold">
                        Explore Locality <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED PROJECTS ===================== */}
      <section data-testid="projects-section" className="py-16 sm:py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-10 sm:mb-14 max-w-3xl">
            <div className="eyebrow-line mb-8">
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">Featured Projects</span>
            </div>
            <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
              A handpicked portfolio.<br />
              <span className="italic text-[#5F5F5F]">Verified. Premium. Ready.</span>
            </h2>
          </motion.div>

          {projects.length === 0 ? (
            <div className="text-center py-24 border border-[#E8DED2]">
              <p className="text-[#737373] italic font-serif-display text-lg mb-8">New projects are being curated.</p>
              <Link to="/contact" className="btn-outline">Speak to an Advisor</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {projects.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="group"
                  data-testid={`project-card-${p.id}`}
                >
                  <Link to={`/properties/${p.id}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden bg-[#FAF8F5]">
                      {(() => {
                        const fallback = pickPropertyFallback(p.id);
                        const candidateImages = [
                          ...(p.featured_image ? [p.featured_image] : []),
                          ...(Array.isArray(p.images) ? p.images : []),
                        ];
                        const driveImg = candidateImages.find(isGoogleDriveImage);
                        const anyHttpImg = candidateImages.find(
                          (img) =>
                            typeof img === "string" &&
                            (img.startsWith("http") || img.startsWith("/uploads/")) &&
                            !img.includes("astitva-realestate")
                        );
                        const primaryCandidate = driveImg || anyHttpImg || candidateImages[0] || fallback;
                        return (
                          <SafeImage
                            src={primaryCandidate}
                            alt={p.project_name}
                            type="property"
                            seed={p.id}
                            fallbackSrc={fallback}
                            width={1000}
                            className="w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
                          />
                        );
                      })()}
                    </div>
                    <div className="pt-8">
                      <div className="text-[#737373] text-[10px] tracking-[0.4em] uppercase mb-3 flex items-center gap-2">
                        <span className="w-4 h-px bg-copper" /> {p.city}
                      </div>
                      <h3 className="font-serif-display text-2xl text-ivory mb-3 group-hover:text-copper transition-colors duration-500">{p.project_name}</h3>
                      <p className="text-[#5F5F5F] text-sm font-light line-clamp-2 leading-[1.7]">{p.description}</p>
                    </div>
                  </Link>
                  <div className="mt-6 flex items-center justify-between pt-6 border-t border-[#E8DED2]">
                    <span className="text-ivory/80 font-serif-display text-base italic">{p.price_label || "Price on request"}</span>
                    <div className="flex items-center gap-3">
                      <ShareButton
                        item={p}
                        title={p.project_name}
                        location={p.location || p.city || "Kolkata"}
                        price={p.price_label || (p.starting_price ? `₹${p.starting_price.toLocaleString("en-IN")}` : "")}
                        propertyType={p.property_type || "Luxury Property"}
                        category={p.category || "Residential"}
                        description={p.description}
                        url={`https://astittva.in/properties/${p.id}`}
                        image={p.featured_image || (Array.isArray(p.images) ? p.images[0] : "") || pickPropertyFallback(p.id)}
                        type="property"
                        variant="iconOnly"
                        className="w-10 h-10 min-w-[40px] min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] !p-0"
                        label=""
                      />
                      <Link
                        to={`/properties/${p.id}`}
                        className="p-1 text-copper transition-transform duration-500 group-hover:translate-x-1"
                        aria-label={`Explore ${p.project_name} in ${p.location || p.city || "Kolkata"}`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================== REGULATORY RESOURCES (EXTERNAL LINKS) ===================== */}
      <section data-testid="regulatory-section" className="py-16 sm:py-20 bg-[#FAF8F5] border-y border-[#E8DED2]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="max-w-3xl mb-10">
            <div className="eyebrow-line mb-6">
              <span className="text-[10px] tracking-[0.45em] uppercase text-copper font-semibold">Government & Regulatory Due Diligence</span>
            </div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Essential Considerations & Official Portals<br />
              <span className="italic text-[#5F5F5F] font-serif-display">For Kolkata Property Buyers.</span>
            </h2>
            <p className="mt-4 text-[#5F5F5F] text-base leading-relaxed font-light">
              We empower homebuyers with transparent legal oversight and verified documentation. Before committing capital to any property in West Bengal, review statutory approvals via official government portals. Verify promoter registrations on WBRERA and inspect prevailing circle rates on the state e-Nathikaran system.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {EXTERNAL_RESOURCES.map((res, i) => (
              <motion.a
                key={res.title}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 bg-white border border-[#E8DED2] rounded-xl hover:border-copper transition-all duration-300 group flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="text-[10px] tracking-[0.25em] uppercase text-copper font-semibold mb-2">{res.tag}</div>
                  <h3 className="font-serif-display text-lg text-[#1C1C1C] group-hover:text-copper transition-colors leading-snug">{res.title}</h3>
                  <p className="text-xs text-[#5F5F5F] mt-2.5 leading-relaxed font-light">{res.desc}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E8DED2]/70 flex items-center justify-between text-xs text-copper font-medium">
                  <span>{res.domain}</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHY INVEST IN KOLKATA ===================== */}
      <section data-testid="why-kolkata-section" className="relative py-16 sm:py-24 bg-[#F5F1EC] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]">
          <img loading="lazy" src={TEXTURE} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="eyebrow-line mb-8">
                <span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">Why Invest in Kolkata</span>
              </div>
              <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
                The next great Indian real estate story <span className="italic text-[#5F5F5F]">is being written here.</span>
              </h2>
              <p className="mt-10 text-[#5F5F5F] leading-[1.85] font-light text-base">
                As a leading real estate company in Kolkata, Astittva guides clients through the city&apos;s quiet residential renaissance. Kolkata offers attractive property entry points compared to other major metro regions like Mumbai or Bangalore. High-growth corridors along EM Bypass and New Town deliver strong rental yields and transformative metro infrastructure. Meanwhile, South Kolkata heritage enclaves preserve long-term capital value for discerning homeowners.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-px bg-white/[0.06] self-start">
              {KOLKATA_FACTS.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="bg-[#F5F1EC] p-8 sm:p-10 lg:p-14 group hover:bg-white transition-colors duration-500"
                >
                  <div className="font-serif-display text-[3.5rem] sm:text-[5rem] lg:text-[6rem] leading-[0.95] tracking-[-0.02em] text-ivory mb-4 sm:mb-6">
                    {f.stat}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-px bg-copper" />
                    <div className="text-[#3A3A3A] text-[11px] sm:text-xs tracking-[0.2em] uppercase">{f.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== FREQUENTLY ASKED QUESTIONS ===================== */}
      <section data-testid="faq-section" className="py-16 sm:py-24 bg-white border-t border-[#E8DED2]">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="eyebrow-line justify-center mb-6" style={{ display: "inline-flex" }}>
              <span className="text-[10px] tracking-[0.45em] uppercase text-copper font-semibold">Client Advisory Questions</span>
            </div>
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Frequently Asked Questions About<br />
              <span className="italic text-[#5F5F5F] font-serif-display">Real Estate in Kolkata.</span>
            </h2>
            <p className="mt-4 text-[#5F5F5F] text-base leading-relaxed font-light">
              Clear answers to the most common questions regarding property purchases, legal title searches, West Bengal stamp duty, and investment yields.
            </p>
          </motion.div>

          <div className="space-y-3.5">
            {HOMEPAGE_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className="border border-[#E8DED2] rounded-xl overflow-hidden bg-[#FAF8F5] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-copper"
                  >
                    <span className="font-serif-display text-base sm:text-lg text-[#1C1C1C] font-medium leading-snug">
                      {faq.q}
                    </span>
                    <span className={`w-7 h-7 rounded-full border border-[#E8DED2] bg-white flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-copper border-copper" : "text-[#737373]"}`}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-[#4A4A4A] leading-[1.8] font-light border-t border-[#E8DED2]/60 bg-white">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== EXPANSION ROADMAP ===================== */}
      <section data-testid="roadmap-section" className="py-16 sm:py-24 bg-[#FAF8F5]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="eyebrow-line justify-center mb-8" style={{ display: "inline-flex" }}>
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">Future Expansion</span>
            </div>
            <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05] mt-2">
              From Kolkata<br /><span className="italic text-[#5F5F5F]">to the world.</span>
            </h2>
            <p className="mt-8 text-[#5F5F5F] font-light leading-[1.85] text-base">
              Built on a foundation of local trust, designed for global ambition. Our roadmap charts a deliberate expansion across India and into key international investment markets.
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-0">
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />

            {ROADMAP.map((step, i) => (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="relative text-center flex flex-col items-center"
                data-testid={`roadmap-step-${i}`}
              >
                <div className="w-24 h-24 rounded-full border border-[#E8DED2] bg-white flex items-center justify-center mb-8 relative group hover:border-copper transition-colors duration-500">
                  <step.icon className="w-7 h-7 text-copper" strokeWidth={1} />
                </div>
                <div className="text-copper text-[10px] tracking-[0.4em] uppercase mb-3">{step.phase}</div>
                <div className="font-serif-display text-ivory text-lg max-w-[180px]">{step.area}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHATSAPP CTA STRIP ===================== */}
      <section data-testid="whatsapp-cta" className="relative bg-[#FAF8F5] border-y border-[#E8DED2]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" strokeWidth={1.5} />
                </span>
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#5F5F5F]">Direct Advisory</span>
              </div>
              <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.05]">
                Need Immediate Property Advice?
              </h2>
              <p className="mt-5 sm:mt-6 text-muted-fg font-light leading-[1.85] text-base max-w-xl">
                Talk directly with an Astittva advisor and receive project recommendations, pricing details, floor plans, investment guidance and site visit assistance.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4">
              <a
                href={whatsappLink("Hi Astittva, I'd like advice on premium properties.")}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="whatsapp-section-cta"
                className="flex-1 inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe57] text-[#0a0a0a] py-4 sm:py-5 px-6 text-xs tracking-[0.18em] uppercase font-medium transition"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2} /> Chat on WhatsApp
              </a>
              <a href="#consultation" data-testid="whatsapp-section-book" className="flex-1 btn-outline">
                Book Consultation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LEAD FORM ===================== */}
      <section id="consultation" data-testid="lead-form-section" className="relative py-16 sm:py-24 bg-[#F5F1EC]">
        <div className="absolute inset-0 opacity-[0.06]"><img loading="lazy" src={TEXTURE} alt="" className="w-full h-full object-cover" /></div>

        <div className="relative max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="eyebrow-line mb-8">
                <span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">Book a Consultation</span>
              </div>
              <h2 className="section-title text-3xl sm:text-5xl lg:text-[3.5rem] leading-[1.05]">
                Let&apos;s design your<br /><span className="italic text-[#5F5F5F]">investment journey.</span>
              </h2>
              <p className="mt-8 sm:mt-10 text-[#5F5F5F] font-light leading-[1.85] text-base">
                Share a few details. A senior advisor will reach out within one business day with a curated shortlist tailored to your goals.
              </p>

              <ul className="mt-8 space-y-3">
                {["No spam — ever", "Confidential & RERA-compliant", "Response within 24 hours"].map((b) => (
                  <li key={b} className="flex items-center gap-3 text-[#5F5F5F] text-sm font-light">
                    <Check className="w-4 h-4 text-copper" strokeWidth={1.4} /> {b}
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-8 sm:pt-10 border-t border-[#E8DED2]">
                <div className="text-[10px] tracking-[0.4em] uppercase text-[#737373] mb-3">Or call us directly</div>
                <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="font-serif-display text-2xl text-ivory hover:text-copper transition">{PHONE_DISPLAY}</a>
              </div>
            </div>

            <div className="lg:col-span-7">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-[rgba(255,255,255,0.65)] backdrop-blur-[12px] border border-[rgba(74,8,13,0.10)] rounded-[12px] sm:rounded-[14px] p-8 sm:p-12 md:p-14 shadow-[0_12px_40px_rgba(40,10,10,0.06)]"
                  data-testid="lead-thank-you"
                >
                  <div className="w-12 h-12 rounded-full border border-[#C89A55]/40 bg-[#C89A55]/10 flex items-center justify-center mb-6">
                    <Check className="w-5 h-5 text-[#C89A55]" strokeWidth={2} />
                  </div>
                  <div className="w-8 h-[2px] bg-gradient-to-r from-[#4A080D] to-[#C89A55] mb-4 rounded-full" />
                  <h3 className="font-serif-display text-2xl sm:text-3xl text-[#3A2525] font-medium tracking-tight mb-3">
                    Request received.
                  </h3>
                  <p className="text-[#817572] font-normal text-[14.5px] sm:text-[15px] leading-relaxed max-w-xl">
                    Our property advisor will be in touch shortly with a curated shortlist for you.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-6 border-t border-[rgba(74,8,13,0.08)]">
                    <a
                      href={whatsappLink("Hi Astittva, I just submitted a consultation request.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe57] text-[#050505] h-[46px] px-6 rounded-[5px] text-[11px] tracking-[0.14em] uppercase font-semibold transition-all shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> Instant WhatsApp Advisory
                    </a>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="inline-flex items-center justify-center h-[46px] px-6 rounded-[5px] text-[11px] tracking-[0.14em] uppercase font-semibold text-[#4A080D] hover:bg-[#4A080D]/5 border border-[#DDD2C9] hover:border-[#B99A82] transition-all"
                    >
                      Submit Another
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-[rgba(255,255,255,0.58)] backdrop-blur-[12px] border border-[rgba(74,8,13,0.10)] rounded-[12px] sm:rounded-[14px] p-6 sm:p-9 md:p-11 shadow-[0_12px_40px_rgba(40,10,10,0.06)]">
                  <div className="mb-8 sm:mb-10">
                    <div className="w-8 h-[2px] bg-gradient-to-r from-[#4A080D] to-[#C89A55] mb-5 rounded-full" />
                    <h3 className="font-sans text-[26px] sm:text-[30px] font-medium text-[#3A2525] tracking-tight leading-tight">
                      Tell us what you&apos;re looking for.
                    </h3>
                    <p className="mt-2 text-[14px] sm:text-[15px] text-[#817572] font-normal leading-relaxed">
                      Share a few details and our property advisor will help you find the right opportunity.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7" data-testid="lead-form">
                    <div className="grid grid-cols-12 gap-x-4 sm:gap-x-5 gap-y-5 sm:gap-y-6">
                      <div className="col-span-4 sm:col-span-2">
                        <label htmlFor="lead-prefix-home" className="label-consultation">Prefix</label>
                        <div className="relative">
                          <select
                            id="lead-prefix-home"
                            name="prefix"
                            data-testid="lead-prefix-select"
                            value={formData.prefix}
                            onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                            className="input-consultation pr-7"
                          >
                            <option>Mr</option>
                            <option>Ms</option>
                            <option>Mrs</option>
                            <option>Dr</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4A080D]" strokeWidth={1.8} />
                        </div>
                      </div>
                      <div className="col-span-8 sm:col-span-5">
                        <label htmlFor="lead-firstname-home" className="label-consultation">First Name</label>
                        <input
                          required
                          id="lead-firstname-home"
                          name="first_name"
                          type="text"
                          data-testid="lead-first-name-input"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="input-consultation"
                          placeholder="First name"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-5">
                        <label htmlFor="lead-lastname-home" className="label-consultation">Last Name</label>
                        <input
                          required
                          id="lead-lastname-home"
                          name="last_name"
                          type="text"
                          data-testid="lead-last-name-input"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="input-consultation"
                          placeholder="Last name"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-3">
                        <label htmlFor="lead-phonecode-home" className="label-consultation">Code</label>
                        <input
                          required
                          id="lead-phonecode-home"
                          name="phone_code"
                          type="text"
                          data-testid="lead-phone-code-input"
                          value={formData.phone_code}
                          onChange={(e) => setFormData({ ...formData, phone_code: e.target.value })}
                          className="input-consultation"
                          placeholder="+91"
                        />
                      </div>
                      <div className="col-span-8 sm:col-span-9">
                        <label htmlFor="lead-phone-home" className="label-consultation">Phone Number</label>
                        <input
                          required
                          id="lead-phone-home"
                          name="phone"
                          type="tel"
                          data-testid="lead-phone-input"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="input-consultation"
                          placeholder="Phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="lead-email-home" className="label-consultation">Email Address</label>
                      <input
                        required
                        id="lead-email-home"
                        name="email"
                        type="email"
                        data-testid="lead-email-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-consultation"
                        placeholder="you@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 sm:gap-x-6 gap-y-5 sm:gap-y-6">
                      <div>
                        <label htmlFor="lead-interest-home" className="label-consultation">Property Interest</label>
                        <div className="relative">
                          <select
                            id="lead-interest-home"
                            name="interest"
                            data-testid="lead-interest-select"
                            value={formData.interest}
                            onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                            className="input-consultation"
                          >
                            <option value="">Select an interest</option>
                            <option>Residential — Luxury</option>
                            <option>Residential — Premium</option>
                            <option>Commercial</option>
                            <option>Plot / Land</option>
                            <option>Investment Advisory</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A080D]" strokeWidth={1.8} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="lead-budget-home" className="label-consultation">Budget</label>
                        <div className="relative">
                          <select
                            id="lead-budget-home"
                            name="budget"
                            data-testid="lead-budget-select"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            className="input-consultation"
                          >
                            <option value="">Select budget</option>
                            {BUDGETS.map((b) => (
                              <option key={b}>{b}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A080D]" strokeWidth={1.8} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="lead-message-home" className="label-consultation flex items-center justify-between">
                        <span>Message / Specific Requirements</span>
                        <span className="text-[#817572] font-normal tracking-normal text-[10px]">OPTIONAL</span>
                      </label>
                      <textarea
                        rows={3}
                        id="lead-message-home"
                        name="message"
                        data-testid="lead-message-input"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="input-consultation"
                        placeholder="Tell us about your goals..."
                      />
                    </div>

                    {submitError && (
                      <div
                        data-testid="lead-error"
                        className="text-[#A43B35] text-[12px] font-medium border border-[#A43B35]/30 bg-[#A43B35]/[0.06] rounded-[4px] px-4 py-2.5"
                      >
                        {submitError}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
                      <button
                        type="submit"
                        disabled={submitting}
                        data-testid="lead-submit-btn"
                        className="h-[50px] px-7 sm:px-8 text-white rounded-[5px] font-semibold text-[11.5px] uppercase tracking-[0.10em] flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group shadow-[0_4px_14px_rgba(74,8,13,0.12)] hover:shadow-[0_8px_22px_rgba(74,8,13,0.18)] hover:-translate-y-0.5 active:translate-y-0"
                        style={{
                          background: "linear-gradient(135deg, #4A080D 0%, #651118 100%)",
                        }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#C89A55]" />
                            <span>SUBMITTING...</span>
                          </>
                        ) : (
                          <>
                            <span>SUBMIT CONSULTATION REQUEST</span>
                            <ArrowRight className="w-4 h-4 text-[#C89A55] transition-transform duration-200 group-hover:translate-x-1" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center sm:justify-start gap-2 text-[#8A7A72] text-[9.5px] sm:text-[10px] tracking-[0.10em] uppercase font-medium">
                        <Check className="w-3.5 h-3.5 text-[#C89A55] shrink-0" strokeWidth={2.2} />
                        <span>100% Confidential · Direct Expert Advisory</span>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
