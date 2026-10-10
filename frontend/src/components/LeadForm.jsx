import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, MessageCircle, ChevronDown, Loader2 } from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { whatsappLink } from "@/lib/site";
import {
  LOCATIONS_CATALOGUE,
  PURPOSES,
  PROPERTY_TYPES,
  BUDGET_OPTIONS,
  TIMELINES,
} from "@/constants/siteData";

export default function LeadForm({
  variant = "consultation", // "consultation" | "contact" | "property"
  property = null,
  source = "homepage",
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Consultation state (split name / prefix / interest)
  const [consultForm, setConsultForm] = useState({
    prefix: "Mr",
    first_name: "",
    last_name: "",
    phone_code: "+91",
    email: "",
    phone: "",
    interest: "",
    budget: "",
    message: "",
  });

  // Contact state (single name / locality / timeline / purpose)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferred_locality: "",
    investment_purpose: "",
    property_type: "",
    budget: "",
    timeline: "",
    message: "",
  });

  // Property detail enquiry state
  const [propForm, setPropForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const fullName = `${consultForm.first_name || ""} ${consultForm.last_name || ""}`.trim() || consultForm.prefix;
      await api.post("/leads/property", {
        name: fullName,
        phone: consultForm.phone,
        email: consultForm.email,
        propertyId: property?.id || property?._id || "",
        propertyName: property?.project_name || property?.title || "",
        location: property?.location || property?.city || consultForm.preferred_locality || "",
        leadType: "Book Consultation",
        message: consultForm.message,
        source: source || "book-consultation",
        budget: consultForm.budget,
        interest: consultForm.interest,
        ...consultForm,
      });
      setSubmitted(true);
      setConsultForm({
        prefix: "Mr",
        first_name: "",
        last_name: "",
        phone_code: "+91",
        email: "",
        phone: "",
        interest: "",
        budget: "",
        message: "",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg =
        formatApiErrorDetail(err.response?.data?.detail) ||
        "Submission failed. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      await api.post("/leads/property", {
        name: contactForm.name,
        phone: contactForm.phone,
        email: contactForm.email,
        propertyId: property?.id || property?._id || "",
        propertyName: property?.project_name || property?.title || "",
        location: property?.location || property?.city || contactForm.preferred_locality || "",
        leadType: contactForm.property_type || "General Enquiry",
        message: contactForm.message,
        source: source || "contact-page",
        budget: contactForm.budget,
        timeline: contactForm.timeline,
        investment_purpose: contactForm.investment_purpose,
        ...contactForm,
      });
      setSubmitted(true);
      setContactForm({
        name: "",
        email: "",
        phone: "",
        preferred_locality: "",
        investment_purpose: "",
        property_type: "",
        budget: "",
        timeline: "",
        message: "",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg =
        formatApiErrorDetail(err.response?.data?.detail) ||
        "Submission failed. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      await api.post("/leads/property", {
        name: propForm.name,
        phone: propForm.phone,
        email: propForm.email,
        propertyId: property?.id || property?._id || "",
        propertyName: property?.project_name || property?.title || "Property Enquiry",
        location: property?.location || property?.city || "",
        leadType: "Property Enquiry",
        message: propForm.message,
        source: source || `property:${property?.id || property?._id || ""}`,
        project: property?.project_name || "",
        property_location: property?.location || property?.city || "",
        interest: property?.project_name || "Property Enquiry",
        ...propForm,
      });
      toast.success("Enquiry sent. Our team will reach out shortly.");
      setSubmitted(true);
      setPropForm({ name: "", email: "", phone: "", message: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg =
        formatApiErrorDetail(err.response?.data?.detail) || "Submission failed";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Render Thank-You State
  // ----------------------------------------------------
  if (submitted) {
    return (
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
          Our property advisor will be in touch shortly with verified opportunities tailored to your brief.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-6 border-t border-[rgba(74,8,13,0.08)]">
          <a
            href={whatsappLink(
              variant === "property"
                ? `Hi Astittva, I just submitted an enquiry for ${property?.project_name || "a property"}.`
                : "Hi Astittva, I just submitted a consultation request."
            )}
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
            Submit Another Request
          </button>
        </div>
      </motion.div>
    );
  }

  // ----------------------------------------------------
  // VARIANT: Property Detail Enquiry Form
  // ----------------------------------------------------
  if (variant === "property") {
    return (
      <form
        onSubmit={handlePropertySubmit}
        className="space-y-4"
        data-testid="property-enquiry-form"
      >
        <input
          required
          placeholder="Name"
          data-testid="enquiry-name"
          className="input-consultation"
          value={propForm.name}
          onChange={(e) => setPropForm({ ...propForm, name: e.target.value })}
        />
        <input
          required
          type="tel"
          placeholder="Phone"
          data-testid="enquiry-phone"
          className="input-consultation"
          value={propForm.phone}
          onChange={(e) => setPropForm({ ...propForm, phone: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Email"
          data-testid="enquiry-email"
          className="input-consultation"
          value={propForm.email}
          onChange={(e) => setPropForm({ ...propForm, email: e.target.value })}
        />
        <textarea
          rows={3}
          placeholder="Message (optional)"
          data-testid="enquiry-message"
          className="input-consultation"
          value={propForm.message}
          onChange={(e) => setPropForm({ ...propForm, message: e.target.value })}
        />
        <button
          type="submit"
          disabled={submitting}
          data-testid="enquiry-submit-btn"
          className="h-[50px] w-full text-white rounded-[5px] font-semibold text-[11.5px] uppercase tracking-[0.10em] flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group shadow-[0_4px_14px_rgba(74,8,13,0.12)] hover:shadow-[0_8px_22px_rgba(74,8,13,0.18)]"
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
            <span>Request Brochure &amp; Pricing</span>
          )}
        </button>
        {errorMsg && (
          <div className="text-[#A43B35] text-[12px] font-medium border border-[#A43B35]/30 bg-[#A43B35]/[0.06] rounded-[4px] px-3.5 py-2">
            {errorMsg}
          </div>
        )}
      </form>
    );
  }

  // ----------------------------------------------------
  // VARIANT: Contact Page Form
  // ----------------------------------------------------
  if (variant === "contact") {
    return (
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

        <form
          onSubmit={handleContactSubmit}
          className="space-y-8 sm:space-y-10"
          data-testid="contact-form"
        >
          {/* SECTION 1: YOUR DETAILS */}
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <span className="text-[11px] sm:text-[12px] font-semibold tracking-[0.18em] uppercase text-[#B4773F]">
                Your Details
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[#B4773F]/35 via-[#B4773F]/15 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 sm:gap-x-6 gap-y-5 sm:gap-y-6">
              <div>
                <label className="label-consultation">Full Name</label>
                <input
                  required
                  data-testid="contact-name"
                  className="input-consultation"
                  placeholder="Enter your full name"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
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
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, phone: e.target.value })
                  }
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
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: INVESTMENT BRIEF */}
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <span className="text-[11px] sm:text-[12px] font-semibold tracking-[0.18em] uppercase text-[#B4773F]">
                Investment Brief
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[#B4773F]/35 via-[#B4773F]/15 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 sm:gap-x-6 gap-y-5 sm:gap-y-6">
              <div>
                <label className="label-consultation">Preferred Locality</label>
                <div className="relative">
                  <select
                    data-testid="contact-locality"
                    className="input-consultation"
                    value={contactForm.preferred_locality}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        preferred_locality: e.target.value,
                      })
                    }
                  >
                    <option value="">Select locality</option>
                    {LOCATIONS_CATALOGUE.map((l) => (
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
                    value={contactForm.investment_purpose}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        investment_purpose: e.target.value,
                      })
                    }
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
                    value={contactForm.property_type}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        property_type: e.target.value,
                      })
                    }
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
                    value={contactForm.budget}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, budget: e.target.value })
                    }
                  >
                    <option value="">Select budget</option>
                    {BUDGET_OPTIONS.map((b) => (
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
                    value={contactForm.timeline}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        timeline: e.target.value,
                      })
                    }
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

          {/* SECTION 3: MESSAGE / SPECIFIC REQUIREMENTS */}
          <div>
            <label className="label-consultation flex items-center justify-between">
              <span>Message / Specific Requirements</span>
              <span className="text-[#817572] font-normal tracking-normal text-[10px]">OPTIONAL</span>
            </label>
            <textarea
              rows={4}
              data-testid="contact-message"
              className="input-consultation"
              value={contactForm.message}
              onChange={(e) =>
                setContactForm({ ...contactForm, message: e.target.value })
              }
              placeholder="Share any preferred developers, unit configurations, or timing constraints..."
            />
          </div>

          {/* ERROR MESSAGE */}
          {errorMsg && (
            <div
              data-testid="contact-error"
              className="text-[#A43B35] text-[12px] font-medium border border-[#A43B35]/30 bg-[#A43B35]/[0.06] rounded-[4px] px-4 py-2.5"
            >
              {errorMsg}
            </div>
          )}

          {/* CTA ROW */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
            <button
              type="submit"
              disabled={submitting}
              data-testid="contact-submit-btn"
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
    );
  }

  // ----------------------------------------------------
  // VARIANT: Consultation Form (Default / Homepage)
  // ----------------------------------------------------
  return (
    <div className="bg-[rgba(255,255,255,0.58)] backdrop-blur-[12px] border border-[rgba(74,8,13,0.10)] rounded-[12px] sm:rounded-[14px] p-6 sm:p-9 md:p-11 shadow-[0_12px_40px_rgba(40,10,10,0.06)]">
      <form
        onSubmit={handleConsultSubmit}
        className="space-y-6 sm:space-y-7"
        data-testid="lead-form"
      >
        <div className="grid grid-cols-12 gap-x-4 sm:gap-x-5 gap-y-5 sm:gap-y-6">
          <div className="col-span-4 sm:col-span-2">
            <label className="label-consultation">Prefix</label>
            <div className="relative">
              <select
                data-testid="lead-prefix-select"
                value={consultForm.prefix}
                onChange={(e) =>
                  setConsultForm({ ...consultForm, prefix: e.target.value })
                }
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
            <label className="label-consultation">First Name</label>
            <input
              required
              type="text"
              data-testid="lead-first-name-input"
              value={consultForm.first_name}
              onChange={(e) =>
                setConsultForm({ ...consultForm, first_name: e.target.value })
              }
              className="input-consultation"
              placeholder="First name"
            />
          </div>
          <div className="col-span-12 sm:col-span-5">
            <label className="label-consultation">Last Name</label>
            <input
              required
              type="text"
              data-testid="lead-last-name-input"
              value={consultForm.last_name}
              onChange={(e) =>
                setConsultForm({ ...consultForm, last_name: e.target.value })
              }
              className="input-consultation"
              placeholder="Last name"
            />
          </div>
          <div className="col-span-4 sm:col-span-3">
            <label className="label-consultation">Code</label>
            <input
              required
              type="text"
              data-testid="lead-phone-code-input"
              value={consultForm.phone_code}
              onChange={(e) =>
                setConsultForm({ ...consultForm, phone_code: e.target.value })
              }
              className="input-consultation"
              placeholder="+91"
            />
          </div>
          <div className="col-span-8 sm:col-span-9">
            <label className="label-consultation">Phone Number</label>
            <input
              required
              type="tel"
              data-testid="lead-phone-input"
              value={consultForm.phone}
              onChange={(e) =>
                setConsultForm({ ...consultForm, phone: e.target.value })
              }
              className="input-consultation"
              placeholder="Phone number"
            />
          </div>
        </div>

        <div>
          <label className="label-consultation">Email Address</label>
          <input
            required
            type="email"
            data-testid="lead-email-input"
            value={consultForm.email}
            onChange={(e) =>
              setConsultForm({ ...consultForm, email: e.target.value })
            }
            className="input-consultation"
            placeholder="you@email.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 sm:gap-x-6 gap-y-5 sm:gap-y-6">
          <div>
            <label className="label-consultation">Property Interest</label>
            <div className="relative">
              <select
                data-testid="lead-interest-select"
                value={consultForm.interest}
                onChange={(e) =>
                  setConsultForm({ ...consultForm, interest: e.target.value })
                }
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
            <label className="label-consultation">Budget</label>
            <div className="relative">
              <select
                data-testid="lead-budget-select"
                value={consultForm.budget}
                onChange={(e) =>
                  setConsultForm({ ...consultForm, budget: e.target.value })
                }
                className="input-consultation"
              >
                <option value="">Select budget</option>
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A080D]" strokeWidth={1.8} />
            </div>
          </div>
        </div>

        <div>
          <label className="label-consultation flex items-center justify-between">
            <span>Message / Specific Requirements</span>
            <span className="text-[#817572] font-normal tracking-normal text-[10px]">OPTIONAL</span>
          </label>
          <textarea
            rows={3}
            data-testid="lead-message-input"
            value={consultForm.message}
            onChange={(e) =>
              setConsultForm({ ...consultForm, message: e.target.value })
            }
            className="input-consultation"
            placeholder="Tell us about your goals..."
          />
        </div>

        {errorMsg && (
          <div
            data-testid="lead-error"
            className="text-[#A43B35] text-[12px] font-medium border border-[#A43B35]/30 bg-[#A43B35]/[0.06] rounded-[4px] px-4 py-2.5"
          >
            {errorMsg}
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
  );
}
