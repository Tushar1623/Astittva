import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
    const onScroll = () => setScrolled(window.scrollY > 20);
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
      {/* Floating Dark Maroon Bar */}
      <div className="pointer-events-auto px-2.5 sm:px-4 lg:px-6 xl:px-8 pt-2.5 sm:pt-3">
        <div
          className="relative max-w-[1440px] mx-auto rounded-[8px] lg:rounded-[10px] border border-white/10 transition-all duration-300"
          style={{
            background: "linear-gradient(90deg, #470811 0%, #530E17 35%, #59101C 65%, #470811 100%)",
            boxShadow: scrolled
              ? "0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
              : "0 8px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.10)",
          }}
        >
          {/* Main Navigation Bar Content */}
          <div className="relative px-3 sm:px-5 lg:px-6 xl:px-7 h-[64px] sm:h-[68px] lg:h-[72px] flex items-center justify-between gap-3 lg:gap-4">

            {/* LEFT: Square Logo Badge + Wordmark Lockup */}
            <div className="flex items-center shrink-0">
              <Link
                to="/"
                data-testid="logo-link"
                className="flex items-center gap-2.5 sm:gap-3 group"
              >
                {/* Square Emblem Badge */}
                <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] lg:w-[46px] lg:h-[46px] rounded-[6px] overflow-hidden shrink-0 border border-white/15 shadow-sm bg-[#3D060E] flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
                  <img
                    src="/apple-touch-icon.png"
                    alt="Astittva Emblem"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/favicon-512x512.png";
                    }}
                  />
                </div>

                {/* Vertical separator */}
                <div className="h-6 sm:h-7 lg:h-8 w-[1px] bg-white/20 shrink-0 mx-1 sm:mx-1.5" />

                {/* Editorial Brand Wordmark */}
                <div className="flex flex-col justify-center leading-none">
                  <span
                    className="font-cinzel text-[19px] sm:text-[21px] lg:text-[23px] tracking-[0.18em] sm:tracking-[0.20em] text-white font-bold whitespace-nowrap"
                    style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.35)" }}
                  >
                    ASTITTVA
                  </span>
                  <span className="font-sans text-[8px] sm:text-[9px] lg:text-[9.5px] tracking-[0.44em] text-[#E8DCD5] font-semibold mt-[2px] sm:mt-[3px] whitespace-nowrap">
                    MARKETING
                  </span>
                </div>
              </Link>
            </div>

            {/* CENTER: Navigation Links */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-2 xl:px-4 min-w-0">
              <div className="flex items-center gap-2 xl:gap-4 2xl:gap-6">
                {nav.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/"}
                    data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="transition-colors duration-200"
                  >
                    {({ isActive }) => {
                      const active = isActive || (n.to === "/about" && pathname === "/contact");
                      return (
                        <span
                          className={`inline-flex flex-col items-center justify-center transition-all duration-200 ${
                            active
                              ? "border border-white/30 bg-white/[0.08] rounded-[6px] px-3.5 xl:px-4 py-1.5"
                              : "border border-transparent px-2.5 xl:px-3 py-1.5 text-[#E8DCD5] hover:text-white"
                          }`}
                        >
                          <span
                            className={`font-sans text-[12px] xl:text-[12.5px] 2xl:text-[13px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap leading-none ${
                              active ? "text-white" : ""
                            }`}
                          >
                            {n.label}
                          </span>
                          {active && (
                            <span
                              aria-hidden="true"
                              className="w-full h-[2px] bg-[#D4A359] rounded-full mt-1.5"
                            />
                          )}
                        </span>
                      );
                    }}
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* RIGHT: Warm Amber Book Consultation CTA */}
            <div className="hidden lg:flex items-center justify-end shrink-0">
              <Link
                to="/contact"
                data-testid="header-cta"
                className="group relative inline-flex items-center justify-center gap-2 h-[40px] lg:h-[42px] px-5 lg:px-6 font-sans text-[12px] xl:text-[12.5px] font-semibold tracking-[0.06em] uppercase text-white rounded-[6px] border border-white/20 transition-all duration-200 hover:brightness-110 hover:-translate-y-px active:translate-y-0 whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, #BD7732 0%, #DA9B48 100%)",
                  boxShadow: "0 4px 16px rgba(189, 119, 50, 0.35)",
                }}
              >
                <span>Book Consultation</span>
                <ArrowRight
                  className="w-3.5 h-3.5 text-white transition-transform duration-200 group-hover:translate-x-0.5 shrink-0"
                  strokeWidth={2}
                />
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              data-testid="mobile-menu-toggle"
              className="lg:hidden text-white hover:text-[#C89A55] relative w-10 h-10 rounded-[6px] flex items-center justify-center transition-colors duration-200 hover:bg-white/[0.06] border border-transparent hover:border-white/10"
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

        {/* Mobile Full-Width Menu Drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-glass-menu"
              initial={{ opacity: 0, y: -8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden max-w-[1440px] mx-auto mt-2 rounded-[8px] overflow-hidden border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
              style={{
                background: "linear-gradient(180deg, #4A0811 0%, #540D17 100%)",
              }}
            >
              <nav className="p-4 sm:p-5 flex flex-col gap-2">
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
                      data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className={({ isActive }) => {
                        const active = isActive || (n.to === "/about" && pathname === "/contact");
                        return `flex items-center justify-between px-4 py-3 font-sans text-[13.5px] font-semibold leading-none uppercase rounded-[6px] transition-colors duration-200 min-h-[44px] ${
                          active
                            ? "text-white bg-white/[0.08] border border-white/25"
                            : "text-[#E8DCD5] hover:text-white hover:bg-white/[0.04] border border-transparent"
                        }`;
                      }}
                    >
                      {({ isActive }) => {
                        const active = isActive || (n.to === "/about" && pathname === "/contact");
                        return (
                          <>
                            <span className="tracking-[0.08em]">{n.label}</span>
                            {active && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359] shadow-[0_0_6px_rgba(212,163,89,0.8)]" />
                            )}
                          </>
                        );
                      }}
                    </NavLink>
                  </motion.div>
                ))}

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.2 }}
                  className="mt-3 pt-3 border-t border-white/10"
                >
                  <Link
                    to="/contact"
                    data-testid="mobile-header-cta"
                    className="group flex items-center justify-center gap-2 w-full h-[44px] px-6 font-sans text-[12.5px] font-semibold tracking-[0.06em] uppercase text-white rounded-[6px] transition-all duration-200 border border-white/20"
                    style={{
                      background: "linear-gradient(135deg, #BD7732 0%, #DA9B48 100%)",
                      boxShadow: "0 4px 16px rgba(189, 119, 50, 0.35)",
                    }}
                  >
                    <span>Book Consultation</span>
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </Link>
                </motion.div>

                <div className="mt-2 text-[9px] tracking-[0.3em] uppercase text-[#E8DCD5]/60 text-center">
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
