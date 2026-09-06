import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-close the mobile drawer on route change so tapping a link doesn't
  // leave the drawer covering the newly rendered page.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open on mobile so the background
  // page doesn't scroll under the fingers.
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

  const items = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/properties", label: "Properties", icon: Building2 },
    { to: "/admin/blogs", label: "Blogs", icon: BookOpen },
    { to: "/admin/leads", label: "Leads", icon: Inbox },
    ...(user?.role === "admin"
      ? [{ to: "/admin/users", label: "Users", icon: Users }]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-charcoal">
      {/* Mobile top bar — visible < lg. Sticky so admin can always reach the menu. */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-charcoal border-b border-copper/15">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={LOGO_URL}
            alt="Astittva"
            className="h-7 w-7 object-contain shrink-0"
          />
          <div className="text-ivory font-display tracking-[0.2em] text-[11px] truncate">
            ASTITTVA · <span className="text-copper">ADMIN</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          data-testid="admin-menu-btn"
          className="p-2 -mr-2 text-ivory/80 hover:text-copper"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile-only overlay while the drawer is open. Tap outside to dismiss. */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
        data-testid="admin-drawer-overlay"
      />

      {/*
        Single sidebar for both breakpoints. On <lg it's `fixed` and slides in from
        the left; on ≥lg it collapses back into the normal flex row. Only ONE copy of
        each nav item exists so there are no duplicated data-testids to trip E2E tests.
      */}
      <aside
        data-testid="admin-sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw]
          bg-charcoal border-r border-copper/15
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:w-64 lg:max-w-none lg:z-auto lg:bg-charcoal-2/30 lg:shrink-0
        `}
      >
        <div className="p-6 border-b border-copper/15 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={LOGO_URL}
              alt="Astittva"
              className="h-10 w-10 object-contain shrink-0"
            />
            <div className="leading-tight min-w-0">
              <div className="text-ivory font-display tracking-[0.25em] text-xs">
                ASTITTVA
              </div>
              <div className="text-copper text-[10px] tracking-[0.4em]">
                ADMIN
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            data-testid="admin-drawer-close"
            className="lg:hidden p-1.5 -mr-1 text-ivory/70 hover:text-copper"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              data-testid={`nav-admin-${it.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-xs tracking-[0.2em] uppercase transition ${
                  isActive
                    ? "bg-copper/10 text-copper border-l-2 border-copper"
                    : "text-ivory/65 hover:text-ivory hover:bg-charcoal-2/60"
                }`
              }
            >
              <it.icon className="w-4 h-4" strokeWidth={1.5} />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-copper/15">
          <div className="px-2 mb-3 min-w-0">
            <div className="text-ivory text-sm truncate">{user?.name}</div>
            <div className="text-copper text-[10px] tracking-[0.3em] uppercase">
              {user?.role}
            </div>
          </div>
          <button
            onClick={onLogout}
            data-testid="admin-logout"
            className="flex items-center gap-2 text-ivory/60 hover:text-copper text-xs tracking-[0.2em] uppercase px-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
