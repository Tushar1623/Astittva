import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Users,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  X,
  Phone,
  Mail,
  RefreshCw,
  Trash2,
  ArrowUpDown,
  FileX,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import ApplicantDetailsModal from "@/components/admin/ApplicantDetailsModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

const STAGES = [
  "New",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Selected",
  "Rejected",
  "Withdrawn",
];

export default function AdminRecruitmentApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Application Data & Pagination State
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobsList, setJobsList] = useState([]);

  // Live Stats State
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    underReview: 0,
    shortlisted: 0,
    interviewScheduled: 0,
    selected: 0,
    rejected: 0,
    withdrawn: 0,
  });

  // Filters & Sorting
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [jobIdFilter, setJobIdFilter] = useState(searchParams.get("jobId") || "All");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected Candidate for modal
  const [selectedApp, setSelectedApp] = useState(null);

  // Status Change State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // CV Download State
  const [downloadingId, setDownloadingId] = useState(null);

  // Delete Confirmation Modal State
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch job list for filter dropdown
  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await api.get("/admin/recruitment/jobs");
        setJobsList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load jobs list:", err);
      }
    }
    loadJobs();
  }, []);

  // Fetch live stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/recruitment/dashboard");
      const byStatus = res.data?.byStatus || {};
      const summary = res.data?.summary || {};
      setStats({
        total: summary.totalApplications ?? 0,
        new: byStatus.new ?? 0,
        underReview: byStatus.underReview ?? 0,
        shortlisted: byStatus.shortlisted ?? 0,
        interviewScheduled: byStatus.interviewScheduled ?? 0,
        selected: byStatus.selected ?? 0,
        rejected: byStatus.rejected ?? 0,
        withdrawn: byStatus.withdrawn ?? 0,
      });
    } catch (err) {
      console.error("Failed to fetch recruitment stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch applications list
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        limit: 100,
        search: search.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        jobId: jobIdFilter !== "All" ? jobIdFilter : undefined,
      };

      const res = await api.get("/admin/recruitment/applications", { params });
      const rawList = Array.isArray(res.data) ? res.data : res.data?.applications || [];
      setApplications(rawList);
      setTotal(typeof res.data?.total === "number" ? res.data.total : rawList.length);
    } catch (err) {
      setApplications([]);
      setTotal(0);
      setError(formatApiErrorDetail(err.response?.data?.detail));
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to load candidate applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchApplications, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, jobIdFilter]);

  // Keep URL search params in sync
  useEffect(() => {
    const newParams = {};
    if (statusFilter !== "ALL") newParams.status = statusFilter;
    if (jobIdFilter !== "All") newParams.jobId = jobIdFilter;
    if (search.trim()) newParams.search = search.trim();
    setSearchParams(newParams, { replace: true });
  }, [statusFilter, jobIdFilter, search, setSearchParams]);

  // Open details modal
  const openCandidateDrawer = async (applicationId) => {
    try {
      const res = await api.get(`/admin/recruitment/applications/${applicationId}`);
      setSelectedApp(res.data);
    } catch (err) {
      console.error("Failed to load candidate details:", err);
      toast.error("Failed to load candidate dossier.");
    }
  };

  const closeCandidateDrawer = () => {
    setSelectedApp(null);
  };

  // Status update
  const handleUpdateStatus = async (newSt, reason) => {
    if (!selectedApp) return;
    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/admin/recruitment/applications/${selectedApp.id}/status`, {
        status: newSt,
        reason: reason || undefined,
      });

      toast.success(res.data?.message || `Candidate moved to stage "${newSt}".`);
      setSelectedApp((prev) => ({
        ...prev,
        status: newSt,
        statusHistory: [
          {
            fromStatus: prev.status,
            toStatus: newSt,
            note: reason || undefined,
            changedAt: new Date().toISOString(),
          },
          ...(prev.statusHistory || []),
        ],
      }));

      await fetchApplications();
      await fetchStats();
    } catch (err) {
      console.error("Update candidate status error:", err);
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to update candidate status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Add recruiter note
  const handleAddNote = async (noteText) => {
    if (!selectedApp || !noteText?.trim()) return;
    try {
      setAddingNote(true);
      const res = await api.post(`/admin/recruitment/applications/${selectedApp.id}/notes`, {
        text: noteText.trim(),
      });

      toast.success("Recruiter note logged successfully.");
      setSelectedApp((prev) => ({
        ...prev,
        notes: [
          {
            text: noteText.trim(),
            createdAt: new Date().toISOString(),
            author: "Recruiter",
          },
          ...(Array.isArray(prev.notes) ? prev.notes : []),
        ],
      }));
    } catch (err) {
      console.error("Add candidate note error:", err);
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to save recruiter note.");
    } finally {
      setAddingNote(false);
    }
  };

  // CV Download Handler
  const handleDownloadResume = async (appDoc) => {
    if (!appDoc?.id) return;
    try {
      setDownloadingId(appDoc.id);
      const toastId = toast.loading(`Preparing CV for ${appDoc.name || "candidate"}…`);

      const res = await api.get(`/admin/recruitment/applications/${appDoc.id}/resume`, {
        responseType: "blob",
      });

      const contentType = res.headers["content-type"] || "application/pdf";
      let extension = ".pdf";
      if (contentType.includes("word") || contentType.includes("officedocument")) {
        extension = ".docx";
      }

      const safeName = (appDoc.name || "candidate").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
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
      toast.error("Failed to download CV. The file reference may be missing or inaccessible.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Permanent Delete Handler
  const confirmDeleteApplicant = async () => {
    if (!deleteCandidate || isDeleting) return;

    try {
      setIsDeleting(true);
      const res = await api.delete(`/admin/recruitment/applications/${deleteCandidate.id}`);
      toast.success(res.data?.message || `Applicant ${deleteCandidate.name} permanently deleted.`);

      if (selectedApp?.id === deleteCandidate.id) {
        closeCandidateDrawer();
      }
      setDeleteCandidate(null);

      await fetchApplications();
      await fetchStats();
    } catch (err) {
      console.error("Delete applicant error:", err);
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to delete applicant record.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Sorted and Paginated Applications
  const sortedApplications = useMemo(() => {
    const list = [...applications];
    list.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    return list;
  }, [applications, sortOrder]);

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedApplications.slice(start, start + pageSize);
  }, [sortedApplications, currentPage, pageSize]);

  return (
    <div data-testid="admin-recruitment-applications-page" className="space-y-6">
      {/* Top Header */}
      <AdminHeader
        category="Recruitment Console"
        subcategory="Candidate Pipeline"
        title="Career Applications & Pipeline"
        subtitle="Review candidate applications, download PDF CVs, track pipeline stages, and manage recruitment decisions."
        onRefresh={() => {
          fetchApplications();
          fetchStats();
        }}
        refreshing={loading}
        actions={[
          {
            label: "General Career Leads →",
            to: "/admin/leads/careers",
            variant: "outline",
          },
        ]}
      />

      {/* DASHBOARD LIVE SUMMARY CARDS (7 Stages) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Applications */}
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
            {stats.total}
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
            {stats.new}
          </div>
          <div className="text-[10px] text-[var(--admin-info)] uppercase tracking-wider mt-1 font-medium">Unreviewed</div>
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
            {stats.underReview}
          </div>
          <div className="text-[10px] text-[var(--admin-warning)] uppercase tracking-wider mt-1 font-medium">In Evaluation</div>
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
            {stats.shortlisted}
          </div>
          <div className="text-[10px] text-teal-700 dark:text-teal-400 uppercase tracking-wider mt-1 font-medium">Qualified</div>
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
            {stats.interviewScheduled}
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
            {stats.selected}
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
            {stats.rejected}
          </div>
          <div className="text-[10px] text-[var(--admin-error)] uppercase tracking-wider mt-1 font-medium">Archived</div>
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <AdminFilterBar
        statusOptions={["ALL", ...STAGES]}
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search name, email, phone, role..."
      >
        {/* Vacancy Dropdown */}
        <select
          value={jobIdFilter}
          onChange={(e) => {
            setJobIdFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 px-3 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] max-w-[180px] truncate cursor-pointer"
          style={{
            backgroundColor: "var(--admin-input-bg)",
            borderColor: "var(--admin-input-border)",
            borderWidth: "1px",
            color: "var(--admin-input-text)",
          }}
        >
          <option value="All">All Openings</option>
          {jobsList.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>

        {/* Sort Order Selector */}
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="h-9 px-3 border border-[var(--admin-border)] hover:border-[var(--admin-accent)] rounded-md text-xs text-[var(--admin-text-primary)] bg-[var(--admin-surface)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs font-medium"
          title="Toggle application date sorting"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-[var(--admin-accent)]" />
          <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
        </button>
      </AdminFilterBar>

      {/* APPLICANT TABLE */}
      {loading ? (
        <div className="text-[var(--admin-text-muted)] text-center py-20 tracking-[0.3em] uppercase text-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 text-[var(--admin-accent)] animate-spin" />
          <span>Loading Candidate Applications…</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 border border-rose-500/30 bg-rose-500/10 rounded-lg text-rose-500 text-sm p-6">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchApplications}
            className="btn-admin-primary mt-4 inline-flex"
          >
            Retry
          </button>
        </div>
      ) : sortedApplications.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title={statusFilter === "ALL" && !search ? "No candidate applications received yet." : "No candidates matched your search."}
          message="Candidate applications submitted through specific job openings will appear here."
          onClearFilters={
            statusFilter !== "ALL" || search || jobIdFilter !== "All"
              ? () => {
                  setStatusFilter("ALL");
                  setSearch("");
                  setJobIdFilter("All");
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
                  <th className="text-left p-4 font-semibold">Ref #</th>
                  <th className="text-left p-4 font-semibold">Applicant Name</th>
                  <th className="text-left p-4 font-semibold">Role Applied For</th>
                  <th className="text-left p-4 font-semibold hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 font-semibold hidden lg:table-cell">Experience</th>
                  <th className="text-left p-4 font-semibold hidden sm:table-cell">Applied Date</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-center p-4 font-semibold">CV (PDF)</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openCandidateDrawer(app.id)}
                    className="admin-tr cursor-pointer group"
                  >
                    {/* Ref # */}
                    <td className="p-4 font-mono font-bold text-[var(--admin-accent)] text-xs whitespace-nowrap">
                      {app.referenceNumber || (app.id ? `#${app.id.slice(-6).toUpperCase()}` : "—")}
                    </td>

                    {/* Applicant Name */}
                    <td className="p-4">
                      <div className="font-semibold text-[var(--admin-text-primary)] text-sm group-hover:text-[var(--admin-accent)] transition-colors">
                        {app.name}
                      </div>
                      {app.currentCompany && (
                        <div className="text-[11px] text-[var(--admin-text-muted)] truncate max-w-[160px]">
                          {app.currentCompany}
                        </div>
                      )}
                    </td>

                    {/* Job Title & Department */}
                    <td className="p-4">
                      <div className="text-xs font-semibold text-[var(--admin-text-primary)] truncate max-w-[180px]">
                        {app.jobTitle}
                      </div>
                      <div className="text-[10px] text-[var(--admin-accent)] tracking-wider uppercase mt-0.5 font-medium">
                        {app.department || "Sales & Advisory"}
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

                    {/* Experience */}
                    <td className="p-4 text-xs text-[var(--admin-text-secondary)] hidden lg:table-cell">
                      <div className="font-semibold text-[var(--admin-text-primary)]">
                        {app.experienceYears != null ? `${app.experienceYears} Years` : "—"}
                      </div>
                      <div className="text-[11px] text-[var(--admin-text-muted)]">
                        {app.noticePeriodDays != null ? `${app.noticePeriodDays}d Notice` : ""}
                      </div>
                    </td>

                    {/* Application Date */}
                    <td className="p-4 text-xs text-[var(--admin-text-secondary)] hidden sm:table-cell font-mono whitespace-nowrap">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }) : "—"}
                    </td>

                    {/* Stage Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={app.status || "New"} />
                    </td>

                    {/* CV Download Action */}
                    <td className="p-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {app.hasResume || app.resumeFileId ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadResume(app)}
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

                    {/* Actions: View Details & Delete */}
                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openCandidateDrawer(app.id)}
                          className="p-1.5 text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)] rounded-md transition-colors cursor-pointer"
                          title="View Applicant Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteCandidate({
                              id: app.id,
                              name: app.name,
                              jobTitle: app.jobTitle,
                              referenceNumber: app.referenceNumber,
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
            totalItems={sortedApplications.length}
            pageSize={pageSize}
            itemLabel="candidates"
          />
        </div>
      )}

      {/* STANDARDIZED APPLICANT DETAILS MODAL */}
      <ApplicantDetailsModal
        isOpen={Boolean(selectedApp)}
        applicant={selectedApp}
        onClose={closeCandidateDrawer}
        onDownloadCv={handleDownloadResume}
        isDownloading={downloadingId === selectedApp?.id}
        onUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={updatingStatus}
        availableStatuses={STAGES}
        onSaveNotes={handleAddNote}
        isSavingNotes={addingNote}
        onDelete={(app) =>
          setDeleteCandidate({
            id: app.id,
            name: app.name,
            jobTitle: app.jobTitle,
            referenceNumber: app.referenceNumber,
          })
        }
      />

      {/* STANDARDIZED DELETION CONFIRMATION DIALOG */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Permanently Delete Applicant"
        itemName={deleteCandidate?.name}
        itemType="Candidate Application"
        warning="This action is irreversible. The applicant's contact details, experience, notes history, and associated PDF CV document will be permanently removed from MongoDB and GridFS storage."
        onConfirm={confirmDeleteApplicant}
        onCancel={() => !isDeleting && setDeleteCandidate(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
