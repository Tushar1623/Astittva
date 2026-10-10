import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, ShieldCheck, TrendingUp, Sparkles, 
  ArrowRight, CheckCircle2, Clock, Mail, Phone, MapPin 
} from "lucide-react";
import Seo from "@/components/Seo";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { PHONE_DISPLAY, EMAIL } from "@/lib/site";

export default function ResalePage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    intent: "buy", // "buy" or "sell"
    preferred_locality: "New Town",
    budget: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      await api.post("/leads/property", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        propertyId: "",
        propertyName: form.intent === "sell" ? "Resale Listing Request" : "Resale Purchase Enquiry",
        location: form.preferred_locality || "Kolkata",
        leadType: "Resale Enquiry",
        message: form.message || `Interest registered via Resale Desk portal (${form.intent.toUpperCase()}).`,
        source: "resale-page",
        budget: form.budget || "Unspecified",
        preferred_locality: form.preferred_locality,
        investment_purpose: form.intent === "sell" ? "Resale / Listing" : "Resale Purchase",
        property_type: "Secondary Market / Resale",
      });
      setSubmitted(true);
      toast.success("Interest registered. Our Resale Desk will contact you shortly.");
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || "Failed to submit. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-[90px] sm:pt-[105px] lg:pt-[115px]">
      <Seo
        title="Luxury Resale Properties in Kolkata — Coming Soon"
        description="Astittva Resale Advisory Desk: Verified secondary residences, penthouses, and luxury apartments across New Town, Rajarhat, and Kolkata. Coming soon."
        path="/resale"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#250306] via-[#35050A] to-[#1F0205] text-white py-16 sm:py-24 lg:py-28">
        {/* Subtle architectural background texture & ambient glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 20%, rgba(200, 154, 85, 0.25), transparent 70%), radial-gradient(circle at 85% 80%, rgba(183, 123, 62, 0.15), transparent 50%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-[11px] sm:text-[12px] font-sans tracking-[0.2em] uppercase text-[#E8DCD5]/70 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C89A55]">Resale</span>
          </nav>

          {/* Coming Soon Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#C89A55]/30 bg-[#C89A55]/10 backdrop-blur-md mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[#C89A55] animate-pulse" />
            <span className="font-sans text-[11px] sm:text-[12px] font-semibold tracking-[0.24em] uppercase text-[#F1E7E0]">
              Coming Soon
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.15] mb-6"
          >
            Curated Resale Residences &amp; <br className="hidden sm:inline" />
            <span className="italic font-light text-[#E8DCD5]">Secondary Market Advisory</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-[14px] sm:text-[16px] lg:text-[17px] font-sans text-[#E8DCD5]/85 leading-relaxed font-light mb-8"
          >
            We are curating an exclusive portfolio of legally-vetted, verified secondary residences,
            luxury penthouses, and prime commercial assets across New Town, Rajarhat, Salt Lake, and Kolkata.
          </motion.p>

          {/* Direct CTA scroll */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#early-access"
              className="inline-flex items-center justify-center gap-2 h-[46px] px-7 font-sans text-[12.5px] font-semibold tracking-[0.1em] uppercase text-white rounded-[6px] transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, #B77B3E 0%, #D2A15D 100%)",
                boxShadow: "0 8px 24px rgba(185, 125, 62, 0.25)",
              }}
            >
              <span>Register Priority Interest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 h-[46px] px-6 font-sans text-[12.5px] font-medium tracking-[0.1em] uppercase text-[#E8DCD5] hover:text-white rounded-[6px] border border-white/20 hover:border-white/40 transition-colors"
            >
              Explore New Launches
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 sm:py-20 lg:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[#B87333]">
            What to Expect
          </span>
          <h2 className="font-serif-display text-2xl sm:text-4xl text-[#1C1C1C] mt-2 mb-3">
            A Transparent Resale Ecosystem
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#5F5F5F] font-sans leading-relaxed">
            Unlike informal brokers, Astittva provides institutional-grade verification and fair market discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-7 sm:p-8 rounded-[8px] border border-[#E8DED2] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#B87333]/40 transition-colors">
            <div className="w-12 h-12 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-5">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-serif-display text-xl text-[#1C1C1C] mb-2.5">
              Title-Cleared Properties Only
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#5F5F5F] font-sans leading-relaxed">
              Every resale property undergoes comprehensive legal due diligence, deed validation, and encumbrance checks prior to listing.
            </p>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-[8px] border border-[#E8DED2] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#B87333]/40 transition-colors">
            <div className="w-12 h-12 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-5">
              <TrendingUp className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-serif-display text-xl text-[#1C1C1C] mb-2.5">
              Accurate Market Valuations
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#5F5F5F] font-sans leading-relaxed">
              We leverage real registry transaction data and micro-market trends to ensure realistic valuations for both buyers and sellers.
            </p>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-[8px] border border-[#E8DED2] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#B87333]/40 transition-colors">
            <div className="w-12 h-12 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-5">
              <Building2 className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-serif-display text-xl text-[#1C1C1C] mb-2.5">
              Discreet Private Client Desk
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#5F5F5F] font-sans leading-relaxed">
              High-net-worth sellers benefit from private off-market matchmaking, avoiding public spam and unsolicited calls.
            </p>
          </div>
        </div>
      </section>

      {/* Early Access / Priority Registration Section */}
      <section id="early-access" className="py-16 sm:py-20 bg-[#F5F1EC] border-t border-[#E8DED2]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 sm:p-10 lg:p-12 rounded-[10px] border border-[#E8DED2] shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <div className="text-center mb-8">
              <span className="font-sans text-[11px] font-semibold tracking-[0.28em] uppercase text-[#B87333]">
                Early Access Notification
              </span>
              <h2 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C] mt-1.5 mb-2">
                Register with Our Resale Desk
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#5F5F5F] font-sans">
                Be the first to receive vetted secondary listings or request a confidential appraisal for your home.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#EBF7EE] text-[#1E7E34] flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif-display text-2xl text-[#1C1C1C] mb-2">
                  Thank You for Registering
                </h3>
                <p className="text-[14px] text-[#5F5F5F] max-w-md mx-auto mb-6">
                  Your details have been saved with our private resale team. We will reach out as soon as matching listings are cataloged.
                </p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", email: "", intent: "buy", preferred_locality: "New Town", budget: "", message: "" }); }}
                  className="font-sans text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#B87333] hover:underline"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[4px]">
                    {errorMsg}
                  </div>
                )}

                {/* Intent toggle */}
                <div className="flex rounded-[6px] p-1 bg-[#FAF8F5] border border-[#E8DED2]">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, intent: "buy" }))}
                    className={`flex-1 py-2 text-[12px] font-sans font-semibold uppercase tracking-[0.1em] rounded-[4px] transition-all ${
                      form.intent === "buy"
                        ? "bg-[#35050A] text-white shadow-sm"
                        : "text-[#5F5F5F] hover:text-[#1C1C1C]"
                    }`}
                  >
                    I Want to Buy Resale
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, intent: "sell" }))}
                    className={`flex-1 py-2 text-[12px] font-sans font-semibold uppercase tracking-[0.1em] rounded-[4px] transition-all ${
                      form.intent === "sell"
                        ? "bg-[#35050A] text-white shadow-sm"
                        : "text-[#5F5F5F] hover:text-[#1C1C1C]"
                    }`}
                  >
                    I Want to Sell / List
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#5F5F5F] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Rahul Sen"
                      className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#5F5F5F] mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +91 98300 00000"
                      className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#5F5F5F] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#5F5F5F] mb-1.5">
                      Target Locality
                    </label>
                    <select
                      value={form.preferred_locality}
                      onChange={(e) => setForm({ ...form, preferred_locality: e.target.value })}
                      className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#B87333]"
                    >
                      <option value="New Town">New Town</option>
                      <option value="Rajarhat">Rajarhat</option>
                      <option value="Salt Lake">Salt Lake</option>
                      <option value="EM Bypass">EM Bypass</option>
                      <option value="Alipore / Ballygunge">Alipore / Ballygunge</option>
                      <option value="Other">Other Kolkata Area</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#5F5F5F] mb-1.5">
                    Budget / Expected Price
                  </label>
                  <input
                    type="text"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="e.g. ₹1.2 Cr – ₹1.8 Cr"
                    className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#B87333]"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#5F5F5F] mb-1.5">
                    Additional Details / Property Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Specific requirements, configuration (3 BHK / 4 BHK / Penthouse), or property specifications..."
                    className="w-full p-3.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#B87333]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 flex items-center justify-center gap-2 font-sans text-[13px] font-semibold tracking-[0.1em] uppercase text-white rounded-[4px] transition-all"
                  style={{
                    background: "linear-gradient(135deg, #B77B3E 0%, #D2A15D 100%)",
                    boxShadow: "0 6px 20px rgba(185, 125, 62, 0.20)",
                  }}
                >
                  {submitting ? "Registering Interest…" : "Submit Priority Registration"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Direct Contact Bar */}
      <section className="py-12 bg-white border-t border-[#E8DED2] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-[13px] font-sans text-[#5F5F5F] mb-3">
            Have an immediate resale transaction or need direct consultation?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[13.5px] font-medium text-[#1C1C1C]">
            <a href={`tel:${PHONE_DISPLAY}`} className="flex items-center gap-2 text-[#B87333] hover:underline">
              <Phone className="w-4 h-4" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <span className="text-[#E8DED2]">•</span>
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 text-[#B87333] hover:underline">
              <Mail className="w-4 h-4" />
              <span>{EMAIL}</span>
            </a>
            <span className="text-[#E8DED2]">•</span>
            <Link to="/contact" className="hover:text-[#B87333] transition-colors">
              Schedule Office Meeting
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
