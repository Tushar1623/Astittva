import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { 
  Building2, Inbox, Users, CheckCircle2, 
  Briefcase, ArrowRight, UserCheck, CalendarCheck, PhoneCall, Award 
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
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
    <div data-testid="admin-dashboard" className="space-y-12">
      {/* Top Header */}
      <div>
        <div className="overline mb-2 text-copper">ADMIN CONSOLE</div>
        <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory mb-2">
          Dashboard Overview
        </h1>
        <p className="text-ivory/55 font-light text-sm">
          Real-time metrics for properties, client enquiries, and talent recruitment.
        </p>
      </div>

      {/* Primary Estate & Platform Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-copper/15 border border-copper/20 rounded-[6px] overflow-hidden">
        <div className="bg-charcoal p-6">
          <Building2 className="w-5 h-5 text-copper mb-4" strokeWidth={1.5} />
          <div className="text-3xl font-display font-light text-ivory">
            {stats?.properties_total ?? "—"}
          </div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 mt-2">
            Total Properties
          </div>
        </div>

        <div className="bg-charcoal p-6">
          <CheckCircle2 className="w-5 h-5 text-[#2E7D32] mb-4" strokeWidth={1.5} />
          <div className="text-3xl font-display font-light text-ivory">
            {stats?.properties_published ?? "—"}
          </div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 mt-2">
            Published Live
          </div>
        </div>

        <div className="bg-charcoal p-6">
          <Users className="w-5 h-5 text-[#C89A55] mb-4" strokeWidth={1.5} />
          <div className="text-3xl font-display font-light text-ivory">
            {stats?.users_total ?? "—"}
          </div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-ivory/50 mt-2">
            Team Accounts
          </div>
        </div>
      </div>

      {/* SECTION 1: PROPERTY LEADS */}
      <div className="bg-charcoal-2/30 border border-copper/20 rounded-[8px] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-copper/15 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#C89A55]/15 border border-[#C89A55]/30 flex items-center justify-center text-[#C89A55]">
              <Inbox className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-display text-xl text-ivory">Property Leads</h2>
              <p className="text-xs text-ivory/50">
                Inquiries, consultations, site visits, and purchase interests
              </p>
            </div>
          </div>
          <Link
            to="/admin/leads/property"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-copper hover:text-white transition-colors"
          >
            <span>Manage Property Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-charcoal p-4 rounded-[6px] border border-copper/10">
            <div className="text-2xl sm:text-3xl font-display text-ivory">
              {propStats.total}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ivory/50 mt-1">
              Total Property Leads
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-[#C89A55]/20">
            <div className="text-2xl sm:text-3xl font-display text-[#E6BF80]">
              {propStats.new}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-[#E6BF80]/80 mt-1">
              New Uncontacted
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-copper/10">
            <div className="text-2xl sm:text-3xl font-display text-ivory">
              {propStats.contacted}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ivory/50 mt-1">
              Contacted
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-copper/10">
            <div className="text-2xl sm:text-3xl font-display text-ivory">
              {propStats.site_visit}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ivory/50 mt-1">
              Site Visits
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-[#2E7D32]/30">
            <div className="text-2xl sm:text-3xl font-display text-[#4CAF50]">
              {propStats.converted}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-[#4CAF50]/80 mt-1">
              Converted
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CAREER APPLICATIONS */}
      <div className="bg-charcoal-2/30 border border-copper/20 rounded-[8px] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-copper/15 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#B77B3E]/15 border border-[#B77B3E]/30 flex items-center justify-center text-[#B77B3E]">
              <Briefcase className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-display text-xl text-ivory">Career Applications</h2>
              <p className="text-xs text-ivory/50">
                Talent acquisitions, job applicants, candidate resumes, and interviews
              </p>
            </div>
          </div>
          <Link
            to="/admin/leads/careers"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-copper hover:text-white transition-colors"
          >
            <span>Manage Career Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-charcoal p-4 rounded-[6px] border border-copper/10">
            <div className="text-2xl sm:text-3xl font-display text-ivory">
              {careerStats.total}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ivory/50 mt-1">
              Total Applications
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-[#C89A55]/20">
            <div className="text-2xl sm:text-3xl font-display text-[#E6BF80]">
              {careerStats.new}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-[#E6BF80]/80 mt-1">
              New
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-copper/10">
            <div className="text-2xl sm:text-3xl font-display text-ivory">
              {careerStats.reviewing}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ivory/50 mt-1">
              Reviewing
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-copper/10">
            <div className="text-2xl sm:text-3xl font-display text-ivory">
              {careerStats.shortlisted}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ivory/50 mt-1">
              Shortlisted
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-copper/10">
            <div className="text-2xl sm:text-3xl font-display text-ivory">
              {careerStats.interview}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-ivory/50 mt-1">
              Interview
            </div>
          </div>

          <div className="bg-charcoal p-4 rounded-[6px] border border-[#2E7D32]/30">
            <div className="text-2xl sm:text-3xl font-display text-[#4CAF50]">
              {careerStats.selected}
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-[#4CAF50]/80 mt-1">
              Selected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
