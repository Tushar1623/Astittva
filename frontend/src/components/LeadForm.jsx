import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
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
      await api.post("/leads", { ...consultForm, source });
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
      await api.post("/leads", {
        ...contactForm,
        source: source || "contact-page",
        interest: contactForm.property_type,
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
      await api.post("/leads", {
        ...propForm,
        interest: property?.project_name || "Property Enquiry",
        project: property?.project_name || "",
        property_location: property?.location || property?.city || "",
        source: source || `property:${property?.id || ""}`,
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border border-copper/30 p-10 sm:p-14 text-center"
        data-testid="lead-thank-you"
      >
        <div className="w-16 h-16 mx-auto rounded-full border border-copper/40 flex items-center justify-center mb-6">
          <Check className="w-7 h-7 text-copper" strokeWidth={1.4} />
        </div>
        <h3 className="font-serif-display text-3xl sm:text-4xl text-ivory mb-4">
          Thank you.
        </h3>
        <p className="text-[#5F5F5F] font-light leading-[1.85] max-w-md mx-auto">
          Your request has been received. A senior Astittva advisor will reach
          out within one business day with a curated shortlist for you.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <a
            href={whatsappLink(
              variant === "property"
                ? `Hi Astittva, I just submitted an enquiry for ${property?.project_name || "a property"}.`
                : "Hi Astittva, I just submitted a consultation request."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-[#0a0a0a] py-3.5 px-6 text-xs tracking-[0.18em] uppercase font-medium transition"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp Us
          </a>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-ghost justify-center"
          >
            Submit Another
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
          className="input-luxury"
          value={propForm.name}
          onChange={(e) => setPropForm({ ...propForm, name: e.target.value })}
        />
        <input
          required
          type="tel"
          placeholder="Phone"
          data-testid="enquiry-phone"
          className="input-luxury"
          value={propForm.phone}
          onChange={(e) => setPropForm({ ...propForm, phone: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Email"
          data-testid="enquiry-email"
          className="input-luxury"
          value={propForm.email}
          onChange={(e) => setPropForm({ ...propForm, email: e.target.value })}
        />
        <textarea
          rows={3}
          placeholder="Message (optional)"
          data-testid="enquiry-message"
          className="input-luxury"
          value={propForm.message}
          onChange={(e) => setPropForm({ ...propForm, message: e.target.value })}
        />
        <button
          type="submit"
          disabled={submitting}
          data-testid="enquiry-submit-btn"
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Request Brochure & Pricing"}
        </button>
        {errorMsg && (
          <div className="text-red-400 text-xs border border-red-500/30 bg-red-500/5 px-3 py-2">
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
      <form
        onSubmit={handleContactSubmit}
        className="space-y-10"
        data-testid="contact-form"
      >
        <div>
          <div className="overline mb-6">Your Details</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7">
            <div>
              <label className="input-label">Full Name</label>
              <input
                required
                data-testid="contact-name"
                className="input-luxury"
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm({ ...contactForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input
                required
                type="tel"
                data-testid="contact-phone"
                className="input-luxury"
                value={contactForm.phone}
                onChange={(e) =>
                  setContactForm({ ...contactForm, phone: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="input-label">Email</label>
              <input
                required
                type="email"
                data-testid="contact-email"
                className="input-luxury"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm({ ...contactForm, email: e.target.value })
                }
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
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Investment Purpose</label>
              <select
                data-testid="contact-purpose"
                className="input-luxury"
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
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Property Type</label>
              <select
                data-testid="contact-property-type"
                className="input-luxury"
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
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Budget</label>
              <select
                data-testid="contact-budget"
                className="input-luxury"
                value={contactForm.budget}
                onChange={(e) =>
                  setContactForm({ ...contactForm, budget: e.target.value })
                }
              >
                <option value="">Select budget</option>
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="input-label">Timeline to Purchase</label>
              <select
                data-testid="contact-timeline"
                className="input-luxury"
                value={contactForm.timeline}
                onChange={(e) =>
                  setContactForm({ ...contactForm, timeline: e.target.value })
                }
              >
                <option value="">Select timeline</option>
                {TIMELINES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="input-label">Message (optional)</label>
          <textarea
            rows={3}
            data-testid="contact-message"
            className="input-luxury"
            value={contactForm.message}
            onChange={(e) =>
              setContactForm({ ...contactForm, message: e.target.value })
            }
            placeholder="Anything else we should know..."
          />
        </div>

        {errorMsg && (
          <div
            data-testid="contact-error"
            className="text-red-400 text-sm font-light border border-red-500/30 bg-red-500/5 px-4 py-3"
          >
            {errorMsg}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button
            type="submit"
            disabled={submitting}
            data-testid="contact-submit-btn"
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Submit Enquiry"}{" "}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[#5F5F5F] text-xs font-light">
            We respond within 24 business hours. No spam, ever.
          </span>
        </div>
      </form>
    );
  }

  // ----------------------------------------------------
  // VARIANT: Consultation Form (Default / Homepage)
  // ----------------------------------------------------
  return (
    <form
      onSubmit={handleConsultSubmit}
      className="space-y-7 sm:space-y-8"
      data-testid="lead-form"
    >
      <div className="grid grid-cols-12 gap-x-4 sm:gap-x-5 gap-y-7 sm:gap-y-8">
        <div className="col-span-4 sm:col-span-2">
          <label className="input-label">Prefix</label>
          <select
            data-testid="lead-prefix-select"
            value={consultForm.prefix}
            onChange={(e) =>
              setConsultForm({ ...consultForm, prefix: e.target.value })
            }
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
          <input
            required
            type="text"
            data-testid="lead-first-name-input"
            value={consultForm.first_name}
            onChange={(e) =>
              setConsultForm({ ...consultForm, first_name: e.target.value })
            }
            className="input-luxury"
            placeholder="First name"
          />
        </div>
        <div className="col-span-12 sm:col-span-5">
          <label className="input-label">Last Name</label>
          <input
            required
            type="text"
            data-testid="lead-last-name-input"
            value={consultForm.last_name}
            onChange={(e) =>
              setConsultForm({ ...consultForm, last_name: e.target.value })
            }
            className="input-luxury"
            placeholder="Last name"
          />
        </div>
        <div className="col-span-4 sm:col-span-2">
          <label className="input-label">Code</label>
          <input
            required
            type="text"
            data-testid="lead-phone-code-input"
            value={consultForm.phone_code}
            onChange={(e) =>
              setConsultForm({ ...consultForm, phone_code: e.target.value })
            }
            className="input-luxury"
            placeholder="+91"
          />
        </div>
        <div className="col-span-8 sm:col-span-10">
          <label className="input-label">Phone</label>
          <input
            required
            type="tel"
            data-testid="lead-phone-input"
            value={consultForm.phone}
            onChange={(e) =>
              setConsultForm({ ...consultForm, phone: e.target.value })
            }
            className="input-luxury"
            placeholder="Phone number"
          />
        </div>
      </div>
      <div>
        <label className="input-label">Email</label>
        <input
          required
          type="email"
          data-testid="lead-email-input"
          value={consultForm.email}
          onChange={(e) =>
            setConsultForm({ ...consultForm, email: e.target.value })
          }
          className="input-luxury"
          placeholder="you@email.com"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7 sm:gap-y-8">
        <div>
          <label className="input-label">Property Interest</label>
          <select
            data-testid="lead-interest-select"
            value={consultForm.interest}
            onChange={(e) =>
              setConsultForm({ ...consultForm, interest: e.target.value })
            }
            className="input-luxury"
          >
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
          <select
            data-testid="lead-budget-select"
            value={consultForm.budget}
            onChange={(e) =>
              setConsultForm({ ...consultForm, budget: e.target.value })
            }
            className="input-luxury"
          >
            <option value="">Select budget</option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="input-label">Message (optional)</label>
        <textarea
          rows={3}
          data-testid="lead-message-input"
          value={consultForm.message}
          onChange={(e) =>
            setConsultForm({ ...consultForm, message: e.target.value })
          }
          className="input-luxury"
          placeholder="Tell us about your goals..."
        />
      </div>
      <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          data-testid="lead-submit-btn"
          className="btn-primary disabled:opacity-50 w-full sm:w-auto"
        >
          {submitting ? "Sending..." : "Request Consultation"}{" "}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <span className="text-[#9D948B] text-[10px] tracking-[0.25em] uppercase font-light sm:ml-2">
          100% Confidential
        </span>
      </div>
      {errorMsg && (
        <div
          data-testid="lead-error"
          className="text-red-400 text-sm font-light border border-red-500/30 bg-red-500/5 px-4 py-3"
        >
          {errorMsg}
        </div>
      )}
    </form>
  );
}
