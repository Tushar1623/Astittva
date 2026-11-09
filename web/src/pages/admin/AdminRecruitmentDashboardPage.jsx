import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AdminRecruitmentDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/recruitment/dashboard");
      setData(res.data);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-[var(--admin-text-muted)] text-center py-20 tracking-[0.25em] uppercase text-xs flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-5 h-5 text-[var(--admin-accent)] animate-spin" />
        <span>Loading Recruitment Analytics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 border border-rose-500/30 bg-rose-500/10 rounded-lg p-6 max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <p className="text-rose-500 font-semibold text-sm mb-3">
          {error || "Failed to load dashboard data."}
        </p>
        <button
          onClick={loadDashboard}
          className="btn-admin-primary"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { summary = {}, byStatus = {}, recentApplications = [], recentJobs = [] } = data;

  return (
    <div data-testid="admin-recruitment-dashboard" className="space-y-8">
      {/* Header */}
      <AdminHeader
        category="Recruitment Console"
        title="Recruitment Overview"
        subtitle="Real-time talent acquisition metrics, job openings, and applicant pipeline tracking."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            variant: "outline",
            onClick: loadDashboard,
          },
          {
            label: "Post New Opening",
            icon: Plus,
            to: "/admin/recruitment/jobs/new",
            variant: "primary",
          },
          {
            label: "Public Job Board",
            icon: ExternalLink,
            to: "/careers/jobs",
            variant: "outline",
          },
        ]}
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vacancies */}
        <div className="admin-card p-5 rounded-xl relative overflow-hidden group hover:border-[var(--admin-accent)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <Briefcase className="w-5 h-5 text-[var(--admin-accent)]" strokeWidth={1.75} />
            <Link
              to="/admin/recruitment/jobs"
              className="text-[11px] text-[var(--admin-accent)] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Openings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-serif-display font-medium text-[var(--admin-text-primary)]">
            {summary.totalJobs ?? 0}
          </div>
          <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--admin-text-secondary)] mt-1 font-semibold">
            Total Vacancies
          </div>
          <div className="text-xs text-[var(--admin-text-muted)] mt-2 flex gap-2 font-mono">
            <span className="text-[var(--admin-success)] font-semibold">
              {summary.publishedJobs || 0} Published
            </span>
            <span>•</span>
            <span>{summary.draftJobs || 0} Draft</span>
          </div>
        </div>

        {/* Total Candidates */}
        <div className="admin-card p-5 rounded-xl relative overflow-hidden group hover:border-[var(--admin-accent)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-[var(--admin-accent)]" strokeWidth={1.75} />
            <Link
              to="/admin/recruitment/applications"
              className="text-[11px] text-[var(--admin-accent)] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Candidates <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-serif-display font-medium text-[var(--admin-text-primary)]">
            {summary.totalApplications ?? 0}
          </div>
          <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--admin-text-secondary)] mt-1 font-semibold">
            Total Candidates
          </div>
          <div className="text-xs text-[var(--admin-info)] font-semibold mt-2 font-mono">
            {byStatus.new || 0} New Pending Review
          </div>
        </div>

        {/* In Active Pipeline */}
        <div className="admin-card p-5 rounded-xl relative overflow-hidden group hover:border-[var(--admin-accent)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-5 h-5 text-[var(--admin-accent)]" strokeWidth={1.75} />
            <Link
              to="/admin/recruitment/applications?status=Under%20Review"
              className="text-[11px] text-[var(--admin-accent)] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Active <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-serif-display font-medium text-[var(--admin-text-primary)]">
            {(byStatus.underReview || 0) +
              (byStatus.shortlisted || 0) +
              (byStatus.interviewScheduled || 0)}
          </div>
          <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--admin-text-secondary)] mt-1 font-semibold">
            In Active Pipeline
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-300 font-semibold mt-2 font-mono">
            {byStatus.interviewScheduled || 0} Interviews Scheduled
          </div>
        </div>

        {/* Selected & Hired */}
        <div className="admin-card p-5 rounded-xl relative overflow-hidden group hover:border-[var(--admin-accent)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="w-5 h-5 text-[var(--admin-success)]" strokeWidth={1.75} />
            <Link
              to="/admin/recruitment/applications?status=Selected"
              className="text-[11px] text-[var(--admin-success)] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Hired <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-serif-display font-medium text-[var(--admin-text-primary)]">
            {byStatus.selected ?? 0}
          </div>
          <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--admin-text-secondary)] mt-1 font-semibold">
            Selected &amp; Hired
          </div>
          <div className="text-xs text-[var(--admin-text-muted)] mt-2 font-mono">
            {byStatus.rejected || 0} Rejected · {byStatus.withdrawn || 0} Withdrawn
          </div>
        </div>
      </div>

      {/* Pipeline Stages Breakdown */}
      <div className="admin-card rounded-xl p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-accent)] shadow-2xs">
              <Users className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-serif-display text-lg font-medium text-[var(--admin-text-primary)]">
                Recruitment Pipeline Stages
              </h2>
              <p className="text-xs text-[var(--admin-text-secondary)]">
                Candidate distribution across qualification, interview scheduling, and offer release
              </p>
            </div>
          </div>
          <Link
            to="/admin/recruitment/applications"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--admin-accent)] hover:underline transition-colors"
          >
            <span>Open Candidate Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            {
              label: "New",
              count: byStatus.new || 0,
              bg: "var(--admin-info-bg)",
              border: "var(--admin-info-border)",
              color: "var(--admin-info)",
            },
            {
              label: "Under Review",
              count: byStatus.underReview || 0,
              bg: "var(--admin-warning-bg)",
              border: "var(--admin-warning-border)",
              color: "var(--admin-warning)",
            },
            {
              label: "Shortlisted",
              count: byStatus.shortlisted || 0,
              bg: "rgba(20, 184, 166, 0.10)",
              border: "rgba(20, 184, 166, 0.28)",
              color: "#0f766e",
            },
            {
              label: "Interview Scheduled",
              count: byStatus.interviewScheduled || 0,
              bg: "rgba(168, 85, 247, 0.10)",
              border: "rgba(168, 85, 247, 0.28)",
              color: "#7e22ce",
            },
            {
              label: "Selected",
              count: byStatus.selected || 0,
              bg: "var(--admin-success-bg)",
              border: "var(--admin-success-border)",
              color: "var(--admin-success)",
            },
            {
              label: "Rejected",
              count: byStatus.rejected || 0,
              bg: "var(--admin-error-bg)",
              border: "var(--admin-error-border)",
              color: "var(--admin-error)",
            },
            {
              label: "Withdrawn",
              count: byStatus.withdrawn || 0,
              bg: "var(--admin-surface-2)",
              border: "var(--admin-border-subtle)",
              color: "var(--admin-text-secondary)",
            },
          ].map((stage, idx) => (
            <Link
              key={idx}
              to={`/admin/recruitment/applications?status=${encodeURIComponent(stage.label)}`}
              className="p-3.5 rounded-lg border text-center transition-all hover:scale-[1.02] shadow-2xs"
              style={{
                backgroundColor: stage.bg,
                borderColor: stage.border,
              }}
            >
              <div
                className="text-2xl font-serif-display font-medium"
                style={{ color: stage.color }}
              >
                {stage.count}
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.14em] mt-1 font-semibold truncate"
                style={{ color: stage.color }}
              >
                {stage.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-Column: Recent Candidates & Recent Openings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Card */}
        <div className="admin-card rounded-xl p-6 flex flex-col justify-between shadow-2xs space-y-4">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[var(--admin-border)] mb-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[var(--admin-accent)]" />
                <h3 className="font-serif-display text-base font-medium text-[var(--admin-text-primary)]">
                  Recent Candidates
                </h3>
              </div>
              <Link
                to="/admin/recruitment/applications"
                className="text-xs text-[var(--admin-accent)] hover:underline font-semibold uppercase tracking-[0.12em] transition-colors"
              >
                View All →
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-10 border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-muted)] italic text-xs">
                No candidate applications received yet.
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="w-full text-xs">
                  <thead className="admin-thead">
                    <tr>
                      <th className="text-left p-3 font-semibold">Candidate</th>
                      <th className="text-left p-3 font-semibold">Role</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr key={app.id} className="admin-tr">
                        <td className="p-3">
                          <Link
                            to={`/admin/recruitment/applications?id=${app.id}`}
                            className="font-semibold text-[var(--admin-text-primary)] hover:text-[var(--admin-accent)] transition-colors"
                          >
                            {app.name}
                          </Link>
                          <div className="text-[10px] text-[var(--admin-text-muted)] font-mono">
                            Ref: {app.referenceNumber}
                          </div>
                        </td>
                        <td className="p-3 text-[var(--admin-text-secondary)] truncate max-w-[140px]">
                          {app.jobTitle}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={app.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--admin-border)] text-center">
            <Link
              to="/admin/recruitment/applications"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--admin-accent)] hover:underline transition-colors"
            >
              Open Candidate Pipeline Console →
            </Link>
          </div>
        </div>

        {/* Recent Openings Card */}
        <div className="admin-card rounded-xl p-6 flex flex-col justify-between shadow-2xs space-y-4">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[var(--admin-border)] mb-4">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-[var(--admin-accent)]" />
                <h3 className="font-serif-display text-base font-medium text-[var(--admin-text-primary)]">
                  Recent Vacancies
                </h3>
              </div>
              <Link
                to="/admin/recruitment/jobs"
                className="text-xs text-[var(--admin-accent)] hover:underline font-semibold uppercase tracking-[0.12em] transition-colors"
              >
                Manage All →
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="text-center py-10 border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-muted)] italic text-xs">
                No job vacancies published yet.
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="w-full text-xs">
                  <thead className="admin-thead">
                    <tr>
                      <th className="text-left p-3 font-semibold">Job Title</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-right p-3 font-semibold">Applicants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((job) => (
                      <tr key={job.id} className="admin-tr">
                        <td className="p-3">
                          <Link
                            to={`/admin/recruitment/jobs/${job.id}/edit`}
                            className="font-semibold text-[var(--admin-text-primary)] hover:text-[var(--admin-accent)] transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="text-[10px] text-[var(--admin-text-muted)]">
                            {job.department} • {job.location}
                          </div>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-[var(--admin-accent)]">
                          {job.applicationsCount || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--admin-border)] flex items-center justify-between">
            <Link
              to="/admin/recruitment/jobs/new"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--admin-accent)] hover:underline transition-colors"
            >
              + Create New Vacancy
            </Link>
            <Link
              to="/admin/recruitment/jobs"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] transition-colors"
            >
              View Full Table →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
