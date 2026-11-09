import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, ArrowRight, Briefcase, Home, Sparkles } from "lucide-react";
import Seo from "@/components/Seo";
import { toast } from "sonner";

export default function ApplicationSuccessPage() {
  const location = useLocation();
  const state = location.state || {};

  const { referenceNumber, jobTitle, applicantName } = state;

  const copyRefNumber = () => {
    if (!referenceNumber) return;
    navigator.clipboard.writeText(referenceNumber);
    toast.success("Reference number copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
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
          className="bg-white border border-[#E8DED2] rounded-2xl p-8 sm:p-12 shadow-xs text-center"
        >
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-[#B87333]/15 border border-[#B87333]/40 flex items-center justify-center mx-auto mb-6 text-[#B87333]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#B87333] block mb-2 font-mono">
            APPLICATION LOGGED
          </span>

          <h1 className="text-2xl sm:text-4xl font-serif-display font-medium text-[#1C1C1C] mb-3">
            Thank You, {applicantName || "Candidate"}!
          </h1>

          <p className="text-sm sm:text-base text-[#5F5F5F] leading-relaxed max-w-lg mx-auto mb-8 font-light">
            Your application for{" "}
            <strong className="text-[#1C1C1C] font-semibold">{jobTitle || "the position"}</strong> has been securely logged with our talent acquisition desk.
          </p>

          {/* Reference Number Box */}
          {referenceNumber && (
            <div className="bg-[#FAF8F5] border border-[#B87333]/30 rounded-xl p-5 max-w-md mx-auto mb-8">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C827A] font-mono block mb-1">
                Your Application Reference Number
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl sm:text-2xl font-mono font-bold text-[#B87333] tracking-wider">
                  {referenceNumber}
                </span>
                <button
                  type="button"
                  onClick={copyRefNumber}
                  className="p-1.5 rounded text-[#5F5F5F] hover:text-[#B87333] hover:bg-[#B87333]/10 transition-colors cursor-pointer"
                  title="Copy Reference Number"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-[#8C827A] mt-2">
                Please quote this reference number in any communication regarding your application.
              </p>
            </div>
          )}

          {/* Next Steps Timeline */}
          <div className="border-t border-[#E8DED2] pt-8 mb-8 text-left max-w-lg mx-auto">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#B87333] mb-5 font-semibold">
              What Happens Next:
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-[#4A4A4A]">
              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#B87333]/15 text-[#B87333] font-mono flex items-center justify-center shrink-0 text-xs font-semibold">
                  1
                </span>
                <div>
                  <h4 className="font-semibold text-[#1C1C1C]">Recruiter Profile Screening</h4>
                  <p className="text-[#5F5F5F] text-xs mt-0.5 leading-relaxed font-light">
                    Our talent acquisition specialists review your experience, track record, and resume within 3 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#B87333]/15 text-[#B87333] font-mono flex items-center justify-center shrink-0 text-xs font-semibold">
                  2
                </span>
                <div>
                  <h4 className="font-semibold text-[#1C1C1C]">Direct Interview Invitation</h4>
                  <p className="text-[#5F5F5F] text-xs mt-0.5 leading-relaxed font-light">
                    Shortlisted candidates receive an email invitation to interview with our practice directors at our Kolkata offices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#B87333]/15 text-[#B87333] font-mono flex items-center justify-center shrink-0 text-xs font-semibold">
                  3
                </span>
                <div>
                  <h4 className="font-semibold text-[#1C1C1C]">Mutual Evaluation &amp; Offer</h4>
                  <p className="text-[#5F5F5F] text-xs mt-0.5 leading-relaxed font-light">
                    Clear performance milestones, commission structures, and career roadmaps tailored to your strengths.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/careers/jobs"
              className="btn-outline text-xs w-full sm:w-auto"
            >
              Browse More Openings
            </Link>
            <Link
              to="/"
              className="btn-primary text-xs w-full sm:w-auto"
            >
              Return Home <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
