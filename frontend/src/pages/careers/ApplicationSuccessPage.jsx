import { useLocation, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, ArrowRight, Briefcase, Home, Sparkles, Building, Calendar } from "lucide-react";
import Seo from "@/components/Seo";
import { toast } from "sonner";

export default function ApplicationSuccessPage() {
  const location = useLocation();
  const state = location.state || {};

  const { referenceNumber, jobTitle, applicantName, applicantEmail } = state;

  const copyRefNumber = () => {
    if (!referenceNumber) return;
    navigator.clipboard.writeText(referenceNumber);
    toast.success("Reference number copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-charcoal text-ivory pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Seo
        title="Application Received | Astittva Marketing Careers"
        description="Your job application has been successfully received by Astittva Marketing in Kolkata."
        noIndex={true}
      />

      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="luxury-card rounded-[8px] p-8 sm:p-12 shadow-sm text-center"
        >
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-copper/15 border border-copper/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-copper" />
          </div>

          <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper block mb-2">
            APPLICATION LOGGED
          </span>

          <h1 className="text-2xl sm:text-3xl font-display font-medium text-ivory mb-3">
            Thank You, {applicantName || "Candidate"}!
          </h1>

          <p className="text-sm text-ivory/70 leading-relaxed font-sans max-w-lg mx-auto mb-8">
            Your application for{" "}
            <strong className="text-ivory">{jobTitle || "the position"}</strong> has been securely logged with our talent acquisition desk.
          </p>

          {/* Reference Number Box */}
          {referenceNumber && (
            <div className="bg-charcoal-2/60 border border-copper/30 rounded-[6px] p-5 max-w-md mx-auto mb-8 shadow-inner">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/50 font-mono block mb-1">
                Your Application Reference Number
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl sm:text-2xl font-mono font-bold text-copper tracking-wider">
                  {referenceNumber}
                </span>
                <button
                  type="button"
                  onClick={copyRefNumber}
                  className="p-1.5 rounded text-ivory/60 hover:text-copper hover:bg-copper/10 transition-colors"
                  title="Copy Reference Number"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-ivory/50 mt-2">
                Please quote this reference number in any communication regarding your application.
              </p>
            </div>
          )}

          {/* Next Steps Timeline */}
          <div className="border-t border-copper/15 pt-8 mb-8 text-left max-w-lg mx-auto">
            <h3 className="text-xs font-mono uppercase tracking-widest text-copper mb-4">
              What Happens Next:
            </h3>

            <div className="space-y-4 font-sans text-xs sm:text-sm text-ivory/75">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-copper/20 text-copper font-mono flex items-center justify-center shrink-0 text-xs font-semibold">
                  1
                </span>
                <div>
                  <h4 className="font-medium text-ivory">Recruiter Profile Screening</h4>
                  <p className="text-ivory/50 text-xs mt-0.5">
                    Our talent acquisition specialists review your experience, track record, and resume within 3 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-copper/20 text-copper font-mono flex items-center justify-center shrink-0 text-xs font-semibold">
                  2
                </span>
                <div>
                  <h4 className="font-medium text-ivory">Direct Interview Invitation</h4>
                  <p className="text-ivory/50 text-xs mt-0.5">
                    Shortlisted candidates receive an email invitation to interview with our practice directors at our Kolkata offices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-copper/20 text-copper font-mono flex items-center justify-center shrink-0 text-xs font-semibold">
                  3
                </span>
                <div>
                  <h4 className="font-medium text-ivory">Mutual Evaluation &amp; Offer</h4>
                  <p className="text-ivory/50 text-xs mt-0.5">
                    Clear performance milestones, commission structures, and career roadmaps tailored to your strengths.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/careers/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[4px] bg-copper hover:bg-copper-light text-white font-semibold text-xs tracking-[0.15em] uppercase transition-colors shadow-sm"
            >
              Explore Other Positions <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[4px] border border-copper/30 hover:border-copper text-ivory/80 hover:text-white text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
            >
              <Home className="w-4 h-4" /> Return to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
