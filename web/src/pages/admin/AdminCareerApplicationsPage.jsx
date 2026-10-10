import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { 
  Briefcase, Trash2, Eye, Phone, Mail, MapPin, 
  Calendar, Download, FileText, Search, RefreshCw, X, ArrowLeft 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CAREER_STATUSES = [
  "New",
  "Reviewing",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

export default function AdminCareerApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/admin/leads/career")
      .then(({ data }) => setApplications(data))
      .catch((e) => toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load career applications"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
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
    }
  };

  const saveNotes = async () => {
    if (!selectedApp) return;
    setSavingNotes(true);
    try {
      await api.patch(`/admin/leads/career/${selectedApp.id}`, { notes: editingNotes });
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, notes: editingNotes } : a))
      );
      setSelectedApp((prev) => ({ ...prev, notes: editingNotes }));
      toast.success("Notes saved successfully");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this career application?")) return;
    try {
      await api.delete(`/admin/leads/career/${id}`);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (selectedApp?.id === id) setSelectedApp(null);
      toast.success("Career application deleted");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete application");
    }
  };

  const downloadResume = async (appDoc) => {
    try {
      if (!appDoc.hasResumeFile && (!appDoc.resumeUrl || !appDoc.resumeUrl.includes("/resume"))) {
        if (appDoc.resumeUrl && appDoc.resumeUrl.startsWith("http")) {
          window.open(appDoc.resumeUrl, "_blank");
          return;
        }
        toast.info("No downloadable resume file attached to this application.");
        return;
      }

      // Download file using authenticated axios client as blob
      const res = await api.get(`/admin/leads/career/${appDoc.id}/resume`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type: res.headers["content-type"] || "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = appDoc.resumeFilename || `${appDoc.name.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Resume downloaded successfully");
    } catch (err) {
      toast.error("Failed to download resume file");
    }
  };

  const openDetails = (appDoc) => {
    setSelectedApp(appDoc);
    setEditingNotes(appDoc.notes || "");
  };

  // Filter & Search
  const filteredApps = applications.filter((a) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (a.status && a.status.toLowerCase() === statusFilter.toLowerCase());
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

  return (
    <div data-testid="admin-career-applications-page">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper">
              TALENT RECRUITMENT
            </span>
            <span className="text-ivory/30">•</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/50">
              ASTITTVA TALENT DESK
            </span>
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
            Career Applications
          </h1>
          <p className="text-ivory/55 text-sm mt-1">
            Job applicants and candidate profiles submitted via the Careers portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/leads/property"
            className="inline-flex items-center gap-2 px-4 py-2 border border-copper/30 hover:border-copper text-xs font-semibold uppercase tracking-[0.15em] text-ivory/80 hover:text-white rounded-[4px] transition-colors"
          >
            <span>View Property Leads</span>
            <span>→</span>
          </Link>
          <button
            onClick={load}
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
          {["ALL", ...CAREER_STATUSES].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium tracking-[0.08em] transition-all ${
                statusFilter === st
                  ? "bg-copper text-charcoal font-semibold shadow-sm"
                  : "bg-charcoal/50 text-ivory/70 hover:text-ivory hover:bg-charcoal"
              }`}
            >
              {st}
              {st === "ALL" ? ` (${applications.length})` : ""}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search applicants..."
            className="w-full h-9 pl-9 pr-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs">
          Loading Career Applications...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-20 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[6px]">
          {applications.length === 0
            ? "No career applications received yet."
            : "No applicants matched your search/filter criteria."}
        </div>
      ) : (
        <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="career-applications-table">
              <thead className="bg-charcoal-2/80 text-ivory/60 text-[10px] tracking-[0.22em] uppercase border-b border-copper/15">
                <tr>
                  <th className="text-left p-4 font-normal">Name</th>
                  <th className="text-left p-4 font-normal">Phone</th>
                  <th className="text-left p-4 font-normal hidden md:table-cell">Email</th>
                  <th className="text-left p-4 font-normal">Position</th>
                  <th className="text-left p-4 font-normal hidden lg:table-cell">Department</th>
                  <th className="text-left p-4 font-normal hidden xl:table-cell">Experience</th>
                  <th className="text-left p-4 font-normal">Status</th>
                  <th className="text-center p-4 font-normal">Resume</th>
                  <th className="text-right p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-copper/10">
                {filteredApps.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-charcoal-2/50 transition-colors cursor-pointer"
                    onClick={() => openDetails(a)}
                  >
                    <td className="p-4">
                      <div className="font-medium text-ivory">{a.name}</div>
                      <div className="text-[11px] text-ivory/40 mt-0.5">
                        {new Date(a.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-ivory/80 whitespace-nowrap">
                      <a
                        href={`tel:${a.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-copper transition-colors"
                      >
                        {a.phone}
                      </a>
                    </td>
                    <td className="p-4 text-ivory/70 hidden md:table-cell max-w-[180px] truncate">
                      <a
                        href={`mailto:${a.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-copper transition-colors"
                      >
                        {a.email}
                      </a>
                    </td>
                    <td className="p-4 text-ivory font-medium max-w-[200px] truncate">
                      {a.jobTitle}
                    </td>
                    <td className="p-4 text-ivory/70 hidden lg:table-cell max-w-[160px] truncate">
                      {a.department || "Advisory"}
                    </td>
                    <td className="p-4 text-ivory/70 hidden xl:table-cell whitespace-nowrap">
                      {a.experience || "—"}
                    </td>
                    <td className="p-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={a.status || "New"}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                        data-testid={`career-status-${a.id}`}
                        className="bg-charcoal border border-copper/30 text-ivory text-xs px-2.5 py-1.5 rounded-[4px] focus:outline-none focus:border-copper"
                      >
                        {CAREER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {a.hasResumeFile || (a.resumeUrl && a.resumeUrl.includes("/resume")) ? (
                        <button
                          type="button"
                          onClick={() => downloadResume(a)}
                          title="Download Resume"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#C89A55] hover:text-white bg-[#C89A55]/15 hover:bg-[#C89A55] rounded-[3px] border border-[#C89A55]/30 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      ) : a.resumeUrl ? (
                        <a
                          href={a.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-copper hover:underline"
                        >
                          <span>Link</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <span className="text-ivory/30 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetails(a)}
                          title="View Details"
                          className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => remove(a.id)}
                            title="Delete Application"
                            className="p-1.5 text-ivory/50 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            data-testid={`delete-career-${a.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPLICANT DETAILS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1A1817] border border-copper/30 rounded-[10px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-copper/15 pb-5 mb-6">
              <div>
                <span className="text-[10.5px] font-semibold tracking-[0.2em] uppercase text-copper">
                  APPLICANT PROFILE
                </span>
                <h2 className="font-display text-2xl text-ivory mt-1">
                  {selectedApp.name}
                </h2>
                <div className="flex items-center gap-3 text-xs text-ivory/50 mt-1">
                  <span>
                    Applied on: {new Date(selectedApp.createdAt).toLocaleString()}
                  </span>
                  <span>•</span>
                  <span>Source: {selectedApp.source || "Careers Portal"}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 text-ivory/60 hover:text-copper transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="space-y-6">
              {/* Position & Candidate Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-[6px] bg-charcoal/60 border border-copper/15">
                <div>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-copper block mb-1">
                    Position Applied
                  </span>
                  <p className="text-sm font-semibold text-ivory">
                    {selectedApp.jobTitle}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-copper block mb-1">
                    Department
                  </span>
                  <p className="text-sm text-ivory/80">
                    {selectedApp.department || "Advisory"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-copper block mb-1">
                    Experience Level
                  </span>
                  <p className="text-sm text-[#E6BF80]">
                    {selectedApp.experience || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-copper block mb-1">
                    Current Location
                  </span>
                  <p className="text-sm text-ivory/80">
                    {selectedApp.location || "Kolkata"}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-[6px] bg-charcoal/60 border border-copper/15 space-y-3">
                <span className="text-[10px] tracking-[0.18em] uppercase text-copper block">
                  Candidate Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-copper shrink-0" />
                    <a
                      href={`tel:${selectedApp.phone}`}
                      className="text-ivory hover:text-copper underline-offset-2 hover:underline"
                    >
                      {selectedApp.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-copper shrink-0" />
                    <a
                      href={`mailto:${selectedApp.email}`}
                      className="text-ivory hover:text-copper underline-offset-2 hover:underline truncate"
                    >
                      {selectedApp.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Resume / Document Section */}
              <div className="p-4 rounded-[6px] bg-charcoal/60 border border-copper/15 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-copper shrink-0" />
                  <div>
                    <span className="text-[10px] tracking-[0.18em] uppercase text-copper block">
                      Resume Document
                    </span>
                    <p className="text-sm text-ivory font-medium">
                      {selectedApp.resumeFilename || "Resume on file"}
                    </p>
                  </div>
                </div>
                {selectedApp.hasResumeFile || (selectedApp.resumeUrl && selectedApp.resumeUrl.includes("/resume")) ? (
                  <button
                    type="button"
                    onClick={() => downloadResume(selectedApp)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-charcoal font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CV</span>
                  </button>
                ) : selectedApp.resumeUrl ? (
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-charcoal font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors"
                  >
                    <span>Open Portfolio</span>
                    <span>↗</span>
                  </a>
                ) : (
                  <span className="text-ivory/40 text-xs italic">
                    No resume uploaded
                  </span>
                )}
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div className="p-4 rounded-[6px] bg-charcoal/60 border border-copper/15">
                  <span className="text-[10px] tracking-[0.18em] uppercase text-copper block mb-2">
                    Cover Letter &amp; Highlights
                  </span>
                  <p className="text-sm text-ivory/80 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}

              {/* Status & Review Notes */}
              <div className="p-4 rounded-[6px] bg-charcoal/60 border border-copper/15 space-y-4">
                <span className="text-[10px] tracking-[0.18em] uppercase text-copper block">
                  Application Status &amp; Talent Notes
                </span>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] text-ivory/60 block mb-1.5">
                    Hiring Stage
                  </label>
                  <select
                    value={selectedApp.status || "New"}
                    onChange={(e) => updateStatus(selectedApp.id, e.target.value)}
                    className="w-full h-9 px-3 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper"
                  >
                    {CAREER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] text-ivory/60 block mb-1.5">
                    Internal Talent Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Interview feedback, salary expectation, notice period..."
                    className="w-full p-3 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={saveNotes}
                    disabled={savingNotes}
                    className="px-5 py-2 bg-copper hover:bg-copper-light text-charcoal font-semibold text-xs tracking-[0.12em] uppercase rounded-[4px] transition-colors"
                  >
                    {savingNotes ? "Saving…" : "Save Notes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
