import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LOGO_URL } from "@/lib/site";

const nav = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/news", label: "News" },
  { to: "/blogs", label: "Blogs" },
  { to: "/resale", label: "Resale" },
  { to: "/career", label: "Career" },
  { to: "/about", label: "About & Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 25);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) document.body.classList.add("menu-open");
    else document.body.classList.remove("menu-open");
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <header
      data-testid="site-header"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      {/* Subtle top dark gradient to ensure high readability over light hero elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 inset-x-0 h-32 bg-gradient-to-b from-[#250306]/45 via-[#250306]/15 to-transparent transition-opacity duration-300"
      />

      {/* Floating Dark Maroon Glassmorphic Capsule */}
      <div className="pointer-events-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 lg:pt-3.5">
        <div
          className="relative max-w-[1440px] mx-auto transition-all duration-300 ease-out border"
          style={{
            backgroundColor: scrolled
              ? "rgba(50, 6, 10, 0.88)"
              : "rgba(60, 8, 13, 0.75)",
            backdropFilter: "blur(18px) saturate(140%)",
            WebkitBackdropFilter: "blur(18px) saturate(140%)",
            borderColor: "rgba(255, 255, 255, 0.10)",
            borderRadius: "10px",
            boxShadow: scrolled
              ? "0 14px 44px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
              : "0 10px 40px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Subtle Ambient Glow inside the glass navbar */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[10px] overflow-hidden"
            style={{
              background:
                "radial-gradient(circle at 18% 50%, rgba(110, 20, 25, 0.28), transparent 55%), radial-gradient(circle at 85% 50%, rgba(183, 123, 62, 0.08), transparent 45%)",
            }}
          />

          {/* ========================================================
              DESKTOP 3-COLUMN GRID: 240px LOGO | 1fr NAV | 220px CTA
              ======================================================== */}
          <div className="hidden xl:grid grid-cols-[240px_1fr_220px] items-center w-full h-[76px] px-6 xl:px-8 2xl:px-10 relative">
            
            {/* COL 1: Logo / Brand (Fixed 240px width) */}
            <div className="w-[240px] flex items-center shrink-0">
              <Link
                to="/"
                data-testid="logo-link"
                className="flex items-center gap-3 group"
              >
                <img
                  src={LOGO_URL}
                  alt="Astittva Marketing"
                  className="h-[44px] w-[44px] object-contain shrink-0 transition-transform duration-300 group-hover:scale-[1.02]"
                />
                
                {/* Subtle vertical separator */}
                <div className="h-7 w-px bg-white/15 shrink-0 mx-0.5" />

                {/* Editorial Brand Wordmark */}
                <div className="flex flex-col justify-center leading-[1.05]">
                  <span
                    className="font-serif-display text-[22px] tracking-[0.16em] text-[#FFFFFF] font-extrabold whitespace-nowrap"
                    style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.35)" }}
                  >
                    ASTITTVA
                  </span>
                  <span className="font-sans text-[10px] tracking-[0.42em] text-[#E8DCD5] font-medium mt-[2px] whitespace-nowrap">
                    MARKETING
                  </span>
                </div>
              </Link>
            </div>

            {/* COL 2: Centered Navigation Bar */}
            <nav className="flex items-center justify-center w-full min-w-0">
              <div className="flex items-center gap-[22px] 2xl:gap-[28px]">
                {nav.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/"}
                    data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={({ isActive }) =>
                      `group relative font-sans text-[12.5px] font-medium leading-none uppercase transition-colors duration-250 ease-out whitespace-nowrap px-[11px] py-[9px] rounded-[6px] border ${
                        isActive
                          ? "text-[#FFFFFF] bg-[rgba(255,255,255,0.07)] border-[rgba(255,255,255,0.20)] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                          : "text-[#E8DCD5] hover:text-[#FFFFFF] border-transparent"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <span className="relative flex items-center justify-center">
                        <span
                          className={
                            n.label === "About & Contact"
                              ? "tracking-[0.10em]"
                              : "tracking-[0.12em]"
                          }
                        >
                          {n.label}
                        </span>
                        {/* Thin champagne-gold underline for active item */}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-[3px] left-1 right-1 h-[2px] bg-[#C89A55] rounded-full"
                          />
                        )}
                        {/* Subtle gold underline on hover for non-active item */}
                        {!isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-[3px] left-0 right-0 h-[1.5px] bg-[#C89A55] opacity-0 group-hover:opacity-90 transition-opacity duration-250 ease-out rounded-full"
                          />
                        )}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* COL 3: Book Consultation CTA (Fixed 220px visual width, far right) */}
            <div className="w-[220px] flex items-center justify-end shrink-0">
              <Link
                to="/contact"
                data-testid="header-cta"
                className="group relative inline-flex items-center justify-center gap-2 w-[216px] h-[44px] font-sans text-[12px] font-semibold tracking-[0.08em] uppercase text-white rounded-[6px] transition-all duration-250 ease-out hover:-translate-y-px whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, #B77B3E 0%, #D2A15D 100%)",
                  boxShadow: "0 6px 20px rgba(185, 125, 62, 0.20)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #C28646 0%, #DDB06B 100%)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(185, 125, 62, 0.30)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #B77B3E 0%, #D2A15D 100%)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(185, 125, 62, 0.20)";
                }}
              >
                <span>Book Consultation</span>
                <ArrowRight
                  className="w-3.5 h-3.5 transition-transform duration-250 ease-out group-hover:translate-x-1 shrink-0"
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>

          {/* ========================================================
              TABLET & MOBILE BAR (< 1280px)
              ======================================================== */}
          <div className="flex xl:hidden items-center justify-between w-full h-[68px] sm:h-[72px] px-4 sm:px-6 relative">
            
            {/* Left: Astittva Logo */}
            <Link
              to="/"
              data-testid="logo-link-mobile"
              className="flex items-center gap-2.5 sm:gap-3 group"
            >
              <img
                src={LOGO_URL}
                alt="Astittva Marketing"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0 transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="h-7 sm:h-8 w-px bg-white/15 shrink-0 mx-0.5" />
              <div className="flex flex-col justify-center leading-[1.05]">
                <span
                  className="font-serif-display text-[20px] sm:text-[22px] tracking-[0.16em] text-[#FFFFFF] font-extrabold whitespace-nowrap"
                  style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.35)" }}
                >
                  ASTITTVA
                </span>
                <span className="font-sans text-[9px] sm:text-[9.5px] tracking-[0.42em] text-[#E8DCD5] font-medium mt-[2px] whitespace-nowrap">
                  MARKETING
                </span>
              </div>
            </Link>

            {/* Right: Mobile Menu Toggle Button (44px min touch target) */}
            <button
              data-testid="mobile-menu-toggle"
              className="text-white hover:text-[#C89A55] relative w-11 h-11 rounded-[6px] flex items-center justify-center transition-colors duration-200 hover:bg-white/[0.06] border border-transparent hover:border-white/10"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "x" : "menu"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="absolute text-white"
                >
                  {open ? (
                    <X className="w-5 h-5" strokeWidth={1.75} />
                  ) : (
                    <Menu className="w-5 h-5" strokeWidth={1.75} />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Full-Width Glass Menu Drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-glass-menu"
              initial={{ opacity: 0, y: -8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="xl:hidden max-w-[1440px] mx-auto mt-2 rounded-[10px] overflow-hidden border"
              style={{
                backgroundColor: "rgba(50, 6, 10, 0.94)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderColor: "rgba(255, 255, 255, 0.10)",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
              }}
            >
              <nav className="p-5 flex flex-col gap-2">
                {nav.map((n, i) => (
                  <motion.div
                    key={n.to}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i + 0.03, duration: 0.2 }}
                  >
                    <NavLink
                      to={n.to}
                      end={n.to === "/"}
                      data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-3.5 font-sans text-[14px] sm:text-[15px] font-medium leading-none uppercase rounded-[6px] transition-colors duration-200 min-h-[46px] ${
                          isActive
                            ? "text-[#FFFFFF] bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.20)] shadow-sm"
                            : "text-[#E8DCD5] hover:text-[#FFFFFF] hover:bg-white/[0.04] border border-transparent"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={
                              n.label === "About & Contact"
                                ? "tracking-[0.10em]"
                                : "tracking-[0.12em]"
                            }
                          >
                            {n.label}
                          </span>
                          {/* Active indicator dot */}
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C89A55] shadow-[0_0_6px_rgba(200,154,85,0.8)] opacity-100" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.2 }}
                  className="mt-4 pt-3 border-t border-white/[0.08]"
                >
                  <Link
                    to="/contact"
                    data-testid="mobile-header-cta"
                    className="group flex items-center justify-center gap-2 w-full h-[46px] px-6 font-sans text-[13px] font-semibold tracking-[0.08em] uppercase text-white rounded-[6px] transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #B77B3E 0%, #D2A15D 100%)",
                      boxShadow: "0 6px 20px rgba(185, 125, 62, 0.25)",
                    }}
                  >
                    <span>Book Consultation</span>
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </Link>
                </motion.div>

                <div className="mt-3 text-[9.5px] tracking-[0.28em] uppercase text-[#E8DCD5]/60 text-center">
                  Real Estate Consulting &amp; Marketing
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
