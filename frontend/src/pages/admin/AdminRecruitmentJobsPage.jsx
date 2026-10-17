import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  ExternalLink,
  Users,
  Archive,
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const STATUS_FILTERS = ["ALL", "published", "draft", "closed", "archived"];

export default function AdminRecruitmentJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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
          status: statusFilter !== "ALL" ? statusFilter : undefined,
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
    <div data-testid="admin-recruitment-jobs-page" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-copper/15">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper">
              RECRUITMENT CONSOLE
            </span>
            <span className="text-ivory/30">•</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/50">
              VACANCY MANAGEMENT
            </span>
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
            Job Vacancies
          </h1>
          <p className="text-ivory/55 text-sm mt-1">
            Manage published job openings, configure job descriptions, and monitor candidate inflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/recruitment/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.15em] rounded-[4px] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Post New Vacancy
          </Link>
          <button
            onClick={fetchJobs}
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
          {STATUS_FILTERS.map((st) => (
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
              {st === "ALL" ? ` (${jobs.length})` : ""}
            </button>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-9 px-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper"
          >
            <option value="All">All Departments</option>
            <option value="Sales & Advisory">Sales &amp; Advisory</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
            <option value="Legal & Advisory">Legal &amp; Advisory</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vacancies..."
              className="w-full h-9 pl-9 pr-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
            />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      {loading ? (
        <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs">
          Loading Job Vacancies…
        </div>
      ) : error ? (
        <div className="text-center py-16 border border-copper/20 bg-charcoal-2/30 rounded-[8px] text-red-600 text-sm">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[6px]">
          {statusFilter === "ALL" && !search
            ? "No job vacancies posted yet. Create your first opening."
            : "No vacancies matched your filter criteria."}
        </div>
      ) : (
        <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-2/80 text-ivory/60 text-[10px] tracking-[0.22em] uppercase border-b border-copper/15">
                <tr>
                  <th className="text-left p-4 font-normal">Role Title</th>
                  <th className="text-left p-4 font-normal hidden md:table-cell">Department</th>
                  <th className="text-left p-4 font-normal hidden lg:table-cell">Location &amp; Type</th>
                  <th className="text-left p-4 font-normal">Status</th>
                  <th className="text-center p-4 font-normal">Applicants</th>
                  <th className="text-right p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-t border-copper/10 hover:bg-charcoal-2/40 transition-colors"
                  >
                    {/* Role Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/recruitment/jobs/${job.id}/edit`}
                          className="font-display text-base font-normal text-ivory hover:text-copper transition-colors"
                        >
                          {job.title}
                        </Link>
                        {job.isFeatured && (
                          <span className="text-[9px] tracking-widest uppercase font-semibold text-copper bg-copper/10 px-1.5 py-0.5 rounded-[2px] border border-copper/25">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ivory/50 mt-0.5">
                        <span className="font-mono text-[11px]">/careers/jobs/{job.slug}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-4 text-ivory/70 hidden md:table-cell text-xs">
                      {job.department}
                    </td>

                    {/* Location & Type */}
                    <td className="p-4 text-ivory/70 hidden lg:table-cell text-xs">
                      <div>{job.location}</div>
                      <div className="text-[10px] text-ivory/45 font-mono">{job.employmentType} · {job.workplaceType}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span
                        className={`text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-[3px] border font-medium ${
                          job.status === "published"
                            ? "border-green-600/30 text-green-700 bg-green-500/10"
                            : job.status === "draft"
                            ? "border-amber-600/30 text-amber-700 bg-amber-500/10"
                            : job.status === "closed"
                            ? "border-red-600/30 text-red-700 bg-red-500/10"
                            : "border-copper/30 text-copper bg-copper/5"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    {/* Candidates Count */}
                    <td className="p-4 text-center">
                      <Link
                        to={`/admin/recruitment/applications?jobId=${job.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-charcoal border border-copper/20 hover:border-copper text-xs font-mono font-medium text-copper transition-colors"
                        title="View Candidates"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applicationsCount || 0}</span>
                      </Link>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {job.status === "published" && (
                          <Link
                            to={`/careers/jobs/${job.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                            title="View Public Listing"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}

                        <Link
                          to={`/admin/recruitment/jobs/${job.id}/edit`}
                          className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                          title="Edit Vacancy"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {confirmDeleteId === job.id ? (
                          <div className="inline-flex items-center gap-1 bg-red-950/20 p-1 rounded border border-red-500/30">
                            <button
                              type="button"
                              onClick={() => handleDeleteJob(job.id)}
                              disabled={deletingId === job.id}
                              className="px-2 py-0.5 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded font-medium"
                            >
                              {deletingId === job.id ? "…" : "Confirm"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 text-[10px] text-ivory/60 hover:text-ivory"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(job.id)}
                            className="p-1.5 text-ivory/50 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete or Archive Vacancy"
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
    </div>
  );
}
