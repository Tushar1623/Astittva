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
  Linkedin,
  Globe,
  Briefcase,
  Calendar,
  FileText,
  MessageSquare,
  Building,
  RefreshCw,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileCheck,
  FileX,
  ExternalLink,
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const STAGES = [
  "New",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Selected",
  "Rejected",
  "Withdrawn",
];

const STATUS_BADGE_CLASSES = {
  New: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  "Under Review": "border-amber-500/40 text-amber-400 bg-amber-500/10",
  Shortlisted: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  "Interview Scheduled": "border-purple-500/40 text-purple-400 bg-purple-500/10",
  Selected: "border-green-500/40 text-green-400 bg-green-500/10",
  Rejected: "border-red-500/40 text-red-400 bg-red-500/10",
  Withdrawn: "border-zinc-500/40 text-zinc-400 bg-zinc-500/10",
};

export default function AdminRecruitmentApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Application Data & Pagination State
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobsList, setJobsList] = useState([]);

  // Live Stats State (Calculated from actual database records)
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
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" = newest first, "asc" = oldest first

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected Candidate for slide-over side panel / modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status Change State
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Private Recruiter Note State
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // CV Download State
  const [downloadingId, setDownloadingId] = useState(null);

  // Delete Confirmation Modal State
  const [deleteCandidate, setDeleteCandidate] = useState(null); // { id, name, jobTitle, referenceNumber }
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

  // Fetch live stats from actual database records
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
      console.error("Failed to load recruitment stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch applications list with filters
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/recruitment/applications", {
        params: {
          search: search.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          jobId: jobIdFilter !== "All" ? jobIdFilter : undefined,
          limit: 100, // Fetch up to 100 for responsive client-side pagination & sorting
        },
      });
      const list = Array.isArray(res?.data?.applications)
        ? res.data.applications
        : (Array.isArray(res?.data) ? res.data : []);
      setApplications(list);
      setTotal(typeof res?.data?.total === "number" ? res.data.total : list.length);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setApplications([]);
      setTotal(0);
      setError(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, jobIdFilter]);

  // Open candidate details if `id` parameter is in URL
  useEffect(() => {
    const candidateId = searchParams.get("id");
    if (candidateId && (!selectedApp || selectedApp.id !== candidateId)) {
      openCandidateDrawer(candidateId);
    }
  }, [searchParams]);

  const openCandidateDrawer = async (appId) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/admin/recruitment/applications/${appId}`);
      setSelectedApp(res.data);
      setNewStatus(res.data.status || "New");
      setStatusReason("");
    } catch (err) {
      console.error("Failed to load candidate details:", err);
      toast.error("Could not load candidate details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeCandidateDrawer = () => {
    setSelectedApp(null);
    if (searchParams.get("id")) {
      const next = new URLSearchParams(searchParams);
      next.delete("id");
      setSearchParams(next);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp || updatingStatus || newStatus === selectedApp.status) return;

    try {
      setUpdatingStatus(true);
      const res = await api.patch(`/admin/recruitment/applications/${selectedApp.id}/status`, {
        status: newStatus,
        reason: statusReason.trim() || `Moved to ${newStatus}`,
      });
      toast.success(res.data?.message || `Status updated to ${newStatus}`);

      // Refresh application details and lists
      const refreshed = await api.get(`/admin/recruitment/applications/${selectedApp.id}`);
      setSelectedApp(refreshed.data);
      setStatusReason("");
      fetchApplications();
      fetchStats();
    } catch (err) {
      console.error("Update status error:", err);
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedApp || addingNote || !newNote.trim()) return;

    try {
      setAddingNote(true);
      const res = await api.post(`/admin/recruitment/applications/${selectedApp.id}/notes`, {
        note: newNote.trim(),
      });
      toast.success("Recruiter note added!");
      setNewNote("");
      setSelectedApp((prev) => ({
        ...prev,
        notes: res.data?.notes || [],
      }));
    } catch (err) {
      console.error("Add note error:", err);
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setAddingNote(false);
    }
  };

  // Secure PDF CV Download via authenticated Blob stream
  const handleDownloadResume = async (app) => {
    if (!app) return;
    if (!app.hasResume && !app.resumeFileId) {
      toast.info("No CV or resume file attached to this candidate application.");
      return;
    }

    try {
      setDownloadingId(app.id);
      const toastId = toast.loading(`Preparing CV download for ${app.name}...`);
      
      const endpoint = `/admin/recruitment/applications/${app.id}/resume`;
      const res = await api.get(endpoint, { responseType: "blob" });

      const contentType = res.headers["content-type"] || "application/pdf";
      let extension = ".pdf";
      if (contentType.includes("word") || contentType.includes("officedocument")) {
        extension = ".docx";
      }

      const safeName = (app.name || "candidate").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = app.resumeFilename || `${safeName}_CV${extension}`;

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

      // Close details drawer if the deleted application was open
      if (selectedApp?.id === deleteCandidate.id) {
        closeCandidateDrawer();
      }
      setDeleteCandidate(null);

      // Refresh table and live stats
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

  const totalPages = Math.max(1, Math.ceil(sortedApplications.length / pageSize));
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedApplications.slice(start, start + pageSize);
  }, [sortedApplications, currentPage, pageSize]);

  return (
    <div data-testid="admin-recruitment-applications-page" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-copper/15">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper">
              RECRUITMENT CONSOLE
            </span>
            <span className="text-ivory/30">•</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/50">
              CANDIDATE PIPELINE
            </span>
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
            Career Applications &amp; Pipeline
          </h1>
          <p className="text-ivory/55 text-sm mt-1">
            Review candidate applications, download PDF CVs, track pipeline stages, and manage recruitment decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/leads/careers"
            className="text-xs uppercase tracking-[0.12em] px-3.5 py-2 rounded-[4px] border border-copper/30 hover:border-copper text-ivory/80 hover:text-white transition-colors"
          >
            General Career Leads →
          </Link>
          <button
            onClick={() => {
              fetchApplications();
              fetchStats();
            }}
            disabled={loading}
            title="Refresh pipeline data"
            className="p-2 border border-copper/20 hover:border-copper/40 text-ivory/70 hover:text-copper rounded-[4px] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* DASHBOARD LIVE SUMMARY CARDS (Calculated from actual stored records) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Applications */}
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`p-4 rounded-[6px] border text-left transition-all ${
            statusFilter === "ALL"
              ? "bg-copper/20 border-copper shadow-md ring-1 ring-copper/50"
              : "bg-charcoal border-copper/20 hover:border-copper/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/60 font-semibold">
              Total
            </span>
            <Users className="w-4 h-4 text-copper" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-light text-ivory mt-2">
            {stats.total}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">Applications</div>
        </button>

        {/* New */}
        <button
          type="button"
          onClick={() => setStatusFilter("New")}
          className={`p-4 rounded-[6px] border text-left transition-all ${
            statusFilter === "New"
              ? "bg-blue-500/20 border-blue-400 ring-1 ring-blue-400"
              : "bg-charcoal border-blue-500/25 hover:border-blue-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] uppercase text-blue-400 font-semibold">
              New
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-light text-blue-300 mt-2">
            {stats.new}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">Unreviewed</div>
        </button>

        {/* Under Review */}
        <button
          type="button"
          onClick={() => setStatusFilter("Under Review")}
          className={`p-4 rounded-[6px] border text-left transition-all ${
            statusFilter === "Under Review"
              ? "bg-amber-500/20 border-amber-400 ring-1 ring-amber-400"
              : "bg-charcoal border-amber-500/25 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] uppercase text-amber-400 font-semibold">
              Under Review
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-light text-amber-300 mt-2">
            {stats.underReview}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">In Evaluation</div>
        </button>

        {/* Shortlisted */}
        <button
          type="button"
          onClick={() => setStatusFilter("Shortlisted")}
          className={`p-4 rounded-[6px] border text-left transition-all ${
            statusFilter === "Shortlisted"
              ? "bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400"
              : "bg-charcoal border-emerald-500/25 hover:border-emerald-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] uppercase text-emerald-400 font-semibold">
              Shortlisted
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-light text-emerald-300 mt-2">
            {stats.shortlisted}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">Qualified</div>
        </button>

        {/* Interview Scheduled */}
        <button
          type="button"
          onClick={() => setStatusFilter("Interview Scheduled")}
          className={`p-4 rounded-[6px] border text-left transition-all ${
            statusFilter === "Interview Scheduled"
              ? "bg-purple-500/20 border-purple-400 ring-1 ring-purple-400"
              : "bg-charcoal border-purple-500/25 hover:border-purple-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] uppercase text-purple-400 font-semibold">
              Interview
            </span>
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-light text-purple-300 mt-2">
            {stats.interviewScheduled}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">Scheduled</div>
        </button>

        {/* Selected */}
        <button
          type="button"
          onClick={() => setStatusFilter("Selected")}
          className={`p-4 rounded-[6px] border text-left transition-all ${
            statusFilter === "Selected"
              ? "bg-green-600/20 border-green-400 ring-1 ring-green-400"
              : "bg-charcoal border-green-600/25 hover:border-green-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] uppercase text-green-400 font-semibold">
              Selected
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-light text-green-300 mt-2">
            {stats.selected}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">Offers Extended</div>
        </button>

        {/* Rejected */}
        <button
          type="button"
          onClick={() => setStatusFilter("Rejected")}
          className={`p-4 rounded-[6px] border text-left transition-all ${
            statusFilter === "Rejected"
              ? "bg-red-500/20 border-red-400 ring-1 ring-red-400"
              : "bg-charcoal border-red-500/25 hover:border-red-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.2em] uppercase text-red-400 font-semibold">
              Rejected
            </span>
            <X className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-light text-red-300 mt-2">
            {stats.rejected}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">Archived</div>
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-charcoal-2/40 border border-copper/15 p-4 rounded-[6px] space-y-3">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {["ALL", ...STAGES].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-medium tracking-[0.08em] uppercase transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-copper text-white font-semibold shadow-sm"
                    : "bg-charcoal/60 text-ivory/70 hover:text-ivory hover:bg-charcoal"
                }`}
              >
                {st}
                {st === "ALL" ? ` (${total})` : ""}
              </button>
            ))}
          </div>

          {/* Search, Job Filter, and Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Vacancy Dropdown */}
            <select
              value={jobIdFilter}
              onChange={(e) => setJobIdFilter(e.target.value)}
              className="h-9 px-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper max-w-[180px] truncate"
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
              className="h-9 px-3 bg-charcoal border border-copper/20 hover:border-copper/40 rounded-[4px] text-xs text-ivory/80 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Toggle application date sorting"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-copper" />
              <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
            </button>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone, role..."
                className="w-full h-9 pl-9 pr-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-ivory"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* APPLICANT TABLE */}
      {loading ? (
        <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 text-copper animate-spin" />
          <span>Loading Candidate Applications…</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 border border-copper/20 bg-charcoal-2/30 rounded-[8px] text-red-400 text-sm p-6">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchApplications}
            className="mt-4 px-4 py-1.5 bg-copper text-white text-xs uppercase tracking-wider rounded-[4px]"
          >
            Retry
          </button>
        </div>
      ) : sortedApplications.length === 0 ? (
        <div className="text-center py-20 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[6px] space-y-2">
          <Users className="w-8 h-8 text-copper/40 mx-auto" />
          <p className="text-sm font-normal">
            {statusFilter === "ALL" && !search
              ? "No candidate applications received yet."
              : "No candidates matched your search or filter criteria."}
          </p>
          {(statusFilter !== "ALL" || search) && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setSearch("");
                setJobIdFilter("All");
              }}
              className="text-xs text-copper underline underline-offset-4 hover:text-copper-light"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal text-ivory/60 text-[10px] tracking-[0.22em] uppercase border-b border-copper/15">
                <tr>
                  <th className="text-left p-4 font-normal">Ref #</th>
                  <th className="text-left p-4 font-normal">Applicant Name</th>
                  <th className="text-left p-4 font-normal">Role Applied For</th>
                  <th className="text-left p-4 font-normal hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 font-normal hidden lg:table-cell">Experience</th>
                  <th className="text-left p-4 font-normal hidden sm:table-cell">Applied Date</th>
                  <th className="text-left p-4 font-normal">Status</th>
                  <th className="text-center p-4 font-normal">CV (PDF)</th>
                  <th className="text-right p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openCandidateDrawer(app.id)}
                    className="border-t border-copper/10 hover:bg-charcoal/50 transition-colors cursor-pointer group"
                  >
                    {/* Ref # */}
                    <td className="p-4 font-mono font-bold text-copper text-xs whitespace-nowrap">
                      {app.referenceNumber || app.id.slice(-6)}
                    </td>

                    {/* Applicant Name */}
                    <td className="p-4">
                      <div className="font-medium text-ivory text-sm group-hover:text-copper transition-colors">
                        {app.name}
                      </div>
                      {app.currentCompany && (
                        <div className="text-[11px] text-ivory/45 truncate max-w-[160px]">
                          {app.currentCompany}
                        </div>
                      )}
                    </td>

                    {/* Job Title & Department */}
                    <td className="p-4">
                      <div className="text-xs text-ivory/90 font-medium truncate max-w-[180px]">
                        {app.jobTitle}
                      </div>
                      <div className="text-[10px] text-copper/80 tracking-wider uppercase mt-0.5">
                        {app.department || "Sales & Advisory"}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 text-xs text-ivory/70 hidden md:table-cell">
                      <a
                        href={`mailto:${app.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-copper block truncate max-w-[160px]"
                        title={app.email}
                      >
                        {app.email}
                      </a>
                      <a
                        href={`tel:${app.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-ivory/45 text-[11px] font-mono hover:text-copper block mt-0.5"
                      >
                        {app.phone}
                      </a>
                    </td>

                    {/* Experience */}
                    <td className="p-4 text-xs text-ivory/70 hidden lg:table-cell">
                      <div className="font-medium text-ivory/90">
                        {app.experienceYears != null ? `${app.experienceYears} Years` : "—"}
                      </div>
                      <div className="text-[11px] text-ivory/45">
                        {app.noticePeriodDays != null ? `${app.noticePeriodDays}d Notice` : ""}
                      </div>
                    </td>

                    {/* Application Date */}
                    <td className="p-4 text-xs text-ivory/60 hidden sm:table-cell font-mono whitespace-nowrap">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }) : "—"}
                    </td>

                    {/* Stage Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-[3px] border font-medium ${
                          STATUS_BADGE_CLASSES[app.status] || "border-copper/30 text-copper bg-copper/5"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* CV Availability & Direct PDF Download Action */}
                    <td className="p-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {app.hasResume || app.resumeFileId ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadResume(app)}
                          disabled={downloadingId === app.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-copper hover:text-white bg-copper/15 hover:bg-copper rounded-[3px] border border-copper/35 transition-all shadow-sm disabled:opacity-50"
                          title={`Download ${app.name}'s CV as PDF`}
                        >
                          {downloadingId === app.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>Download CV</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-ivory/30 text-[11px] italic">
                          <FileX className="w-3.5 h-3.5" />
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
                          className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
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
                          className="p-1.5 text-ivory/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
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

          {/* TABLE PAGINATION BAR */}
          {sortedApplications.length > pageSize && (
            <div className="px-4 py-3 bg-charcoal border-t border-copper/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/60">
              <div>
                Showing{" "}
                <strong className="text-ivory">
                  {(currentPage - 1) * pageSize + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-ivory">
                  {Math.min(currentPage * pageSize, sortedApplications.length)}
                </strong>{" "}
                of <strong className="text-copper">{sortedApplications.length}</strong> applicants
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 border border-copper/20 hover:border-copper rounded-[3px] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                  Prev
                </button>
                <div className="font-mono text-xs px-2">
                  Page <strong className="text-ivory">{currentPage}</strong> of {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 border border-copper/20 hover:border-copper rounded-[3px] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* APPLICANT DETAILS SLIDE-OVER SIDE PANEL / MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#18181b] border border-copper/30 rounded-[10px] max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-ivory">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-copper/15 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-copper tracking-wider px-2 py-0.5 rounded bg-copper/10 border border-copper/25">
                    REF: {selectedApp.referenceNumber || selectedApp.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-[3px] text-[10px] font-mono tracking-wider uppercase border font-semibold ${
                      STATUS_BADGE_CLASSES[selectedApp.status] || "border-copper/30 text-copper"
                    }`}
                  >
                    {selectedApp.status}
                  </span>
                </div>
                <h2 className="font-display text-2xl text-ivory mt-1">{selectedApp.name}</h2>
                <p className="text-xs text-ivory/60 mt-0.5">
                  Applied for:{" "}
                  <strong className="text-copper font-medium">{selectedApp.jobTitle}</strong>
                  {selectedApp.department && (
                    <span className="text-ivory/40"> • {selectedApp.department}</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeCandidateDrawer}
                  className="p-2 text-ivory/60 hover:text-copper hover:bg-charcoal rounded transition-colors"
                  title="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-charcoal rounded-[6px] border border-copper/20 mb-6">
              <div className="flex items-center gap-2">
                {selectedApp.hasResume || selectedApp.resumeFileId ? (
                  <button
                    type="button"
                    onClick={() => handleDownloadResume(selectedApp)}
                    disabled={downloadingId === selectedApp.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {downloadingId === selectedApp.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Download CV (PDF)</span>
                  </button>
                ) : (
                  <span className="text-xs text-ivory/40 italic flex items-center gap-1.5">
                    <FileX className="w-4 h-4" />
                    No downloadable CV uploaded
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteCandidate({
                    id: selectedApp.id,
                    name: selectedApp.name,
                    jobTitle: selectedApp.jobTitle,
                    referenceNumber: selectedApp.referenceNumber,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors"
                title="Permanently remove candidate and CV"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Applicant</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              {/* Stage Transition Control Box */}
              <div className="bg-charcoal/80 border border-copper/25 rounded-[6px] p-5 space-y-3">
                <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper block">
                  Update Candidate Stage
                </span>

                <form onSubmit={handleUpdateStatus} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="h-10 px-3 bg-[#18181b] border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder="Optional stage transition reason..."
                      className="h-10 px-3 bg-[#18181b] border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper sm:col-span-1"
                    />

                    <button
                      type="submit"
                      disabled={updatingStatus || newStatus === selectedApp.status}
                      className="h-10 px-4 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.15em] rounded-[4px] transition-colors disabled:opacity-40"
                    >
                      {updatingStatus ? "Updating…" : "Update Stage"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Candidate Contact & Professional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 rounded-[6px] bg-charcoal/60 border border-copper/15 text-xs">
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedApp.email}`}
                    className="text-ivory font-medium hover:text-copper underline underline-offset-2"
                  >
                    {selectedApp.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Phone Number
                  </span>
                  <a
                    href={`tel:${selectedApp.phone}`}
                    className="text-ivory font-medium font-mono hover:text-copper"
                  >
                    {selectedApp.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Total Experience
                  </span>
                  <p className="text-ivory font-medium">
                    {selectedApp.experienceYears != null ? `${selectedApp.experienceYears} Years` : "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Current Organization
                  </span>
                  <p className="text-ivory font-medium">{selectedApp.currentCompany || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Current CTC
                  </span>
                  <p className="text-ivory font-medium">{selectedApp.currentCtc || "Not disclosed"}</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Expected CTC
                  </span>
                  <p className="text-ivory font-medium">{selectedApp.expectedCtc || "Not disclosed"}</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Notice Period
                  </span>
                  <p className="text-ivory font-medium">
                    {selectedApp.noticePeriodDays != null ? `${selectedApp.noticePeriodDays} Days` : "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Location
                  </span>
                  <p className="text-ivory font-medium">{selectedApp.location || "Kolkata, West Bengal"}</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Application Date
                  </span>
                  <p className="text-ivory font-medium font-mono">
                    {selectedApp.createdAt
                      ? new Date(selectedApp.createdAt).toLocaleString("en-IN")
                      : "—"}
                  </p>
                </div>
              </div>

              {/* CV File Storage Details Card */}
              <div className="p-5 rounded-[6px] bg-charcoal/60 border border-copper/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-copper" />
                    <span className="text-[10px] tracking-[0.2em] uppercase text-copper font-semibold">
                      Stored Resume Document (GridFS)
                    </span>
                  </div>
                  <p className="text-xs text-ivory font-medium font-mono">
                    {selectedApp.resumeFilename || (selectedApp.hasResume ? "applicant-resume.pdf" : "None")}
                  </p>
                  <p className="text-[11px] text-ivory/50">
                    {selectedApp.hasResume || selectedApp.resumeFileId
                      ? "Protected file storage in career_resumes bucket. Ready for verified staff download."
                      : "Candidate did not attach a resume file during application."}
                  </p>
                </div>

                {(selectedApp.hasResume || selectedApp.resumeFileId) && (
                  <button
                    type="button"
                    onClick={() => handleDownloadResume(selectedApp)}
                    disabled={downloadingId === selectedApp.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors shadow-sm shrink-0 disabled:opacity-50"
                  >
                    {downloadingId === selectedApp.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Download CV (PDF)</span>
                  </button>
                )}
              </div>

              {/* Cover Note */}
              {selectedApp.coverNote && (
                <div className="p-5 rounded-[6px] bg-charcoal/60 border border-copper/15 text-xs">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper font-semibold block mb-2">
                    Cover Letter / Candidate Message
                  </span>
                  <p className="text-ivory/85 whitespace-pre-wrap leading-relaxed bg-[#18181b] p-3 rounded border border-copper/10 font-sans">
                    {selectedApp.coverNote}
                  </p>
                </div>
              )}

              {/* Stage Transition History Audit Trail */}
              {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                <div className="p-5 rounded-[6px] bg-charcoal/60 border border-copper/15 text-xs space-y-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper font-semibold block">
                    Stage Transition Audit Log
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedApp.statusHistory.map((h, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-3 text-xs border-b border-copper/10 pb-2 last:border-0"
                      >
                        <div>
                          <span className="font-semibold text-ivory">{h.toStatus}</span>
                          {h.reason && <p className="text-[11px] text-ivory/60 mt-0.5">{h.reason}</p>}
                        </div>
                        <div className="text-right text-[10px] text-ivory/45 font-mono">
                          <div>{h.changedBy || "Staff"}</div>
                          <div>
                            {h.changedAt ? new Date(h.changedAt).toLocaleString("en-IN") : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Private Recruiter Notes Section */}
              <div className="p-5 rounded-[6px] bg-charcoal/60 border border-copper/15 text-xs space-y-4">
                <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper block">
                  Private Recruiter Notes
                </span>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal evaluation note, interview feedback, or review comments..."
                    className="w-full p-3 bg-[#18181b] border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={addingNote || !newNote.trim()}
                      className="px-4 py-1.5 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors disabled:opacity-40"
                    >
                      {addingNote ? "Saving…" : "Save Internal Note"}
                    </button>
                  </div>
                </form>

                {selectedApp.notes && selectedApp.notes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-copper/15 max-h-48 overflow-y-auto">
                    {selectedApp.notes.map((n, idx) => (
                      <div key={idx} className="p-3 bg-[#18181b] rounded-[4px] border border-copper/10 text-xs">
                        <p className="text-ivory/90 whitespace-pre-wrap leading-relaxed">{n.note}</p>
                        <div className="flex items-center justify-between text-[10px] text-ivory/45 font-mono mt-2 pt-1 border-t border-copper/10">
                          <span>By: {n.author || "Recruiter"}</span>
                          <span>{n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-copper/15 flex items-center justify-between">
              <button
                type="button"
                onClick={closeCandidateDrawer}
                className="px-4 py-2 border border-copper/20 hover:border-copper/40 text-ivory/70 hover:text-ivory text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors"
              >
                Close Panel
              </button>
              <button
                type="button"
                onClick={() =>
                  setDeleteCandidate({
                    id: selectedApp.id,
                    name: selectedApp.name,
                    jobTitle: selectedApp.jobTitle,
                    referenceNumber: selectedApp.referenceNumber,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-950/40 border border-red-500/30 hover:bg-red-900/60 text-red-400 hover:text-red-200 text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: PERMANENT APPLICANT DELETION */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#18181b] border border-red-500/40 rounded-[8px] max-w-md w-full p-6 text-ivory shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-display text-ivory">Permanently Delete Applicant</h3>
                <p className="text-xs text-ivory/70 mt-1 leading-relaxed">
                  Are you sure you want to delete the candidate application for{" "}
                  <strong className="text-ivory font-semibold">{deleteCandidate.name}</strong> applied for{" "}
                  <span className="text-copper font-medium">{deleteCandidate.jobTitle}</span>?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-[4px] text-[11px] text-red-200 leading-relaxed space-y-1">
              <div className="font-semibold text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Permanent Deletion Warning:
              </div>
              <div>
                This action is irreversible. The applicant's contact details, experience, notes history, and associated PDF CV document will be permanently removed from MongoDB and GridFS storage.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => !isDeleting && setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-copper/20 hover:border-copper/40 text-ivory/70 hover:text-ivory text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteApplicant}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors disabled:opacity-50 shadow-md"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Record…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
