import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Briefcase, Sparkles, Users, Award, 
  ArrowRight, CheckCircle2, Mail, Phone, MapPin, Send 
} from "lucide-react";
import Seo from "@/components/Seo";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { PHONE_DISPLAY, EMAIL, OFFICE_ADDRESS } from "@/lib/site";

export default function CareerPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    role_interest: "Luxury Property Advisory",
    experience: "2-5 years",
    linkedin: "",
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
      await api.post("/leads", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        preferred_locality: "Kolkata HQ",
        property_type: `Career Application: ${form.role_interest} (${form.experience})`,
        investment_purpose: "Career / Employment",
        message: `${form.message ? `${form.message} | ` : ""}LinkedIn / Portfolio: ${form.linkedin || "Not provided"}`,
        source: "career-portal-coming-soon",
      });
      setSubmitted(true);
      toast.success("Profile submitted. Our talent acquisition team will review your application.");
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
        title="Careers at Astittva Marketing — Coming Soon"
        description="Explore career opportunities at Astittva Marketing. Join Kolkata's premier luxury real estate advisory and marketing firm. Portal coming soon."
        path="/career"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#250306] via-[#35050A] to-[#1F0205] text-white py-16 sm:py-24 lg:py-28">
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
            <span className="text-[#C89A55]">Career</span>
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
              Careers Portal Coming Soon
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.15] mb-6"
          >
            Shape the Future of <br className="hidden sm:inline" />
            <span className="italic font-light text-[#E8DCD5]">Luxury Real Estate Advisory</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-[14px] sm:text-[16px] lg:text-[17px] font-sans text-[#E8DCD5]/85 leading-relaxed font-light mb-8"
          >
            We are building Eastern India&apos;s most respected real estate marketing, architectural branding,
            and private client advisory firm. Our formal career application portal is launching shortly.
          </motion.p>

          {/* Direct CTA scroll */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#apply-early"
              className="inline-flex items-center justify-center gap-2 h-[46px] px-7 font-sans text-[12.5px] font-semibold tracking-[0.1em] uppercase text-white rounded-[6px] transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, #B77B3E 0%, #D2A15D 100%)",
                boxShadow: "0 8px 24px rgba(185, 125, 62, 0.25)",
              }}
            >
              <span>Submit Early Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 h-[46px] px-6 font-sans text-[12.5px] font-medium tracking-[0.1em] uppercase text-[#E8DCD5] hover:text-white rounded-[6px] border border-white/20 hover:border-white/40 transition-colors"
            >
              About Astittva
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Astittva */}
      <section className="py-16 sm:py-20 lg:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[#B87333]">
            Life at Astittva
          </span>
          <h2 className="font-serif-display text-2xl sm:text-4xl text-[#1C1C1C] mt-2 mb-3">
            Why Build Your Career With Us
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#5F5F5F] font-sans leading-relaxed">
            A high-performance culture focused on institutional transparency, architectural aesthetics, and exceptional client relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-7 sm:p-8 rounded-[8px] border border-[#E8DED2] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#B87333]/40 transition-colors">
            <div className="w-12 h-12 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-5">
              <Award className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-serif-display text-xl text-[#1C1C1C] mb-2.5">
              Curated Luxury Portfolio
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#5F5F5F] font-sans leading-relaxed">
              Work exclusively with top-tier developments, high-profile developers, and high-net-worth investors across Eastern India.
            </p>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-[8px] border border-[#E8DED2] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#B87333]/40 transition-colors">
            <div className="w-12 h-12 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-5">
              <Users className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-serif-display text-xl text-[#1C1C1C] mb-2.5">
              Leadership &amp; Mentorship
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#5F5F5F] font-sans leading-relaxed">
              Direct collaboration with senior real estate strategists and marketing leaders who champion meritocracy and personal career growth.
            </p>
          </div>

          <div className="bg-white p-7 sm:p-8 rounded-[8px] border border-[#E8DED2] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#B87333]/40 transition-colors">
            <div className="w-12 h-12 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-5">
              <Briefcase className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-serif-display text-xl text-[#1C1C1C] mb-2.5">
              High-Reward Compensation
            </h3>
            <p className="text-[13px] sm:text-[13.5px] text-[#5F5F5F] font-sans leading-relaxed">
              Transparent, industry-leading compensation structures that generously reward performance, integrity, and client satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Openings Preview */}
      <section className="py-12 sm:py-16 bg-[#FAF8F5] border-t border-[#E8DED2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="font-sans text-[11px] font-semibold tracking-[0.28em] uppercase text-[#B87333]">
              Upcoming Openings
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C] mt-1.5">
              Roles Opening Soon in Kolkata
            </h2>
          </div>

          <div className="space-y-3.5">
            {[
              {
                title: "Senior Luxury Real Estate Consultant",
                dept: "Private Client Advisory",
                exp: "3+ Years",
                loc: "New Town / Rajarhat HQ",
              },
              {
                title: "HNI Relationship Manager",
                dept: "Client Relationship Management",
                exp: "2+ Years",
                loc: "Kolkata",
              },
              {
                title: "Real Estate Content & Brand Strategist",
                dept: "Marketing & Communications",
                exp: "2+ Years",
                loc: "Kolkata (Hybrid)",
              },
              {
                title: "Market Research & Investment Analyst",
                dept: "Research & Valuation Desk",
                exp: "1-3 Years",
                loc: "Kolkata",
              },
            ].map((role, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-[6px] border border-[#E8DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#B87333]/40 transition-colors"
              >
                <div>
                  <h3 className="font-serif-display text-lg text-[#1C1C1C]">
                    {role.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-[12px] font-sans text-[#5F5F5F] mt-1">
                    <span>{role.dept}</span>
                    <span>•</span>
                    <span>{role.exp}</span>
                    <span>•</span>
                    <span>{role.loc}</span>
                  </div>
                </div>
                <span className="inline-flex items-center text-[11px] font-semibold tracking-[0.14em] uppercase text-[#B87333] bg-[#FAF8F5] px-3 py-1.5 rounded-[4px] border border-[#E8DED2] self-start sm:self-center">
                  Opening Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Application Form */}
      <section id="apply-early" className="py-16 sm:py-20 bg-[#F5F1EC] border-t border-[#E8DED2]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 sm:p-10 lg:p-12 rounded-[10px] border border-[#E8DED2] shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <div className="text-center mb-8">
              <span className="font-sans text-[11px] font-semibold tracking-[0.28em] uppercase text-[#B87333]">
                Express Your Interest
              </span>
              <h2 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C] mt-1.5 mb-2">
                Submit Your Profile Early
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#5F5F5F] font-sans">
                Our talent acquisition team reviews profiles on a rolling basis prior to public job postings.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#EBF7EE] text-[#1E7E34] flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif-display text-2xl text-[#1C1C1C] mb-2">
                  Application Received
                </h3>
                <p className="text-[14px] text-[#5F5F5F] max-w-md mx-auto mb-6">
                  Thank you for your interest in joining Astittva. Our hiring team will review your profile and reach out if there is an aligned fit.
                </p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", email: "", role_interest: "Luxury Property Advisory", experience: "2-5 years", linkedin: "", message: "" }); }}
                  className="font-sans text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#B87333] hover:underline"
                >
                  Submit Another Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[4px]">
                    {errorMsg}
                  </div>
                )}

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
                      placeholder="e.g. Ananya Roy"
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
                      placeholder="e.g. ananya@example.com"
                      className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#5F5F5F] mb-1.5">
                      Domain of Interest
                    </label>
                    <select
                      value={form.role_interest}
                      onChange={(e) => setForm({ ...form, role_interest: e.target.value })}
                      className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#B87333]"
                    >
                      <option value="Luxury Property Advisory">Luxury Property Advisory</option>
                      <option value="HNI Relationship Management">HNI Relationship Management</option>
                      <option value="Real Estate Marketing & Content">Marketing &amp; Content</option>
                      <option value="Valuation & Market Research">Valuation &amp; Market Research</option>
                      <option value="Operations & Legal Liaison">Operations &amp; Legal Liaison</option>
                      <option value="Other">Other / General Management</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#5F5F5F] mb-1.5">
                      Relevant Experience
                    </label>
                    <select
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#B87333]"
                    >
                      <option value="Entry Level (< 1 year)">Entry Level (&lt; 1 year)</option>
                      <option value="1-3 years">1 – 3 years</option>
                      <option value="3-5 years">3 – 5 years</option>
                      <option value="5-10 years">5 – 10 years</option>
                      <option value="10+ years (Senior / Leadership)">10+ years (Senior / Leadership)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#5F5F5F] mb-1.5">
                      LinkedIn Profile / Portfolio Link
                    </label>
                    <input
                      type="url"
                      value={form.linkedin}
                      onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                      placeholder="e.g. https://linkedin.com/in/username"
                      className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-[4px] text-[13.5px] focus:outline-none focus:border-[#B87333]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#5F5F5F] mb-1.5">
                    Brief Introduction / Highlights
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your background, key transactions, or why you want to join Astittva..."
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
                  {submitting ? "Submitting Profile…" : "Submit Expression of Interest"}
                  {!submitting && <Send className="w-4 h-4" />}
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
            Prefer direct communication? Send your resume or CV directly to our hiring desk:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[13.5px] font-medium text-[#1C1C1C]">
            <a href={`mailto:${EMAIL}?subject=Career%20Inquiry%20-%20Astittva`} className="flex items-center gap-2 text-[#B87333] hover:underline">
              <Mail className="w-4 h-4" />
              <span>{EMAIL}</span>
            </a>
            <span className="text-[#E8DED2]">•</span>
            <span className="flex items-center gap-2 text-[#5F5F5F]">
              <MapPin className="w-4 h-4 text-[#B87333]" />
              <span>{OFFICE_ADDRESS.building}, {OFFICE_ADDRESS.area}, {OFFICE_ADDRESS.city}</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
