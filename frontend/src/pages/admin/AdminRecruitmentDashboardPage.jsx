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
      <div className="text-ivory/50 text-center py-20 tracking-[0.25em] uppercase text-xs">
        Loading Recruitment Analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 border border-copper/20 bg-charcoal-2/30 rounded-[6px] p-6">
        <p className="text-rose-500 font-medium text-sm mb-3">
          {error || "Failed to load dashboard data."}
        </p>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.15em] rounded-[4px] transition-colors"
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
        <div className="bg-charcoal p-5 rounded-[6px] border border-copper/20 shadow-sm relative overflow-hidden group hover:border-copper/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <Briefcase className="w-5 h-5 text-copper" strokeWidth={1.75} />
            <Link
              to="/admin/recruitment/jobs"
              className="text-[10px] text-copper hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Openings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-display font-light text-ivory">
            {summary.totalJobs ?? 0}
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 mt-1">
            Total Vacancies
          </div>
          <div className="text-xs text-ivory/60 mt-2 flex gap-2 font-mono">
            <span className="text-emerald-500 font-medium">
              {summary.publishedJobs || 0} Published
            </span>
            <span>•</span>
            <span>{summary.draftJobs || 0} Draft</span>
          </div>
        </div>

        <div className="bg-charcoal p-5 rounded-[6px] border border-copper/20 shadow-sm relative overflow-hidden group hover:border-copper/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-[#C89A55]" strokeWidth={1.75} />
            <Link
              to="/admin/recruitment/applications"
              className="text-[10px] text-[#C89A55] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Candidates <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-display font-light text-ivory">
            {summary.totalApplications ?? 0}
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 mt-1">
            Total Candidates
          </div>
          <div className="text-xs text-blue-500 font-medium mt-2 font-mono">
            {byStatus.new || 0} New Pending Review
          </div>
        </div>

        <div className="bg-charcoal p-5 rounded-[6px] border border-copper/20 shadow-sm relative overflow-hidden group hover:border-copper/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
            <Link
              to="/admin/recruitment/applications"
              className="text-[10px] text-amber-500 hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Active <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-display font-light text-ivory">
            {(byStatus.underReview || 0) +
              (byStatus.shortlisted || 0) +
              (byStatus.interviewScheduled || 0)}
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 mt-1">
            In Active Pipeline
          </div>
          <div className="text-xs text-purple-500 font-medium mt-2 font-mono">
            {byStatus.interviewScheduled || 0} Interviews Scheduled
          </div>
        </div>

        <div className="bg-charcoal p-5 rounded-[6px] border border-copper/20 shadow-sm relative overflow-hidden group hover:border-copper/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={1.75} />
            <Link
              to="/admin/recruitment/applications"
              className="text-[10px] text-emerald-500 hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Hired <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-display font-light text-ivory">
            {byStatus.selected ?? 0}
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 mt-1">
            Selected &amp; Hired
          </div>
          <div className="text-xs text-ivory/50 mt-2 font-mono">
            {byStatus.rejected || 0} Rejected · {byStatus.withdrawn || 0} Withdrawn
          </div>
        </div>
      </div>

      {/* Pipeline Stages Breakdown */}
      <div className="bg-charcoal-2/30 border border-copper/20 rounded-[8px] p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-copper/15 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#C89A55]/15 border border-[#C89A55]/30 flex items-center justify-center text-[#C89A55]">
              <Users className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-display text-lg text-ivory">Recruitment Pipeline Stages</h2>
              <p className="text-xs text-ivory/50">
                Candidate distribution across qualification, interview scheduling, and offer release
              </p>
            </div>
          </div>
          <Link
            to="/admin/recruitment/applications"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-copper hover:underline transition-colors"
          >
            <span>Open Candidate Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "New", count: byStatus.new || 0, color: "border-blue-500/30 text-blue-500" },
            { label: "Under Review", count: byStatus.underReview || 0, color: "border-amber-500/30 text-amber-500" },
            { label: "Shortlisted", count: byStatus.shortlisted || 0, color: "border-emerald-500/30 text-emerald-500" },
            { label: "Interview Scheduled", count: byStatus.interviewScheduled || 0, color: "border-purple-500/30 text-purple-500" },
            { label: "Selected", count: byStatus.selected || 0, color: "border-green-600/30 text-green-600" },
            { label: "Rejected", count: byStatus.rejected || 0, color: "border-rose-500/30 text-rose-500" },
            { label: "Withdrawn", count: byStatus.withdrawn || 0, color: "border-zinc-500/30 text-zinc-400" },
          ].map((stage, idx) => (
            <Link
              key={idx}
              to={`/admin/recruitment/applications?status=${encodeURIComponent(stage.label)}`}
              className={`p-3.5 rounded-[4px] border text-center transition-all hover:border-copper/60 bg-charcoal ${stage.color}`}
            >
              <div className="text-2xl font-display font-light">{stage.count}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] mt-1 font-semibold truncate">
                {stage.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-Column: Recent Applications & Recent Openings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Card */}
        <div className="bg-charcoal-2/30 border border-copper/20 rounded-[8px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-copper/15 mb-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-copper" />
                <h3 className="font-display text-base text-ivory">Recent Candidates</h3>
              </div>
              <Link
                to="/admin/recruitment/applications"
                className="text-xs text-copper hover:underline font-semibold uppercase tracking-[0.12em] transition-colors"
              >
                View All →
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-10 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[4px] text-xs">
                No candidate applications received yet.
              </div>
            ) : (
              <div className="border border-copper/15 rounded-[4px] overflow-hidden bg-charcoal-2/20">
                <table className="w-full text-xs">
                  <thead className="bg-charcoal-2/80 text-ivory/60 text-[10px] tracking-[0.2em] uppercase border-b border-copper/15">
                    <tr>
                      <th className="text-left p-3 font-normal">Candidate</th>
                      <th className="text-left p-3 font-normal">Role</th>
                      <th className="text-left p-3 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-copper/10">
                    {recentApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-charcoal-2/40 transition-colors"
                      >
                        <td className="p-3">
                          <Link
                            to={`/admin/recruitment/applications?id=${app.id}`}
                            className="font-medium text-ivory hover:text-copper transition-colors"
                          >
                            {app.name}
                          </Link>
                          <div className="text-[10px] text-ivory/45 font-mono">
                            Ref: {app.referenceNumber}
                          </div>
                        </td>
                        <td className="p-3 text-ivory/70 truncate max-w-[140px]">
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

          <div className="pt-4 border-t border-copper/15 mt-5 text-center">
            <Link
              to="/admin/recruitment/applications"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-copper hover:underline transition-colors"
            >
              Open Candidate Pipeline Console →
            </Link>
          </div>
        </div>

        {/* Recent Openings Card */}
        <div className="bg-charcoal-2/30 border border-copper/20 rounded-[8px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-copper/15 mb-4">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-copper" />
                <h3 className="font-display text-base text-ivory">Recent Vacancies</h3>
              </div>
              <Link
                to="/admin/recruitment/jobs"
                className="text-xs text-copper hover:underline font-semibold uppercase tracking-[0.12em] transition-colors"
              >
                Manage All →
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="text-center py-10 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[4px] text-xs">
                No job vacancies published yet.
              </div>
            ) : (
              <div className="border border-copper/15 rounded-[4px] overflow-hidden bg-charcoal-2/20">
                <table className="w-full text-xs">
                  <thead className="bg-charcoal-2/80 text-ivory/60 text-[10px] tracking-[0.2em] uppercase border-b border-copper/15">
                    <tr>
                      <th className="text-left p-3 font-normal">Job Title</th>
                      <th className="text-left p-3 font-normal">Status</th>
                      <th className="text-right p-3 font-normal">Applicants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-copper/10">
                    {recentJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="hover:bg-charcoal-2/40 transition-colors"
                      >
                        <td className="p-3">
                          <Link
                            to={`/admin/recruitment/jobs/${job.id}/edit`}
                            className="font-medium text-ivory hover:text-copper transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="text-[10px] text-ivory/45">
                            {job.department} • {job.location}
                          </div>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="p-3 text-right font-mono font-medium text-copper">
                          {job.applicationsCount || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-copper/15 mt-5 flex items-center justify-between">
            <Link
              to="/admin/recruitment/jobs/new"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-copper hover:underline transition-colors"
            >
              + Create New Vacancy
            </Link>
            <Link
              to="/admin/recruitment/jobs"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-ivory/60 hover:text-copper transition-colors"
            >
              View Full Table →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
