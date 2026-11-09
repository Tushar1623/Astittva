import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import {
  Briefcase,
  Trash2,
  Eye,
  Download,
  Search,
  RefreshCw,
  X,
  ArrowUpDown,
  FileX,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import ApplicantDetailsModal from "@/components/admin/ApplicantDetailsModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

const CAREER_STATUSES = [
  "New",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Selected",
  "Rejected",
];

export default function AdminCareerApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected Applicant for side panel / modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // CV Download State
  const [downloadingId, setDownloadingId] = useState(null);

  // Delete Confirmation Dialog State
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/admin/leads/career");
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      setApplications([]);
      setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load career applications");
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load career applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Compute live dashboard metrics from actual stored database records
  const liveStats = useMemo(() => {
    const list = Array.isArray(applications) ? applications : [];
    let countNew = 0;
    let countReview = 0;
    let countShortlisted = 0;
    let countInterview = 0;
    let countSelected = 0;
    let countRejected = 0;

    for (const app of list) {
      const s = (app.status || "New").toLowerCase();
      if (s === "new") countNew++;
      else if (s.includes("review")) countReview++;
      else if (s.includes("shortlist")) countShortlisted++;
      else if (s.includes("interview")) countInterview++;
      else if (s.includes("select")) countSelected++;
      else if (s.includes("reject")) countRejected++;
    }

    return {
      total: list.length,
      new: countNew,
      underReview: countReview,
      shortlisted: countShortlisted,
      interviewScheduled: countInterview,
      selected: countSelected,
      rejected: countRejected,
    };
  }, [applications]);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingStatus(true);
      await api.patch(`/admin/leads/career/${id}`, { status });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp((prev) => ({ ...prev, status }));
      }
      toast.success(`Applicant status updated to "${status}"`);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNotes = async (noteText) => {
    if (!selectedApp) return;
    const finalNotes = noteText !== undefined ? noteText : editingNotes;
    try {
      setSavingNotes(true);
      await api.patch(`/admin/leads/career/${selectedApp.id}`, {
        notes: finalNotes,
      });
      setApplications((prev) =>
        prev.map((a) =>
          a.id === selectedApp.id ? { ...a, notes: finalNotes } : a
        )
      );
      setSelectedApp((prev) => ({ ...prev, notes: finalNotes }));
      toast.success("Notes saved successfully");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`/admin/leads/career/${deleteCandidate.id}`);
      setApplications((prev) => prev.filter((a) => a.id !== deleteCandidate.id));
      if (selectedApp?.id === deleteCandidate.id) setSelectedApp(null);
      toast.success("Career applicant deleted successfully");
      setDeleteCandidate(null);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete applicant");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadResume = async (appDoc) => {
    if (!appDoc?.id) return;
    try {
      setDownloadingId(appDoc.id);
      const toastId = toast.loading(`Preparing CV for ${appDoc.name || "applicant"}…`);

      const res = await api.get(`/admin/leads/career/${appDoc.id}/resume`, {
        responseType: "blob",
      });

      const contentType = res.headers["content-type"] || "application/pdf";
      let extension = ".pdf";
      if (contentType.includes("word") || contentType.includes("officedocument")) {
        extension = ".docx";
      }

      const safeName = (appDoc.name || "applicant").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = appDoc.resumeFilename || `${safeName}_CV${extension}`;

      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      console.error("Resume download error:", err);
      toast.dismiss();
      toast.error("Failed to download CV file from storage.");
    } finally {
      setDownloadingId(null);
    }
  };

  const openDetails = (appDoc) => {
    setSelectedApp(appDoc);
    setEditingNotes(appDoc.notes || "");
  };

  // Filter & Search
  const filteredApps = useMemo(() => {
    const list = Array.isArray(applications) ? applications : [];
    return list.filter((a) => {
      const currentSt = (a.status || "New").toLowerCase();
      const matchesStatus =
        statusFilter === "ALL" ||
        currentSt === statusFilter.toLowerCase() ||
        (statusFilter === "Under Review" && currentSt === "reviewing") ||
        (statusFilter === "Interview Scheduled" && currentSt === "interview");

      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.phone && a.phone.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.jobTitle && a.jobTitle.toLowerCase().includes(q)) ||
        (a.department && a.department.toLowerCase().includes(q)) ||
        (a.location && a.location.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchTerm]);

  // Sort
  const sortedApps = useMemo(() => {
    const list = [...filteredApps];
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
      const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    return list;
  }, [filteredApps, sortOrder]);

  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedApps.slice(start, start + pageSize);
  }, [sortedApps, currentPage, pageSize]);

  return (
    <div data-testid="admin-career-applications-page" className="space-y-6">
      {/* Top Header */}
      <AdminHeader
        category="Talent Recruitment"
        subcategory="General Career Submissions"
        title="Career Applications"
        subtitle="General career submissions from the website Careers portal, with secure CV downloads and applicant management."
        onRefresh={load}
        refreshing={loading}
        actions={[
          {
            label: "Candidate Pipeline (Job Board) →",
            to: "/admin/recruitment/applications",
            variant: "outline",
          },
        ]}
      />

      {/* LIVE DASHBOARD SUMMARY CARDS (7 Pipeline Stages) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("ALL");
            setCurrentPage(1);
          }}
          className={`admin-card p-4 rounded-lg text-left transition-all cursor-pointer ${
            statusFilter === "ALL"
              ? "ring-2 ring-[var(--admin-accent)] border-[var(--admin-accent)] shadow-xs"
              : "hover:border-[var(--admin-accent)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[var(--admin-text-secondary)] font-semibold">
              Total
            </span>
            <Users className="w-4 h-4 text-[var(--admin-accent)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-display font-medium text-[var(--admin-text-primary)] mt-2">
            {liveStats.total}
          </div>
          <div className="text-[10px] text-[var(--admin-text-muted)] uppercase tracking-wider mt-1">Applications</div>
        </button>

        {/* New */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("New");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            statusFilter === "New"
              ? "ring-2 ring-[var(--admin-info)] border-[var(--admin-info)] shadow-xs"
              : ""
          }`}
          style={{
            backgroundColor: "var(--admin-info-bg)",
            borderColor: "var(--admin-info-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[var(--admin-info)] font-semibold">
              New
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--admin-info)] animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-display font-medium text-[var(--admin-info)] mt-2">
            {liveStats.new}
          </div>
          <div className="text-[10px] text-[var(--admin-info)] uppercase tracking-wider mt-1 font-medium">Pending</div>
        </button>

        {/* Under Review */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("Under Review");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            statusFilter === "Under Review"
              ? "ring-2 ring-[var(--admin-warning)] border-[var(--admin-warning)] shadow-xs"
              : ""
          }`}
          style={{
            backgroundColor: "var(--admin-warning-bg)",
            borderColor: "var(--admin-warning-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[var(--admin-warning)] font-semibold">
              Under Review
            </span>
            <Clock className="w-3.5 h-3.5 text-[var(--admin-warning)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-display font-medium text-[var(--admin-warning)] mt-2">
            {liveStats.underReview}
          </div>
          <div className="text-[10px] text-[var(--admin-warning)] uppercase tracking-wider mt-1 font-medium">In Review</div>
        </button>

        {/* Shortlisted */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("Shortlisted");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            statusFilter === "Shortlisted"
              ? "ring-2 ring-teal-500 border-teal-500 shadow-xs"
              : ""
          }`}
          style={{
            backgroundColor: "rgba(20, 184, 166, 0.10)",
            borderColor: "rgba(20, 184, 166, 0.28)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.18em] uppercase text-teal-600 dark:text-teal-300 font-semibold">
              Shortlisted
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-display font-medium text-teal-700 dark:text-teal-300 mt-2">
            {liveStats.shortlisted}
          </div>
          <div className="text-[10px] text-teal-700 dark:text-teal-400 uppercase tracking-wider mt-1 font-medium">Approved</div>
        </button>

        {/* Interview Scheduled */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("Interview Scheduled");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            statusFilter === "Interview Scheduled"
              ? "ring-2 ring-purple-500 border-purple-500 shadow-xs"
              : ""
          }`}
          style={{
            backgroundColor: "rgba(168, 85, 247, 0.10)",
            borderColor: "rgba(168, 85, 247, 0.28)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.18em] uppercase text-purple-600 dark:text-purple-300 font-semibold">
              Interview
            </span>
            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-display font-medium text-purple-700 dark:text-purple-300 mt-2">
            {liveStats.interviewScheduled}
          </div>
          <div className="text-[10px] text-purple-700 dark:text-purple-400 uppercase tracking-wider mt-1 font-medium">Scheduled</div>
        </button>

        {/* Selected */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("Selected");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            statusFilter === "Selected"
              ? "ring-2 ring-[var(--admin-success)] border-[var(--admin-success)] shadow-xs"
              : ""
          }`}
          style={{
            backgroundColor: "var(--admin-success-bg)",
            borderColor: "var(--admin-success-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[var(--admin-success)] font-semibold">
              Selected
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--admin-success)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-display font-medium text-[var(--admin-success)] mt-2">
            {liveStats.selected}
          </div>
          <div className="text-[10px] text-[var(--admin-success)] uppercase tracking-wider mt-1 font-medium">Hired</div>
        </button>

        {/* Rejected */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("Rejected");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            statusFilter === "Rejected"
              ? "ring-2 ring-[var(--admin-error)] border-[var(--admin-error)] shadow-xs"
              : ""
          }`}
          style={{
            backgroundColor: "var(--admin-error-bg)",
            borderColor: "var(--admin-error-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[var(--admin-error)] font-semibold">
              Rejected
            </span>
            <X className="w-3.5 h-3.5 text-[var(--admin-error)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-display font-medium text-[var(--admin-error)] mt-2">
            {liveStats.rejected}
          </div>
          <div className="text-[10px] text-[var(--admin-error)] uppercase tracking-wider mt-1 font-medium">Closed</div>
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <AdminFilterBar
        statusOptions={["ALL", ...CAREER_STATUSES]}
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search name, email, phone, role..."
      >
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="h-9 px-3 border border-[var(--admin-border)] hover:border-[var(--admin-accent)] rounded-md text-xs text-[var(--admin-text-primary)] bg-[var(--admin-surface)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs font-medium"
          title="Toggle date sorting"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-[var(--admin-accent)]" />
          <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
        </button>
      </AdminFilterBar>

      {/* APPLICANT TABLE */}
      {loading ? (
        <div className="text-[var(--admin-text-muted)] text-center py-20 tracking-[0.3em] uppercase text-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 text-[var(--admin-accent)] animate-spin" />
          <span>Loading Career Applications…</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 border border-rose-500/30 bg-rose-500/10 rounded-lg text-rose-500 text-sm p-6">
          <p className="font-semibold">{error}</p>
          <button
            onClick={load}
            className="btn-admin-primary mt-4 inline-flex"
          >
            Retry
          </button>
        </div>
      ) : sortedApps.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title={statusFilter === "ALL" && !searchTerm ? "No career applications recorded yet." : "No applications matched your search."}
          message="Candidate resumes and general applications submitted through the careers section will appear here."
          onClearFilters={
            statusFilter !== "ALL" || searchTerm
              ? () => {
                  setStatusFilter("ALL");
                  setSearchTerm("");
                }
              : null
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-thead">
                <tr>
                  <th className="text-left p-4 font-semibold">Applicant Name</th>
                  <th className="text-left p-4 font-semibold">Job Title Applied For</th>
                  <th className="text-left p-4 font-semibold hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 font-semibold hidden lg:table-cell">Experience / Location</th>
                  <th className="text-left p-4 font-semibold hidden sm:table-cell">Applied Date</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-center p-4 font-semibold">CV (PDF)</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openDetails(app)}
                    className="admin-tr cursor-pointer group"
                  >
                    {/* Name */}
                    <td className="p-4">
                      <div className="font-semibold text-[var(--admin-text-primary)] text-sm group-hover:text-[var(--admin-accent)] transition-colors">
                        {app.name}
                      </div>
                      <div className="text-[10px] text-[var(--admin-text-muted)] font-mono mt-0.5">
                        ID: {app.id.slice(-6)}
                      </div>
                    </td>

                    {/* Job Title & Department */}
                    <td className="p-4">
                      <div className="text-xs font-semibold text-[var(--admin-text-primary)] truncate max-w-[180px]">
                        {app.jobTitle || "General Application"}
                      </div>
                      <div className="text-[10px] text-[var(--admin-accent)] tracking-wider uppercase mt-0.5 font-medium">
                        {app.department || "General"}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 text-xs text-[var(--admin-text-secondary)] hidden md:table-cell">
                      <a
                        href={`mailto:${app.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-[var(--admin-accent)] block truncate max-w-[160px]"
                        title={app.email}
                      >
                        {app.email}
                      </a>
                      <a
                        href={`tel:${app.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[var(--admin-text-muted)] text-[11px] font-mono hover:text-[var(--admin-accent)] block mt-0.5"
                      >
                        {app.phone}
                      </a>
                    </td>

                    {/* Experience & Location */}
                    <td className="p-4 text-xs text-[var(--admin-text-secondary)] hidden lg:table-cell">
                      <div className="font-semibold text-[var(--admin-text-primary)]">{app.experience || "—"}</div>
                      <div className="text-[11px] text-[var(--admin-text-muted)]">{app.location || "Kolkata"}</div>
                    </td>

                    {/* Application Date */}
                    <td className="p-4 text-xs text-[var(--admin-text-secondary)] hidden sm:table-cell font-mono whitespace-nowrap">
                      {app.createdAt || app.created_at
                        ? new Date(app.createdAt || app.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={app.status || "New"} />
                    </td>

                    {/* CV Download Action */}
                    <td className="p-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {app.hasResumeFile || app.resumeFileId || (app.resumeUrl && app.resumeUrl.includes("/resume")) ? (
                        <button
                          type="button"
                          onClick={() => downloadResume(app)}
                          disabled={downloadingId === app.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--admin-accent)] bg-[var(--admin-surface-2)] hover:bg-[var(--admin-surface-hover)] rounded-md border border-[var(--admin-border)] hover:border-[var(--admin-accent)] transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                          title={`Download ${app.name}'s CV as PDF`}
                        >
                          {downloadingId === app.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>CV</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[var(--admin-text-muted)] text-[11px] italic">
                          <FileX className="w-3.5 h-3.5 opacity-50" />
                          <span>No CV</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetails(app)}
                          className="p-1.5 text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)] rounded-md transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteCandidate({
                              id: app.id,
                              name: app.name,
                              jobTitle: app.jobTitle || "Career Applicant",
                            })
                          }
                          className="p-1.5 text-[var(--admin-error)] hover:bg-[var(--admin-error-bg)] rounded-md transition-colors cursor-pointer"
                          title="Permanently Delete Applicant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <AdminPagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalItems={sortedApps.length}
            pageSize={pageSize}
            itemLabel="career applicants"
          />
        </div>
      )}

      {/* STANDARDIZED APPLICANT DETAILS MODAL */}
      <ApplicantDetailsModal
        isOpen={Boolean(selectedApp)}
        applicant={selectedApp}
        onClose={() => setSelectedApp(null)}
        onDownloadCv={downloadResume}
        isDownloading={downloadingId === selectedApp?.id}
        onUpdateStatus={(st, reason) => updateStatus(selectedApp.id, st)}
        isUpdatingStatus={updatingStatus}
        availableStatuses={CAREER_STATUSES}
        onSaveNotes={saveNotes}
        isSavingNotes={savingNotes}
        onDelete={(app) =>
          setDeleteCandidate({
            id: app.id,
            name: app.name,
            jobTitle: app.jobTitle || "Career Applicant",
          })
        }
      />

      {/* STANDARDIZED DELETION CONFIRMATION DIALOG */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Permanently Delete Applicant"
        itemName={deleteCandidate?.name}
        itemType="Career Application"
        warning="This action is irreversible. The applicant record and associated PDF CV stored in GridFS will be permanently removed from MongoDB storage."
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setDeleteCandidate(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
