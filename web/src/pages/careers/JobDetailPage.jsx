import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowLeft,
  ArrowRight,
  Share2,
  CheckCircle2,
  Building,
  Sparkles,
  IndianRupee,
  Calendar,
  Award,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Seo from "@/components/Seo";
import api from "@/lib/api";
import { toast } from "sonner";

export default function JobDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchJobDetail() {
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
              ? "This job opening is either filled, archived, or no longer available."
              : "Unable to load job vacancy details. Please try again later."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (slug) fetchJobDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${job?.title || "Career Opening"} | Astittva Marketing`,
          text: `Explore this career opportunity at Astittva Marketing in Kolkata: ${job?.title}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied to clipboard!");
    }
  };

  // Build Schema.org JobPosting Structured Data JSON-LD
  const generateJobPostingSchema = () => {
    if (!job) return null;

    const baseSalary =
      job.salaryRange?.isDisclosed && job.salaryRange?.min > 0
        ? {
            "@type": "MonetaryAmount",
            currency: job.salaryRange.currency || "INR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salaryRange.min,
              maxValue: job.salaryRange.max || job.salaryRange.min,
              unitText: job.salaryRange.period === "monthly" ? "MONTH" : "YEAR",
            },
          }
        : undefined;

    return {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      title: job.title,
      description: job.description || `${job.title} at Astittva Marketing Kolkata`,
      identifier: {
        "@type": "PropertyValue",
        name: "Astittva Marketing",
        value: job.id || job._id,
      },
      datePosted: job.postedAt || job.createdAt || new Date().toISOString(),
      validThrough:
        job.expiresAt ||
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
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
        logo: "https://astittva.in/logo192.png",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Action Area II, New Town",
          addressLocality: "Kolkata",
          addressRegion: "West Bengal",
          postalCode: "700135",
          addressCountry: "IN",
        },
      },
      jobLocationType: job.workplaceType === "Remote" ? "TELECOMMUTE" : undefined,
      applicantLocationRequirements:
        job.workplaceType === "Remote"
          ? {
              "@type": "Country",
              name: "India",
            }
          : undefined,
      baseSalary,
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities.join("; ")
        : undefined,
      qualifications: Array.isArray(job.requirements)
        ? job.requirements.join("; ")
        : undefined,
      experienceRequirements: {
        "@type": "OccupationalExperienceRequirements",
        monthsOfExperience: (job.experienceMinYears || 2) * 12,
      },
    };
  };

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
        <div className="luxury-card rounded-[8px] p-8 shadow-sm">
          <Briefcase className="w-10 h-10 text-copper/40 mx-auto mb-3" />
          <h1 className="text-xl font-display text-ivory mb-2">Opening Not Available</h1>
          <p className="text-sm text-ivory/60 mb-6 font-sans">{error || "This vacancy could not be found."}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/careers/jobs"
              className="px-4 py-2 text-xs uppercase tracking-wider text-ivory border border-copper/40 rounded-[4px] hover:bg-copper/10 transition-colors w-full sm:w-auto font-semibold"
            >
              Browse All Openings
            </Link>
            <Link
              to="/career"
              className="px-4 py-2 text-xs uppercase tracking-[0.12em] text-white font-semibold bg-copper hover:bg-copper-light rounded-[4px] transition-colors w-full sm:w-auto shadow-sm"
            >
              General Application
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const jobSchema = generateJobPostingSchema();

  return (
    <div className="min-h-screen bg-charcoal pt-24 pb-20">
      <Seo
        title={`${job.title} | Career Openings | Astittva Marketing Kolkata`}
        description={job.description ? job.description.slice(0, 160) : `Apply for ${job.title} at Astittva Marketing Kolkata.`}
        path={`/careers/jobs/${job.slug}`}
        jsonLd={jobSchema}
      />

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/careers/jobs"
            className="inline-flex items-center gap-2 text-xs text-copper hover:underline font-semibold uppercase tracking-[0.12em] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Positions
          </Link>
        </div>

        {/* Hero Card */}
        <div className="luxury-card rounded-[8px] p-6 sm:p-10 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {job.isFeatured && (
                  <span className="px-3 py-1 rounded-[3px] text-[11px] font-mono tracking-wider uppercase bg-copper/15 border border-copper/30 text-copper font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Featured Role
                  </span>
                )}
                <span className="px-3 py-1 rounded-[3px] text-[11px] font-mono tracking-wider uppercase bg-charcoal border border-copper/20 text-ivory/80">
                  {job.department}
                </span>
                <span className="px-3 py-1 rounded-[3px] text-[11px] font-mono tracking-wider uppercase bg-charcoal border border-copper/20 text-ivory/80">
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
                      ? `${job.experienceMinYears} - ${job.experienceMaxYears} Years Experience`
                      : job.experienceLevel}
                  </span>
                </div>
                {job.salaryRange?.isDisclosed && job.salaryRange?.min > 0 && (
                  <div className="flex items-center gap-2 text-copper font-medium">
                    <IndianRupee className="w-4 h-4 shrink-0" />
                    <span>
                      ₹{(job.salaryRange.min / 100000).toFixed(1)}L - ₹{(job.salaryRange.max / 100000).toFixed(1)}L PA
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                to={`/careers/jobs/${job.slug}/apply`}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[4px] bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.15em] transition-colors shadow-sm"
              >
                Apply For This Position <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[4px] border border-copper/30 hover:border-copper text-ivory/80 hover:text-white text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
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
              <div className="luxury-card rounded-[8px] p-6 sm:p-8">
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
              <div className="luxury-card rounded-[8px] p-6 sm:p-8">
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
              <div className="luxury-card rounded-[8px] p-6 sm:p-8">
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
              <div className="luxury-card rounded-[8px] p-6 sm:p-8">
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
            <div className="luxury-card rounded-[8px] p-6 text-center shadow-sm">
              <h3 className="text-lg font-display text-ivory mb-2">Ready to Apply?</h3>
              <p className="text-xs text-ivory/60 leading-relaxed mb-5 font-sans">
                Submit your CV and portfolio directly to our talent acquisition team. We typically respond within 3 business days.
              </p>
              <Link
                to={`/careers/jobs/${job.slug}/apply`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[4px] bg-copper hover:bg-copper-light text-white font-semibold text-xs tracking-[0.15em] uppercase transition-colors shadow-sm"
              >
                Apply For This Role <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* At a Glance Box */}
            <div className="luxury-card rounded-[8px] p-6 space-y-4 text-xs font-sans">
              <h4 className="text-xs font-mono uppercase tracking-widest text-copper border-b border-copper/15 pb-2">
                Position Snapshot
              </h4>

              <div className="flex items-center justify-between">
                <span className="text-ivory/60">Department</span>
                <span className="text-ivory font-medium">{job.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ivory/60">Work Location</span>
                <span className="text-ivory font-medium">{job.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ivory/60">Arrangement</span>
                <span className="text-ivory font-medium">{job.workplaceType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ivory/60">Employment</span>
                <span className="text-ivory font-medium">{job.employmentType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ivory/60">Experience</span>
                <span className="text-ivory font-medium">
                  {job.experienceMinYears && job.experienceMaxYears
                    ? `${job.experienceMinYears} - ${job.experienceMaxYears} Yrs`
                    : job.experienceLevel}
                </span>
              </div>
              {job.salaryRange?.isDisclosed && job.salaryRange?.min > 0 && (
                <div className="flex items-center justify-between text-copper font-medium">
                  <span>Compensation</span>
                  <span>₹{(job.salaryRange.min / 100000).toFixed(1)}L - ₹{(job.salaryRange.max / 100000).toFixed(1)}L</span>
                </div>
              )}
            </div>

            {/* Advisory Practice Highlights */}
            <div className="luxury-card rounded-[8px] p-6 text-xs text-ivory/70 space-y-3 font-sans">
              <div className="flex items-center gap-2 text-copper font-medium uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4" /> Why Astittva?
              </div>
              <p>
                We represent Kolkata’s most prestigious residential enclaves in New Town, Rajarhat, and EM Bypass.
              </p>
              <p>
                Consultants enjoy clear commission structures, marketing back-office support, verified developer mandates, and professional executive training.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
