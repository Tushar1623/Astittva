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
        <div className="bg-charcoal p-5 rounded-[6px] border border-copper/20 shadow-sm relative overflow-hidden group hover:border-copper/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-5 h-5 text-copper" strokeWidth={1.75} />
            <Link
              to="/admin/properties"
              className="text-[10px] text-copper hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-display font-light text-ivory">
            {stats?.properties_total ?? (loading ? "…" : 0)}
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 mt-1">
            Total Properties
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{stats?.properties_published ?? 0} Published Live</span>
          </div>
        </div>

        <div className="bg-charcoal p-5 rounded-[6px] border border-copper/20 shadow-sm relative overflow-hidden group hover:border-copper/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <Inbox className="w-5 h-5 text-[#C89A55]" strokeWidth={1.75} />
            <Link
              to="/admin/leads/property"
              className="text-[10px] text-[#C89A55] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-display font-light text-ivory">
            {propStats.total}
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 mt-1">
            Property Leads
          </div>
          <div className="text-xs text-rose-500 font-medium mt-2">
            {propStats.new} New Inquiries Pending
          </div>
        </div>

        <div className="bg-charcoal p-5 rounded-[6px] border border-copper/20 shadow-sm relative overflow-hidden group hover:border-copper/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <Briefcase className="w-5 h-5 text-copper" strokeWidth={1.75} />
            <Link
              to="/admin/recruitment"
              className="text-[10px] text-copper hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Console <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-display font-light text-ivory">
            {careerStats.total}
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 mt-1">
            Career Applicants
          </div>
          <div className="text-xs text-blue-600 font-medium mt-2">
            {careerStats.new} New Applicants Awaiting Review
          </div>
        </div>

        <div className="bg-charcoal p-5 rounded-[6px] border border-copper/20 shadow-sm relative overflow-hidden group hover:border-copper/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-[#C89A55]" strokeWidth={1.75} />
            <Link
              to="/admin/users"
              className="text-[10px] text-[#C89A55] hover:underline uppercase tracking-wider font-semibold inline-flex items-center gap-1"
            >
              Team <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-3xl font-display font-light text-ivory">
            {stats?.users_total ?? (loading ? "…" : 0)}
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 mt-1">
            Staff Accounts
          </div>
          <div className="text-xs text-ivory/50 mt-2 font-mono">
            Active RBAC Access
          </div>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/properties/new"
          className="p-3.5 rounded-[4px] border border-copper/20 bg-charcoal-2/30 hover:bg-charcoal-2/60 hover:border-copper transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded bg-copper/10 text-copper group-hover:scale-105 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-ivory group-hover:text-copper transition-colors">
              Add Property
            </div>
            <div className="text-[10px] text-ivory/40">Post primary listing</div>
          </div>
        </Link>

        <Link
          to="/admin/resale/new"
          className="p-3.5 rounded-[4px] border border-copper/20 bg-charcoal-2/30 hover:bg-charcoal-2/60 hover:border-copper transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded bg-copper/10 text-copper group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-ivory group-hover:text-copper transition-colors">
              Add Resale
            </div>
            <div className="text-[10px] text-ivory/40">Post verified resale</div>
          </div>
        </Link>

        <Link
          to="/admin/blogs/new"
          className="p-3.5 rounded-[4px] border border-copper/20 bg-charcoal-2/30 hover:bg-charcoal-2/60 hover:border-copper transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded bg-copper/10 text-copper group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-ivory group-hover:text-copper transition-colors">
              Publish Editorial
            </div>
            <div className="text-[10px] text-ivory/40">Market trends &amp; blogs</div>
          </div>
        </Link>

        <Link
          to="/admin/recruitment/jobs/new"
          className="p-3.5 rounded-[4px] border border-copper/20 bg-charcoal-2/30 hover:bg-charcoal-2/60 hover:border-copper transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded bg-copper/10 text-copper group-hover:scale-105 transition-transform">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-medium text-ivory group-hover:text-copper transition-colors">
              Post Vacancy
            </div>
            <div className="text-[10px] text-ivory/40">Recruit team talent</div>
          </div>
        </Link>
      </div>

      {/* SECTION 1: PROPERTY LEADS BREAKDOWN */}
      <div className="bg-charcoal-2/30 border border-copper/20 rounded-[8px] p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-copper/15 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#C89A55]/15 border border-[#C89A55]/30 flex items-center justify-center text-[#C89A55]">
              <Inbox className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-display text-lg text-ivory">Property Inquiries Breakdown</h2>
              <p className="text-xs text-ivory/50">
                Buyer and investor inquiry status across primary development portfolios
              </p>
            </div>
          </div>
          <Link
            to="/admin/leads/property"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-copper hover:underline transition-colors"
          >
            <span>Open Leads Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-charcoal p-4 rounded-[6px] border border-copper/15">
            <div className="text-2xl font-display text-ivory">
              {propStats.total}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ivory/50 mt-1">
              Total Inquiries
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-rose-500/30">
            <div className="text-2xl font-display text-rose-500">
              {propStats.new}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-rose-500/80 mt-1">
              New Uncontacted
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-amber-500/30">
            <div className="text-2xl font-display text-amber-500">
              {propStats.contacted}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-amber-500/80 mt-1">
              Contacted
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-purple-500/30">
            <div className="text-2xl font-display text-purple-500">
              {propStats.site_visit}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-purple-500/80 mt-1">
              Site Visits
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-emerald-500/30">
            <div className="text-2xl font-display text-emerald-500">
              {propStats.converted}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-emerald-500/80 mt-1">
              Converted
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CAREER PIPELINE BREAKDOWN */}
      <div className="bg-charcoal-2/30 border border-copper/20 rounded-[8px] p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-copper/15 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#B77B3E]/15 border border-[#B77B3E]/30 flex items-center justify-center text-[#B77B3E]">
              <Briefcase className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-display text-lg text-ivory">Recruitment Pipeline</h2>
              <p className="text-xs text-ivory/50">
                Candidate applications, candidate CV assessments, and interview statuses
              </p>
            </div>
          </div>
          <Link
            to="/admin/recruitment/applications"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-copper hover:underline transition-colors"
          >
            <span>Open Applicant Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-charcoal p-4 rounded-[6px] border border-copper/15">
            <div className="text-2xl font-display text-ivory">
              {careerStats.total}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ivory/50 mt-1">
              Total Applicants
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-blue-500/30">
            <div className="text-2xl font-display text-blue-500">
              {careerStats.new}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-blue-500/80 mt-1">
              New
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-amber-500/30">
            <div className="text-2xl font-display text-amber-500">
              {careerStats.reviewing}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-amber-500/80 mt-1">
              Under Review
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-emerald-500/30">
            <div className="text-2xl font-display text-emerald-500">
              {careerStats.shortlisted}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-emerald-500/80 mt-1">
              Shortlisted
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-purple-500/30">
            <div className="text-2xl font-display text-purple-500">
              {careerStats.interview}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-purple-500/80 mt-1">
              Interview
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-green-600/30">
            <div className="text-2xl font-display text-green-600">
              {careerStats.selected}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-green-600/80 mt-1">
              Selected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
