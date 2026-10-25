import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  ExternalLink,
  Users,
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

const STATUS_FILTERS = ["ALL", "published", "draft", "closed", "archived"];
const DEPARTMENTS = [
  "All",
  "Sales & Advisory",
  "Marketing",
  "Operations",
  "Legal & Advisory",
];

export default function AdminRecruitmentJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [isDeleting, setIsDeleting] = useState(false);

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
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setJobs([]);
      setError(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchJobs, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, deptFilter]);

  const confirmDeleteJob = async () => {
    if (!deleteTarget || isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/admin/recruitment/jobs/${deleteTarget.id}`);
      if (res.data?.archived) {
        toast.info(res.data.message || "Opening archived to preserve candidate applications.");
      } else {
        toast.success("Job opening deleted successfully.");
      }
      setDeleteTarget(null);
      fetchJobs();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = { ALL: jobs.length };
    STATUS_FILTERS.forEach((st) => {
      if (st !== "ALL") {
        counts[st] = jobs.filter(
          (j) => (j.status || "").toLowerCase() === st.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [jobs]);

  const filterTabs = STATUS_FILTERS.map((st) => ({
    key: st,
    label: st === "ALL" ? "All Vacancies" : st,
    count: statusCounts[st] || 0,
  }));

  // Pagination slice
  const totalPages = Math.ceil(jobs.length / pageSize) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return jobs.slice(start, start + pageSize);
  }, [jobs, currentPage]);

  return (
    <div data-testid="admin-recruitment-jobs-page" className="space-y-6">
      {/* Header */}
      <AdminHeader
        category="Recruitment Console"
        title="Job Vacancies"
        subtitle="Manage published career openings, configure requirements, and monitor candidate inflow."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            variant: "outline",
            onClick: fetchJobs,
          },
          {
            label: "Post New Vacancy",
            icon: Plus,
            to: "/admin/recruitment/jobs/new",
            variant: "primary",
          },
        ]}
      />

      {/* Filter and Search Bar */}
      <AdminFilterBar
        tabs={filterTabs}
        activeTab={statusFilter}
        onTabChange={(tab) => {
          setStatusFilter(tab);
          setCurrentPage(1);
        }}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search openings by title, department, location..."
      >
        <select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 px-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper"
        >
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept} className="bg-charcoal text-ivory">
              {dept === "All" ? "All Departments" : dept}
            </option>
          ))}
        </select>
      </AdminFilterBar>

      {/* Main Table Container */}
      {loading ? (
        <div className="text-ivory/50 text-center py-20 tracking-[0.25em] uppercase text-xs">
          Loading Job Vacancies...
        </div>
      ) : error ? (
        <div className="text-center py-16 border border-copper/20 bg-charcoal-2/30 rounded-[6px] text-rose-500 text-sm">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <AdminEmptyState
          icon={Briefcase}
          title="No job vacancies found"
          message={
            statusFilter === "ALL" && !search && deptFilter === "All"
              ? "No job vacancies posted yet. Create your first opening to attract talent."
              : "No vacancies matched your active filter criteria."
          }
          actionLabel={
            statusFilter === "ALL" && !search && deptFilter === "All"
              ? "Post New Vacancy"
              : "Clear Filters"
          }
          actionTo={
            statusFilter === "ALL" && !search && deptFilter === "All"
              ? "/admin/recruitment/jobs/new"
              : null
          }
          onAction={() => {
            setSearch("");
            setStatusFilter("ALL");
            setDeptFilter("All");
            setCurrentPage(1);
          }}
        />
      ) : (
        <div className="border border-copper/20 rounded-[6px] overflow-hidden bg-charcoal-2/20 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-2/80 text-ivory/60 text-[10px] tracking-[0.22em] uppercase border-b border-copper/20">
                <tr>
                  <th className="text-left py-3.5 px-4 font-medium">Role Title</th>
                  <th className="text-left py-3.5 px-4 font-medium hidden md:table-cell">Department</th>
                  <th className="text-left py-3.5 px-4 font-medium hidden lg:table-cell">Location &amp; Type</th>
                  <th className="text-left py-3.5 px-4 font-medium">Status</th>
                  <th className="text-center py-3.5 px-4 font-medium">Applicants</th>
                  <th className="text-right py-3.5 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-copper/10">
                {paginatedJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-charcoal-2/40 transition-colors group"
                  >
                    {/* Role Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/recruitment/jobs/${job.id}/edit`}
                          className="font-display text-sm font-medium text-ivory hover:text-copper transition-colors"
                        >
                          {job.title}
                        </Link>
                        {job.isFeatured && (
                          <span className="text-[9px] tracking-widest uppercase font-semibold text-copper bg-copper/10 px-1.5 py-0.5 rounded-[2px] border border-copper/25">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ivory/50 mt-0.5">
                        <span className="font-mono">/careers/jobs/{job.slug}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-ivory/70 hidden md:table-cell text-xs">
                      {job.department}
                    </td>

                    {/* Location & Type */}
                    <td className="py-3.5 px-4 text-ivory/70 hidden lg:table-cell text-xs">
                      <div>{job.location}</div>
                      <div className="text-[10px] text-ivory/45 font-mono">
                        {job.employmentType} · {job.workplaceType}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={job.status} />
                    </td>

                    {/* Candidates Count */}
                    <td className="py-3.5 px-4 text-center">
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
                    <td className="py-3.5 px-4 text-right">
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

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              id: job.id,
                              title: job.title,
                            })
                          }
                          className="p-1.5 text-ivory/50 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                          title="Delete or Archive Vacancy"
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

          {/* Pagination */}
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={jobs.length}
            pageSize={pageSize}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Job Vacancy"
        message={
          deleteTarget
            ? `Are you sure you want to delete the vacancy "${deleteTarget.title}"? If applicants have already applied, it will be safely archived instead to preserve applicant records.`
            : ""
        }
        confirmLabel="Delete Vacancy"
        isDeleting={isDeleting}
        onConfirm={confirmDeleteJob}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
