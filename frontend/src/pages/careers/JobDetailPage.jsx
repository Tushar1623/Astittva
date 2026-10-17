import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  Building,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Share2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Mail,
  Phone,
} from "lucide-react";
import Seo from "@/components/Seo";
import { buildBreadcrumbSchema } from "@/lib/seoConfig";
import api, { formatApiErrorDetail } from "@/lib/api";
import { LOGO_URL, EMAIL, PHONE_DISPLAY, OFFICE_ADDRESS } from "@/lib/site";
import { toast } from "sonner";

export default function JobDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadJob() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/jobs/${slug}`);
        if (isMounted) {
          setJob(res.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load job details:", err);
          setError(
            err.response?.status === 404
              ? "This job opening was not found or is no longer accepting applications."
              : formatApiErrorDetail(err.response?.data?.detail)
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadJob();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job?.title} | Astittva Careers`,
          text: `Explore this career opportunity at Astittva Marketing in Kolkata: ${job?.title}`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Job link copied to clipboard!");
    }
  };

  const breadcrumbs = useMemo(
    () => [
      { name: "Home", url: "https://astittva.in/" },
      { name: "Careers", url: "https://astittva.in/career" },
      { name: "Job Openings", url: "https://astittva.in/careers/jobs" },
      { name: job?.title || "Job Detail", url: `https://astittva.in/careers/jobs/${slug}` },
    ],
    [job?.title, slug]
  );

  // Schema.org JobPosting JSON-LD
  const jobPostingSchema = useMemo(() => {
    if (!job) return null;

    const responsibilitiesText = Array.isArray(job.responsibilities)
      ? job.responsibilities.join(". ")
      : "";
    const requirementsText = Array.isArray(job.requirements)
      ? job.requirements.join(". ")
      : "";
    const fullDescription = `${job.description || ""} ${
      responsibilitiesText ? `Responsibilities: ${responsibilitiesText}. ` : ""
    }${requirementsText ? `Requirements: ${requirementsText}.` : ""}`.trim();

    const schema = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: fullDescription || job.title,
      identifier: {
        "@type": "PropertyValue",
        name: "Astittva Marketing",
        value: job.slug,
      },
      datePosted: job.postedAt || job.createdAt || "2026-10-15T00:00:00Z",
      validThrough:
        job.expiresAt ||
        new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      employmentType:
        job.employmentType === "Part-time"
          ? "PART_TIME"
          : job.employmentType === "Contract"
          ? "CONTRACTOR"
          : job.employmentType === "Internship"
          ? "INTERN"
          : "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: "Astittva Marketing",
        sameAs: "https://astittva.in",
        logo: LOGO_URL,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          streetAddress: "New Town",
          addressLocality: "Kolkata",
          addressRegion: "West Bengal",
          postalCode: "700156",
          addressCountry: "IN",
        },
      },
    };

    if (job.salaryRange?.isDisclosed && job.salaryRange?.min > 0) {
      schema.baseSalary = {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          minValue: job.salaryRange.min,
          maxValue: job.salaryRange.max,
          unitText: job.salaryRange.period === "monthly" ? "MONTH" : "YEAR",
        },
      };
    }

    return schema;
  }, [job]);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal text-ivory pt-32 pb-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-copper border-t-transparent mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-copper/60">Loading Position Details…</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-charcoal text-ivory pt-32 pb-20 px-4 max-w-xl mx-auto text-center">
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-8 shadow-xl">
          <Briefcase className="w-10 h-10 text-copper/40 mx-auto mb-3" />
          <h1 className="text-xl font-display text-ivory mb-2">Opening Not Available</h1>
          <p className="text-sm text-ivory/60 mb-6 font-sans">{error || "This vacancy could not be found."}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/careers/jobs"
              className="px-4 py-2 text-xs uppercase tracking-wider text-ivory border border-copper/40 rounded-lg hover:bg-copper/10 transition-colors w-full sm:w-auto"
            >
              Browse All Openings
            </Link>
            <Link
              to="/career"
              className="px-4 py-2 text-xs uppercase tracking-wider text-charcoal font-semibold bg-copper hover:bg-copper/90 rounded-lg transition-colors w-full sm:w-auto"
            >
              General Application
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-ivory pt-24 pb-20">
      <Seo
        title={`${job.title} | Careers at Astittva Marketing Kolkata`}
        description={`Apply for ${job.title} in ${job.location} with Astittva Marketing. ${
          job.description ? job.description.slice(0, 150) + "..." : "Join Kolkata's premier luxury real estate advisory firm."
        }`}
        canonical={`https://astittva.in/careers/jobs/${job.slug}`}
        jsonLd={[buildBreadcrumbSchema(breadcrumbs), jobPostingSchema].filter(Boolean)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/careers/jobs"
            className="inline-flex items-center gap-2 text-xs text-copper hover:text-copper/80 font-mono tracking-wider uppercase transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Positions
          </Link>
        </div>

        {/* Hero Card */}
        <div className="bg-[#181818] border border-copper/30 rounded-2xl p-6 sm:p-10 mb-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {job.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-copper/20 border border-copper/40 text-copper font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Featured Role
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-ivory/80">
                  {job.department}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-ivory/80">
                  {job.employmentType}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-ivory tracking-tight mb-4">
                {job.title}
              </h1>

              {/* Quick Info Grid */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-ivory/70">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-copper shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-copper shrink-0" />
                  <span>{job.workplaceType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-copper shrink-0" />
                  <span>
                    {job.experienceMinYears && job.experienceMaxYears
                      ? `${job.experienceMinYears} - ${job.experienceMaxYears} Years Exp.`
                      : job.experienceLevel}
                  </span>
                </div>
                {job.salaryRange?.isDisclosed && job.salaryRange?.min > 0 && (
                  <div className="flex items-center gap-1.5 text-copper font-medium">
                    <IndianRupee className="w-4 h-4 shrink-0" />
                    <span>
                      ₹{(job.salaryRange.min / 100000).toFixed(1)}L - ₹{(job.salaryRange.max / 100000).toFixed(1)}L PA
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                to={`/careers/jobs/${job.slug}/apply`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-copper hover:bg-copper/90 text-charcoal font-semibold text-xs tracking-wider uppercase shadow-xl transition-all"
              >
                Apply for this Position <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-copper/30 hover:border-copper text-xs font-mono tracking-wider uppercase text-ivory hover:text-copper transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share Position
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Role Overview */}
            {job.description && (
              <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 sm:p-8">
                <h2 className="text-xl font-display text-ivory mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-copper" /> Role Overview
                </h2>
                <div className="text-sm sm:text-base text-ivory/80 leading-relaxed font-sans whitespace-pre-line space-y-4">
                  {job.description}
                </div>
              </div>
            )}

            {/* Key Responsibilities */}
            {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
              <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 sm:p-8">
                <h2 className="text-xl font-display text-ivory mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-copper" /> Key Responsibilities
                </h2>
                <ul className="space-y-3 font-sans text-sm sm:text-base text-ivory/80">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-copper mt-2 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements & Qualifications */}
            {Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 sm:p-8">
                <h2 className="text-xl font-display text-ivory mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-copper" /> Candidate Requirements
                </h2>
                <ul className="space-y-3 font-sans text-sm sm:text-base text-ivory/80">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-copper mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits & Perks */}
            {Array.isArray(job.benefits) && job.benefits.length > 0 && (
              <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 sm:p-8">
                <h2 className="text-xl font-display text-ivory mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-copper" /> What We Offer
                </h2>
                <ul className="space-y-3 font-sans text-sm sm:text-base text-ivory/80">
                  {job.benefits.map((ben, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-copper mt-2 shrink-0" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-[#181818] border border-copper/30 rounded-xl p-6 text-center shadow-xl">
              <h3 className="text-lg font-display text-ivory mb-2">Ready to Apply?</h3>
              <p className="text-xs text-ivory/60 leading-relaxed mb-5 font-sans">
                Submit your CV and portfolio directly to our talent acquisition team. We typically respond within 3 business days.
              </p>
              <Link
                to={`/careers/jobs/${job.slug}/apply`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-copper hover:bg-copper/90 text-charcoal font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                Submit Application <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Position Summary Meta */}
            <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 space-y-4 text-xs font-sans">
              <h4 className="text-sm font-display text-ivory border-b border-copper/15 pb-2">
                Position Details
              </h4>
              <div className="flex justify-between py-1">
                <span className="text-ivory/50">Department</span>
                <span className="text-ivory font-medium">{job.department}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ivory/50">Location</span>
                <span className="text-ivory font-medium">{job.location}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ivory/50">Employment</span>
                <span className="text-ivory font-medium">{job.employmentType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ivory/50">Workplace</span>
                <span className="text-ivory font-medium">{job.workplaceType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ivory/50">Experience</span>
                <span className="text-ivory font-medium">
                  {job.experienceMinYears && job.experienceMaxYears
                    ? `${job.experienceMinYears}-${job.experienceMaxYears} yrs`
                    : job.experienceLevel}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ivory/50">Posted</span>
                <span className="text-ivory font-medium">
                  {job.postedAt ? new Date(job.postedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Active"}
                </span>
              </div>
            </div>

            {/* Direct HR Support Card */}
            <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 text-xs text-ivory/70 space-y-3 font-sans">
              <h4 className="text-sm font-display text-ivory">Recruitment Queries</h4>
              <p className="leading-relaxed text-ivory/60">
                Have questions regarding this role or our hiring process? Reach out directly to our HR desk.
              </p>
              <div className="pt-2 space-y-2">
                <a
                  href={`mailto:${EMAIL}?subject=Inquiry regarding ${encodeURIComponent(job.title)}`}
                  className="flex items-center gap-2 text-copper hover:text-copper/80 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{EMAIL}</span>
                </a>
                <a
                  href={`tel:${PHONE_DISPLAY.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-2 text-copper hover:text-copper/80 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{PHONE_DISPLAY}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
