import { useEffect, useState } from "react";
import {
  X,
  Download,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  FileCheck,
  FileX,
  Briefcase,
  Building,
  DollarSign,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Send,
  User,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

/**
 * Standardized, high-contrast, professional Applicant Details Modal
 * Used across both AdminRecruitmentApplicationsPage and AdminCareerApplicationsPage.
 */
export default function ApplicantDetailsModal({
  isOpen,
  applicant,
  onClose,
  onDownloadCv,
  isDownloading = false,
  onUpdateStatus,
  isUpdatingStatus = false,
  availableStatuses = [
    "New",
    "Under Review",
    "Shortlisted",
    "Interview Scheduled",
    "Selected",
    "Rejected",
  ],
  onSaveNotes,
  isSavingNotes = false,
  onDelete,
}) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [noteInput, setNoteInput] = useState("");

  // Keep internal stage selector synced with applicant
  useEffect(() => {
    if (applicant) {
      setSelectedStatus(applicant.status || "New");
      setStatusReason("");
      setNoteInput(
        typeof applicant.notes === "string" ? applicant.notes : ""
      );
    }
  }, [applicant]);

  // Lock body scroll and handle Escape key to close modal
  useEffect(() => {
    if (!isOpen || !applicant) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, applicant, onClose]);

  if (!isOpen || !applicant) return null;

  const hasResume = Boolean(
    applicant.hasResume ||
      applicant.hasResumeFile ||
      applicant.resumeFileId ||
      (applicant.resumeUrl && applicant.resumeUrl.includes("/resume"))
  );

  const resumeFilename =
    applicant.resumeFilename ||
    applicant.filename ||
    (hasResume ? "applicant-resume.pdf" : null);

  const displayRef =
    applicant.referenceNumber ||
    (applicant.id ? `#${applicant.id.slice(-8).toUpperCase()}` : "N/A");

  const formattedDate = applicant.createdAt || applicant.created_at
    ? new Date(applicant.createdAt || applicant.created_at).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "—";

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (
      !onUpdateStatus ||
      isUpdatingStatus ||
      selectedStatus === applicant.status
    )
      return;
    onUpdateStatus(selectedStatus, statusReason);
  };

  const handleNotesSubmit = (e) => {
    e.preventDefault();
    if (!onSaveNotes || isSavingNotes || !noteInput.trim()) return;
    onSaveNotes(noteInput);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="applicant-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FAF8F5] border border-copper/30 rounded-lg max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#1C1C1C]">
        {/* ========================================================
            HEADER
           ======================================================== */}
        <div className="bg-white px-6 py-5 border-b border-copper/15 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Top Meta Row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="font-mono text-xs font-semibold text-copper tracking-wider px-2 py-0.5 rounded bg-copper/10 border border-copper/25">
                {displayRef}
              </span>
              <StatusBadge status={applicant.status || "New"} />
              <span className="text-xs text-[#1C1C1C]/50 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-copper/70" />
                <span>{formattedDate}</span>
              </span>
            </div>

            {/* Applicant Name */}
            <h2
              id="applicant-modal-title"
              className="font-display text-2xl sm:text-3xl font-medium text-[#1C1C1C] truncate"
            >
              {applicant.name || "Unnamed Applicant"}
            </h2>

            {/* Target Job Title & Department */}
            <div className="text-sm text-[#1C1C1C]/70 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-medium text-[#1C1C1C]">
                {applicant.jobTitle || "General Career Opportunity"}
              </span>
              {applicant.department && (
                <>
                  <span className="text-[#1C1C1C]/30">•</span>
                  <span className="text-[#1C1C1C]/60">{applicant.department}</span>
                </>
              )}
              {applicant.location && (
                <>
                  <span className="text-[#1C1C1C]/30">•</span>
                  <span className="text-[#1C1C1C]/60 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-copper/70" />
                    {applicant.location}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full border border-copper/20 hover:border-copper flex items-center justify-center text-[#1C1C1C]/60 hover:text-copper bg-white hover:bg-[#FAF8F5] transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================
            SCROLLABLE CONTENT BODY
           ======================================================== */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#FAF8F5]">
          {/* Quick Action Banner */}
          <div className="bg-white p-4 rounded-[6px] border border-copper/20 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-copper/10 border border-copper/25 flex items-center justify-center text-copper shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#1C1C1C]">
                  {hasResume ? "Verified PDF Resume Available" : "No Resume Attached"}
                </div>
                <div className="text-xs text-[#1C1C1C]/60 truncate max-w-sm">
                  {resumeFilename || "Candidate did not attach a resume document"}
                </div>
              </div>
            </div>

            {hasResume ? (
              <button
                type="button"
                onClick={() => onDownloadCv && onDownloadCv(applicant)}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors shadow-sm disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Streaming CV…</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CV (PDF)</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs text-[#1C1C1C]/40 italic self-center">
                Resume file not provided
              </span>
            )}
          </div>

          {/* Section: Stage Management / Application Progress */}
          <div className="bg-white p-5 rounded-[6px] border border-copper/20 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-copper">
                Application Progress &amp; Stage
              </span>
              <span className="text-xs text-[#1C1C1C]/50">
                Current: <strong className="text-[#1C1C1C] font-semibold">{applicant.status || "New"}</strong>
              </span>
            </div>

            <form
              onSubmit={handleStatusSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1"
            >
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-copper/30 rounded-[4px] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-copper cursor-pointer"
                >
                  {availableStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Optional transition note / reason..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="flex-1 h-10 px-3 bg-[#FAF8F5] border border-copper/30 rounded-[4px] text-xs text-[#1C1C1C] placeholder-[#1C1C1C]/40 focus:outline-none focus:border-copper"
              />

              <button
                type="submit"
                disabled={isUpdatingStatus || selectedStatus === applicant.status}
                className="h-10 px-5 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-sm"
              >
                {isUpdatingStatus ? "Updating…" : "Update Stage"}
              </button>
            </form>
          </div>

          {/* Section: Candidate Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information Card */}
            <div className="bg-white p-5 rounded-[6px] border border-copper/15 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-copper/10">
                <User className="w-4 h-4 text-copper" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1C1C]">
                  Contact Information
                </h3>
              </div>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#1C1C1C]/50 block">
                    Email Address
                  </span>
                  {applicant.email ? (
                    <a
                      href={`mailto:${applicant.email}`}
                      className="text-copper hover:underline font-medium inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{applicant.email}</span>
                    </a>
                  ) : (
                    <span className="text-[#1C1C1C]/60">Not specified</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#1C1C1C]/50 block">
                    Phone Number
                  </span>
                  {applicant.phone ? (
                    <a
                      href={`tel:${applicant.phone}`}
                      className="text-copper hover:underline font-mono font-medium inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{applicant.phone}</span>
                    </a>
                  ) : (
                    <span className="text-[#1C1C1C]/60">Not specified</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#1C1C1C]/50 block">
                    Location
                  </span>
                  <span className="text-[#1C1C1C] font-medium inline-flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-copper/70 shrink-0" />
                    <span>{applicant.location || "Kolkata, West Bengal"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Background Card */}
            <div className="bg-white p-5 rounded-[6px] border border-copper/15 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-copper/10">
                <Briefcase className="w-4 h-4 text-copper" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1C1C]">
                  Professional Background
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#1C1C1C]/50 block">
                    Experience
                  </span>
                  <span className="text-[#1C1C1C] font-medium mt-0.5 block">
                    {applicant.experienceYears != null
                      ? `${applicant.experienceYears} Years`
                      : applicant.experience || "Not specified"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#1C1C1C]/50 block">
                    Notice Period
                  </span>
                  <span className="text-[#1C1C1C] font-medium mt-0.5 block">
                    {applicant.noticePeriodDays != null
                      ? `${applicant.noticePeriodDays} Days`
                      : "Immediate / Not specified"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#1C1C1C]/50 block">
                    Current Employer
                  </span>
                  <span className="text-[#1C1C1C] font-medium mt-0.5 block truncate">
                    {applicant.currentCompany || "Not specified"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#1C1C1C]/50 block">
                    Expected CTC
                  </span>
                  <span className="text-[#1C1C1C] font-medium mt-0.5 block">
                    {applicant.expectedCtc || "Not disclosed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Cover Letter / Message (if provided) */}
          {(applicant.message || applicant.coverNote) && (
            <div className="bg-white p-5 rounded-[6px] border border-copper/15 shadow-sm space-y-2">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-copper block">
                Cover Note / Applicant Message
              </span>
              <p className="text-xs text-[#1C1C1C]/85 whitespace-pre-wrap leading-relaxed bg-[#FAF8F5] p-3.5 rounded border border-copper/15">
                {applicant.message || applicant.coverNote}
              </p>
            </div>
          )}

          {/* Section: Stage Transition Audit History (if available) */}
          {Array.isArray(applicant.statusHistory) &&
            applicant.statusHistory.length > 0 && (
              <div className="bg-white p-5 rounded-[6px] border border-copper/15 shadow-sm space-y-3">
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-copper block">
                  Application Timeline &amp; History
                </span>
                <div className="space-y-2 border-l-2 border-copper/30 pl-4 ml-1">
                  {applicant.statusHistory.map((item, idx) => (
                    <div key={idx} className="relative text-xs pb-2">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-copper border-2 border-white" />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#1C1C1C]">
                          {item.toStatus || item.status}
                        </span>
                        {item.fromStatus && (
                          <span className="text-[10px] text-[#1C1C1C]/50">
                            (was {item.fromStatus})
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#1C1C1C]/40 ml-auto">
                          {item.changedAt
                            ? new Date(item.changedAt).toLocaleString("en-IN")
                            : "—"}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-[#1C1C1C]/70 text-[11px] mt-0.5 italic">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Section: Recruiter & Interview Notes */}
          <div className="bg-white p-5 rounded-[6px] border border-copper/15 shadow-sm space-y-3">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-copper block">
              Administrative &amp; Recruiter Notes
            </span>

            {/* Existing notes list if stored as array */}
            {Array.isArray(applicant.notes) && applicant.notes.length > 0 && (
              <div className="space-y-2 mb-3">
                {applicant.notes.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF8F5] rounded border border-copper/15 text-xs"
                  >
                    <p className="text-[#1C1C1C]/85 leading-relaxed">
                      {typeof n === "string" ? n : n.text || n.note}
                    </p>
                    {typeof n === "object" && (n.createdAt || n.author) && (
                      <div className="text-[10px] text-[#1C1C1C]/40 mt-1 font-mono">
                        {n.author && `${n.author} • `}
                        {n.createdAt &&
                          new Date(n.createdAt).toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Note input form */}
            <form onSubmit={handleNotesSubmit} className="space-y-2.5">
              <textarea
                rows={3}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Record candidate evaluation, interview feedback, or verification remarks..."
                className="w-full p-3 bg-[#FAF8F5] border border-copper/25 rounded-[4px] text-xs text-[#1C1C1C] placeholder-[#1C1C1C]/40 focus:outline-none focus:border-copper leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNotes || !noteInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  {isSavingNotes ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ========================================================
            FOOTER — SINGLE DESTRUCTIVE ACTION & CLOSE
           ======================================================== */}
        <div className="bg-white px-6 py-4 border-t border-copper/15 flex items-center justify-between gap-4">
          {/* Single Delete Applicant action */}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(applicant)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-xs uppercase tracking-[0.1em] font-semibold transition-colors cursor-pointer"
              title="Delete candidate record permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Applicant</span>
            </button>
          ) : (
            <div />
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-copper/30 hover:border-copper text-[#1C1C1C] hover:bg-[#FAF8F5] text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors cursor-pointer font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
