import { useState, useEffect } from "react";
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
  New: "border-blue-500/40 text-blue-700 bg-blue-500/10",
  "Under Review": "border-amber-500/40 text-amber-700 bg-amber-500/10",
  Shortlisted: "border-emerald-500/40 text-emerald-700 bg-emerald-500/10",
  "Interview Scheduled": "border-purple-500/40 text-purple-700 bg-purple-500/10",
  Selected: "border-green-600/40 text-green-700 bg-green-600/10",
  Rejected: "border-red-500/40 text-red-700 bg-red-500/10",
  Withdrawn: "border-zinc-500/40 text-zinc-600 bg-zinc-500/10",
};

export default function AdminRecruitmentApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [jobsList, setJobsList] = useState([]);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [jobIdFilter, setJobIdFilter] = useState(searchParams.get("jobId") || "All");

  // Selected Candidate for slide-over drawer
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status Change State
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Private Note State
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Fetch job list for filter dropdown
  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await api.get("/admin/recruitment/jobs");
        setJobsList(res.data || []);
      } catch (err) {
        console.error("Failed to load jobs list:", err);
      }
    }
    loadJobs();
  }, []);

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/recruitment/applications", {
        params: {
          search: search.trim() || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          jobId: jobIdFilter !== "All" ? jobIdFilter : undefined,
          limit: 100,
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
    const timer = setTimeout(fetchApplications, 250);
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
      toast.success(res.data.message || `Status updated to ${newStatus}`);

      // Refresh application in drawer and list
      const refreshed = await api.get(`/admin/recruitment/applications/${selectedApp.id}`);
      setSelectedApp(refreshed.data);
      setStatusReason("");
      fetchApplications();
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
        notes: res.data.notes || [],
      }));
    } catch (err) {
      console.error("Add note error:", err);
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setAddingNote(false);
    }
  };

  const handleDownloadResume = (appId) => {
    const token = localStorage.getItem("astitva_token");
    const resumeUrl = `/api/admin/recruitment/applications/${appId}/resume`;
    window.open(`${resumeUrl}?token=${encodeURIComponent(token || "")}`, "_blank");
  };

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
            Candidate Applications
          </h1>
          <p className="text-ivory/55 text-sm mt-1">
            Review candidate submissions, update pipeline stages, take recruiter notes, and access uploaded resumes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-ivory/70 bg-charcoal-2/40 px-3.5 py-2 rounded-[4px] border border-copper/20">
            Total Candidates: <strong className="text-copper">{total}</strong>
          </div>
          <button
            onClick={fetchApplications}
            disabled={loading}
            title="Refresh"
            className="p-2 border border-copper/20 hover:border-copper/40 text-ivory/70 hover:text-copper rounded-[4px] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-charcoal-2/40 border border-copper/15 p-4 rounded-[6px] mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {["ALL", ...STAGES].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium tracking-[0.08em] uppercase transition-all ${
                statusFilter === st
                  ? "bg-copper text-white font-semibold shadow-sm"
                  : "bg-charcoal/50 text-ivory/70 hover:text-ivory hover:bg-charcoal"
              }`}
            >
              {st}
              {st === "ALL" ? ` (${total})` : ""}
            </button>
          ))}
        </div>

        {/* Vacancy Dropdown & Search Input */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={jobIdFilter}
            onChange={(e) => setJobIdFilter(e.target.value)}
            className="h-9 px-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper max-w-[200px] truncate"
          >
            <option value="All">All Job Openings</option>
            {jobsList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate or ref #..."
              className="w-full h-9 pl-9 pr-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
            />
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      {loading ? (
        <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs">
          Loading Candidates…
        </div>
      ) : error ? (
        <div className="text-center py-16 border border-copper/20 bg-charcoal-2/30 rounded-[8px] text-red-600 text-sm">
          {error}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[6px]">
          {statusFilter === "ALL" && !search
            ? "No candidate applications received yet."
            : "No candidates matched your search/filter criteria."}
        </div>
      ) : (
        <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-2/80 text-ivory/60 text-[10px] tracking-[0.22em] uppercase border-b border-copper/15">
                <tr>
                  <th className="text-left p-4 font-normal">Ref #</th>
                  <th className="text-left p-4 font-normal">Candidate &amp; Role</th>
                  <th className="text-left p-4 font-normal hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 font-normal hidden lg:table-cell">Experience</th>
                  <th className="text-left p-4 font-normal">Stage</th>
                  <th className="text-center p-4 font-normal">Resume</th>
                  <th className="text-right p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openCandidateDrawer(app.id)}
                    className="border-t border-copper/10 hover:bg-charcoal-2/40 transition-colors cursor-pointer"
                  >
                    {/* Ref # */}
                    <td className="p-4 font-mono font-bold text-copper text-xs whitespace-nowrap">
                      {app.referenceNumber}
                    </td>

                    {/* Candidate & Role */}
                    <td className="p-4">
                      <div className="font-medium text-ivory text-sm">{app.name}</div>
                      <div className="text-xs text-ivory/50 truncate max-w-[200px] mt-0.5">{app.jobTitle}</div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 text-xs text-ivory/70 hidden md:table-cell">
                      <div>{app.email}</div>
                      <div className="text-ivory/45 text-[11px] font-mono">{app.phone}</div>
                    </td>

                    {/* Experience */}
                    <td className="p-4 text-xs text-ivory/70 hidden lg:table-cell">
                      <div>{app.experienceYears} Years</div>
                      <div className="text-[11px] text-ivory/45 truncate max-w-[150px]">{app.currentCompany || "—"}</div>
                    </td>

                    {/* Stage Badge */}
                    <td className="p-4">
                      <span
                        className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-[3px] border font-medium ${
                          STATUS_BADGE_CLASSES[app.status] || "border-copper/30 text-copper"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Resume Action */}
                    <td className="p-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {app.hasResume ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadResume(app.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#C89A55] hover:text-white bg-[#C89A55]/15 hover:bg-[#C89A55] rounded-[3px] border border-[#C89A55]/30 transition-all"
                          title="Stream Resume PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      ) : (
                        <span className="text-ivory/30 text-xs italic">—</span>
                      )}
                    </td>

                    {/* View Action */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCandidateDrawer(app.id);
                        }}
                        className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CANDIDATE DETAILS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] border border-copper/30 rounded-[10px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-ivory">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-copper/15 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-copper tracking-wider">
                    {selectedApp.referenceNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-[3px] text-[10px] font-mono tracking-wider uppercase border ${
                      STATUS_BADGE_CLASSES[selectedApp.status] || "border-copper/30 text-copper"
                    }`}
                  >
                    {selectedApp.status}
                  </span>
                </div>
                <h2 className="font-display text-2xl text-ivory mt-1">{selectedApp.name}</h2>
                <p className="text-xs text-ivory/60 mt-0.5">Applied for: <strong className="text-copper">{selectedApp.jobTitle}</strong></p>
              </div>

              <button
                type="button"
                onClick={closeCandidateDrawer}
                className="p-2 text-ivory/60 hover:text-copper transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              {/* Stage Transition Control Box */}
              <div className="bg-charcoal-2/60 border border-copper/25 rounded-[6px] p-5 space-y-3">
                <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper block">
                  Update Candidate Stage
                </span>

                <form onSubmit={handleUpdateStatus} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="h-10 px-3 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      disabled={updatingStatus || newStatus === selectedApp.status}
                      className="h-10 px-4 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.15em] rounded-[4px] transition-colors disabled:opacity-40"
                    >
                      {updatingStatus ? "Updating…" : "Change Status"}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Optional note / reason for stage transition..."
                    className="w-full px-3 py-2 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
                  />
                </form>
              </div>

              {/* Candidate Contact & Professional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-[6px] bg-charcoal-2/40 border border-copper/15 text-xs">
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">Email</span>
                  <p className="text-ivory font-medium">{selectedApp.email}</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">Phone</span>
                  <p className="text-ivory font-medium">{selectedApp.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">Total Experience</span>
                  <p className="text-ivory font-medium">{selectedApp.experienceYears} Years</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">Current Organization</span>
                  <p className="text-ivory font-medium">{selectedApp.currentCompany || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">Current CTC</span>
                  <p className="text-ivory font-medium">{selectedApp.currentCtc || "Not disclosed"}</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">Expected CTC</span>
                  <p className="text-ivory font-medium">{selectedApp.expectedCtc || "Not disclosed"}</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">Notice Period</span>
                  <p className="text-ivory font-medium">{selectedApp.noticePeriodDays} Days</p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">Submission Date</span>
                  <p className="text-ivory font-medium">{selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleString("en-IN") : "—"}</p>
                </div>
              </div>

              {/* Resume Download Action */}
              <div className="p-4 rounded-[6px] bg-charcoal-2/40 border border-copper/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-0.5">Resume Attachment</span>
                  <p className="text-xs text-ivory font-medium">{selectedApp.resumeFilename || "Resume document"}</p>
                </div>
                {selectedApp.hasResume && (
                  <button
                    type="button"
                    onClick={() => handleDownloadResume(selectedApp.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                )}
              </div>

              {/* Cover Note */}
              {selectedApp.coverNote && (
                <div className="p-5 rounded-[6px] bg-charcoal-2/40 border border-copper/15 text-xs">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-2">Cover Note / Candidate Message</span>
                  <p className="text-ivory/80 whitespace-pre-wrap leading-relaxed">{selectedApp.coverNote}</p>
                </div>
              )}

              {/* Stage Transition History */}
              {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                <div className="p-5 rounded-[6px] bg-charcoal-2/40 border border-copper/15 text-xs space-y-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block">Stage Transition Audit Log</span>
                  <div className="space-y-2">
                    {selectedApp.statusHistory.map((h, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-3 text-xs border-b border-copper/10 pb-2 last:border-0">
                        <div>
                          <span className="font-semibold text-ivory">{h.toStatus}</span>
                          {h.reason && <p className="text-[11px] text-ivory/60 mt-0.5">{h.reason}</p>}
                        </div>
                        <div className="text-right text-[10px] text-ivory/45 font-mono">
                          {h.changedAt ? new Date(h.changedAt).toLocaleString("en-IN") : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recruiter Notes Section */}
              <div className="p-5 rounded-[6px] bg-charcoal-2/40 border border-copper/15 text-xs space-y-4">
                <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper block">
                  Private Recruiter Notes
                </span>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal interview evaluation, feedback, or candidate note..."
                    className="w-full p-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={addingNote || !newNote.trim()}
                      className="px-4 py-1.5 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors disabled:opacity-40"
                    >
                      {addingNote ? "Adding…" : "Add Private Note"}
                    </button>
                  </div>
                </form>

                {selectedApp.notes && selectedApp.notes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-copper/15">
                    {selectedApp.notes.map((n, idx) => (
                      <div key={idx} className="p-3 bg-charcoal rounded-[4px] border border-copper/10 text-xs">
                        <p className="text-ivory/90 whitespace-pre-wrap">{n.note}</p>
                        <div className="flex items-center justify-between text-[10px] text-ivory/45 font-mono mt-2">
                          <span>By: {n.author || "Recruiter"}</span>
                          <span>{n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
