import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import {
  Briefcase,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Download,
  FileText,
  Search,
  RefreshCw,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileCheck,
  FileX,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ApplicantDetailsModal from "@/components/admin/ApplicantDetailsModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

const CAREER_STATUSES = [
  "New",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Selected",
  "Rejected",
];

const STATUS_BADGE_CLASSES = {
  New: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  "Under Review": "border-amber-500/40 text-amber-400 bg-amber-500/10",
  Reviewing: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  Shortlisted: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  "Interview Scheduled": "border-purple-500/40 text-purple-400 bg-purple-500/10",
  Interview: "border-purple-500/40 text-purple-400 bg-purple-500/10",
  Selected: "border-green-500/40 text-green-400 bg-green-500/10",
  Rejected: "border-red-500/40 text-red-400 bg-red-500/10",
};

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
  const [deleteCandidate, setDeleteCandidate] = useState(null); // { id, name, jobTitle }
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
    setSavingNotes(true);
    try {
      await api.patch(`/admin/leads/career/${selectedApp.id}`, { notes: finalNotes });
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, notes: finalNotes } : a))
      );
      setSelectedApp((prev) => ({ ...prev, notes: finalNotes }));
      setEditingNotes(finalNotes);
      toast.success("Internal notes saved successfully");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // Secure Permanent Delete
  const confirmDelete = async () => {
    if (!deleteCandidate || isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/admin/leads/career/${deleteCandidate.id}`);
      setApplications((prev) => prev.filter((a) => a.id !== deleteCandidate.id));
      if (selectedApp?.id === deleteCandidate.id) setSelectedApp(null);
      setDeleteCandidate(null);
      toast.success(res.data?.message || "Career application permanently deleted");
    } catch (e) {
      console.error("Delete career application error:", e);
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete application");
    } finally {
      setIsDeleting(false);
    }
  };

  // Secure Authenticated PDF CV Download
  const downloadResume = async (appDoc) => {
    if (!appDoc) return;
    if (!appDoc.hasResumeFile && (!appDoc.resumeUrl || !appDoc.resumeUrl.includes("/resume"))) {
      if (appDoc.resumeUrl && appDoc.resumeUrl.startsWith("http")) {
        window.open(appDoc.resumeUrl, "_blank");
        return;
      }
      toast.info("No CV or resume file attached to this application.");
      return;
    }

    try {
      setDownloadingId(appDoc.id);
      const toastId = toast.loading(`Downloading CV for ${appDoc.name}...`);
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

  const totalPages = Math.max(1, Math.ceil(sortedApps.length / pageSize));
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedApps.slice(start, start + pageSize);
  }, [sortedApps, currentPage, pageSize]);

  return (
    <div data-testid="admin-career-applications-page" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-copper/15">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper">
              TALENT RECRUITMENT
            </span>
            <span className="text-ivory/30">•</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/50">
              GENERAL CAREER SUBMISSIONS
            </span>
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
            Career Applications
          </h1>
          <p className="text-ivory/55 text-sm mt-1">
            General career submissions from the website Careers portal, with secure CV downloads and applicant management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/recruitment/applications"
            className="text-xs uppercase tracking-[0.12em] px-3.5 py-2 rounded-[4px] border border-copper/30 hover:border-copper text-ivory/80 hover:text-white transition-colors"
          >
            Candidate Pipeline (Job Board) →
          </Link>
          <button
            onClick={load}
            disabled={loading}
            title="Refresh submissions"
            className="p-2 border border-copper/20 hover:border-copper/40 text-ivory/70 hover:text-copper rounded-[4px] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* LIVE DASHBOARD SUMMARY CARDS (Calculated from actual database records) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total */}
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
            {liveStats.total}
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
            {liveStats.new}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">Pending</div>
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
            {liveStats.underReview}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">In Review</div>
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
            {liveStats.shortlisted}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">Approved</div>
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
            {liveStats.interviewScheduled}
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
            {liveStats.selected}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">Hired</div>
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
            {liveStats.rejected}
          </div>
          <div className="text-[10px] text-ivory/40 uppercase tracking-wider mt-1">Closed</div>
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-charcoal-2/40 border border-copper/15 p-4 rounded-[6px] space-y-3">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {["ALL", ...CAREER_STATUSES].map((st) => (
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
                {st === "ALL" ? ` (${applications.length})` : ""}
              </button>
            ))}
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="h-9 px-3 bg-charcoal border border-copper/20 hover:border-copper/40 rounded-[4px] text-xs text-ivory/80 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Toggle date sorting"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-copper" />
              <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
            </button>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, phone, role..."
                className="w-full h-9 pl-9 pr-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
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
          <span>Loading Career Applications…</span>
        </div>
      ) : error ? (
        <div className="text-center py-16 border border-copper/20 bg-charcoal-2/30 rounded-[8px] text-red-400 text-sm p-6">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="font-medium">{error}</p>
          <button
            onClick={load}
            className="mt-4 px-4 py-1.5 bg-copper text-white text-xs uppercase tracking-wider rounded-[4px]"
          >
            Retry
          </button>
        </div>
      ) : sortedApps.length === 0 ? (
        <div className="text-center py-20 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[6px] space-y-2">
          <Users className="w-8 h-8 text-copper/40 mx-auto" />
          <p className="text-sm font-normal">
            {statusFilter === "ALL" && !searchTerm
              ? "No career applications received in this collection yet."
              : "No applications matched your search or filter criteria."}
          </p>
          {(statusFilter !== "ALL" || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setSearchTerm("");
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
                  <th className="text-left p-4 font-normal">Applicant Name</th>
                  <th className="text-left p-4 font-normal">Job Title Applied For</th>
                  <th className="text-left p-4 font-normal hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 font-normal hidden lg:table-cell">Experience / Location</th>
                  <th className="text-left p-4 font-normal hidden sm:table-cell">Applied Date</th>
                  <th className="text-left p-4 font-normal">Status</th>
                  <th className="text-center p-4 font-normal">CV (PDF)</th>
                  <th className="text-right p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openDetails(app)}
                    className="border-t border-copper/10 hover:bg-charcoal/50 transition-colors cursor-pointer group"
                  >
                    {/* Name */}
                    <td className="p-4">
                      <div className="font-medium text-ivory text-sm group-hover:text-copper transition-colors">
                        {app.name}
                      </div>
                      <div className="text-[10px] text-ivory/40 font-mono mt-0.5">
                        ID: {app.id.slice(-6)}
                      </div>
                    </td>

                    {/* Job Title & Department */}
                    <td className="p-4">
                      <div className="text-xs text-ivory/90 font-medium truncate max-w-[180px]">
                        {app.jobTitle || "General Application"}
                      </div>
                      <div className="text-[10px] text-copper/80 tracking-wider uppercase mt-0.5">
                        {app.department || "General"}
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

                    {/* Experience & Location */}
                    <td className="p-4 text-xs text-ivory/70 hidden lg:table-cell">
                      <div className="font-medium text-ivory/90">{app.experience || "—"}</div>
                      <div className="text-[11px] text-ivory/45">{app.location || "Kolkata"}</div>
                    </td>

                    {/* Application Date */}
                    <td className="p-4 text-xs text-ivory/60 hidden sm:table-cell font-mono whitespace-nowrap">
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
                      <span
                        className={`inline-block text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-[3px] border font-medium ${
                          STATUS_BADGE_CLASSES[app.status] || "border-copper/30 text-copper bg-copper/5"
                        }`}
                      >
                        {app.status || "New"}
                      </span>
                    </td>

                    {/* CV Download Action */}
                    <td className="p-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {app.hasResumeFile || app.resumeFileId || (app.resumeUrl && app.resumeUrl.includes("/resume")) ? (
                        <button
                          type="button"
                          onClick={() => downloadResume(app)}
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

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetails(app)}
                          className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
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
          {sortedApps.length > pageSize && (
            <div className="px-4 py-3 bg-charcoal border-t border-copper/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/60">
              <div>
                Showing{" "}
                <strong className="text-ivory">
                  {(currentPage - 1) * pageSize + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-ivory">
                  {Math.min(currentPage * pageSize, sortedApps.length)}
                </strong>{" "}
                of <strong className="text-copper">{sortedApps.length}</strong> applicants
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

      {/* STANDARDIZED APPLICANT DETAILS MODAL */}
      <ApplicantDetailsModal
        isOpen={Boolean(selectedApp)}
        applicant={selectedApp}
        onClose={() => setSelectedApp(null)}
        onDownloadCv={downloadResume}
        isDownloading={downloadingId === selectedApp?.id}
        onUpdateStatus={(st) => updateStatus(selectedApp.id, st)}
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
