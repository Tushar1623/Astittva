import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";

const STATUS_COLORS = {
  New: "bg-blue-900/30 text-blue-300 border-blue-500/40",
  "Under Review": "bg-amber-900/30 text-amber-300 border-amber-500/40",
  Shortlisted: "bg-emerald-900/30 text-emerald-300 border-emerald-500/40",
  "Interview Scheduled": "bg-purple-900/30 text-purple-300 border-purple-500/40",
  Selected: "bg-green-900/30 text-green-300 border-green-500/40",
  Rejected: "bg-red-900/30 text-red-300 border-red-500/40",
  Withdrawn: "bg-zinc-800 text-zinc-400 border-zinc-600/40",
};

export default function AdminRecruitmentDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await api.get("/admin/recruitment/dashboard");
        if (isMounted) setData(res.data);
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load recruitment dashboard:", err);
          setError(formatApiErrorDetail(err.response?.data?.detail));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-copper border-t-transparent mb-3" />
        <p className="text-xs uppercase tracking-widest text-copper/60 font-mono">Loading Recruitment Analytics…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6 text-center text-red-200 text-sm">
          <p>{error || "Failed to load dashboard data."}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-1.5 text-xs bg-red-900/40 rounded border border-red-500/40 hover:bg-red-900/60"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary = {}, byStatus = {}, recentApplications = [], recentJobs = [] } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-copper/15 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-copper">
            Talent Acquisition &amp; Hiring
          </span>
          <h1 className="text-2xl sm:text-3xl font-display text-ivory mt-1">
            Recruitment Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/recruitment/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-copper hover:bg-copper/90 text-charcoal font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" /> Post New Opening
          </Link>
          <Link
            to="/careers/jobs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-copper/30 hover:border-copper text-xs font-mono uppercase tracking-wider text-ivory hover:text-copper transition-colors"
          >
            Public Job Board <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-ivory/50 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Total Vacancies</span>
            <Briefcase className="w-4 h-4 text-copper" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-medium text-ivory">
            {summary.totalJobs || 0}
          </div>
          <div className="text-[11px] text-ivory/50 mt-1 flex gap-2">
            <span className="text-emerald-400 font-medium">{summary.publishedJobs || 0} Published</span>
            <span>•</span>
            <span>{summary.draftJobs || 0} Draft</span>
          </div>
        </div>

        <div className="bg-[#181818] border border-copper/20 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-ivory/50 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Total Candidates</span>
            <Users className="w-4 h-4 text-copper" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-medium text-ivory">
            {summary.totalApplications || 0}
          </div>
          <div className="text-[11px] text-blue-400 font-medium mt-1">
            {byStatus.new || 0} New Pending Review
          </div>
        </div>

        <div className="bg-[#181818] border border-copper/20 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-ivory/50 text-xs font-mono uppercase tracking-wider mb-2">
            <span>In Pipeline</span>
            <Clock className="w-4 h-4 text-copper" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-medium text-ivory">
            {(byStatus.underReview || 0) + (byStatus.shortlisted || 0) + (byStatus.interviewScheduled || 0)}
          </div>
          <div className="text-[11px] text-purple-400 font-medium mt-1">
            {byStatus.interviewScheduled || 0} Interview Scheduled
          </div>
        </div>

        <div className="bg-[#181818] border border-copper/20 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-ivory/50 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Selected Offers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-medium text-emerald-400">
            {byStatus.selected || 0}
          </div>
          <div className="text-[11px] text-ivory/50 mt-1">
            {byStatus.rejected || 0} Rejected / {byStatus.withdrawn || 0} Withdrawn
          </div>
        </div>
      </div>

      {/* Stage Breakdown Pills */}
      <div className="bg-[#181818] border border-copper/20 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-mono uppercase tracking-widest text-copper mb-4">
          Hiring Pipeline Stage Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "New", count: byStatus.new || 0, color: "text-blue-300 bg-blue-950/40 border-blue-500/30" },
            { label: "Under Review", count: byStatus.underReview || 0, color: "text-amber-300 bg-amber-950/40 border-amber-500/30" },
            { label: "Shortlisted", count: byStatus.shortlisted || 0, color: "text-emerald-300 bg-emerald-950/40 border-emerald-500/30" },
            { label: "Interview Scheduled", count: byStatus.interviewScheduled || 0, color: "text-purple-300 bg-purple-950/40 border-purple-500/30" },
            { label: "Selected", count: byStatus.selected || 0, color: "text-green-300 bg-green-950/40 border-green-500/30" },
            { label: "Rejected", count: byStatus.rejected || 0, color: "text-red-300 bg-red-950/40 border-red-500/30" },
            { label: "Withdrawn", count: byStatus.withdrawn || 0, color: "text-zinc-400 bg-zinc-900 border-zinc-700" },
          ].map((stage, idx) => (
            <Link
              key={idx}
              to={`/admin/recruitment/applications?status=${encodeURIComponent(stage.label)}`}
              className={`p-3 rounded-lg border text-center transition-all hover:scale-[1.02] ${stage.color}`}
            >
              <div className="text-xl font-bold font-mono">{stage.count}</div>
              <div className="text-[11px] uppercase tracking-wider font-sans mt-0.5 opacity-90 truncate">{stage.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Section: Recent Candidates & Recent Vacancies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications Table */}
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-copper/15 pb-3">
              <h3 className="text-base font-display text-ivory flex items-center gap-2">
                <Users className="w-4 h-4 text-copper" /> Recent Candidate Applications
              </h3>
              <Link
                to="/admin/recruitment/applications"
                className="text-xs text-copper hover:text-copper/80 font-mono uppercase tracking-wider flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <p className="text-xs text-ivory/40 py-8 text-center font-mono">No candidate applications yet.</p>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    to={`/admin/recruitment/applications?id=${app.id}`}
                    className="block p-3.5 rounded-lg bg-charcoal/70 border border-copper/15 hover:border-copper/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div>
                        <span className="text-sm font-medium text-ivory block">{app.name}</span>
                        <span className="text-xs text-ivory/60 truncate block">{app.jobTitle}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border shrink-0 ${
                          STATUS_COLORS[app.status] || "bg-zinc-800 text-zinc-300 border-zinc-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ivory/40 font-mono">
                      <span>Ref: {app.referenceNumber}</span>
                      <span>{app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN") : ""}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-copper/15 mt-4">
            <Link
              to="/admin/recruitment/applications"
              className="text-xs text-copper hover:underline font-mono tracking-wider block text-center uppercase"
            >
              Open Candidate Pipeline →
            </Link>
          </div>
        </div>

        {/* Recent Openings Table */}
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-copper/15 pb-3">
              <h3 className="text-base font-display text-ivory flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-copper" /> Active &amp; Recent Vacancies
              </h3>
              <Link
                to="/admin/recruitment/jobs"
                className="text-xs text-copper hover:text-copper/80 font-mono uppercase tracking-wider flex items-center gap-1"
              >
                Manage All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <p className="text-xs text-ivory/40 py-8 text-center font-mono">No vacancies created yet.</p>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-lg bg-charcoal/70 border border-copper/15 hover:border-copper/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/recruitment/jobs/${job.id}/edit`}
                          className="text-sm font-medium text-ivory hover:text-copper transition-colors truncate"
                        >
                          {job.title}
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border shrink-0 ${
                            job.status === "published"
                              ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                              : job.status === "draft"
                              ? "bg-amber-950/40 text-amber-300 border-amber-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <span className="text-xs text-ivory/50 block mt-0.5 font-sans">
                        {job.department} • {job.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div className="text-xs text-ivory/70">
                        <span className="text-copper font-bold font-mono text-sm">{job.applicationsCount || 0}</span>
                        <span className="block text-[10px] text-ivory/40 uppercase">Apps</span>
                      </div>

                      <Link
                        to={`/admin/recruitment/jobs/${job.id}/edit`}
                        className="p-1.5 rounded text-ivory/60 hover:text-copper hover:bg-white/5 transition-colors"
                        title="Edit Vacancy"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-copper/15 mt-4 flex items-center justify-between">
            <Link
              to="/admin/recruitment/jobs/new"
              className="text-xs text-copper hover:underline font-mono tracking-wider uppercase"
            >
              + Create New Opening
            </Link>
            <Link
              to="/admin/recruitment/jobs"
              className="text-xs text-ivory/60 hover:text-ivory font-mono tracking-wider uppercase"
            >
              View Full List →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
