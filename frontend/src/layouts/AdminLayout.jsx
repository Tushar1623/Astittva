import { useState, useEffect, useMemo } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LOGO_URL } from "@/lib/site";
import {
  LayoutDashboard,
  Building2,
  Users,
  Inbox,
  LogOut,
  BookOpen,
  Menu,
  X,
  Globe,
  Briefcase,
  Repeat,
  BadgePercent,
  ExternalLink,
  ChevronRight,
  Shield,
  User,
} from "lucide-react";
import Seo from "@/components/Seo";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-close the mobile drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open on mobile
  useEffect(() => {
    if (!drawerOpen) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const onLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const navSections = [
    {
      items: [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
        { to: "/admin/properties", label: "Properties", icon: Building2 },
        { to: "/admin/resale", label: "Resale", icon: Repeat },
        { to: "/admin/blogs", label: "Blogs", icon: BookOpen },
      ],
    },
    {
      title: "LEADS",
      items: [
        { to: "/admin/leads/property", label: "Property Leads", icon: Inbox },
        { to: "/admin/leads/resale", label: "Resale Leads", icon: BadgePercent },
        { to: "/admin/leads/careers", label: "Career Applications", icon: Briefcase },
      ],
    },
    {
      title: "RECRUITMENT",
      items: [
        { to: "/admin/recruitment", label: "Overview", icon: LayoutDashboard, end: true },
        { to: "/admin/recruitment/jobs", label: "Job Openings", icon: Briefcase },
        { to: "/admin/recruitment/applications", label: "Candidate Pipeline", icon: Users },
      ],
    },
    ...(user?.role === "admin"
      ? [
          {
            title: "SYSTEM",
            items: [{ to: "/admin/users", label: "Users", icon: Users }],
          },
        ]
      : []),
  ];

  // Dynamic breadcrumb items based on current path
  const breadcrumb = useMemo(() => {
    const p = location.pathname.replace(/\/$/, "");
    if (p === "/admin") return [{ label: "Console" }, { label: "Dashboard" }];
    if (p === "/admin/properties") return [{ label: "Inventory" }, { label: "Properties" }];
    if (p === "/admin/properties/new") return [{ label: "Properties", to: "/admin/properties" }, { label: "New Property" }];
    if (p.startsWith("/admin/properties/") && p.endsWith("/edit"))
      return [{ label: "Properties", to: "/admin/properties" }, { label: "Edit Property" }];
    if (p === "/admin/resale") return [{ label: "Secondary Market" }, { label: "Resale Inventory" }];
    if (p === "/admin/resale/new") return [{ label: "Resale", to: "/admin/resale" }, { label: "Add Resale" }];
    if (p.startsWith("/admin/resale/") && p.endsWith("/edit"))
      return [{ label: "Resale", to: "/admin/resale" }, { label: "Edit Resale" }];
    if (p === "/admin/blogs") return [{ label: "Editorial" }, { label: "Blogs & Articles" }];
    if (p === "/admin/blogs/new") return [{ label: "Blogs", to: "/admin/blogs" }, { label: "New Blog" }];
    if (p.startsWith("/admin/blogs/") && p.endsWith("/edit"))
      return [{ label: "Blogs", to: "/admin/blogs" }, { label: "Edit Blog" }];
    if (p === "/admin/leads/property") return [{ label: "Leads" }, { label: "Property Inquiries" }];
    if (p === "/admin/leads/resale") return [{ label: "Leads" }, { label: "Resale Inquiries" }];
    if (p === "/admin/leads/careers") return [{ label: "Leads" }, { label: "Career Applications" }];
    if (p === "/admin/recruitment") return [{ label: "Recruitment" }, { label: "Overview" }];
    if (p === "/admin/recruitment/jobs") return [{ label: "Recruitment" }, { label: "Job Openings" }];
    if (p === "/admin/recruitment/jobs/new")
      return [{ label: "Job Openings", to: "/admin/recruitment/jobs" }, { label: "New Vacancy" }];
    if (p.startsWith("/admin/recruitment/jobs/") && p.endsWith("/edit"))
      return [{ label: "Job Openings", to: "/admin/recruitment/jobs" }, { label: "Edit Vacancy" }];
    if (p === "/admin/recruitment/applications")
      return [{ label: "Recruitment" }, { label: "Candidate Pipeline" }];
    if (p === "/admin/users") return [{ label: "System" }, { label: "Staff & RBAC" }];
    return [{ label: "Console" }, { label: "Admin" }];
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0E0305] text-[#FAF8F5]">
      <Seo title="Admin Console | Astittva Marketing" noIndex={true} path={location.pathname} />

      {/* Mobile top bar — visible < lg */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-[#160408] border-b border-[#D4A359]/20">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={LOGO_URL}
            alt="Astittva"
            className="h-7 w-7 object-contain shrink-0"
          />
          <div className="text-white font-cinzel tracking-[0.2em] text-[11px] truncate">
            ASTITTVA · <span className="text-[#D4A359]">ADMIN</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          data-testid="admin-menu-btn"
          className="p-2 -mr-2 text-white/80 hover:text-[#D4A359]"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile-only overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
        data-testid="admin-drawer-overlay"
      />

      {/* Sidebar (Responsive drawer on mobile, static on desktop) */}
      <aside
        data-testid="admin-sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw]
          bg-[#160408] border-r border-[#D4A359]/20
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:w-64 lg:max-w-none lg:z-auto lg:shrink-0
        `}
      >
        <div className="p-5 border-b border-[#D4A359]/20 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-[8px] bg-[#3D060E] border border-[#D4A359]/35 p-1 flex items-center justify-center shrink-0">
              <img
                src={LOGO_URL}
                alt="Astittva"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-white font-cinzel tracking-[0.22em] text-xs font-bold">
                ASTITTVA
              </div>
              <div className="text-[#D4A359] text-[9.5px] tracking-[0.35em] uppercase font-semibold mt-0.5">
                ADMIN CONSOLE
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            data-testid="admin-drawer-close"
            className="lg:hidden p-1.5 -mr-1 text-white/70 hover:text-[#D4A359]"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 p-3.5 space-y-4 overflow-y-auto">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {sec.title && (
                <div className="px-3 pt-2 pb-1 text-[9.5px] font-semibold tracking-[0.25em] text-[#D4A359]/90 uppercase">
                  {sec.title}
                </div>
              )}
              {sec.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  data-testid={`nav-admin-${it.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 text-xs tracking-[0.14em] uppercase rounded-[6px] transition-all duration-200 ${
                      isActive
                        ? "bg-[#D4A359]/15 text-[#D4A359] border-l-2 border-[#D4A359] font-semibold shadow-xs"
                        : "text-[#E8DCD5]/75 hover:text-white hover:bg-white/[0.05]"
                    }`
                  }
                >
                  <it.icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{it.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#D4A359]/20 bg-[#120306]">
          <div className="px-2 mb-3 min-w-0 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{user?.name || "Admin"}</div>
              <div className="text-[#D4A359] text-[10px] tracking-[0.25em] uppercase">
                {user?.role || "Staff"}
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          </div>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/70 hover:text-[#D4A359] text-xs tracking-[0.15em] uppercase px-2 py-1.5 rounded hover:bg-white/5 transition mb-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Website</span>
            <ExternalLink className="w-2.5 h-2.5 ml-auto text-white/40" />
          </Link>
          <button
            onClick={onLogout}
            data-testid="admin-logout"
            className="w-full flex items-center gap-2 text-white/70 hover:text-rose-400 text-xs tracking-[0.15em] uppercase px-2 py-1.5 transition rounded hover:bg-rose-500/10 text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Desktop Shell Header */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#0E0305]">
        {/* Desktop Top Header Bar (≥ lg) */}
        <header className="hidden lg:flex items-center justify-between px-8 h-14 border-b border-[#D4A359]/20 bg-[#160408]/90 backdrop-blur-md sticky top-0 z-30">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            {breadcrumb.map((bc, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="w-3 h-3 text-white/30" />}
                {bc.to ? (
                  <Link
                    to={bc.to}
                    className="text-white/60 hover:text-[#D4A359] uppercase tracking-wider text-[11px] transition-colors"
                  >
                    {bc.label}
                  </Link>
                ) : (
                  <span
                    className={`uppercase tracking-wider text-[11px] ${
                      idx === breadcrumb.length - 1
                        ? "text-white font-medium"
                        : "text-white/40"
                    }`}
                  >
                    {bc.label}
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 hover:text-[#D4A359] transition-colors px-2.5 py-1 rounded border border-[#D4A359]/25 hover:border-[#D4A359]/60"
            >
              <Globe className="w-3 h-3 text-[#D4A359]" />
              <span>astittva.in</span>
              <ExternalLink className="w-2.5 h-2.5 text-white/40" />
            </Link>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#D4A359]/20 border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359] text-xs font-semibold">
                {(user?.name || "A")[0].toUpperCase()}
              </div>
              <div className="text-left leading-tight hidden xl:block">
                <div className="text-xs text-white font-medium">{user?.name || "Administrator"}</div>
                <div className="text-[10px] text-[#D4A359] tracking-wider uppercase font-mono">
                  {user?.role || "admin"}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-white/50 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full text-white">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
