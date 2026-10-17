import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Building,
  CheckCircle2,
  Calendar,
  IndianRupee,
} from "lucide-react";
import Seo from "@/components/Seo";
import { buildBreadcrumbSchema } from "@/lib/seoConfig";
import api, { formatApiErrorDetail } from "@/lib/api";

export default function JobsListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [employmentType, setEmploymentType] = useState("All");
  const [workplaceType, setWorkplaceType] = useState("All");

  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableEmploymentTypes, setAvailableEmploymentTypes] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadJobs() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/jobs", {
          params: {
            search: search.trim() || undefined,
            department: department !== "All" ? department : undefined,
            employmentType: employmentType !== "All" ? employmentType : undefined,
            workplaceType: workplaceType !== "All" ? workplaceType : undefined,
          },
        });
        if (isMounted) {
          setJobs(res.data.jobs || []);
          if (res.data.departments?.length) setAvailableDepartments(res.data.departments);
          if (res.data.employmentTypes?.length) setAvailableEmploymentTypes(res.data.employmentTypes);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load jobs:", err);
          setError(formatApiErrorDetail(err.response?.data?.detail));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(loadJobs, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, department, employmentType, workplaceType]);

  const breadcrumbs = useMemo(
    () => [
      { name: "Home", url: "https://astittva.in/" },
      { name: "Careers", url: "https://astittva.in/career" },
      { name: "Job Openings", url: "https://astittva.in/careers/jobs" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-charcoal text-ivory pt-24 pb-20">
      <Seo
        title="Job Openings & Career Opportunities in Kolkata | Astittva Marketing"
        description="Explore active vacancies at Astittva Marketing. Join Kolkata's premier luxury real estate advisory team in New Town, Rajarhat, and Salt Lake. Competitive packages, mentorship, and high-impact advisory roles."
        canonical="https://astittva.in/careers/jobs"
        jsonLd={[buildBreadcrumbSchema(breadcrumbs)]}
      />

      {/* Hero Header */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper/10 border border-copper/30 text-copper text-xs font-mono tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Our Advisory Practice</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-ivory tracking-tight mb-4">
            Shape the Future of Luxury Real Estate in <span className="text-copper">Kolkata</span>
          </h1>

          <p className="text-ivory/70 text-base sm:text-lg leading-relaxed mb-6 font-sans">
            We are curating Kolkata’s most trusted real estate advisory team. Explore published openings across Private Client Advisory, Digital Growth, and Strategic Investments in New Town & Salt Lake.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-ivory/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-copper" /> Premium Kolkata Portfolios
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-copper" /> Performance Incentives
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-copper" /> Fast-Track Leadership
            </span>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-10">
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-copper/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by role, skill, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-copper transition-colors"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper transition-colors"
              >
                <option value="All">All Departments</option>
                {availableDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                {!availableDepartments.includes("Sales & Advisory") && (
                  <option value="Sales & Advisory">Sales & Advisory</option>
                )}
                {!availableDepartments.includes("Marketing & Growth") && (
                  <option value="Marketing & Growth">Marketing & Growth</option>
                )}
                {!availableDepartments.includes("Operations & Client Success") && (
                  <option value="Operations & Client Success">Operations & Client Success</option>
                )}
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper transition-colors"
              >
                <option value="All">All Employment Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Workplace Type */}
            <div>
              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper transition-colors"
              >
                <option value="All">All Workplace Types</option>
                <option value="On-site">On-site (Kolkata)</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Job Openings Listing Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display text-ivory">
            Available Positions <span className="text-copper text-sm font-sans font-normal ml-2">({jobs.length} open)</span>
          </h2>
          <Link
            to="/career"
            className="text-xs text-copper hover:text-copper/80 flex items-center gap-1 font-sans transition-colors"
          >
            General Application <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-copper border-t-transparent mb-3" />
            <p className="text-xs uppercase tracking-widest text-copper/60 font-mono">Loading Open Positions…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-950/20 border border-red-500/30 rounded-xl text-red-200">
            <p className="text-sm mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-1.5 text-xs bg-red-900/40 hover:bg-red-900/60 rounded border border-red-500/40"
            >
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-[#181818] border border-copper/20 rounded-xl p-12 text-center max-w-2xl mx-auto">
            <Briefcase className="w-12 h-12 text-copper/40 mx-auto mb-4" />
            <h3 className="text-lg font-display text-ivory mb-2">No Matching Positions Found</h3>
            <p className="text-sm text-ivory/60 mb-6 font-sans">
              We don’t currently have an open position matching your exact filters, but we are always seeking ambitious real estate professionals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearch("");
                  setDepartment("All");
                  setEmploymentType("All");
                  setWorkplaceType("All");
                }}
                className="px-4 py-2 text-xs uppercase tracking-wider text-ivory border border-copper/40 rounded-lg hover:bg-copper/10 transition-colors w-full sm:w-auto"
              >
                Reset Filters
              </button>
              <Link
                to="/career"
                className="px-5 py-2 text-xs uppercase tracking-wider text-charcoal font-semibold bg-copper hover:bg-copper/90 rounded-lg transition-colors w-full sm:w-auto"
              >
                Submit General Application
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-[#181818] border border-copper/20 hover:border-copper/60 rounded-xl p-6 flex flex-col justify-between shadow-lg hover:shadow-copper/5 transition-all group"
              >
                <div>
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {job.isFeatured && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-copper/20 border border-copper/40 text-copper font-medium flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-ivory/70">
                      {job.employmentType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-ivory/70">
                      {job.workplaceType}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-display font-medium text-ivory group-hover:text-copper transition-colors line-clamp-2 mb-2">
                    <Link to={`/careers/jobs/${job.slug}`}>{job.title}</Link>
                  </h3>

                  {/* Department & Location */}
                  <div className="space-y-1.5 mb-4 text-xs text-ivory/70">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-copper/70 shrink-0" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-copper/70 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-copper/70 shrink-0" />
                      <span>
                        {job.experienceMinYears && job.experienceMaxYears
                          ? `${job.experienceMinYears} - ${job.experienceMaxYears} Years Exp.`
                          : job.experienceLevel || "Experienced"}
                      </span>
                    </div>
                    {job.salaryRange?.isDisclosed && job.salaryRange?.min > 0 && (
                      <div className="flex items-center gap-2 text-copper font-medium">
                        <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          ₹{(job.salaryRange.min / 100000).toFixed(1)}L - ₹{(job.salaryRange.max / 100000).toFixed(1)}L PA
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description snippet */}
                  {job.description && (
                    <p className="text-xs text-ivory/60 line-clamp-3 mb-4 leading-relaxed font-sans">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Footer action */}
                <div className="pt-4 border-t border-copper/15 flex items-center justify-between mt-auto">
                  <span className="text-[11px] text-ivory/40 font-mono">
                    {job.postedAt ? new Date(job.postedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Active"}
                  </span>
                  <Link
                    to={`/careers/jobs/${job.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-copper group-hover:text-copper/90 font-medium tracking-wide uppercase font-mono transition-colors"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* General Talent Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#240A10] via-[#1A1A1A] to-[#121212] border border-copper/30 p-8 sm:p-12">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-copper font-mono font-medium">
              General Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl font-display text-ivory mt-2 mb-3">
              Don’t See the Exact Role You’re Looking For?
            </h2>
            <p className="text-sm text-ivory/70 leading-relaxed mb-6 font-sans">
              Astittva is always interested in connecting with high-caliber advisory consultants, digital marketing strategists, and client relationship managers across Kolkata.
            </p>
            <Link
              to="/career"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-copper hover:bg-copper/90 text-charcoal font-semibold text-xs tracking-wider uppercase transition-colors shadow-lg"
            >
              Submit General Career Application <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
