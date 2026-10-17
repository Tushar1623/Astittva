import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  Users,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Archive,
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function AdminRecruitmentJobsPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/recruitment/jobs", {
        params: {
          search: search.trim() || undefined,
          status: statusFilter !== "All" ? statusFilter : undefined,
          department: deptFilter !== "All" ? deptFilter : undefined,
        },
      });
      setJobs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch admin jobs:", err);
      setError(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = setTimeout(fetchJobs, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, deptFilter]);

  const handleDeleteJob = async (jobId) => {
    try {
      setDeletingId(jobId);
      const res = await api.delete(`/admin/recruitment/jobs/${jobId}`);
      if (res.data?.archived) {
        toast.info(res.data.message || "Opening archived to preserve candidate applications.");
      } else {
        toast.success("Job opening deleted successfully.");
      }
      setConfirmDeleteId(null);
      fetchJobs();
    } catch (err) {
      console.error("Delete job error:", err);
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-copper/15 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-copper">
            Hiring Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-display text-ivory mt-1">
            Job Openings
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/recruitment/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-copper hover:bg-copper/90 text-charcoal font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" /> Post New Vacancy
          </Link>
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
            placeholder="Search openings by title, location, skills..."
            className="w-full pl-10 pr-4 py-2 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-charcoal border border-copper/30 rounded-lg text-xs text-ivory focus:outline-none focus:border-copper"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3.5 py-2 bg-charcoal border border-copper/30 rounded-lg text-xs text-ivory focus:outline-none focus:border-copper"
          >
            <option value="All">All Departments</option>
            <option value="Sales & Advisory">Sales &amp; Advisory</option>
            <option value="Marketing & Growth">Marketing &amp; Growth</option>
            <option value="Operations & Client Success">Operations</option>
            <option value="Legal & Compliance">Legal &amp; Compliance</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#181818] border border-copper/20 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-copper border-t-transparent mb-3" />
            <p className="text-xs uppercase tracking-widest text-copper/60 font-mono">Loading Openings…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-300 text-sm">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-ivory/50 space-y-3 font-sans">
            <Briefcase className="w-10 h-10 text-copper/40 mx-auto" />
            <p className="text-base text-ivory">No job openings found matching your criteria.</p>
            <Link
              to="/admin/recruitment/jobs/new"
              className="inline-block text-xs uppercase font-mono text-copper hover:underline mt-2"
            >
              + Create First Opening
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-charcoal/80 border-b border-copper/15 text-ivory/50 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Title &amp; Department</th>
                  <th className="py-3 px-4">Location &amp; Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Candidates</th>
                  <th className="py-3 px-4 text-center">Views</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-copper/10 font-sans">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-ivory text-sm hover:text-copper transition-colors">
                        <Link to={`/admin/recruitment/jobs/${job.id}/edit`}>{job.title}</Link>
                      </div>
                      <div className="text-[11px] text-ivory/50 mt-0.5 font-mono">
                        {job.department} {job.isFeatured && <span className="text-copper ml-1.5 font-sans font-bold">★ Featured</span>}
                      </div>
                    </td>

                    {/* Location & Type */}
                    <td className="py-3.5 px-4 text-ivory/70">
                      <div>{job.location}</div>
                      <div className="text-[11px] text-ivory/40 font-mono">
                        {job.employmentType} • {job.workplaceType}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border font-medium ${
                          job.status === "published"
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                            : job.status === "draft"
                            ? "bg-amber-950/40 text-amber-300 border-amber-500/30"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    {/* Applications Count */}
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to={`/admin/recruitment/applications?jobId=${job.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-copper/10 hover:bg-copper/20 border border-copper/30 text-copper font-mono font-bold text-xs transition-colors"
                        title="View Candidates"
                      >
                        <Users className="w-3 h-3" />
                        <span>{job.applicationsCount || 0}</span>
                      </Link>
                    </td>

                    {/* Views Count */}
                    <td className="py-3.5 px-4 text-center font-mono text-ivory/60 text-xs">
                      {job.viewsCount || 0}
                    </td>

                    {/* Posted Date */}
                    <td className="py-3.5 px-4 font-mono text-ivory/50 text-[11px]">
                      {job.postedAt
                        ? new Date(job.postedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                        : job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.status === "published" && (
                          <Link
                            to={`/careers/jobs/${job.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded text-ivory/50 hover:text-copper hover:bg-white/5 transition-colors"
                            title="View Live Listing"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <Link
                          to={`/admin/recruitment/jobs/${job.id}/edit`}
                          className="p-1.5 rounded text-ivory/50 hover:text-copper hover:bg-white/5 transition-colors"
                          title="Edit Position"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(job.id)}
                          disabled={deletingId === job.id}
                          className="p-1.5 rounded text-ivory/50 hover:text-red-400 hover:bg-white/5 transition-colors"
                          title="Delete / Archive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Confirmation dialog inline */}
                      {confirmDeleteId === job.id && (
                        <div className="absolute right-6 mt-2 p-3 bg-charcoal border border-red-500/50 rounded-lg shadow-2xl z-20 text-left w-64 space-y-2">
                          <p className="text-[11px] text-red-200">
                            Delete opening? If applications exist, it will be safely archived instead.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded font-mono"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-[10px] uppercase rounded font-mono"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
