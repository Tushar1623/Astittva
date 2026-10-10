import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  Award, ShieldCheck, Compass, Users,
  Mail, Phone, MapPin, ArrowRight, MessageCircle, Check, ChevronDown, Loader2
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { whatsappLink, PHONE_DISPLAY, EMAIL } from "@/lib/site";
import Seo from "@/components/Seo";

const TEXTURE = "https://static.prod-images.emergentagent.com/jobs/50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/images/1f5da7f44ad5aab6c1f6ab3c12df3ec89723084c1042e95749a6b4658dcffcc6.png";

const LOCALITIES = ["New Town", "Rajarhat", "Kolkata (City)", "Salt Lake", "Alipore", "Ballygunge", "Other"];
const PURPOSES = ["Self-Use", "Investment", "Rental Income", "Resale / Flip", "Diversification"];
const PROPERTY_TYPES = ["Residential — Luxury", "Residential — Premium", "Villa / Standalone", "Apartment", "Commercial", "Plot / Land"];
const BUDGETS = ["Under ₹50 L", "₹50 L – ₹1 Cr", "₹1 – 3 Cr", "₹3 – 5 Cr", "₹5 Cr+"];
const TIMELINES = ["Immediate (< 30 days)", "1 – 3 months", "3 – 6 months", "6 – 12 months", "Just exploring"];

const initialForm = {
  name: "", email: "", phone: "",
  preferred_locality: "", investment_purpose: "",
  property_type: "", budget: "", timeline: "",
  message: "",
};

export default function AboutPage({ scrollToContact = false }) {
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (scrollToContact || location.hash === "#contact" || location.pathname === "/contact") {
      setTimeout(() => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [scrollToContact, location.hash, location.pathname]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      await api.post("/leads/property", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        propertyId: "",
        propertyName: form.property_type || "Private Property Consultation",
        location: form.preferred_locality || "Kolkata",
        leadType: "Book Consultation",
        message: form.message,
        source: "about-contact-page",
        budget: form.budget,
        timeline: form.timeline,
        investment_purpose: form.investment_purpose,
        ...form,
        interest: form.property_type,
      });
      setSubmitted(true);
      setForm(initialForm);
      toast.success("Enquiry received. An Astittva advisor will connect shortly.");
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || "Submission failed. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="about-page" className="pt-28 pb-16 sm:pt-32 sm:pb-24">
      <Seo
        title="About &amp; Contact · Astittva Marketing · Luxury Real Estate Advisory"
        description="Astittva Marketing is a premier luxury real estate advisory representing Kolkata's most prestigious developments. Learn about our vision, values, and schedule a private consultation."
        path="/about"
        keywords="About Astittva Marketing, contact Astittva, luxury real estate advisory Kolkata, real estate consultation"
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header Intro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="overline mb-4">About Astittva</div>
          <h1 className="font-display font-light text-3xl sm:text-5xl lg:text-6xl text-ivory tracking-tight max-w-2xl leading-[1.1]">
            <span className="block">
              Find Your{" "}
              <span
                className="italic"
                style={{
                  color: "#B97832",
                  fontWeight: 600,
                  fontSize: "1.05em",
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                Astittva.
              </span>
            </span>
            <span className="block">Build Your Legacy.</span>
          </h1>
          <p className="mt-6 text-ivory/70 font-light text-lg sm:text-xl max-w-3xl leading-relaxed">
            Curated real estate opportunities across the most promising destinations.
          </p>
          <div className="copper-divider mt-10" />
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 mt-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-2xl sm:text-3xl text-ivory mb-6">Our Mission</h2>
            <p className="text-ivory/70 leading-relaxed font-light text-lg">
              At Astittva, our mission is to help buyers and investors make confident real estate decisions through verified properties, expert consultation, and trusted guidance.
            </p>
            <p className="text-ivory/65 leading-relaxed font-light mt-4">
              We believe a property purchase is far more than a transaction — it's the foundation of a family's future or a portfolio's resilience. Every relationship we build starts with that gravity in mind.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-2xl sm:text-3xl text-ivory mb-6">Our Vision</h2>
            <p className="text-ivory/70 leading-relaxed font-light text-lg">
              We are building a growing real estate network across Greater Kolkata, West Bengal, India, and global investment destinations — without ever diluting the personal trust that defines us.
            </p>
            <p className="text-ivory/65 leading-relaxed font-light mt-4">
              From a single advisory office in New Town to a transnational platform — our roadmap is deliberate, our standards uncompromising.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <section className="mt-20 sm:mt-32 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center max-w-2xl mx-auto mb-16">
            <div className="overline mb-4">Our Values</div>
            <h2 className="font-display font-light text-3xl sm:text-4xl text-ivory">The four pillars of how we work.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-copper/15">
            {[
              { icon: ShieldCheck, title: "Integrity", body: "Transparent advice. Always. Even when it costs us a transaction." },
              { icon: Award, title: "Craftsmanship", body: "We partner only with builders who treat construction as artistry." },
              { icon: Compass, title: "Foresight", body: "We don't sell what's hot. We surface what will compound." },
              { icon: Users, title: "Stewardship", body: "Long after the deal closes, we remain accountable to outcomes." },
            ].map((v) => (
              <div key={v.title} className="bg-charcoal p-10">
                <v.icon className="w-8 h-8 text-copper mb-5" strokeWidth={1.2} />
                <h3 className="font-display text-ivory text-xl mb-3 font-normal">{v.title}</h3>
                <p className="text-ivory/60 font-light text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Integrated Contact & Private Consultation Section */}
      <section
        id="contact"
        data-testid="about-contact-section"
        className="relative mt-24 sm:mt-32 lg:mt-36 py-24 sm:py-28 lg:py-32 bg-[#F7F3ED] border-t border-[rgba(74,8,13,0.08)] overflow-hidden"
      >
        {/* Architectural Linework Background (faint geometric linework 0.03 opacity) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(to right, #4A080D 1px, transparent 1px), linear-gradient(to bottom, #4A080D 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Subtle Maroon Radial Glow behind the consultation form */}
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(74, 8, 13, 0.035) 0%, rgba(74, 8, 13, 0) 70%)",
          }}
        />

        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[38%_1fr] gap-12 lg:gap-[70px] xl:gap-[90px] items-start">
            
            {/* LEFT SIDE — EDITORIAL CONTACT AREA (~38%) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-0"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-6 h-[2px] bg-[#B4773F] rounded-full" />
                <span className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.20em] uppercase text-[#B4773F]">
                  Get in Touch
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="text-[36px] sm:text-[46px] lg:text-[46px] xl:text-[52px] font-normal text-[#3A2727] tracking-tight leading-[1.03] mb-5 sm:mb-6">
                <span className="font-sans font-medium block">Let&apos;s begin a</span>
                <span
                  className="italic block font-normal text-[#3A2727]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  conversation.
                </span>
              </h2>

              {/* Introduction Text */}
              <p className="text-[14px] sm:text-[15px] text-[#857873] font-normal leading-[1.7] max-w-[420px]">
                Whether you are planning a luxury home acquisition, commercial investment, or portfolio diversification, our senior advisors are ready to assist.
              </p>

              {/* Contact Information Hierarchy */}
              <div className="mt-10 sm:mt-12 space-y-7 sm:space-y-8">
                {/* Office */}
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.15em] text-[#B4773F] uppercase mb-2">
                    Office
                  </div>
                  <div className="flex items-start gap-2.5 text-[13.5px] sm:text-[14px] text-[#625653] font-normal leading-[1.6]">
                    <MapPin className="w-4 h-4 text-[#4A080D] mt-1 shrink-0" strokeWidth={1.5} />
                    <p>
                      PS IXL Building<br />
                      5th Floor, Room 511<br />
                      Biswa Bangla Sarani, Atghara, New Town<br />
                      Kolkata, West Bengal 700136, India
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.15em] text-[#B4773F] uppercase mb-2">
                    Phone
                  </div>
                  <a
                    href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2.5 text-[13.5px] sm:text-[14px] text-[#625653] hover:text-[#7A3D35] hover:underline underline-offset-4 transition-colors leading-[1.6]"
                  >
                    <Phone className="w-4 h-4 text-[#4A080D] shrink-0" strokeWidth={1.5} />
                    <span>{PHONE_DISPLAY}</span>
                  </a>
                </div>

                {/* Email */}
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.15em] text-[#B4773F] uppercase mb-2">
                    Email
                  </div>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex items-center gap-2.5 text-[13.5px] sm:text-[14px] text-[#625653] hover:text-[#7A3D35] hover:underline underline-offset-4 transition-colors leading-[1.6]"
                  >
                    <Mail className="w-4 h-4 text-[#4A080D] shrink-0" strokeWidth={1.5} />
                    <span>{EMAIL}</span>
                  </a>
                </div>

                {/* Consultation Hours */}
                <div className="border-l-2 border-[#C89A55] pl-4 sm:pl-4.5 py-0.5">
                  <div className="text-[10px] font-semibold tracking-[0.15em] text-[#B4773F] uppercase mb-1">
                    Consultation Hours
                  </div>
                  <p className="text-[13px] sm:text-[13.5px] text-[#625653] font-normal leading-[1.5]">
                    Mon – Sat &nbsp;·&nbsp; 10:00 AM – 7:00 PM IST
                  </p>
                </div>

                {/* WhatsApp / Direct Advisory Button */}
                <div className="pt-2">
                  <a
                    href={whatsappLink("Hi Astittva, I'd like to schedule a consultation.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 bg-[#4A080D] hover:bg-[#651118] text-white h-[44px] px-6 rounded-[5px] text-[10.5px] sm:text-[11px] tracking-[0.10em] uppercase font-semibold transition-all duration-200 shadow-[0_4px_14px_rgba(74,8,13,0.12)] hover:shadow-[0_8px_20px_rgba(74,8,13,0.18)] hover:-translate-y-0.5 group"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>CHAT WITH OUR ADVISOR</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C89A55] transition-transform duration-200 group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE — CONSULTATION FORM (~62%) */}
            <div>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-[rgba(255,255,255,0.70)] backdrop-blur-[12px] border border-[rgba(74,8,13,0.10)] rounded-[11px] p-8 sm:p-12 shadow-[0_20px_60px_rgba(50,20,20,0.07)]"
                  data-testid="contact-thank-you"
                >
                  <div className="w-12 h-12 rounded-full border border-[#C89A55]/40 bg-[#C89A55]/10 flex items-center justify-center mb-6">
                    <Check className="w-5 h-5 text-[#C89A55]" strokeWidth={2} />
                  </div>
                  <div className="w-8 h-[2px] bg-gradient-to-r from-[#4A080D] to-[#C89A55] mb-4 rounded-full" />
                  <h3 className="font-serif-display text-2xl sm:text-3xl text-[#3A2727] font-medium tracking-tight mb-3">
                    Request received.
                  </h3>
                  <p className="text-[#857873] font-normal text-[14.5px] sm:text-[15px] leading-relaxed max-w-xl">
                    Our property advisor will be in touch shortly with verified opportunities tailored to your brief.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-6 border-t border-[rgba(74,8,13,0.08)]">
                    <a
                      href={whatsappLink("Hi Astittva, I just submitted a consultation request.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 bg-[#4A080D] hover:bg-[#651118] text-white h-[44px] px-6 rounded-[5px] text-[10.5px] sm:text-[11px] tracking-[0.10em] uppercase font-semibold transition-all shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" /> Chat With Our Advisor →
                    </a>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="inline-flex items-center justify-center h-[44px] px-6 rounded-[5px] text-[10.5px] sm:text-[11px] tracking-[0.10em] uppercase font-semibold text-[#4A080D] hover:bg-[#4A080D]/5 border border-[#DDD1C8] hover:border-[#B99A82] transition-all"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-[rgba(255,255,255,0.65)] backdrop-blur-[12px] border border-[rgba(74,8,13,0.10)] rounded-[11px] p-6 sm:p-9 lg:p-11 shadow-[0_20px_60px_rgba(50,20,20,0.07)]">
                  {/* Form Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-5 h-[2px] bg-[#B4773F] rounded-full" />
                      <span className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-[#B4773F]">
                        Your Details
                      </span>
                    </div>
                    <h3 className="font-sans text-[22px] sm:text-[26px] font-medium text-[#3A2727] tracking-tight leading-snug">
                      Tell us what you&apos;re looking for.
                    </h3>
                    <p className="mt-1.5 text-[14px] text-[#756762] font-normal leading-relaxed">
                      Share a few details and our property advisor will help you find the right opportunity.
                    </p>
                  </div>

                  <form onSubmit={submit} className="space-y-6 sm:space-y-7" data-testid="contact-form">
                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 sm:gap-x-6 gap-y-4 sm:gap-y-5">
                      <div>
                        <label className="label-consultation">Full Name</label>
                        <input
                          required
                          data-testid="contact-name"
                          className="input-consultation"
                          placeholder="Enter your full name"
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label-consultation">Phone Number</label>
                        <input
                          required
                          type="tel"
                          data-testid="contact-phone"
                          className="input-consultation"
                          placeholder="+91 XXXXX XXXXX"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label-consultation">Email Address</label>
                        <input
                          required
                          type="email"
                          data-testid="contact-email"
                          className="input-consultation"
                          placeholder="name@example.com"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* INVESTMENT BRIEF SECTION */}
                    <div>
                      <div className="flex items-center gap-3 pt-2 mb-5">
                        <span className="text-[10.5px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-[#B4773F]">
                          Investment Brief
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#B4773F]/35 via-[#B4773F]/15 to-transparent" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 sm:gap-x-6 gap-y-4 sm:gap-y-5">
                        <div>
                          <label className="label-consultation">Preferred Locality</label>
                          <div className="relative">
                            <select
                              data-testid="contact-locality"
                              className="input-consultation"
                              value={form.preferred_locality}
                              onChange={(e) => set("preferred_locality", e.target.value)}
                            >
                              <option value="">Select locality</option>
                              {LOCALITIES.map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A080D]" strokeWidth={1.8} />
                          </div>
                        </div>
                        <div>
                          <label className="label-consultation">Investment Purpose</label>
                          <div className="relative">
                            <select
                              data-testid="contact-purpose"
                              className="input-consultation"
                              value={form.investment_purpose}
                              onChange={(e) => set("investment_purpose", e.target.value)}
                            >
                              <option value="">Select purpose</option>
                              {PURPOSES.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A080D]" strokeWidth={1.8} />
                          </div>
                        </div>
                        <div>
                          <label className="label-consultation">Property Type</label>
                          <div className="relative">
                            <select
                              data-testid="contact-property-type"
                              className="input-consultation"
                              value={form.property_type}
                              onChange={(e) => set("property_type", e.target.value)}
                            >
                              <option value="">Select type</option>
                              {PROPERTY_TYPES.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A080D]" strokeWidth={1.8} />
                          </div>
                        </div>
                        <div>
                          <label className="label-consultation">Budget</label>
                          <div className="relative">
                            <select
                              data-testid="contact-budget"
                              className="input-consultation"
                              value={form.budget}
                              onChange={(e) => set("budget", e.target.value)}
                            >
                              <option value="">Select budget</option>
                              {BUDGETS.map((b) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A080D]" strokeWidth={1.8} />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label-consultation">Timeline to Purchase</label>
                          <div className="relative">
                            <select
                              data-testid="contact-timeline"
                              className="input-consultation"
                              value={form.timeline}
                              onChange={(e) => set("timeline", e.target.value)}
                            >
                              <option value="">Select timeline</option>
                              {TIMELINES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A080D]" strokeWidth={1.8} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MESSAGE FIELD */}
                    <div>
                      <label className="label-consultation flex items-center justify-between">
                        <span>Message / Specific Requirements</span>
                        <span className="text-[#857873] font-normal tracking-normal text-[10px]">OPTIONAL</span>
                      </label>
                      <textarea
                        rows={4}
                        data-testid="contact-message"
                        className="input-consultation"
                        value={form.message}
                        onChange={(e) => set("message", e.target.value)}
                        placeholder="Share any preferred developers, unit configurations, or timing constraints..."
                      />
                    </div>

                    {/* ERROR MESSAGE */}
                    {errorMsg && (
                      <div data-testid="contact-error" className="text-[#A43B35] text-[12px] font-medium border border-[#A43B35]/30 bg-[#A43B35]/[0.06] rounded-[4px] px-4 py-2.5">
                        {errorMsg}
                      </div>
                    )}

                    {/* CTA ROW */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
                      <button
                        type="submit"
                        disabled={submitting}
                        data-testid="contact-submit"
                        className="h-[50px] px-7 text-white rounded-[5px] font-semibold text-[11.5px] uppercase tracking-[0.10em] flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group shadow-[0_4px_14px_rgba(74,8,13,0.12)] hover:shadow-[0_10px_25px_rgba(74,8,13,0.18)] hover:-translate-y-px active:translate-y-0"
                        style={{
                          background: "linear-gradient(135deg, #4A080D 0%, #68151B 100%)",
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

                      <div className="flex items-center justify-center sm:justify-start gap-2 text-[#8B7C75] text-[9.5px] sm:text-[10px] tracking-[0.10em] uppercase font-medium">
                        <Check className="w-3.5 h-3.5 text-[#C89A55] shrink-0" strokeWidth={2.2} />
                        <span>100% Confidential · Direct Expert Advisory</span>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
