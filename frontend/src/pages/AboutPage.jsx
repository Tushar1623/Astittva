import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  Award, ShieldCheck, Compass, Users,
  Mail, Phone, MapPin, ArrowRight, MessageCircle, Check
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
      await api.post("/leads", { ...form, source: "about-contact-page", interest: form.property_type });
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

        {/* Integrated Contact & Private Consultation Section */}
        <section id="contact" data-testid="about-contact-section" className="mt-24 sm:mt-36 scroll-mt-28">
          <div className="copper-divider mb-16" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 sm:mb-16"
          >
            <div className="overline mb-4">Get in Touch</div>
            <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05] max-w-3xl">
              Let&apos;s begin a <span className="italic text-[#B97832]">conversation.</span>
            </h2>
            <p className="mt-5 sm:mt-6 text-muted-fg font-light max-w-2xl leading-[1.85] text-base">
              Whether you are planning a luxury home acquisition, commercial investment, or portfolio diversification, our senior advisors are ready to assist.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left Contact Details */}
            <div className="lg:col-span-4 space-y-10">
              {[
                {
                  label: "Office",
                  value: (
                    <p className="leading-[1.75]">
                      PS IXL Building<br />
                      5th Floor, Room 511<br />
                      Biswa Bangla Sarani<br />
                      Atghara, New Town<br />
                      Kolkata, West Bengal 700136<br />
                      India
                    </p>
                  ),
                  icon: MapPin,
                },
                {
                  label: "Phone",
                  value: (
                    <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="hover:text-copper transition-colors">
                      {PHONE_DISPLAY}
                    </a>
                  ),
                  icon: Phone,
                },
                {
                  label: "Email",
                  value: (
                    <a href={`mailto:${EMAIL}`} className="hover:text-copper transition-colors">
                      {EMAIL}
                    </a>
                  ),
                  icon: Mail,
                },
              ].map((b) => (
                <div key={b.label}>
                  <div className="overline mb-3">{b.label}</div>
                  <div className="flex items-start gap-4 text-[#2A2A2A] font-light">
                    <b.icon className="w-5 h-5 text-copper mt-0.5 shrink-0" strokeWidth={1.2} />
                    <div>{b.value}</div>
                  </div>
                </div>
              ))}

              <div className="pt-8 border-t border-[#E8DED2]">
                <div className="overline mb-3">Consultation Hours</div>
                <p className="text-[#2A2A2A] font-light text-sm">Mon – Sat &nbsp;·&nbsp; 10:00 AM – 7:00 PM IST</p>
              </div>

              <a
                href={whatsappLink("Hi Astittva, I'd like to schedule a consultation.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-[#050505] px-6 py-4 text-xs tracking-[0.18em] uppercase font-medium transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> Instant WhatsApp Advisory
              </a>
            </div>

            {/* Right Contact Form */}
            <div className="lg:col-span-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="border border-copper/30 p-10 sm:p-14 bg-white/40"
                  data-testid="contact-thank-you"
                >
                  <div className="w-16 h-16 rounded-full border border-copper/40 flex items-center justify-center mb-6">
                    <Check className="w-7 h-7 text-copper" strokeWidth={1.4} />
                  </div>
                  <h3 className="font-serif-display text-3xl sm:text-4xl text-ivory mb-4">Thank you.</h3>
                  <p className="text-muted-fg font-light leading-[1.85] max-w-xl">
                    Your enquiry has been received. A senior Astittva advisor will reach out within one business day with verified opportunities tailored to your brief.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <a
                      href={whatsappLink("Hi Astittva, I just submitted a consultation request.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-[#050505] py-3.5 px-6 text-xs tracking-[0.18em] uppercase font-medium transition"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp Us
                    </a>
                    <button onClick={() => setSubmitted(false)} className="btn-ghost justify-center">
                      Submit Another Request
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={submit} className="space-y-10" data-testid="contact-form">
                  <div>
                    <div className="overline mb-6">Your Details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7">
                      <div>
                        <label className="input-label">Full Name</label>
                        <input
                          required
                          data-testid="contact-name"
                          className="input-luxury"
                          value={form.name}
                          onChange={(e) => set("name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="input-label">Phone</label>
                        <input
                          required
                          type="tel"
                          data-testid="contact-phone"
                          className="input-luxury"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="input-label">Email</label>
                        <input
                          required
                          type="email"
                          data-testid="contact-email"
                          className="input-luxury"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="overline mb-6">Investment Brief</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7">
                      <div>
                        <label className="input-label">Preferred Locality</label>
                        <select
                          data-testid="contact-locality"
                          className="input-luxury"
                          value={form.preferred_locality}
                          onChange={(e) => set("preferred_locality", e.target.value)}
                        >
                          <option value="">Select locality</option>
                          {LOCALITIES.map((l) => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Investment Purpose</label>
                        <select
                          data-testid="contact-purpose"
                          className="input-luxury"
                          value={form.investment_purpose}
                          onChange={(e) => set("investment_purpose", e.target.value)}
                        >
                          <option value="">Select purpose</option>
                          {PURPOSES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Property Type</label>
                        <select
                          data-testid="contact-property-type"
                          className="input-luxury"
                          value={form.property_type}
                          onChange={(e) => set("property_type", e.target.value)}
                        >
                          <option value="">Select type</option>
                          {PROPERTY_TYPES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Budget</label>
                        <select
                          data-testid="contact-budget"
                          className="input-luxury"
                          value={form.budget}
                          onChange={(e) => set("budget", e.target.value)}
                        >
                          <option value="">Select budget</option>
                          {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="input-label">Timeline to Purchase</label>
                        <select
                          data-testid="contact-timeline"
                          className="input-luxury"
                          value={form.timeline}
                          onChange={(e) => set("timeline", e.target.value)}
                        >
                          <option value="">Select timeline</option>
                          {TIMELINES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Message / Specific Requirements (optional)</label>
                    <textarea
                      rows={3}
                      data-testid="contact-message"
                      className="input-luxury"
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      placeholder="Share any preferred developers, unit configurations, or timing constraints..."
                    />
                  </div>

                  {errorMsg && (
                    <div data-testid="contact-error" className="text-red-400 text-sm font-light border border-red-500/30 bg-red-500/5 px-4 py-3">
                      {errorMsg}
                    </div>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                    <button
                      type="submit"
                      disabled={submitting}
                      data-testid="contact-submit"
                      className="btn-primary disabled:opacity-50 w-full sm:w-auto"
                    >
                      {submitting ? "Sending..." : "Submit Consultation Request"} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[#9D948B] text-[10px] tracking-[0.25em] uppercase font-light sm:ml-2">
                      100% Confidential · Direct Expert Advisory
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
