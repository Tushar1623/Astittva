import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Linkedin,
  Globe,
  Sparkles,
} from "lucide-react";
import Seo from "@/components/Seo";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function JobApplyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState("");

  // Candidate Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    portfolioUrl: "",
    experienceYears: "",
    currentCompany: "",
    currentCtc: "",
    expectedCtc: "",
    noticePeriodDays: "30",
    coverNote: "",
  });

  // Resume File State
  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [readingFile, setReadingFile] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Fetch target job details
  useEffect(() => {
    let isMounted = true;

    async function loadJob() {
      try {
        setJobLoading(true);
        setJobError("");
        const res = await api.get(`/jobs/${slug}`);
        if (isMounted) setJob(res.data);
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load job for application:", err);
          setJobError("This position is no longer accepting applications or does not exist.");
        }
      } finally {
        if (isMounted) setJobLoading(false);
      }
    }

    if (slug) loadJob();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (duplicateWarning) setDuplicateWarning(null);
  };

  const processSelectedFile = (file) => {
    setFileError("");
    if (!file) return;

    const allowedExtensions = ["pdf", "doc", "docx"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setFileError("Only PDF, DOC, or DOCX documents are accepted.");
      return;
    }

    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      setFileError("Resume file size must not exceed 10MB.");
      return;
    }

    setReadingFile(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64Data = e.target.result;
      setResumeFile({
        filename: file.name,
        contentType: file.type || "application/pdf",
        sizeBytes: file.size,
        sizeMb: (file.size / (1024 * 1024)).toFixed(2),
        base64: base64Data,
      });
      setReadingFile(false);
    };

    reader.onerror = () => {
      setFileError("Error reading uploaded file. Please try again.");
      setReadingFile(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedFile(file);
  };

  const removeResume = () => {
    setResumeFile(null);
    setFileError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || readingFile) return;

    if (!formData.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your contact phone number.");
      return;
    }
    if (!resumeFile && !formData.linkedin.trim()) {
      toast.error("Please upload your resume (PDF/DOC/DOCX) or provide a LinkedIn profile URL.");
      return;
    }

    try {
      setSubmitting(true);
      setServerError("");
      setDuplicateWarning(null);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        linkedin: formData.linkedin.trim(),
        portfolioUrl: formData.portfolioUrl.trim(),
        coverNote: formData.coverNote.trim(),
        experienceYears: parseFloat(formData.experienceYears) || 0,
        currentCompany: formData.currentCompany.trim(),
        currentCtc: formData.currentCtc.trim(),
        expectedCtc: formData.expectedCtc.trim(),
        noticePeriodDays: parseInt(formData.noticePeriodDays, 10) || 0,
        source: "careers-job-board",
      };

      if (resumeFile) {
        payload.resume = {
          filename: resumeFile.filename,
          contentType: resumeFile.contentType,
          base64: resumeFile.base64,
        };
      }

      const res = await api.post(`/jobs/${job.id}/apply`, payload);

      toast.success("Application successfully submitted!");

      navigate("/careers/application-success", {
        state: {
          referenceNumber: res.data.referenceNumber,
          jobTitle: job.title,
          applicantName: formData.name,
          applicantEmail: formData.email,
        },
      });
    } catch (err) {
      console.error("Application error:", err);

      if (err.response?.status === 409) {
        const errorDetail = err.response.data?.detail || "You have already applied for this opening in the last 24 hours.";
        const existingRef = err.response.data?.referenceNumber;
        setDuplicateWarning({
          message: errorDetail,
          referenceNumber: existingRef,
        });
        toast.warning("Duplicate application detected.");
      } else {
        const msg = formatApiErrorDetail(err.response?.data?.detail) || "Failed to submit application. Please try again.";
        setServerError(msg);
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-charcoal text-ivory pt-32 pb-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-copper border-t-transparent mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-copper/60">Loading Role Details…</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-charcoal text-ivory pt-32 pb-20 px-4 max-w-xl mx-auto text-center">
        <div className="luxury-card rounded-[8px] p-8 shadow-sm">
          <Briefcase className="w-10 h-10 text-copper/40 mx-auto mb-3" />
          <h1 className="text-xl font-display text-ivory mb-2">Position Unavailable</h1>
          <p className="text-sm text-ivory/60 mb-6 font-sans">{jobError || "This opening is no longer accessible."}</p>
          <Link
            to="/careers/jobs"
            className="px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-white font-semibold bg-copper hover:bg-copper-light rounded-[4px] transition-colors inline-block shadow-sm"
          >
            Explore Other Positions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-ivory pt-24 pb-20">
      <Seo
        title={`Apply for ${job.title} | Astittva Careers`}
        description={`Submit your application for ${job.title} at Astittva Marketing in Kolkata.`}
        path={`/careers/jobs/${job.slug}/apply`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to={`/careers/jobs/${job.slug}`}
            className="inline-flex items-center gap-2 text-xs text-copper hover:underline font-semibold uppercase tracking-[0.12em] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Details
          </Link>
        </div>

        {/* Application Header Card */}
        <div className="luxury-card rounded-[8px] p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-mono text-copper uppercase tracking-wider">
            <span>{job.department}</span>
            <span>•</span>
            <span>{job.location}</span>
            <span>•</span>
            <span>{job.employmentType}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-medium text-ivory mb-2">
            Apply for <span className="text-copper">{job.title}</span>
          </h1>

          <p className="text-xs sm:text-sm text-ivory/60 font-sans leading-relaxed">
            Please complete the candidate profile form below and attach your resume. All submissions are directly reviewed by our leadership and executive hiring team in Kolkata.
          </p>
        </div>

        {/* Duplicate Warning Box */}
        {duplicateWarning && (
          <div className="mb-8 p-6 rounded-[8px] bg-amber-500/10 border border-amber-500/30 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-amber-900 mb-1">Application Already Logged</h3>
                <p className="text-xs text-amber-800 leading-relaxed mb-3">
                  {duplicateWarning.message}
                </p>
                {duplicateWarning.referenceNumber && (
                  <p className="text-xs font-mono text-amber-900">
                    Existing Reference: <strong>{duplicateWarning.referenceNumber}</strong>
                  </p>
                )}
                <div className="mt-4 flex gap-3">
                  <Link
                    to="/careers/jobs"
                    className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-amber-600 text-white rounded-[4px] shadow-sm hover:bg-amber-700 transition-colors"
                  >
                    Browse Other Openings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {serverError && (
          <div className="mb-8 p-4 rounded-[8px] bg-red-950/10 border border-red-500/20 text-red-600 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-8 font-sans">
          {/* Section 1: Candidate Identity */}
          <div className="luxury-card rounded-[8px] p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-lg font-display text-ivory flex items-center gap-2 border-b border-copper/15 pb-3">
              <User className="w-4 h-4 text-copper" /> 1. Personal &amp; Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ivory/60 block mb-2">
                  Full Name <span className="text-copper">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Arjun Banerjee"
                  className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ivory/60 block mb-2">
                  Email Address <span className="text-copper">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. arjun@example.com"
                  className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ivory/60 block mb-2">
                  Phone Number <span className="text-copper">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. +91 98301 23456"
                  className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ivory/60 block mb-2">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Experience & Compensation */}
          <div className="luxury-card rounded-[8px] p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-lg font-display text-ivory flex items-center gap-2 border-b border-copper/15 pb-3">
              <Briefcase className="w-4 h-4 text-copper" /> 2. Professional Experience &amp; Notice
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ivory/60 block mb-2">
                  Total Experience (Years)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  placeholder="e.g. 4.5"
                  className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ivory/60 block mb-2">
                  Current Organization
                </label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleInputChange}
                  placeholder="e.g. Kolkata Realty Pvt Ltd"
                  className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ivory/60 block mb-2">
                  Notice Period (Days)
                </label>
                <input
                  type="number"
                  name="noticePeriodDays"
                  min="0"
                  value={formData.noticePeriodDays}
                  onChange={handleInputChange}
                  placeholder="30"
                  className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ivory/60 block mb-2">
                  Current Annual CTC
                </label>
                <input
                  type="text"
                  name="currentCtc"
                  value={formData.currentCtc}
                  onChange={handleInputChange}
                  placeholder="e.g. 6 LPA"
                  className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ivory/60 block mb-2">
                  Expected Annual CTC
                </label>
                <input
                  type="text"
                  name="expectedCtc"
                  value={formData.expectedCtc}
                  onChange={handleInputChange}
                  placeholder="e.g. 8.5 LPA"
                  className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ivory/60 block mb-2">
                  Portfolio / Website URL
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                  placeholder="https://mywork.dev"
                  className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Resume Upload */}
          <div className="luxury-card rounded-[8px] p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-display text-ivory flex items-center gap-2 border-b border-copper/15 pb-3">
              <UploadCloud className="w-4 h-4 text-copper" /> 3. Upload Resume / Curriculum Vitae <span className="text-copper">*</span>
            </h2>

            <p className="text-xs text-ivory/60">
              Accepted formats: <strong className="text-ivory">PDF, DOC, DOCX</strong> up to 10MB. Stored securely in our encrypted MongoDB storage.
            </p>

            {resumeFile ? (
              <div className="flex items-center justify-between p-4 bg-charcoal border border-copper/50 rounded-[4px]">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-copper shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ivory">{resumeFile.filename}</p>
                    <p className="text-xs text-ivory/50 font-mono">{resumeFile.sizeMb} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeResume}
                  className="p-1.5 rounded text-ivory/50 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-copper/30 hover:border-copper/70 rounded-[6px] p-8 text-center transition-colors bg-charcoal/50 cursor-pointer"
                onClick={() => document.getElementById("resume-input")?.click()}
              >
                <input
                  id="resume-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-copper/60 mx-auto mb-3" />
                <p className="text-sm font-medium text-ivory mb-1">
                  Drag and drop your resume file here, or <span className="text-copper underline">browse</span>
                </p>
                <p className="text-xs text-ivory/40 font-mono">PDF, DOC, DOCX up to 10MB</p>
              </div>
            )}

            {fileError && <p className="text-xs text-red-600 mt-2">{fileError}</p>}
          </div>

          {/* Section 4: Candidate Note */}
          <div className="luxury-card rounded-[8px] p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-display text-ivory flex items-center gap-2 border-b border-copper/15 pb-3">
              <Sparkles className="w-4 h-4 text-copper" /> 4. Candidate Note (Optional)
            </h2>

            <textarea
              name="coverNote"
              rows={4}
              value={formData.coverNote}
              onChange={handleInputChange}
              placeholder="Tell us briefly why you would like to join Astittva Marketing in Kolkata, your experience in New Town/Rajarhat real estate, or any key achievements..."
              className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper transition-colors leading-relaxed"
            />
          </div>

          {/* Submit CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-xs text-ivory/50 font-sans">
              By submitting, you agree to our privacy policy and consent to our recruitment team contacting you regarding this vacancy.
            </p>

            <button
              type="submit"
              disabled={submitting || readingFile}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[4px] bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.15em] shadow-sm transition-all disabled:opacity-50 shrink-0"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Application…</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
