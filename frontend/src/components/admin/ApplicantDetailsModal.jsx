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
  Briefcase,
  AlertCircle,
  RefreshCw,
  Send,
  User,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

/**
 * Standardized, theme-adaptive, high-contrast Applicant Details Modal
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-xl border max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors"
        style={{
          backgroundColor: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
          color: "var(--admin-text-primary)",
        }}
      >
        {/* ========================================================
            HEADER
           ======================================================== */}
        <div
          className="px-6 py-5 border-b flex items-start justify-between gap-4 transition-colors"
          style={{
            backgroundColor: "var(--admin-surface)",
            borderColor: "var(--admin-border)",
          }}
        >
          <div className="min-w-0 flex-1">
            {/* Top Meta Row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="font-mono text-xs font-semibold text-[var(--admin-accent)] tracking-wider px-2 py-0.5 rounded-md bg-[var(--admin-surface-2)] border border-[var(--admin-border)]">
                {displayRef}
              </span>
              <StatusBadge status={applicant.status || "New"} />
              <span className="text-xs text-[var(--admin-text-secondary)] flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[var(--admin-accent)] opacity-75" />
                <span>{formattedDate}</span>
              </span>
            </div>

            {/* Applicant Name */}
            <h2
              id="applicant-modal-title"
              className="font-serif-display text-2xl sm:text-3xl font-medium truncate text-[var(--admin-text-primary)]"
            >
              {applicant.name || "Unnamed Applicant"}
            </h2>

            {/* Target Job Title & Department */}
            <div className="text-sm text-[var(--admin-text-secondary)] mt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[var(--admin-text-primary)]">
                {applicant.jobTitle || "General Career Opportunity"}
              </span>
              {applicant.department && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="text-[var(--admin-text-muted)]">{applicant.department}</span>
                </>
              )}
              {applicant.location && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="text-[var(--admin-text-muted)] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--admin-accent)] opacity-75" />
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
            className="w-10 h-10 rounded-full border border-[var(--admin-border)] hover:border-[var(--admin-accent)] flex items-center justify-center text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] bg-[var(--admin-surface-2)] transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================
            SCROLLABLE CONTENT BODY
           ======================================================== */}
        <div
          className="p-6 overflow-y-auto space-y-6 flex-1 transition-colors"
          style={{ backgroundColor: "var(--admin-bg)" }}
        >
          {/* Quick Action Banner (CV Download) */}
          <div
            className="p-4 rounded-lg border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs transition-colors"
            style={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--admin-surface-2)] border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-accent)] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-primary)]">
                  {hasResume ? "Verified Resume Available" : "No Resume Attached"}
                </div>
                <div className="text-xs text-[var(--admin-text-secondary)] truncate max-w-sm">
                  {resumeFilename || "Candidate did not attach a resume document"}
                </div>
              </div>
            </div>

            {hasResume ? (
              <button
                type="button"
                onClick={() => onDownloadCv && onDownloadCv(applicant)}
                disabled={isDownloading}
                className="btn-admin-primary shrink-0"
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
              <span className="text-xs text-[var(--admin-text-muted)] italic self-center">
                Resume file not provided
              </span>
            )}
          </div>

          {/* Section: Stage Management / Application Progress */}
          <div
            className="p-5 rounded-lg border shadow-2xs space-y-3 transition-colors"
            style={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--admin-accent)]">
                Application Progress &amp; Stage
              </span>
              <span className="text-xs text-[var(--admin-text-secondary)]">
                Current: <strong className="text-[var(--admin-text-primary)] font-semibold">{applicant.status || "New"}</strong>
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
                  className="w-full h-10 px-3 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] cursor-pointer"
                  style={{
                    backgroundColor: "var(--admin-input-bg)",
                    borderColor: "var(--admin-input-border)",
                    borderWidth: "1px",
                    color: "var(--admin-input-text)",
                  }}
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
                className="flex-1 h-10 px-3 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                style={{
                  backgroundColor: "var(--admin-input-bg)",
                  borderColor: "var(--admin-input-border)",
                  borderWidth: "1px",
                  color: "var(--admin-input-text)",
                }}
              />

              <button
                type="submit"
                disabled={isUpdatingStatus || selectedStatus === applicant.status}
                className="btn-admin-primary shrink-0"
              >
                {isUpdatingStatus ? "Updating…" : "Update Stage"}
              </button>
            </form>
          </div>

          {/* Section: Candidate Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information Card */}
            <div
              className="p-5 rounded-lg border shadow-2xs space-y-3 transition-colors"
              style={{
                backgroundColor: "var(--admin-surface)",
                borderColor: "var(--admin-border)",
              }}
            >
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--admin-border-subtle)]">
                <User className="w-4 h-4 text-[var(--admin-accent)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-primary)]">
                  Contact Information
                </h3>
              </div>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] block">
                    Email Address
                  </span>
                  {applicant.email ? (
                    <a
                      href={`mailto:${applicant.email}`}
                      className="text-[var(--admin-accent)] hover:underline font-medium inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{applicant.email}</span>
                    </a>
                  ) : (
                    <span className="text-[var(--admin-text-muted)]">Not specified</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] block">
                    Phone Number
                  </span>
                  {applicant.phone ? (
                    <a
                      href={`tel:${applicant.phone}`}
                      className="text-[var(--admin-accent)] hover:underline font-mono font-medium inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{applicant.phone}</span>
                    </a>
                  ) : (
                    <span className="text-[var(--admin-text-muted)]">Not specified</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] block">
                    Location
                  </span>
                  <span className="text-[var(--admin-text-primary)] font-medium inline-flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--admin-accent)] opacity-75 shrink-0" />
                    <span>{applicant.location || "Kolkata, West Bengal"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Background Card */}
            <div
              className="p-5 rounded-lg border shadow-2xs space-y-3 transition-colors"
              style={{
                backgroundColor: "var(--admin-surface)",
                borderColor: "var(--admin-border)",
              }}
            >
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--admin-border-subtle)]">
                <Briefcase className="w-4 h-4 text-[var(--admin-accent)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-primary)]">
                  Professional Background
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] block">
                    Experience
                  </span>
                  <span className="text-[var(--admin-text-primary)] font-medium mt-0.5 block">
                    {applicant.experienceYears != null
                      ? `${applicant.experienceYears} Years`
                      : applicant.experience || "Not specified"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] block">
                    Notice Period
                  </span>
                  <span className="text-[var(--admin-text-primary)] font-medium mt-0.5 block">
                    {applicant.noticePeriodDays != null
                      ? `${applicant.noticePeriodDays} Days`
                      : "Immediate / Not specified"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] block">
                    Current Employer
                  </span>
                  <span className="text-[var(--admin-text-primary)] font-medium mt-0.5 block truncate">
                    {applicant.currentCompany || "Not specified"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)] block">
                    Expected CTC
                  </span>
                  <span className="text-[var(--admin-text-primary)] font-medium mt-0.5 block">
                    {applicant.expectedCtc || "Not disclosed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Cover Letter / Message (if provided) */}
          {(applicant.message || applicant.coverNote) && (
            <div
              className="p-5 rounded-lg border shadow-2xs space-y-2 transition-colors"
              style={{
                backgroundColor: "var(--admin-surface)",
                borderColor: "var(--admin-border)",
              }}
            >
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--admin-accent)] block">
                Cover Note / Applicant Message
              </span>
              <p
                className="text-xs whitespace-pre-wrap leading-relaxed p-3.5 rounded-md border"
                style={{
                  backgroundColor: "var(--admin-surface-2)",
                  borderColor: "var(--admin-border-subtle)",
                  color: "var(--admin-text-primary)",
                }}
              >
                {applicant.message || applicant.coverNote}
              </p>
            </div>
          )}

          {/* Section: Stage Transition Audit History (if available) */}
          {Array.isArray(applicant.statusHistory) &&
            applicant.statusHistory.length > 0 && (
              <div
                className="p-5 rounded-lg border shadow-2xs space-y-3 transition-colors"
                style={{
                  backgroundColor: "var(--admin-surface)",
                  borderColor: "var(--admin-border)",
                }}
              >
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--admin-accent)] block">
                  Application Timeline &amp; History
                </span>
                <div className="space-y-2 border-l-2 border-[var(--admin-accent)] pl-4 ml-1">
                  {applicant.statusHistory.map((item, idx) => (
                    <div key={idx} className="relative text-xs pb-2">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--admin-accent)] border-2 border-[var(--admin-surface)]" />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[var(--admin-text-primary)]">
                          {item.toStatus || item.status}
                        </span>
                        {item.fromStatus && (
                          <span className="text-[10px] text-[var(--admin-text-muted)]">
                            (was {item.fromStatus})
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[var(--admin-text-muted)] ml-auto">
                          {item.changedAt
                            ? new Date(item.changedAt).toLocaleString("en-IN")
                            : "—"}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-[var(--admin-text-secondary)] text-[11px] mt-0.5 italic">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Section: Recruiter & Interview Notes */}
          <div
            className="p-5 rounded-lg border shadow-2xs space-y-3 transition-colors"
            style={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
            }}
          >
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--admin-accent)] block">
              Administrative &amp; Recruiter Notes
            </span>

            {/* Existing notes list if stored as array */}
            {Array.isArray(applicant.notes) && applicant.notes.length > 0 && (
              <div className="space-y-2 mb-3">
                {applicant.notes.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md border text-xs"
                    style={{
                      backgroundColor: "var(--admin-surface-2)",
                      borderColor: "var(--admin-border-subtle)",
                      color: "var(--admin-text-primary)",
                    }}
                  >
                    <p className="leading-relaxed">
                      {typeof n === "string" ? n : n.text || n.note}
                    </p>
                    {typeof n === "object" && (n.createdAt || n.author) && (
                      <div className="text-[10px] text-[var(--admin-text-muted)] mt-1 font-mono">
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
                className="w-full p-3 rounded-md text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                style={{
                  backgroundColor: "var(--admin-input-bg)",
                  borderColor: "var(--admin-input-border)",
                  borderWidth: "1px",
                  color: "var(--admin-input-text)",
                }}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNotes || !noteInput.trim()}
                  className="btn-admin-primary"
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
            FOOTER
           ======================================================== */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between gap-4 transition-colors"
          style={{
            backgroundColor: "var(--admin-surface)",
            borderColor: "var(--admin-border)",
          }}
        >
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(applicant)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[var(--admin-error)] bg-[var(--admin-error-bg)] border border-[var(--admin-error-border)] hover:opacity-90 rounded-md text-xs uppercase tracking-[0.1em] font-semibold transition-all cursor-pointer"
              title="Delete candidate record permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Applicant</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border rounded-md text-xs uppercase tracking-[0.1em] font-semibold transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--admin-surface-2)",
              borderColor: "var(--admin-border)",
              color: "var(--admin-text-primary)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
