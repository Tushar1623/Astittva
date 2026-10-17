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
          className="bg-[#181818] border border-copper/30 rounded-2xl p-8 sm:p-12 shadow-2xl text-center backdrop-blur-md"
        >
          {/* Animated Success Icon */}
          <div className="w-16 h-16 rounded-full bg-copper/15 border border-copper/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-copper" />
          </div>

          <span className="text-xs uppercase tracking-widest text-copper font-mono font-medium">
            Application Received
          </span>

          <h1 className="text-2xl sm:text-3xl font-display font-medium text-ivory mt-2 mb-3">
            Thank You, {applicantName || "Candidate"}!
          </h1>

          <p className="text-sm text-ivory/70 leading-relaxed font-sans max-w-lg mx-auto mb-8">
            Your application for{" "}
            <strong className="text-ivory">{jobTitle || "the position"}</strong> has been securely logged with our talent acquisition desk.
          </p>

          {/* Reference Number Box */}
          {referenceNumber && (
            <div className="bg-charcoal border border-copper/40 rounded-xl p-5 max-w-md mx-auto mb-8 shadow-inner">
              <span className="text-[11px] uppercase tracking-wider text-ivory/50 font-mono block mb-1">
                Your Application Reference Number
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl sm:text-2xl font-mono font-bold text-copper tracking-wider">
                  {referenceNumber}
                </span>
                <button
                  type="button"
                  onClick={copyRefNumber}
                  className="p-1.5 rounded-lg text-ivory/60 hover:text-copper hover:bg-white/5 transition-colors"
                  title="Copy Reference Number"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-ivory/40 mt-2">
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
                  <h4 className="font-medium text-ivory">Introductory Discussion</h4>
                  <p className="text-ivory/50 text-xs mt-0.5">
                    Shortlisted candidates are contacted via phone or email for an introductory discovery conversation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-copper/20 text-copper font-mono flex items-center justify-center shrink-0 text-xs font-semibold">
                  3
                </span>
                <div>
                  <h4 className="font-medium text-ivory">In-Person Consultation</h4>
                  <p className="text-ivory/50 text-xs mt-0.5">
                    A face-to-face meeting at our New Town office with senior leadership to assess mutual alignment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/careers/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-copper/40 hover:border-copper text-xs uppercase font-mono tracking-wider text-ivory hover:text-copper transition-colors"
            >
              <Briefcase className="w-4 h-4" /> View More Vacancies
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-copper hover:bg-copper/90 text-charcoal font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg"
            >
              <Home className="w-4 h-4" /> Return to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
