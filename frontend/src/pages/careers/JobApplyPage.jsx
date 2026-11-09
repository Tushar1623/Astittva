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
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-32 pb-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#B87333] border-t-transparent mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#B87333]">Loading Role Details…</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-32 pb-20 px-4 max-w-xl mx-auto text-center">
        <div className="bg-white border border-[#E8DED2] rounded-xl p-8 shadow-xs">
          <Briefcase className="w-10 h-10 text-[#B87333]/40 mx-auto mb-3" />
          <h1 className="text-xl font-serif-display text-[#1C1C1C] mb-2 font-medium">Position Unavailable</h1>
          <p className="text-sm text-[#5F5F5F] mb-6 font-light">{jobError || "This opening is no longer accessible."}</p>
          <Link
            to="/careers/jobs"
            className="btn-primary text-xs"
          >
            Explore Other Positions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-28 pb-20">
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
            className="inline-flex items-center gap-2 text-xs text-[#B87333] hover:text-[#5E1F28] font-semibold uppercase tracking-[0.12em] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Role Details
          </Link>
        </div>

        {/* Application Header Card */}
        <div className="bg-white border border-[#E8DED2] rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-mono text-[#B87333] uppercase tracking-wider font-semibold">
            <span>{job.department}</span>
            <span>•</span>
            <span>{job.location}</span>
            <span>•</span>
            <span>{job.employmentType}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif-display font-medium text-[#1C1C1C] mb-3">
            Apply for <span className="text-[#B87333]">{job.title}</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#5F5F5F] font-light leading-relaxed">
            Please complete the candidate profile form below and attach your resume. All submissions are directly reviewed by our leadership and executive hiring team in Kolkata.
          </p>
        </div>

        {/* Duplicate Warning Box */}
        {duplicateWarning && (
          <div className="mb-8 p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
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
                    className="btn-primary text-xs"
                  >
                    Browse Other Openings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {serverError && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Candidate Identity */}
          <div className="bg-white border border-[#E8DED2] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-serif-display text-[#1C1C1C] flex items-center gap-2 border-b border-[#E8DED2] pb-3 font-semibold">
              <User className="w-4 h-4 text-[#B87333]" /> 1. Personal &amp; Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Full Name <span className="text-[#B87333]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Arjun Banerjee"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] placeholder:text-[#8C827A] focus:outline-none focus:border-[#B87333] transition-colors"
                />
              </div>

              <div>
                <label className="form-label">
                  Email Address <span className="text-[#B87333]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. arjun@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] placeholder:text-[#8C827A] focus:outline-none focus:border-[#B87333] transition-colors"
                />
              </div>

              <div>
                <label className="form-label">
                  Phone Number <span className="text-[#B87333]">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. +91 98301 23456"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] placeholder:text-[#8C827A] focus:outline-none focus:border-[#B87333] transition-colors"
                />
              </div>

              <div>
                <label className="form-label">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] placeholder:text-[#8C827A] focus:outline-none focus:border-[#B87333] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Experience & Compensation */}
          <div className="bg-white border border-[#E8DED2] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-lg font-serif-display text-[#1C1C1C] flex items-center gap-2 border-b border-[#E8DED2] pb-3 font-semibold">
              <Briefcase className="w-4 h-4 text-[#B87333]" /> 2. Professional Experience &amp; Notice
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">
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
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333] transition-colors"
                />
              </div>

              <div>
                <label className="form-label">
                  Current Organization
                </label>
                <input
                  type="text"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleInputChange}
                  placeholder="e.g. Kolkata Realty Pvt Ltd"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333] transition-colors"
                />
              </div>

              <div>
                <label className="form-label">
                  Notice Period (Days)
                </label>
                <input
                  type="number"
                  name="noticePeriodDays"
                  min="0"
                  value={formData.noticePeriodDays}
                  onChange={handleInputChange}
                  placeholder="30"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333] transition-colors"
                />
              </div>

              <div>
                <label className="form-label">
                  Current Annual CTC
                </label>
                <input
                  type="text"
                  name="currentCtc"
                  value={formData.currentCtc}
                  onChange={handleInputChange}
                  placeholder="e.g. 6 LPA"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333] transition-colors"
                />
              </div>

              <div>
                <label className="form-label">
                  Expected Annual CTC
                </label>
                <input
                  type="text"
                  name="expectedCtc"
                  value={formData.expectedCtc}
                  onChange={handleInputChange}
                  placeholder="e.g. 8.5 LPA"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333] transition-colors"
                />
              </div>

              <div>
                <label className="form-label">
                  Portfolio / Website URL
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                  placeholder="https://mywork.dev"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Resume Upload */}
          <div className="bg-white border border-[#E8DED2] rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg font-serif-display text-[#1C1C1C] flex items-center gap-2 border-b border-[#E8DED2] pb-3 font-semibold">
              <UploadCloud className="w-4 h-4 text-[#B87333]" /> 3. Upload Resume / Curriculum Vitae <span className="text-[#B87333]">*</span>
            </h2>

            <p className="text-xs text-[#5F5F5F]">
              Accepted formats: <strong className="text-[#1C1C1C]">PDF, DOC, DOCX</strong> up to 10MB. Stored securely in our encrypted MongoDB storage.
            </p>

            {resumeFile ? (
              <div className="flex items-center justify-between p-4 bg-[#FAF8F5] border border-[#B87333]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[#B87333] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#1C1C1C]">{resumeFile.filename}</p>
                    <p className="text-xs text-[#5F5F5F] font-mono">{resumeFile.sizeMb} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeResume}
                  className="p-1.5 rounded text-[#5F5F5F] hover:text-rose-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#B87333]/30 hover:border-[#B87333] rounded-xl p-8 text-center transition-colors bg-[#FAF8F5]/60 cursor-pointer"
                onClick={() => document.getElementById("resume-input")?.click()}
              >
                <input
                  id="resume-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-[#B87333]/60 mx-auto mb-3" />
                <p className="text-sm font-medium text-[#1C1C1C] mb-1">
                  Drag and drop your resume file here, or <span className="text-[#B87333] underline">browse</span>
                </p>
                <p className="text-xs text-[#8C827A] font-mono">PDF, DOC, DOCX up to 10MB</p>
              </div>
            )}

            {fileError && <p className="text-xs text-rose-600 mt-2 font-medium">{fileError}</p>}
          </div>

          {/* Section 4: Candidate Note */}
          <div className="bg-white border border-[#E8DED2] rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg font-serif-display text-[#1C1C1C] flex items-center gap-2 border-b border-[#E8DED2] pb-3 font-semibold">
              <Sparkles className="w-4 h-4 text-[#B87333]" /> 4. Candidate Note (Optional)
            </h2>

            <textarea
              name="coverNote"
              rows={4}
              value={formData.coverNote}
              onChange={handleInputChange}
              placeholder="Tell us briefly why you would like to join Astittva Marketing in Kolkata, your experience in New Town/Rajarhat real estate, or any key achievements..."
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] placeholder:text-[#8C827A] focus:outline-none focus:border-[#B87333] transition-colors leading-relaxed"
            />
          </div>

          {/* Submit CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-xs text-[#5F5F5F] font-light">
              By submitting, you agree to our privacy policy and consent to our recruitment team contacting you regarding this vacancy.
            </p>

            <button
              type="submit"
              disabled={submitting || readingFile}
              className="btn-primary w-full sm:w-auto shrink-0"
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
