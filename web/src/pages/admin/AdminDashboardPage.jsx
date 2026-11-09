import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import {
  Building2,
  Inbox,
  Users,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  FileText,
  Plus,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const propStats = stats?.property_leads || {
    total: stats?.leads_total ?? 0,
    new: stats?.leads_new ?? 0,
    contacted: 0,
    site_visit: 0,
    converted: 0,
  };

  const careerStats = stats?.career_applications || {
    total: 0,
    new: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
  };

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      {/* Header */}
      <AdminHeader
        category="Admin Console"
        title="Dashboard Overview"
        subtitle="Real-time estate metrics, customer inquiries, and recruitment pipeline status."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            variant: "outline",
            onClick: fetchStats,
          },
          {
            label: "New Property",
            icon: Plus,
            to: "/admin/properties/new",
            variant: "primary",
          },
        ]}
      />

      {/* Primary KPI Metrics Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Properties */}
        <div className="admin-card p-6 rounded-xl relative overflow-hidden group hover:border-[var(--admin-accent)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-5 h-5 text-[var(--admin-accent)]" strokeWidth={1.75} />
            <Link
              to="/admin/properties"
              className="text-[11px] text-[var(--admin-accent)] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-serif-display font-medium text-[var(--admin-text-primary)]">
            {stats?.properties_total ?? (loading ? "…" : 0)}
          </div>
          <div className="text-[11px] tracking-[0.16em] uppercase text-[var(--admin-text-secondary)] mt-1 font-medium">
            Total Properties
          </div>
          <div className="text-xs text-[var(--admin-success)] font-medium mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--admin-success)] animate-pulse" />
            <span>{stats?.properties_published ?? 0} Published Live</span>
          </div>
        </div>

        {/* Property Leads */}
        <div className="admin-card p-6 rounded-xl relative overflow-hidden group hover:border-[var(--admin-accent)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <Inbox className="w-5 h-5 text-[var(--admin-accent)]" strokeWidth={1.75} />
            <Link
              to="/admin/leads/property"
              className="text-[11px] text-[var(--admin-accent)] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-serif-display font-medium text-[var(--admin-text-primary)]">
            {propStats.total}
          </div>
          <div className="text-[11px] tracking-[0.16em] uppercase text-[var(--admin-text-secondary)] mt-1 font-medium">
            Property Leads
          </div>
          <div className="text-xs text-[var(--admin-error)] font-medium mt-2">
            {propStats.new} New Inquiries Pending
          </div>
        </div>

        {/* Career Applicants */}
        <div className="admin-card p-6 rounded-xl relative overflow-hidden group hover:border-[var(--admin-accent)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <Briefcase className="w-5 h-5 text-[var(--admin-accent)]" strokeWidth={1.75} />
            <Link
              to="/admin/recruitment"
              className="text-[11px] text-[var(--admin-accent)] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Console <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-serif-display font-medium text-[var(--admin-text-primary)]">
            {careerStats.total}
          </div>
          <div className="text-[11px] tracking-[0.16em] uppercase text-[var(--admin-text-secondary)] mt-1 font-medium">
            Career Applicants
          </div>
          <div className="text-xs text-[var(--admin-info)] font-medium mt-2">
            {careerStats.new} New Applicants Awaiting Review
          </div>
        </div>

        {/* Staff Accounts */}
        <div className="admin-card p-6 rounded-xl relative overflow-hidden group hover:border-[var(--admin-accent)] transition-all">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-[var(--admin-accent)]" strokeWidth={1.75} />
            <Link
              to="/admin/users"
              className="text-[11px] text-[var(--admin-accent)] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Team <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-serif-display font-medium text-[var(--admin-text-primary)]">
            {stats?.users_total ?? (loading ? "…" : 0)}
          </div>
          <div className="text-[11px] tracking-[0.16em] uppercase text-[var(--admin-text-secondary)] mt-1 font-medium">
            Staff Accounts
          </div>
          <div className="text-xs text-[var(--admin-text-muted)] mt-2 font-mono">
            Active RBAC Access
          </div>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/properties/new"
          className="admin-card p-4 rounded-xl hover:border-[var(--admin-accent)] transition-all flex items-center gap-3.5 group shadow-2xs"
        >
          <div className="p-2.5 rounded-lg bg-[var(--admin-surface-2)] text-[var(--admin-accent)] group-hover:scale-105 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--admin-text-primary)] group-hover:text-[var(--admin-accent)] transition-colors">
              Add Property
            </div>
            <div className="text-[10px] text-[var(--admin-text-secondary)]">Post primary listing</div>
          </div>
        </Link>

        <Link
          to="/admin/resale/new"
          className="admin-card p-4 rounded-xl hover:border-[var(--admin-accent)] transition-all flex items-center gap-3.5 group shadow-2xs"
        >
          <div className="p-2.5 rounded-lg bg-[var(--admin-surface-2)] text-[var(--admin-accent)] group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--admin-text-primary)] group-hover:text-[var(--admin-accent)] transition-colors">
              Add Resale
            </div>
            <div className="text-[10px] text-[var(--admin-text-secondary)]">Post verified resale</div>
          </div>
        </Link>

        <Link
          to="/admin/blogs/new"
          className="admin-card p-4 rounded-xl hover:border-[var(--admin-accent)] transition-all flex items-center gap-3.5 group shadow-2xs"
        >
          <div className="p-2.5 rounded-lg bg-[var(--admin-surface-2)] text-[var(--admin-accent)] group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--admin-text-primary)] group-hover:text-[var(--admin-accent)] transition-colors">
              Publish Editorial
            </div>
            <div className="text-[10px] text-[var(--admin-text-secondary)]">Market trends &amp; blogs</div>
          </div>
        </Link>

        <Link
          to="/admin/recruitment/jobs/new"
          className="admin-card p-4 rounded-xl hover:border-[var(--admin-accent)] transition-all flex items-center gap-3.5 group shadow-2xs"
        >
          <div className="p-2.5 rounded-lg bg-[var(--admin-surface-2)] text-[var(--admin-accent)] group-hover:scale-105 transition-transform">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--admin-text-primary)] group-hover:text-[var(--admin-accent)] transition-colors">
              Post Vacancy
            </div>
            <div className="text-[10px] text-[var(--admin-text-secondary)]">Recruit team talent</div>
          </div>
        </Link>
      </div>

      {/* SECTION 1: PROPERTY LEADS BREAKDOWN */}
      <div className="admin-card rounded-xl p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-accent)] shadow-2xs">
              <Inbox className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-serif-display text-lg font-medium text-[var(--admin-text-primary)]">
                Property Inquiries Breakdown
              </h2>
              <p className="text-xs text-[var(--admin-text-secondary)]">
                Buyer and investor inquiry status across primary development portfolios
              </p>
            </div>
          </div>
          <Link
            to="/admin/leads/property"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--admin-accent)] hover:underline transition-colors"
          >
            <span>Open Leads Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="admin-card-subtle p-4 rounded-lg">
            <div className="text-2xl font-serif-display font-medium text-[var(--admin-text-primary)]">
              {propStats.total}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-text-secondary)] mt-1 font-medium">
              Total Inquiries
            </div>
          </div>

          <div
            className="p-4 rounded-lg border text-left"
            style={{
              backgroundColor: "var(--admin-error-bg)",
              borderColor: "var(--admin-error-border)",
            }}
          >
            <div className="text-2xl font-serif-display font-medium text-[var(--admin-error)]">
              {propStats.new}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-error)] mt-1 font-semibold">
              New Uncontacted
            </div>
          </div>

          <div
            className="p-4 rounded-lg border text-left"
            style={{
              backgroundColor: "var(--admin-warning-bg)",
              borderColor: "var(--admin-warning-border)",
            }}
          >
            <div className="text-2xl font-serif-display font-medium text-[var(--admin-warning)]">
              {propStats.contacted}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-warning)] mt-1 font-semibold">
              Contacted
            </div>
          </div>

          <div
            className="p-4 rounded-lg border text-left"
            style={{
              backgroundColor: "var(--admin-info-bg)",
              borderColor: "var(--admin-info-border)",
            }}
          >
            <div className="text-2xl font-serif-display font-medium text-[var(--admin-info)]">
              {propStats.site_visit}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-info)] mt-1 font-semibold">
              Site Visits
            </div>
          </div>

          <div
            className="p-4 rounded-lg border text-left"
            style={{
              backgroundColor: "var(--admin-success-bg)",
              borderColor: "var(--admin-success-border)",
            }}
          >
            <div className="text-2xl font-serif-display font-medium text-[var(--admin-success)]">
              {propStats.converted}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-success)] mt-1 font-semibold">
              Converted
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CAREER PIPELINE BREAKDOWN */}
      <div className="admin-card rounded-xl p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-accent)] shadow-2xs">
              <Briefcase className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-serif-display text-lg font-medium text-[var(--admin-text-primary)]">
                Recruitment Pipeline
              </h2>
              <p className="text-xs text-[var(--admin-text-secondary)]">
                Candidate applications, candidate CV assessments, and interview statuses
              </p>
            </div>
          </div>
          <Link
            to="/admin/recruitment/applications"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--admin-accent)] hover:underline transition-colors"
          >
            <span>Open Applicant Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="admin-card-subtle p-4 rounded-lg">
            <div className="text-2xl font-serif-display font-medium text-[var(--admin-text-primary)]">
              {careerStats.total}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-text-secondary)] mt-1 font-medium">
              Total Applicants
            </div>
          </div>

          <div
            className="p-4 rounded-lg border text-left"
            style={{
              backgroundColor: "var(--admin-info-bg)",
              borderColor: "var(--admin-info-border)",
            }}
          >
            <div className="text-2xl font-serif-display font-medium text-[var(--admin-info)]">
              {careerStats.new}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-info)] mt-1 font-semibold">
              New
            </div>
          </div>

          <div
            className="p-4 rounded-lg border text-left"
            style={{
              backgroundColor: "var(--admin-warning-bg)",
              borderColor: "var(--admin-warning-border)",
            }}
          >
            <div className="text-2xl font-serif-display font-medium text-[var(--admin-warning)]">
              {careerStats.reviewing}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-warning)] mt-1 font-semibold">
              Under Review
            </div>
          </div>

          <div
            className="p-4 rounded-lg border text-left"
            style={{
              backgroundColor: "var(--admin-success-bg)",
              borderColor: "var(--admin-success-border)",
            }}
          >
            <div className="text-2xl font-serif-display font-medium text-[var(--admin-success)]">
              {careerStats.shortlisted}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-success)] mt-1 font-semibold">
              Shortlisted
            </div>
          </div>

          <div
            className="p-4 rounded-lg border text-left"
            style={{
              backgroundColor: "rgba(168, 85, 247, 0.10)",
              borderColor: "rgba(168, 85, 247, 0.28)",
            }}
          >
            <div className="text-2xl font-serif-display font-medium text-purple-600 dark:text-purple-300">
              {careerStats.interview}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-purple-700 dark:text-purple-300 mt-1 font-semibold">
              Interview
            </div>
          </div>

          <div
            className="p-4 rounded-lg border text-left"
            style={{
              backgroundColor: "var(--admin-success-bg)",
              borderColor: "var(--admin-success-border)",
            }}
          >
            <div className="text-2xl font-serif-display font-medium text-[var(--admin-success)]">
              {careerStats.selected}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-success)] mt-1 font-semibold">
              Selected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
