import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Eye,
  FileText,
  Calendar,
  Building,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";

const STATUS_BADGE_CLASSES = {
  New: "border-blue-500/40 text-blue-700 bg-blue-500/10",
  "Under Review": "border-amber-500/40 text-amber-700 bg-amber-500/10",
  Shortlisted: "border-emerald-500/40 text-emerald-700 bg-emerald-500/10",
  "Interview Scheduled": "border-purple-500/40 text-purple-700 bg-purple-500/10",
  Selected: "border-green-600/40 text-green-700 bg-green-600/10",
  Rejected: "border-red-500/40 text-red-700 bg-red-500/10",
  Withdrawn: "border-zinc-500/40 text-zinc-600 bg-zinc-500/10",
};

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
      console.error("Failed to load recruitment dashboard:", err);
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
      <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs">
        Loading Recruitment Analytics…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 border border-copper/20 bg-charcoal-2/30 rounded-[8px] p-6">
        <p className="text-red-600 font-medium text-sm mb-3">{error || "Failed to load dashboard data."}</p>
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
    <div data-testid="admin-recruitment-dashboard" className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-copper/15">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper">
              RECRUITMENT CONSOLE
            </span>
            <span className="text-ivory/30">•</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/50">
              TALENT ACQUISITION
            </span>
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory mb-2">
            Recruitment Overview
          </h1>
          <p className="text-ivory/55 font-light text-sm">
            Real-time metrics, vacancy monitoring, and applicant tracking across active Kolkata hiring pipelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/recruitment/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.15em] rounded-[4px] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Post New Opening
          </Link>
          <Link
            to="/careers/jobs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-copper/30 hover:border-copper text-xs font-semibold uppercase tracking-[0.15em] text-ivory/80 hover:text-white rounded-[4px] transition-colors"
          >
            <span>Public Job Board</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Signature Multi-Tile KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-copper/15 border border-copper/20 rounded-[6px] overflow-hidden">
        <div className="bg-charcoal p-6">
          <Briefcase className="w-5 h-5 text-copper mb-4" strokeWidth={1.5} />
          <div className="text-3xl font-display font-light text-ivory">
            {summary.totalJobs ?? 0}
          </div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 mt-2">
            Total Vacancies
          </div>
          <div className="text-xs text-ivory/50 mt-1 flex gap-2 font-mono">
            <span className="text-emerald-700 font-medium">{summary.publishedJobs || 0} Published</span>
            <span>•</span>
            <span>{summary.draftJobs || 0} Draft</span>
          </div>
        </div>

        <div className="bg-charcoal p-6">
          <Users className="w-5 h-5 text-[#C89A55] mb-4" strokeWidth={1.5} />
          <div className="text-3xl font-display font-light text-ivory">
            {summary.totalApplications ?? 0}
          </div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 mt-2">
            Total Applicants
          </div>
          <div className="text-xs text-blue-700 font-medium mt-1 font-mono">
            {byStatus.new || 0} New Pending Review
          </div>
        </div>

        <div className="bg-charcoal p-6">
          <Clock className="w-5 h-5 text-[#C89A55] mb-4" strokeWidth={1.5} />
          <div className="text-3xl font-display font-light text-ivory">
            {(byStatus.underReview || 0) + (byStatus.shortlisted || 0) + (byStatus.interviewScheduled || 0)}
          </div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 mt-2">
            In Active Pipeline
          </div>
          <div className="text-xs text-purple-700 font-medium mt-1 font-mono">
            {byStatus.interviewScheduled || 0} Interview Scheduled
          </div>
        </div>

        <div className="bg-charcoal p-6">
          <CheckCircle2 className="w-5 h-5 text-[#2E7D32] mb-4" strokeWidth={1.5} />
          <div className="text-3xl font-display font-light text-ivory">
            {byStatus.selected ?? 0}
          </div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 mt-2">
            Offers &amp; Selected
          </div>
          <div className="text-xs text-ivory/50 mt-1 font-mono">
            {byStatus.rejected || 0} Rejected · {byStatus.withdrawn || 0} Withdrawn
          </div>
        </div>
      </div>

      {/* SECTION: Pipeline Stages Breakdown */}
      <div className="bg-charcoal-2/30 border border-copper/20 rounded-[8px] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-copper/15 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#C89A55]/15 border border-[#C89A55]/30 flex items-center justify-center text-[#C89A55]">
              <Users className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-display text-xl text-ivory">Recruitment Pipeline Stages</h2>
              <p className="text-xs text-ivory/50">
                Track candidates across application review, interviews, and final offers
              </p>
            </div>
          </div>
          <Link
            to="/admin/recruitment/applications"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-copper hover:text-white transition-colors"
          >
            <span>Open Pipeline Console</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "New", count: byStatus.new || 0, color: "text-blue-700 bg-blue-500/10 border-blue-500/25" },
            { label: "Under Review", count: byStatus.underReview || 0, color: "text-amber-700 bg-amber-500/10 border-amber-500/25" },
            { label: "Shortlisted", count: byStatus.shortlisted || 0, color: "text-emerald-700 bg-emerald-500/10 border-emerald-500/25" },
            { label: "Interview Scheduled", count: byStatus.interviewScheduled || 0, color: "text-purple-700 bg-purple-500/10 border-purple-500/25" },
            { label: "Selected", count: byStatus.selected || 0, color: "text-green-700 bg-green-600/10 border-green-600/25" },
            { label: "Rejected", count: byStatus.rejected || 0, color: "text-red-700 bg-red-500/10 border-red-500/25" },
            { label: "Withdrawn", count: byStatus.withdrawn || 0, color: "text-zinc-600 bg-zinc-500/10 border-zinc-500/25" },
          ].map((stage, idx) => (
            <Link
              key={idx}
              to={`/admin/recruitment/applications?status=${encodeURIComponent(stage.label)}`}
              className={`p-3.5 rounded-[4px] border text-center transition-all hover:border-copper/50 bg-charcoal ${stage.color}`}
            >
              <div className="text-2xl font-display font-normal">{stage.count}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] mt-1 font-semibold truncate">
                {stage.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* TWO-COLUMN SECTION: Recent Applications & Recent Openings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications Card */}
        <div className="bg-charcoal-2/30 border border-copper/20 rounded-[8px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-copper/15 mb-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-copper" />
                <h3 className="font-display text-lg text-ivory">Recent Applications</h3>
              </div>
              <Link
                to="/admin/recruitment/applications"
                className="text-xs text-copper hover:text-white font-semibold uppercase tracking-[0.12em] transition-colors"
              >
                View All →
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-12 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[6px]">
                No candidate applications received yet.
              </div>
            ) : (
              <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20">
                <table className="w-full text-xs">
                  <thead className="bg-charcoal-2/80 text-ivory/60 text-[10px] tracking-[0.2em] uppercase border-b border-copper/15">
                    <tr>
                      <th className="text-left p-3 font-normal">Candidate</th>
                      <th className="text-left p-3 font-normal">Role</th>
                      <th className="text-left p-3 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-t border-copper/10 hover:bg-charcoal-2/40 transition-colors"
                      >
                        <td className="p-3">
                          <Link
                            to={`/admin/recruitment/applications?id=${app.id}`}
                            className="font-medium text-ivory hover:text-copper transition-colors"
                          >
                            {app.name}
                          </Link>
                          <div className="text-[10px] text-ivory/45 font-mono">Ref: {app.referenceNumber}</div>
                        </td>
                        <td className="p-3 text-ivory/70 truncate max-w-[140px]">{app.jobTitle}</td>
                        <td className="p-3">
                          <span
                            className={`text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-[2px] border font-medium ${
                              STATUS_BADGE_CLASSES[app.status] || "border-copper/30 text-copper"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-copper/15 mt-6 text-center">
            <Link
              to="/admin/recruitment/applications"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-copper hover:text-white transition-colors"
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
                <h3 className="font-display text-lg text-ivory">Recent Vacancies</h3>
              </div>
              <Link
                to="/admin/recruitment/jobs"
                className="text-xs text-copper hover:text-white font-semibold uppercase tracking-[0.12em] transition-colors"
              >
                Manage All →
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="text-center py-12 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[6px]">
                No job vacancies published yet.
              </div>
            ) : (
              <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20">
                <table className="w-full text-xs">
                  <thead className="bg-charcoal-2/80 text-ivory/60 text-[10px] tracking-[0.2em] uppercase border-b border-copper/15">
                    <tr>
                      <th className="text-left p-3 font-normal">Job Title</th>
                      <th className="text-left p-3 font-normal">Status</th>
                      <th className="text-right p-3 font-normal">Applicants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-t border-copper/10 hover:bg-charcoal-2/40 transition-colors"
                      >
                        <td className="p-3">
                          <Link
                            to={`/admin/recruitment/jobs/${job.id}/edit`}
                            className="font-medium text-ivory hover:text-copper transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="text-[10px] text-ivory/45">{job.department} • {job.location}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-[2px] border font-medium ${
                              job.status === "published"
                                ? "border-green-600/30 text-green-700 bg-green-500/10"
                                : job.status === "draft"
                                ? "border-amber-600/30 text-amber-700 bg-amber-500/10"
                                : "border-copper/30 text-copper"
                            }`}
                          >
                            {job.status}
                          </span>
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

          <div className="pt-4 border-t border-copper/15 mt-6 flex items-center justify-between">
            <Link
              to="/admin/recruitment/jobs/new"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-copper hover:text-white transition-colors"
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
