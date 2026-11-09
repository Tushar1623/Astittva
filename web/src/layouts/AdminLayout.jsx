import { useState, useEffect, useMemo } from "react";
import { NavLink, Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdminThemeProvider, useAdminTheme, AdminThemeToggle } from "@/context/AdminThemeContext";
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

function AdminLayoutContent() {
  const { user, logout } = useAuth();
  const { resolvedTheme } = useAdminTheme();
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
    if (p === "/admin/properties/new")
      return [{ label: "Properties", to: "/admin/properties" }, { label: "New Property" }];
    if (p.startsWith("/admin/properties/") && p.endsWith("/edit"))
      return [{ label: "Properties", to: "/admin/properties" }, { label: "Edit Property" }];
    if (p === "/admin/resale") return [{ label: "Secondary Market" }, { label: "Resale Inventory" }];
    if (p === "/admin/resale/new")
      return [{ label: "Resale", to: "/admin/resale" }, { label: "Add Resale" }];
    if (p.startsWith("/admin/resale/") && p.endsWith("/edit"))
      return [{ label: "Resale", to: "/admin/resale" }, { label: "Edit Resale" }];
    if (p === "/admin/blogs") return [{ label: "Editorial" }, { label: "Blogs & Articles" }];
    if (p === "/admin/blogs/new")
      return [{ label: "Blogs", to: "/admin/blogs" }, { label: "New Blog" }];
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
    <div
      data-testid="admin-layout"
      data-theme={resolvedTheme}
      className={`admin-console admin-theme-${resolvedTheme} min-h-screen flex flex-col lg:flex-row transition-colors duration-200`}
      style={{
        backgroundColor: "var(--admin-bg)",
        color: "var(--admin-text-primary)",
      }}
    >
      <Seo title="Admin Console | Astittva Marketing" noIndex={true} path={location.pathname} />

      {/* Mobile top bar — visible < lg */}
      <div
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b transition-colors"
        style={{
          backgroundColor: "var(--admin-header-bg)",
          borderColor: "var(--admin-border)",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={LOGO_URL}
            alt="Astittva"
            className="h-7 w-7 object-contain shrink-0"
          />
          <div className="font-cinzel tracking-[0.2em] text-[11px] truncate font-bold text-[var(--admin-text-primary)]">
            ASTITTVA · <span className="text-[var(--admin-accent)]">ADMIN</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AdminThemeToggle compact />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            data-testid="admin-menu-btn"
            className="p-2 -mr-1 text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] transition-colors"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Mobile-only overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ${
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
          border-r flex flex-col transition-all duration-300 ease-out
          ${drawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:w-64 lg:max-w-none lg:z-auto lg:shrink-0
        `}
        style={{
          backgroundColor: "var(--admin-sidebar-bg)",
          borderColor: "var(--admin-border)",
        }}
      >
        {/* Brand Header in Sidebar */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[var(--admin-surface-2)] border border-[var(--admin-border)] p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src={LOGO_URL}
                alt="Astittva"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-tight min-w-0">
              <div className="font-cinzel tracking-[0.2em] text-xs font-bold text-[var(--admin-text-primary)]">
                ASTITTVA
              </div>
              <div className="text-[var(--admin-accent)] text-[9.5px] tracking-[0.3em] uppercase font-semibold mt-0.5">
                ADMIN CONSOLE
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            data-testid="admin-drawer-close"
            className="lg:hidden p-1.5 -mr-1 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 p-3.5 space-y-4 overflow-y-auto">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {sec.title && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.22em] uppercase text-[var(--admin-text-muted)]">
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
                    `flex items-center gap-3 px-3.5 py-2.5 text-xs tracking-[0.12em] uppercase rounded-md transition-all duration-150 ${
                      isActive
                        ? "bg-[var(--admin-surface-2)] text-[var(--admin-accent)] border-l-3 border-[var(--admin-accent)] font-semibold shadow-xs"
                        : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-hover)]"
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

        {/* Sidebar Footer User Info & Actions */}
        <div
          className="p-4 border-t transition-colors"
          style={{
            borderColor: "var(--admin-border)",
            backgroundColor: "var(--admin-surface-2)",
          }}
        >
          <div className="px-2 mb-3 min-w-0 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate text-[var(--admin-text-primary)]">
                {user?.name || "Admin"}
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[var(--admin-accent)] font-medium">
                {user?.role || "Staff"}
              </div>
            </div>
            <span
              className="w-2 h-2 rounded-full bg-[var(--admin-success)] shadow-xs"
              title="Session Active"
            />
          </div>

          <div className="pt-2 border-t border-[var(--admin-border-subtle)] space-y-1">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs tracking-[0.12em] uppercase px-2 py-1.5 rounded-md text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-hover)] transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Website</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
            </Link>
            <button
              onClick={onLogout}
              data-testid="admin-logout"
              className="w-full flex items-center gap-2 text-xs tracking-[0.12em] uppercase px-2 py-1.5 rounded-md text-[var(--admin-error)] hover:bg-[var(--admin-error-bg)] transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className="flex-1 min-w-0 flex flex-col transition-colors"
        style={{ backgroundColor: "var(--admin-bg)" }}
      >
        {/* Desktop Top Header Bar (≥ lg) */}
        <header
          className="hidden lg:flex items-center justify-between px-8 h-14 border-b sticky top-0 z-30 transition-colors backdrop-blur-md"
          style={{
            backgroundColor: "var(--admin-header-bg)",
            borderColor: "var(--admin-border)",
          }}
        >
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs">
            {breadcrumb.map((bc, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--admin-text-muted)] opacity-50" />}
                {bc.to ? (
                  <Link
                    to={bc.to}
                    className="text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] uppercase tracking-wider text-[11px] transition-colors"
                  >
                    {bc.label}
                  </Link>
                ) : (
                  <span
                    className={`uppercase tracking-wider text-[11px] ${
                      idx === breadcrumb.length - 1
                        ? "text-[var(--admin-text-primary)] font-semibold"
                        : "text-[var(--admin-text-muted)]"
                    }`}
                  >
                    {bc.label}
                  </span>
                )}
              </span>
            ))}
          </nav>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Selector (Light / Dark / System) */}
            <AdminThemeToggle />

            <div className="h-4 w-px bg-[var(--admin-border)]" />

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] transition-colors px-2.5 py-1 rounded-md border border-[var(--admin-border)] hover:border-[var(--admin-accent)] bg-[var(--admin-surface)]"
            >
              <Globe className="w-3 h-3 text-[var(--admin-accent)]" />
              <span>astittva.in</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-50" />
            </Link>

            <div className="h-4 w-px bg-[var(--admin-border)]" />

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[var(--admin-surface-2)] border border-[var(--admin-accent)] flex items-center justify-center text-[var(--admin-accent)] text-xs font-semibold shadow-2xs">
                {(user?.name || "A")[0].toUpperCase()}
              </div>
              <div className="text-left leading-tight hidden xl:block">
                <div className="text-xs font-semibold text-[var(--admin-text-primary)]">
                  {user?.name || "Administrator"}
                </div>
                <div className="text-[10px] text-[var(--admin-accent)] tracking-wider uppercase font-mono">
                  {user?.role || "admin"}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-[var(--admin-text-secondary)] hover:text-[var(--admin-error)] hover:bg-[var(--admin-error-bg)] rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ color: "var(--admin-text-primary)" }}
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent />
    </AdminThemeProvider>
  );
}
