import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, MessageCircle, Check } from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { whatsappLink, PHONE_DISPLAY, EMAIL } from "@/lib/site";
import Seo from "@/components/Seo";

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

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setErrorMsg("");
    try {
      await api.post("/leads", { ...form, source: "contact-page", interest: form.property_type });
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || "Submission failed. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page" className="relative text-ivory">
      <Seo
        title="Contact Astittva Marketing · Private Consultation"
        description="Schedule a private consultation with Astittva Marketing. Call +91 92303 74700, email contact@astittva.in, or send an enquiry online. We respond within one business day for property visits, advisory and luxury real estate enquiries in Kolkata."
        path="/contact"
        keywords="contact Astittva Marketing, real estate consultation Kolkata, property advisory enquiry"
      />
      <section className="pt-32 sm:pt-40 pb-12 sm:pb-16 border-b border-copper/10">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="eyebrow-line mb-6"><span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">Contact</span></div>
            <h1 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05] max-w-3xl">
              Let&apos;s begin a <span className="italic text-[#5F5F5F]">conversation.</span>
            </h1>
            <p className="mt-5 sm:mt-6 text-muted-fg font-light max-w-2xl leading-[1.85] text-base">
              Reach out for a private consultation, property visit, or general advisory. We respond within one business day.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left — contact info */}
            <div className="lg:col-span-4 space-y-10">
              {[
                { label: "Office", value: (
                  <p className="leading-[1.75]">
                    PS IXL Building<br />
                    5th Floor, Room 511<br />
                    Biswa Bangla Sarani<br />
                    Atghara, New Town<br />
                    Kolkata, West Bengal 700136<br />
                    India
                  </p>
                ), icon: MapPin },
                { label: "Phone", value: <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="hover:text-copper">{PHONE_DISPLAY}</a>, icon: Phone },
                { label: "Email", value: <a href={`mailto:${EMAIL}`} className="hover:text-copper">{EMAIL}</a>, icon: Mail },
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
                <div className="overline mb-3">Hours</div>
                <p className="text-[#2A2A2A] font-light text-sm">Mon – Sat &nbsp;·&nbsp; 10:00 AM – 7:00 PM IST</p>
              </div>

              <a
                href={whatsappLink("Hi Astittva, I'd like immediate advisory.")}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-[#050505] px-6 py-4 text-xs tracking-[0.18em] uppercase font-medium transition"
              >
                <MessageCircle className="w-4 h-4" /> Instant WhatsApp Reply
              </a>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                  className="border border-copper/30 p-10 sm:p-14"
                  data-testid="contact-thank-you"
                >
                  <div className="w-16 h-16 rounded-full border border-copper/40 flex items-center justify-center mb-6">
                    <Check className="w-7 h-7 text-copper" strokeWidth={1.4} />
                  </div>
                  <h3 className="font-serif-display text-3xl sm:text-4xl text-ivory mb-4">Thank you.</h3>
                  <p className="text-muted-fg font-light leading-[1.85] max-w-xl">
                    Your enquiry has been received. A senior Astittva advisor will reach out within one business day with a curated shortlist tailored to your goals.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <a href={whatsappLink("Hi Astittva, I just submitted a contact form.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-[#050505] py-3.5 px-6 text-xs tracking-[0.18em] uppercase font-medium transition">
                      <MessageCircle className="w-4 h-4" /> WhatsApp Us
                    </a>
                    <button onClick={() => setSubmitted(false)} className="btn-ghost justify-center">Submit Another</button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={submit} className="space-y-10" data-testid="contact-form">
                  <div>
                    <div className="overline mb-6">Your Details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7">
                      <div><label className="input-label">Full Name</label><input required data-testid="contact-name" className="input-luxury" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
                      <div><label className="input-label">Phone</label><input required type="tel" data-testid="contact-phone" className="input-luxury" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
                      <div className="sm:col-span-2"><label className="input-label">Email</label><input required type="email" data-testid="contact-email" className="input-luxury" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
                    </div>
                  </div>

                  <div>
                    <div className="overline mb-6">Investment Brief</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7">
                      <div>
                        <label className="input-label">Preferred Locality</label>
                        <select data-testid="contact-locality" className="input-luxury" value={form.preferred_locality} onChange={(e) => set("preferred_locality", e.target.value)}>
                          <option value="">Select locality</option>
                          {LOCALITIES.map((l) => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Investment Purpose</label>
                        <select data-testid="contact-purpose" className="input-luxury" value={form.investment_purpose} onChange={(e) => set("investment_purpose", e.target.value)}>
                          <option value="">Select purpose</option>
                          {PURPOSES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Property Type</label>
                        <select data-testid="contact-property-type" className="input-luxury" value={form.property_type} onChange={(e) => set("property_type", e.target.value)}>
                          <option value="">Select type</option>
                          {PROPERTY_TYPES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Budget</label>
                        <select data-testid="contact-budget" className="input-luxury" value={form.budget} onChange={(e) => set("budget", e.target.value)}>
                          <option value="">Select budget</option>
                          {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="input-label">Timeline to Purchase</label>
                        <select data-testid="contact-timeline" className="input-luxury" value={form.timeline} onChange={(e) => set("timeline", e.target.value)}>
                          <option value="">Select timeline</option>
                          {TIMELINES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Message (optional)</label>
                    <textarea rows={3} data-testid="contact-message" className="input-luxury" value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Anything else we should know..." />
                  </div>

                  {errorMsg && (
                    <div data-testid="contact-error" className="text-red-400 text-sm font-light border border-red-500/30 bg-red-500/5 px-4 py-3">
                      {errorMsg}
                    </div>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                    <button type="submit" disabled={submitting} data-testid="contact-submit" className="btn-primary disabled:opacity-50 w-full sm:w-auto">
                      {submitting ? "Sending..." : "Send Enquiry"} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[#9D948B] text-[10px] tracking-[0.25em] uppercase font-light sm:ml-2">100% Confidential · No Spam</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
