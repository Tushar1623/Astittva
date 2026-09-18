import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Building2, Compass, ChevronRight, MapPin, Globe2, Award, TrendingUp, BadgeCheck, Handshake, Briefcase, MessageCircle, Check } from "lucide-react";
import api, { fileUrl, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { whatsappLink, PHONE_DISPLAY } from "@/lib/site";
import CinematicHero from "@/components/CinematicHero";
import Seo from "@/components/Seo";
import RiddhiBhumiSection from "@/components/RiddhiBhumiSection";

const TEXTURE = "https://static.prod-images.emergentagent.com/jobs/50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/images/1f5da7f44ad5aab6c1f6ab3c12df3ec89723084c1042e95749a6b4658dcffcc6.png";

const TRUST_SIGNALS = [
  { icon: BadgeCheck, label: "RERA-Verified Projects" },
  { icon: Handshake, label: "Trusted Developer Partnerships" },
  { icon: Compass, label: "Senior Expert Advisory" },
  { icon: Briefcase, label: "End-to-End Investment Guidance" },
];

const LOCATIONS = [
  {
    name: "New Town",
    tag: "Smart City Hub",
    img: "/images/luxe/locations_newtown.jpg",
    blurb: "India's first planned smart-city — IT corridors and rising luxury sky-residences.",
    starting: "₹1.2 Cr",
    category: "Luxury · Premium",
  },
  {
    name: "Rajarhat",
    tag: "Investment Frontier",
    img: "/images/luxe/locations_rajarhat.jpg",
    blurb: "The fastest-appreciating corridor of Greater Kolkata, anchored by Eco Park & global IT.",
    starting: "₹35 L",
    category: "Premium · Plots",
  },
  {
    name: "Kolkata",
    tag: "Cultural Capital",
    img: "/images/luxe/locations_kolkata.jpg",
    blurb: "A legacy city reimagined — heritage, art, and a new wave of luxury residences.",
    starting: "₹4.5 Cr",
    category: "Heritage · Luxury",
  },
];

const PILLARS = [
  { icon: ShieldCheck, title: "RERA-Verified Projects", body: "Every listing is RERA-verified and personally vetted by our advisory team — no surprises, ever." },
  { icon: Sparkles, title: "Verified Developers", body: "We partner only with developers whose craftsmanship and integrity match our standards of luxury." },
  { icon: Compass, title: "Expert Investment Advisory", body: "From legal diligence to investment strategy — a single, sophisticated point of contact for your journey." },
  { icon: Award, title: "Legal Support", body: "Complete title, RERA and registration support from our in-house and partner legal network." },
  { icon: MapPin, title: "Site Visit Assistance", body: "Pre-scheduled, comfortable, advisor-led site visits across New Town, Rajarhat and Kolkata." },
  { icon: Briefcase, title: "End-to-End Guidance", body: "From shortlist to handover — and beyond. We remain accountable to outcomes, not just deals." },
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
  const [projects, setProjects] = useState([]);
  const initialForm = { prefix: "Mr", first_name: "", last_name: "", phone_code: "+91", email: "", phone: "", interest: "", budget: "", message: "" };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    api.get("/properties", { params: { featured: true, limit: 6 } })
      .then(({ data }) => setProjects(data))
      .catch(() => setProjects([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.post("/leads", { ...formData, source: "homepage" });
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

  return (
    <div data-testid="home-page">
      <Seo
        title="Astittva Marketing — Luxury Real Estate Advisory, Property Consultants & Investment Advisory in Kolkata"
        description="Astittva Marketing is a luxury real estate advisory and property consultancy in Kolkata. We curate verified residential, commercial and investment properties across New Town, Rajarhat, Salt Lake, Alipore and partner with India's most trusted developers to deliver opportunities for the discerning investor."
        path="/"
        keywords="luxury real estate Kolkata, property consultants Kolkata, investment advisory Kolkata, real estate advisory, New Town properties, Rajarhat apartments, Astittva Marketing, premium real estate Kolkata"
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
            {/* Localized contrast halo behind hero copy — guarantees readability on any slide */}
            <div
              aria-hidden="true"
              className="absolute -inset-x-8 -inset-y-10 sm:-inset-x-12 sm:-inset-y-14 -z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 75% 70% at 30% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 45%, transparent 78%)",
                filter: "blur(8px)",
              }}
            />

            <div className="eyebrow-line mb-6 sm:mb-10" data-testid="hero-overline">
              <span
                className="text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-white font-semibold"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.18)" }}
              >Astittva Marketing · Est. 2026</span>
            </div>

            <h1
              className="display-headline text-white text-[2.1rem] leading-[1.04] sm:text-[3.4rem] lg:text-[5rem] tracking-[-0.025em]"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.35)" }}
            >
              <span className="block">Invest With Confidence.</span>
              <span className="block mt-1 sm:mt-2">Build your future</span>
              <span className="block mt-1 sm:mt-2">
                with <span style={{ color: "#FFFFFF" }}>Astittva.</span>
              </span>
            </h1>

            <p
              className="mt-6 sm:mt-9 text-white text-[15px] sm:text-base lg:text-lg max-w-xl leading-[1.75] font-normal"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.18)" }}
            >
              Discover verified residential and commercial opportunities across Kolkata&apos;s fastest-growing real estate destinations — curated by advisors who measure success in decades, not deals.
            </p>

            <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-5 items-stretch sm:items-center">
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

      {/* ===================== FEATURED: RIDDHI BHOOMI ===================== */}
      <RiddhiBhumiSection />

      {/* ===================== WHY ASTITTVA placeholder will follow ===================== */}
      <section data-testid="why-astitva-section" className="relative py-16 sm:py-24 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="max-w-3xl mb-12 sm:mb-16">
            <div className="eyebrow-line mb-8">
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">The Astittva Difference</span>
            </div>
            <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
              A new standard for real estate<br />
              <span className="text-[#5F5F5F] italic font-serif-display">advisory in Eastern India.</span>
            </h2>
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
                <Link to={`/properties?city=${encodeURIComponent(loc.name)}`} data-testid={`location-card-${loc.name.toLowerCase().replace(' ', '-')}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F1EC]">
                    <img loading="lazy" src={loc.img} alt={loc.name} className="w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105" />
                    {/* Subtle bottom gradient — only behind chip, photograph stays bright */}
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
                        Discover <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
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
                  <Link to={`/properties/${p.id}`}>
                    <div className="aspect-[4/3] overflow-hidden bg-[#FAF8F5]">
                      <img loading="lazy"
                        src={p.images?.[0] ? fileUrl(p.images[0]) : "/images/luxe/luxury_villa.jpg"}
                        alt={p.project_name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/luxe/luxury_villa.jpg";
                        }}
                        className="w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="pt-8">
                      <div className="text-[#737373] text-[10px] tracking-[0.4em] uppercase mb-3 flex items-center gap-2">
                        <span className="w-4 h-px bg-copper" /> {p.city}
                      </div>
                      <h3 className="font-serif-display text-2xl text-ivory mb-3 group-hover:text-copper transition-colors duration-500">{p.project_name}</h3>
                      <p className="text-[#5F5F5F] text-sm font-light line-clamp-2 leading-[1.7]">{p.description}</p>
                      <div className="mt-6 flex items-center justify-between pt-6 border-t border-[#E8DED2]">
                        <span className="text-ivory/80 font-serif-display text-base italic">{p.price_label || "Price on request"}</span>
                        <ArrowRight className="w-4 h-4 text-copper transition-transform duration-500 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
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
                Kolkata — and Greater Kolkata in particular — is experiencing a quiet renaissance. Lower entry points than Mumbai or Bangalore, strong rental yields, and a wave of infrastructure that&apos;s redrawing the map of Eastern India.
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

      {/* ===================== EXPANSION ROADMAP ===================== */}
      <section data-testid="roadmap-section" className="py-16 sm:py-24">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="border border-copper/30 p-10 sm:p-14 text-center"
                  data-testid="lead-thank-you"
                >
                  <div className="w-16 h-16 mx-auto rounded-full border border-copper/40 flex items-center justify-center mb-6">
                    <Check className="w-7 h-7 text-copper" strokeWidth={1.4} />
                  </div>
                  <h3 className="font-serif-display text-3xl sm:text-4xl text-ivory mb-4">Thank you.</h3>
                  <p className="text-[#5F5F5F] font-light leading-[1.85] max-w-md mx-auto">
                    Your request has been received. A senior Astittva advisor will reach out within one business day with a curated shortlist for you.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <a
                      href={whatsappLink("Hi Astittva, I just submitted a consultation request.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-[#0a0a0a] py-3.5 px-6 text-xs tracking-[0.18em] uppercase font-medium transition"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp Us
                    </a>
                    <button onClick={() => setSubmitted(false)} className="btn-ghost justify-center">
                      Submit Another
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8" data-testid="lead-form">
                  <div className="grid grid-cols-12 gap-x-4 sm:gap-x-5 gap-y-7 sm:gap-y-8">
                    <div className="col-span-4 sm:col-span-2">
                      <label className="input-label">Prefix</label>
                      <select
                        data-testid="lead-prefix-select"
                        value={formData.prefix}
                        onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                        className="input-luxury bg-transparent"
                      >
                        <option>Mr</option>
                        <option>Ms</option>
                        <option>Mrs</option>
                        <option>Dr</option>
                      </select>
                    </div>
                    <div className="col-span-8 sm:col-span-5">
                      <label className="input-label">First Name</label>
                      <input required type="text" data-testid="lead-first-name-input" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="input-luxury" placeholder="First name" />
                    </div>
                    <div className="col-span-12 sm:col-span-5">
                      <label className="input-label">Last Name</label>
                      <input required type="text" data-testid="lead-last-name-input" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="input-luxury" placeholder="Last name" />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="input-label">Code</label>
                      <input required type="text" data-testid="lead-phone-code-input" value={formData.phone_code} onChange={(e) => setFormData({ ...formData, phone_code: e.target.value })} className="input-luxury" placeholder="+91" />
                    </div>
                    <div className="col-span-8 sm:col-span-10">
                      <label className="input-label">Phone</label>
                      <input required type="tel" data-testid="lead-phone-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-luxury" placeholder="Phone number" />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input required type="email" data-testid="lead-email-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-luxury" placeholder="you@email.com" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7 sm:gap-y-8">
                    <div>
                      <label className="input-label">Property Interest</label>
                      <select data-testid="lead-interest-select" value={formData.interest} onChange={(e) => setFormData({ ...formData, interest: e.target.value })} className="input-luxury">
                        <option value="">Select an interest</option>
                        <option>Residential — Luxury</option>
                        <option>Residential — Premium</option>
                        <option>Commercial</option>
                        <option>Plot / Land</option>
                        <option>Investment Advisory</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Budget</label>
                      <select data-testid="lead-budget-select" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="input-luxury">
                        <option value="">Select budget</option>
                        {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Message (optional)</label>
                    <textarea rows={3} data-testid="lead-message-input" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="input-luxury" placeholder="Tell us about your goals..." />
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                    <button type="submit" disabled={submitting} data-testid="lead-submit-btn" className="btn-primary disabled:opacity-50 w-full sm:w-auto">
                      {submitting ? "Sending..." : "Request Consultation"} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[#9D948B] text-[10px] tracking-[0.25em] uppercase font-light sm:ml-2">100% Confidential</span>
                  </div>
                  {submitError && (
                    <div data-testid="lead-error" className="text-red-400 text-sm font-light border border-red-500/30 bg-red-500/5 px-4 py-3">
                      {submitError}
                    </div>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
