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
          className="relative max-w-[1440px] mx-auto transition-all duration-300 ease-out rounded-[10px] lg:rounded-[12px] border"
          style={{
            // Dark luxury maroon glass with fallback
            backgroundColor: scrolled
              ? "rgba(50, 5, 9, 0.88)"
              : "rgba(55, 5, 10, 0.72)",
            backdropFilter: scrolled
              ? "blur(22px) saturate(140%)"
              : "blur(18px) saturate(140%)",
            WebkitBackdropFilter: scrolled
              ? "blur(22px) saturate(140%)"
              : "blur(18px) saturate(140%)",
            borderColor: "rgba(255, 255, 255, 0.10)",
            boxShadow: scrolled
              ? "0 14px 44px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
              : "0 10px 40px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Maroon Ambient Glow inside the glass navbar */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[10px] lg:rounded-[12px] overflow-hidden"
            style={{
              background:
                "radial-gradient(circle at 18% 50%, rgba(110, 20, 25, 0.32), transparent 55%), radial-gradient(circle at 85% 50%, rgba(183, 123, 62, 0.08), transparent 45%)",
            }}
          />

          {/* Subtle architectural right-side lines for depth */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-[300px] lg:w-[420px] overflow-hidden opacity-[0.035] mix-blend-screen"
          >
            <svg
              viewBox="0 0 420 78"
              fill="none"
              preserveAspectRatio="none"
              className="w-full h-full text-[#C89A55]"
            >
              <line x1="70" y1="0" x2="148" y2="78" stroke="currentColor" strokeWidth="0.75" />
              <line x1="140" y1="0" x2="218" y2="78" stroke="currentColor" strokeWidth="0.75" />
              <line x1="210" y1="0" x2="288" y2="78" stroke="currentColor" strokeWidth="0.75" />
              <line x1="280" y1="0" x2="358" y2="78" stroke="currentColor" strokeWidth="0.75" />
              <line x1="350" y1="0" x2="428" y2="78" stroke="currentColor" strokeWidth="0.75" />
              <line x1="0" y1="26" x2="420" y2="26" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 6" />
              <line x1="0" y1="52" x2="420" y2="52" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 6" />
            </svg>
          </div>

          {/* Navigation Bar Content (72–80px Height) */}
          <div className="relative px-3 sm:px-6 lg:px-6 xl:px-8 2xl:px-10 h-[68px] sm:h-[74px] lg:h-[78px] flex items-center justify-between gap-3 lg:gap-4">

            {/* LEFT: Logo + Wordmark Lockup */}
            <div className="flex items-center shrink-0">
              <Link
                to="/"
                data-testid="logo-link"
                className="flex items-center gap-2.5 sm:gap-3.5 group"
              >
                <img
                  src={LOGO_URL}
                  alt="Astittva Marketing"
                  className="h-10 w-10 sm:h-11 sm:w-11 lg:h-[48px] lg:w-[48px] object-contain shrink-0 transition-transform duration-300 group-hover:scale-[1.02]"
                />

                {/* Subtle vertical separator */}
                <div className="h-7 sm:h-8 w-px bg-white/15 shrink-0 mx-0.5 sm:mx-1" />

                {/* Editorial Brand Wordmark */}
                <div className="flex flex-col justify-center leading-[1.05]">
                  <span
                    className="font-serif-display text-[20px] sm:text-[23px] lg:text-[24px] xl:text-[25px] tracking-[0.16em] sm:tracking-[0.18em] text-[#FFFFFF] font-extrabold whitespace-nowrap"
                    style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.35)" }}
                  >
                    ASTITTVA
                  </span>
                  <span className="font-sans text-[9px] sm:text-[10px] lg:text-[10.5px] tracking-[0.42em] text-[#E8DCD5] font-medium mt-[2px] sm:mt-[3px] whitespace-nowrap">
                    MARKETING
                  </span>
                </div>
              </Link>
            </div>

            {/* CENTER: Navigation Links (Refined Quiet Luxury Typography) */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-2 xl:px-4 2xl:px-6 min-w-0">
              <div className="flex items-center gap-[18px] lg:gap-[22px] xl:gap-[28px] 2xl:gap-[32px]">
                {nav.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/"}
                    data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={({ isActive }) =>
                      `group relative font-sans text-[12px] xl:text-[12.5px] 2xl:text-[13px] font-medium leading-none uppercase transition-colors duration-250 ease-out whitespace-nowrap ${isActive
                        ? "text-[#FFFFFF] bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.18)] rounded-[6px] px-[13px] py-[9px]"
                        : "text-[#F1E7E0] hover:text-[#FFFFFF] px-[8px] py-[9px] border border-transparent"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <span className="relative flex items-center justify-center">
                        <span
                          className={
                            n.label === "About & Contact"
                              ? "tracking-[0.10em] xl:tracking-[0.11em]"
                              : "tracking-[0.12em]"
                          }
                        >
                          {n.label}
                        </span>
                        {/* Thin champagne-gold underline for active item (~2px) */}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-[3px] left-1.5 right-1.5 h-[2px] bg-[#C89A55] rounded-full"
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

            {/* RIGHT: Champagne Gold Consultation CTA (Visually stronger than navigation) */}
            <div className="hidden lg:flex items-center justify-end shrink-0">
              <Link
                to="/contact"
                data-testid="header-cta"
                className="group relative inline-flex items-center justify-center gap-2 h-[42px] lg:h-[44px] px-5 lg:px-6 font-sans text-[12px] xl:text-[12.5px] font-semibold tracking-[0.07em] uppercase text-white rounded-[6px] transition-all duration-250 ease-out hover:-translate-y-px whitespace-nowrap"
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

            {/* Mobile Menu Toggle Button (44px min touch target) */}
            <button
              data-testid="mobile-menu-toggle"
              className="lg:hidden text-white hover:text-[#C89A55] relative w-11 h-11 rounded-[6px] flex items-center justify-center transition-colors duration-200 hover:bg-white/[0.06] border border-transparent hover:border-white/10"
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
              className="lg:hidden max-w-[1440px] mx-auto mt-2 rounded-[10px] overflow-hidden border"
              style={{
                backgroundColor: "rgba(50, 5, 9, 0.92)",
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
                        `flex items-center justify-between px-4 py-3.5 font-sans text-[14px] sm:text-[14.5px] font-medium leading-none uppercase rounded-[6px] transition-colors duration-200 min-h-[46px] ${isActive
                          ? "text-[#FFFFFF] bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.18)]"
                          : "text-[#F1E7E0] hover:text-[#FFFFFF] hover:bg-white/[0.04] border border-transparent"
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
