import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Building,
  CheckCircle2,
  Calendar,
  IndianRupee,
} from "lucide-react";
import Seo from "@/components/Seo";
import api from "@/lib/api";

const STATIC_FALLBACK_DEPARTMENTS = [
  "Sales & Advisory",
  "Marketing & Growth",
  "Operations & Client Success",
  "Legal & Advisory",
];

export default function JobsListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [employmentType, setEmploymentType] = useState("All");
  const [workplaceType, setWorkplaceType] = useState("All");

  // Facet options from backend
  const [availableDepartments, setAvailableDepartments] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchJobs() {
      try {
        setLoading(true);
        setError("");

        const params = {};
        if (search.trim()) params.search = search.trim();
        if (department !== "All") params.department = department;
        if (employmentType !== "All") params.type = employmentType;
        if (workplaceType !== "All") params.workplace = workplaceType;

        const res = await api.get("/jobs", { params });
        if (isMounted) {
          setJobs(res.data.jobs || []);
          if (res.data.departments && res.data.departments.length > 0) {
            setAvailableDepartments(res.data.departments);
          } else {
            setAvailableDepartments(STATIC_FALLBACK_DEPARTMENTS);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load jobs:", err);
          setError("Unable to load current career opportunities. Please try again shortly.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(fetchJobs, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, department, employmentType, workplaceType]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-28 pb-20">
      <Seo
        title="Job Openings & Vacancies in Kolkata | Astittva Marketing"
        description="Explore published job openings in luxury real estate advisory, digital sales, and property consulting at Astittva Marketing Kolkata."
        path="/careers/jobs"
        keywords="real estate jobs Kolkata, property consultant vacancies New Town, real estate careers Salt Lake, Astittva Marketing hiring"
      />

      {/* Hero Header */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-12 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B87333]/10 border border-[#B87333]/30 text-[#B87333] text-xs font-mono tracking-widest uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Our Advisory Practice</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-display text-[#1C1C1C] tracking-tight leading-[1.1] mb-5">
            Shape the Future of Luxury Real Estate in <span className="text-[#B87333]">Kolkata</span>
          </h1>

          <p className="text-[#4A4A4A] text-base sm:text-lg leading-relaxed mb-8 font-light max-w-2xl mx-auto">
            Astittva Marketing is curating Kolkata&apos;s foremost luxury real estate advisory team. Explore career opportunities and job openings across Private Client Advisory, Developer Representation, Market Intelligence, and Investment Advisory in New Town, Rajarhat, and South Kolkata.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#5F5F5F] font-medium">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B87333]" /> Premium Kolkata Portfolios
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B87333]" /> Performance Incentives
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B87333]" /> Fast-Track Leadership
            </span>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-10">
        <div className="bg-white rounded-xl border border-[#E8DED2] p-5 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B87333]/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by role, skill, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] placeholder:text-[#8C827A] focus:outline-none focus:border-[#B87333] transition-colors"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333] transition-colors"
              >
                <option value="All">All Departments</option>
                {availableDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                {!availableDepartments.includes("Sales & Advisory") && (
                  <option value="Sales & Advisory">Sales &amp; Advisory</option>
                )}
                {!availableDepartments.includes("Marketing & Growth") && (
                  <option value="Marketing & Growth">Marketing &amp; Growth</option>
                )}
                {!availableDepartments.includes("Operations & Client Success") && (
                  <option value="Operations & Client Success">Operations &amp; Client Success</option>
                )}
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333] transition-colors"
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
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8DED2] rounded-lg text-xs text-[#1C1C1C] focus:outline-none focus:border-[#B87333] transition-colors"
              >
                <option value="All">All Workplace Types</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Job Openings Listing Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E8DED2]">
          <h2 className="text-xl font-serif-display text-[#1C1C1C] font-semibold">
            Available Positions <span className="text-[#B87333] text-xs font-mono font-normal ml-2">({jobs.length} open)</span>
          </h2>
          <Link
            to="/career"
            className="text-xs text-[#B87333] hover:text-[#5E1F28] flex items-center gap-1 font-semibold uppercase tracking-[0.12em] transition-colors"
          >
            General Inquiry →
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#B87333] border-t-transparent mb-3" />
            <p className="text-xs uppercase tracking-widest text-[#B87333] font-mono">Loading Open Positions…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
            <p className="text-sm mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-xs"
            >
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-[#E8DED2] rounded-xl p-12 text-center max-w-2xl mx-auto shadow-xs">
            <Briefcase className="w-12 h-12 text-[#B87333]/40 mx-auto mb-4" />
            <h3 className="text-xl font-serif-display text-[#1C1C1C] mb-2 font-medium">No Matching Positions Found</h3>
            <p className="text-sm text-[#5F5F5F] mb-6 font-light leading-relaxed">
              We don&apos;t currently have an open position matching your exact filters, but we are always seeking ambitious real estate professionals across Kolkata.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearch("");
                  setDepartment("All");
                  setEmploymentType("All");
                  setWorkplaceType("All");
                }}
                className="btn-outline text-xs w-full sm:w-auto"
              >
                Reset Filters
              </button>
              <Link
                to="/career"
                className="btn-primary text-xs w-full sm:w-auto"
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
                className="bg-white rounded-xl border border-[#E8DED2] p-6 sm:p-7 flex flex-col justify-between shadow-xs transition-all group hover:border-[#B87333]"
              >
                <div>
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {job.isFeatured && (
                      <span className="px-2.5 py-1 rounded-[4px] text-[10px] font-mono tracking-wider uppercase bg-[#B87333]/15 border border-[#B87333]/30 text-[#B87333] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-[4px] text-[10px] font-mono tracking-wider uppercase bg-[#FAF8F5] border border-[#E8DED2] text-[#5F5F5F] font-medium">
                      {job.employmentType}
                    </span>
                    <span className="px-2.5 py-1 rounded-[4px] text-[10px] font-mono tracking-wider uppercase bg-[#FAF8F5] border border-[#E8DED2] text-[#5F5F5F] font-medium">
                      {job.workplaceType}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-serif-display font-medium text-[#1C1C1C] group-hover:text-[#B87333] transition-colors line-clamp-2 mb-3">
                    <Link to={`/careers/jobs/${job.slug}`}>{job.title}</Link>
                  </h3>

                  {/* Department & Location */}
                  <div className="space-y-2 mb-4 text-xs text-[#5F5F5F]">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#B87333] shrink-0" />
                      <span className="font-medium text-[#1C1C1C]">{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#B87333] shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-[#B87333] shrink-0" />
                      <span>
                        {job.experienceMinYears && job.experienceMaxYears
                          ? `${job.experienceMinYears} - ${job.experienceMaxYears} Years Exp.`
                          : job.experienceLevel || "Experienced"}
                      </span>
                    </div>
                    {job.salaryRange?.isDisclosed && job.salaryRange?.min > 0 && (
                      <div className="flex items-center gap-2 text-[#B87333] font-semibold">
                        <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          ₹{(job.salaryRange.min / 100000).toFixed(1)}L - ₹{(job.salaryRange.max / 100000).toFixed(1)}L PA
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description snippet */}
                  {job.description && (
                    <p className="text-xs text-[#5F5F5F] line-clamp-3 mb-5 leading-relaxed font-light">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Footer action */}
                <div className="pt-4 border-t border-[#E8DED2] flex items-center justify-between mt-auto">
                  <span className="text-[11px] text-[#8C827A] font-mono">
                    {job.postedAt ? new Date(job.postedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Active"}
                  </span>
                  <Link
                    to={`/careers/jobs/${job.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#B87333] group-hover:text-[#5E1F28] font-semibold tracking-wide uppercase transition-colors"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ===================== CAREER OVERVIEW & ADVISORY CULTURE ===================== */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-20 pt-16 border-t border-[#E8DED2]">
        <div className="max-w-4xl mx-auto">
          <div className="text-[10px] tracking-[0.35em] uppercase text-[#B87333] font-semibold mb-3">
            Real Estate Careers in Kolkata
          </div>
          <h2 className="font-serif-display text-2xl sm:text-4xl text-[#1C1C1C] mb-6 font-medium">
            Building a Career in Luxury Real Estate Advisory at Astittva
          </h2>

          <div className="space-y-6 text-[#4A4A4A] text-sm sm:text-base leading-relaxed font-light">
            <p>
              At Astittva Marketing, we are redefining property consulting across Eastern India. Our advisory practice operates on principles of institutional integrity, fiduciary responsibility, and discreet client management. Unlike traditional brokerage firms, our advisors build lifelong relationships with high-net-worth individuals, NRI investors, and leading corporate leadership across Kolkata, New Town, and Rajarhat.
            </p>

            <div>
              <h3 className="font-serif-display text-lg sm:text-xl text-[#1C1C1C] mb-2 font-semibold">
                Core Practice Areas &amp; Specialisations
              </h3>
              <p>
                Our team spans distinct functional desks: <strong>Private Client Advisory</strong> (representing buyers and investors for ultra-luxury residences and penthouses), <strong>Developer Representation</strong> (partnering with Kolkata&apos;s premier builders for mandate marketing and sales strategy), <strong>Market Research &amp; Intelligence</strong> (tracking macro infrastructure, metro expansions, and price per sq.ft. appreciation), and <strong>Secondary Market Advisory</strong> (curating verified resale properties with legal title scrutiny).
              </p>
            </div>

            <div>
              <h3 className="font-serif-display text-lg sm:text-xl text-[#1C1C1C] mb-2 font-semibold">
                Professional Growth, Mentorship &amp; Culture
              </h3>
              <p>
                We provide our advisory consultants with institutional-grade technology, verified inventory data, and continuous mentorship under senior real estate leaders. Team members enjoy structured career progression, competitive base compensation, transparent performance-linked commissions, and direct exposure to Kolkata&apos;s most prestigious architectural projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* General Talent Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-20">
        <div className="bg-white border border-[#E8DED2] rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-xs">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#B87333] block mb-2">
              GENERAL INQUIRIES
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif-display font-medium text-[#1C1C1C] mb-3">
              Don’t See the Exact Role You’re Looking For?
            </h2>
            <p className="text-sm sm:text-base text-[#5F5F5F] leading-relaxed mb-6 font-light">
              Astittva is always interested in connecting with high-caliber advisory consultants, digital marketing strategists, and client relationship managers across Kolkata.
            </p>
            <Link
              to="/career"
              className="btn-primary"
            >
              Submit General Career Application <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
