import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  Linkedin,
  Globe,
  Briefcase,
  IndianRupee,
  Building,
  Calendar,
  MessageSquare,
  History,
  Send,
  Eye,
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

const STATUS_COLORS = {
  New: "bg-blue-900/30 text-blue-300 border-blue-500/40",
  "Under Review": "bg-amber-900/30 text-amber-300 border-amber-500/40",
  Shortlisted: "bg-emerald-900/30 text-emerald-300 border-emerald-500/40",
  "Interview Scheduled": "bg-purple-900/30 text-purple-300 border-purple-500/40",
  Selected: "bg-green-900/30 text-green-300 border-green-500/40",
  Rejected: "bg-red-900/30 text-red-300 border-red-500/40",
  Withdrawn: "bg-zinc-800 text-zinc-400 border-zinc-600/40",
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
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "All");
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
          status: statusFilter !== "All" ? statusFilter : undefined,
          jobId: jobIdFilter !== "All" ? jobIdFilter : undefined,
          limit: 100,
        },
      });
      setApplications(res.data.applications || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = setTimeout(fetchApplications, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, jobIdFilter]);

  // Open candidate details if `id` parameter is in URL
  useEffect(() => {
    const directId = searchParams.get("id");
    if (directId) {
      openCandidateDrawer(directId);
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
    window.open(`/api/admin/recruitment/applications/${appId}/resume?token=${token}`, "_blank");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-copper/15 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-copper">
            Hiring Pipeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-display text-ivory mt-1">
            Candidate Applications
          </h1>
        </div>

        <div className="text-xs font-mono text-ivory/60 bg-charcoal px-3 py-1.5 rounded-lg border border-copper/25">
          Total Candidates: <strong className="text-copper">{total}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#181818] border border-copper/20 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-copper/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates by name, email, phone, company, reference #..."
            className="w-full pl-10 pr-4 py-2 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Job Filter */}
          <select
            value={jobIdFilter}
            onChange={(e) => setJobIdFilter(e.target.value)}
            className="px-3.5 py-2 bg-charcoal border border-copper/30 rounded-lg text-xs text-ivory focus:outline-none focus:border-copper max-w-[200px] truncate"
          >
            <option value="All">All Job Openings</option>
            {jobsList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-charcoal border border-copper/30 rounded-lg text-xs text-ivory focus:outline-none focus:border-copper"
          >
            <option value="All">All Stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-[#181818] border border-copper/20 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-copper border-t-transparent mb-3" />
            <p className="text-xs uppercase tracking-widest text-copper/60 font-mono">Loading Candidates…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-300 text-sm">{error}</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-ivory/50 space-y-3 font-sans">
            <Users className="w-10 h-10 text-copper/40 mx-auto" />
            <p className="text-base text-ivory">No candidate applications found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-charcoal/80 border-b border-copper/15 text-ivory/50 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Applicant &amp; Role</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-copper/10 font-sans">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openCandidateDrawer(app.id)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    {/* Ref */}
                    <td className="py-3.5 px-4 font-mono font-bold text-copper">
                      {app.referenceNumber}
                    </td>

                    {/* Applicant & Role */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-ivory text-sm">{app.name}</div>
                      <div className="text-[11px] text-ivory/50 font-sans mt-0.5 truncate max-w-[200px]">
                        {app.jobTitle}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4 text-ivory/70 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-copper/60 shrink-0" />
                        <span className="truncate max-w-[180px]">{app.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-copper/60 shrink-0" />
                        <span>{app.phone}</span>
                      </div>
                    </td>

                    {/* Experience & Company */}
                    <td className="py-3.5 px-4 text-ivory/70">
                      <div>{app.experienceYears ? `${app.experienceYears} yrs` : "Not specified"}</div>
                      <div className="text-[11px] text-ivory/40 truncate max-w-[150px]">
                        {app.currentCompany || "—"}
                      </div>
                    </td>

                    {/* Stage Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border font-medium ${
                          STATUS_COLORS[app.status] || "bg-zinc-800 text-zinc-300 border-zinc-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Resume Icon */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      {app.hasResume ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadResume(app.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-copper/10 hover:bg-copper/20 border border-copper/30 text-copper font-mono text-[11px] transition-colors"
                          title="Download Resume"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      ) : (
                        <span className="text-ivory/30 font-mono">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-ivory/50 text-[11px]">
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCandidateDrawer(app.id);
                        }}
                        className="p-1.5 rounded text-ivory/60 hover:text-copper hover:bg-white/5 transition-colors"
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
        )}
      </div>

      {/* Candidate Slide-Over Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#181818] border-l border-copper/30 h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-copper/15 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-copper tracking-wider">
                      {selectedApp.referenceNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border ${
                        STATUS_COLORS[selectedApp.status] || "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {selectedApp.status}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display text-ivory">{selectedApp.name}</h2>
                  <p className="text-xs text-ivory/60 mt-0.5">Applied for: {selectedApp.jobTitle}</p>
                </div>

                <button
                  type="button"
                  onClick={closeCandidateDrawer}
                  className="p-1.5 rounded-lg text-ivory/50 hover:text-ivory hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Transition Control Box */}
              <div className="bg-charcoal border border-copper/30 rounded-xl p-4 mb-6 space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-copper block">
                  Update Candidate Pipeline Stage
                </span>

                <form onSubmit={handleUpdateStatus} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="px-3 py-2 bg-[#181818] border border-copper/40 rounded-lg text-xs text-ivory focus:outline-none focus:border-copper"
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
                      className="px-4 py-2 bg-copper hover:bg-copper/90 text-charcoal font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-40"
                    >
                      {updatingStatus ? "Updating…" : "Change Status"}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Reason or audit note for status update (optional)..."
                    className="w-full px-3 py-1.5 bg-[#181818] border border-copper/20 rounded-lg text-xs text-ivory/80 placeholder-ivory/30 focus:outline-none focus:border-copper"
                  />
                </form>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-charcoal/70 p-3.5 rounded-lg border border-copper/15 space-y-1">
                  <span className="text-[11px] text-ivory/40 uppercase font-mono block">Contact Email</span>
                  <a
                    href={`mailto:${selectedApp.email}`}
                    className="text-xs text-copper hover:underline flex items-center gap-1.5 font-medium"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedApp.email}</span>
                  </a>
                </div>

                <div className="bg-charcoal/70 p-3.5 rounded-lg border border-copper/15 space-y-1">
                  <span className="text-[11px] text-ivory/40 uppercase font-mono block">Phone Number</span>
                  <a
                    href={`tel:${selectedApp.phone}`}
                    className="text-xs text-copper hover:underline flex items-center gap-1.5 font-medium"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedApp.phone}</span>
                  </a>
                </div>

                <div className="bg-charcoal/70 p-3.5 rounded-lg border border-copper/15 space-y-1">
                  <span className="text-[11px] text-ivory/40 uppercase font-mono block">Total Experience</span>
                  <span className="text-xs text-ivory font-medium">
                    {selectedApp.experienceYears ? `${selectedApp.experienceYears} Years` : "Not specified"}
                  </span>
                </div>

                <div className="bg-charcoal/70 p-3.5 rounded-lg border border-copper/15 space-y-1">
                  <span className="text-[11px] text-ivory/40 uppercase font-mono block">Current Company</span>
                  <span className="text-xs text-ivory font-medium">
                    {selectedApp.currentCompany || "Not specified"}
                  </span>
                </div>

                <div className="bg-charcoal/70 p-3.5 rounded-lg border border-copper/15 space-y-1">
                  <span className="text-[11px] text-ivory/40 uppercase font-mono block">Compensation</span>
                  <span className="text-xs text-ivory font-medium">
                    Current: {selectedApp.currentCtc || "—"} | Exp: {selectedApp.expectedCtc || "—"}
                  </span>
                </div>

                <div className="bg-charcoal/70 p-3.5 rounded-lg border border-copper/15 space-y-1">
                  <span className="text-[11px] text-ivory/40 uppercase font-mono block">Notice Period</span>
                  <span className="text-xs text-ivory font-medium">
                    {selectedApp.noticePeriodDays ? `${selectedApp.noticePeriodDays} Days` : "Immediate"}
                  </span>
                </div>
              </div>

              {/* External Profile Links */}
              <div className="flex flex-wrap gap-3 mb-6">
                {selectedApp.linkedin && (
                  <a
                    href={selectedApp.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs font-mono hover:bg-blue-950/60 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
                  </a>
                )}
                {selectedApp.portfolioUrl && (
                  <a
                    href={selectedApp.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-copper/10 border border-copper/30 text-copper text-xs font-mono hover:bg-copper/20 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Portfolio / Website
                  </a>
                )}
                {selectedApp.hasResume && (
                  <button
                    type="button"
                    onClick={() => handleDownloadResume(selectedApp.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-copper text-charcoal font-semibold text-xs uppercase tracking-wider hover:bg-copper/90 transition-colors ml-auto shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Resume
                  </button>
                )}
              </div>

              {/* Cover Statement */}
              {selectedApp.coverNote && (
                <div className="bg-charcoal/70 border border-copper/15 rounded-xl p-4 mb-6">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-copper mb-2">
                    Candidate Cover Statement
                  </h4>
                  <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed whitespace-pre-line font-sans">
                    {selectedApp.coverNote}
                  </p>
                </div>
              )}

              {/* Recruiter Private Notes */}
              <div className="bg-charcoal/70 border border-copper/15 rounded-xl p-4 mb-6 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-copper flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Recruiter Internal Notes
                </h4>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add recruiter observation, interview outcome, or salary expectation note..."
                    className="flex-1 px-3 py-2 bg-[#181818] border border-copper/25 rounded-lg text-xs text-ivory focus:outline-none focus:border-copper"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !newNote.trim()}
                    className="px-4 py-2 bg-copper hover:bg-copper/90 text-charcoal font-bold text-xs uppercase rounded-lg transition-colors disabled:opacity-40"
                  >
                    Add
                  </button>
                </form>

                {Array.isArray(selectedApp.notes) && selectedApp.notes.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {selectedApp.notes.map((n, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-[#181818] border border-copper/10 text-xs">
                        <div className="flex items-center justify-between text-ivory/40 text-[10px] font-mono mb-1">
                          <span>{n.author || "Recruiter"}</span>
                          <span>{n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}</span>
                        </div>
                        <p className="text-ivory/80 leading-relaxed font-sans">{n.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-ivory/40 italic font-sans">No recruiter notes recorded yet.</p>
                )}
              </div>

              {/* Status Audit History Timeline */}
              {Array.isArray(selectedApp.statusHistory) && selectedApp.statusHistory.length > 0 && (
                <div className="bg-charcoal/70 border border-copper/15 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-copper flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Pipeline Audit Trail
                  </h4>

                  <div className="space-y-2">
                    {selectedApp.statusHistory.map((h, idx) => (
                      <div key={idx} className="text-xs flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-copper mt-1.5 shrink-0" />
                        <div>
                          <div className="font-mono text-[11px] text-ivory">
                            <span className="text-copper">{h.toStatus}</span>
                            <span className="text-ivory/40 ml-2">by {h.changedBy || "system"}</span>
                          </div>
                          {h.reason && <p className="text-ivory/60 text-[11px] mt-0.5">{h.reason}</p>}
                          <span className="text-[10px] text-ivory/40 font-mono block">
                            {h.changedAt ? new Date(h.changedAt).toLocaleString("en-IN") : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-copper/15 mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeCandidateDrawer}
                className="px-5 py-2 rounded-lg border border-copper/30 text-xs font-mono uppercase text-ivory/70 hover:text-ivory hover:border-copper"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
