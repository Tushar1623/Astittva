import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CALCULATORS, CALCULATOR_CATEGORIES } from "@/data/calculatorsData";
import CalculatorIcon from "@/components/calculators/CalculatorIcon";

// Strict navigation order:
// HOME -> PROPERTIES -> NEWS -> BLOGS -> RESALE -> CALCULATORS -> CAREER -> ABOUT & CONTACT
const primaryNav = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/blogs", label: "Blogs" },
  { to: "/resale", label: "Resale" },
  { to: "/calculators", label: "Calculators", isDropdown: true },
  { to: "/career", label: "Career" },
  { to: "/about", label: "About & Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [calcDropdownOpen, setCalcDropdownOpen] = useState(false);
  const [mobileCalcExpanded, setMobileCalcExpanded] = useState(false);

  const dropdownTimerRef = useRef(null);
  const { pathname } = useLocation();

  // Scroll detection for subtle elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setCalcDropdownOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) document.body.classList.add("menu-open");
    else document.body.classList.remove("menu-open");
    return () => document.body.classList.remove("menu-open");
  }, [mobileOpen]);

  // Graceful hover timeout for mega-menu
  const handleMouseEnter = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setCalcDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setCalcDropdownOpen(false);
    }, 180);
  };

  const isCalculatorsActive = pathname.startsWith("/calculators");

  return (
    <header
      data-testid="site-header"
      className="fixed top-0 left-0 right-0 z-[1000] pointer-events-none"
    >
      {/* Floating Dark Maroon Bar Wrapper */}
      <div className="pointer-events-auto px-2 sm:px-4 lg:px-5 xl:px-8 pt-2.5 sm:pt-3">
        {/* Containing Navbar Capsule (position: relative for dropdown anchoring) */}
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
          <div className="relative px-3 sm:px-4 lg:px-5 xl:px-6 h-[64px] sm:h-[68px] lg:h-[72px] flex items-center justify-between gap-2 lg:gap-3">

            {/* LEFT: Square Logo Badge + Wordmark Lockup */}
            <div className="flex items-center shrink-0">
              <Link
                to="/"
                data-testid="logo-link"
                className="flex items-center gap-2 sm:gap-2.5 group"
              >
                {/* Square Emblem Badge */}
                <div className="w-[38px] h-[38px] sm:w-[42px] sm:h-[42px] lg:w-[44px] lg:h-[44px] rounded-[6px] overflow-hidden shrink-0 border border-white/15 shadow-sm bg-[#3D060E] flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]">
                  <img
                    src="/apple-touch-icon.png"
                    alt="Astittva Marketing - Luxury Real Estate Advisory Kolkata"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/favicon-512x512.png";
                    }}
                  />
                </div>

                {/* Vertical separator */}
                <div className="h-6 sm:h-7 lg:h-7.5 w-[1px] bg-white/20 shrink-0 mx-0.5 sm:mx-1" />

                {/* Editorial Brand Wordmark */}
                <div className="flex flex-col justify-center leading-none">
                  <span
                    className="font-cinzel text-[18px] sm:text-[20px] lg:text-[21px] xl:text-[22px] tracking-[0.16em] sm:tracking-[0.18em] text-white font-bold whitespace-nowrap"
                    style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.35)" }}
                  >
                    ASTITTVA
                  </span>
                  <span className="font-sans text-[7.5px] sm:text-[8.5px] lg:text-[9px] tracking-[0.42em] text-[#E8DCD5] font-semibold mt-[2px] sm:mt-[2.5px] whitespace-nowrap">
                    MARKETING
                  </span>
                </div>
              </Link>
            </div>

            {/* CENTER: Navigation Links */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-1 xl:px-2 min-w-0" aria-label="Primary Navigation">
              <div className="flex items-center gap-1 xl:gap-2 2xl:gap-3.5">
                {primaryNav.map((n) => {
                  // Special Dropdown Item for CALCULATORS
                  if (n.isDropdown) {
                    return (
                      <div
                        key={n.to}
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <button
                          type="button"
                          onClick={() => setCalcDropdownOpen((prev) => !prev)}
                          data-testid="nav-calculators"
                          className="inline-flex items-center transition-colors duration-200 outline-none"
                          aria-expanded={calcDropdownOpen}
                          aria-haspopup="true"
                        >
                          <span
                            className={`inline-flex items-center justify-center transition-all duration-200 ${
                              isCalculatorsActive
                                ? "border border-white/30 bg-white/[0.08] rounded-[6px] px-2.5 xl:px-3 py-1.5"
                                : "border border-transparent px-2 xl:px-2.5 py-1.5 text-[#E8DCD5] hover:text-white"
                            }`}
                          >
                            <span className="inline-flex flex-col items-center justify-center">
                              <span
                                className={`inline-flex items-center gap-1 font-sans text-[11.5px] xl:text-[12px] 2xl:text-[12.5px] font-semibold uppercase tracking-[0.07em] whitespace-nowrap leading-none ${
                                  isCalculatorsActive ? "text-white" : ""
                                }`}
                              >
                                {n.label}
                                <ChevronDown
                                  className={`w-3 h-3 transition-transform duration-200 opacity-75 ${
                                    calcDropdownOpen ? "rotate-180 text-[#D4A359]" : ""
                                  }`}
                                  strokeWidth={2.2}
                                />
                              </span>
                              {isCalculatorsActive && (
                                <span
                                  aria-hidden="true"
                                  className="w-full h-[2px] bg-[#D4A359] rounded-full mt-1.5"
                                />
                              )}
                            </span>
                          </span>
                        </button>
                      </div>
                    );
                  }

                  // Standard Nav Items
                  return (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      end={n.to === "/"}
                      data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                      className="transition-colors duration-200"
                    >
                      {({ isActive }) => {
                        const active =
                          isActive || (n.to === "/about" && pathname === "/contact");
                        return (
                          <span
                            className={`inline-flex flex-col items-center justify-center transition-all duration-200 ${
                              active
                                ? "border border-white/30 bg-white/[0.08] rounded-[6px] px-2.5 xl:px-3 py-1.5"
                                : "border border-transparent px-2 xl:px-2.5 py-1.5 text-[#E8DCD5] hover:text-white"
                            }`}
                          >
                            <span
                              className={`font-sans text-[11.5px] xl:text-[12px] 2xl:text-[12.5px] font-semibold uppercase tracking-[0.07em] whitespace-nowrap leading-none ${
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
                  );
                })}
              </div>
            </nav>

            {/* RIGHT: Warm Amber Book Consultation CTA */}
            <div className="hidden lg:flex items-center justify-end shrink-0">
              <Link
                to="/contact"
                data-testid="header-cta"
                className="group relative inline-flex items-center justify-center gap-1.5 h-[38px] xl:h-[40px] px-4 xl:px-5 font-sans text-[11.5px] xl:text-[12px] font-semibold tracking-[0.06em] uppercase text-white rounded-[6px] border border-white/20 transition-all duration-200 hover:brightness-110 hover:-translate-y-px active:translate-y-0 whitespace-nowrap"
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
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "x" : "menu"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="absolute text-white"
                >
                  {mobileOpen ? (
                    <X className="w-5 h-5" strokeWidth={1.75} />
                  ) : (
                    <Menu className="w-5 h-5" strokeWidth={1.75} />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          {/* ============================================================== */}
          {/* DESKTOP 3-COLUMN MEGA-MENU DROPDOWN                           */}
          {/* Anchored to the Navbar Capsule right edge - never overflows!   */}
          {/* ============================================================== */}
          <AnimatePresence>
            {calcDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.99 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="hidden lg:block absolute top-[calc(100%+10px)] right-3 xl:right-4 rounded-[10px] overflow-hidden border border-white/15 p-5 xl:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.7)] z-[1100] text-left before:content-[''] before:absolute before:-top-[14px] before:left-0 before:right-0 before:h-[16px]"
                style={{
                  width: "min(920px, calc(100vw - 32px))",
                  maxWidth: "920px",
                  background: "linear-gradient(135deg, #44070F 0%, #520C16 50%, #44070F 100%)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                }}
              >
                {/* 3-Column Equal Grid */}
                <div
                  className="grid grid-cols-3"
                  style={{
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "28px",
                  }}
                >
                  {CALCULATOR_CATEGORIES.map((cat) => {
                    const catCalcs = CALCULATORS.filter(
                      (c) => c.category === cat.id
                    );

                    return (
                      <div key={cat.id} className="min-w-0 flex flex-col">
                        {/* Column Header */}
                        <div className="pb-2 mb-3 border-b border-white/10 flex items-center justify-between">
                          <span className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-[#D4A359]">
                            {cat.name}
                          </span>
                          <span className="text-[9.5px] font-semibold tracking-wider text-[#D4C3BA]/60 uppercase">
                            {catCalcs.length} Tools
                          </span>
                        </div>

                        {/* List of Calculator Items with Strict 38px + 1fr Grid */}
                        <div className="space-y-2">
                          {catCalcs.map((item) => {
                            const isItemActive = pathname === item.path;

                            return (
                              <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => setCalcDropdownOpen(false)}
                                className={`group grid grid-cols-[38px_minmax(0,1fr)] items-center h-[50px] px-2.5 rounded-[6px] transition-all duration-150 border ${
                                  isItemActive
                                    ? "bg-white/[0.12] border-white/20"
                                    : "border-transparent hover:bg-white/[0.08] hover:border-white/10"
                                }`}
                              >
                                {/* Centered Icon */}
                                <div className="w-[30px] h-[30px] rounded-[5px] bg-white/[0.08] text-[#D4A359] group-hover:text-white group-hover:bg-[#B87333] flex items-center justify-center shrink-0 transition-colors">
                                  <CalculatorIcon
                                    name={item.iconName}
                                    className="w-4 h-4"
                                  />
                                </div>

                                {/* Text Column (truncated, no overflow) */}
                                <div className="min-w-0 pr-1 overflow-hidden flex flex-col justify-center">
                                  <div className="font-sans text-[12px] font-semibold text-white group-hover:text-[#F3CA8A] transition-colors leading-tight truncate">
                                    {item.shortName}
                                  </div>
                                  <div className="text-[10.5px] text-[#D4C3BA] leading-tight truncate mt-0.5">
                                    {item.shortDescription}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dropdown Compact Footer Bar */}
                <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11.5px]">
                  <div className="flex items-center gap-2 text-[#D4C3BA] text-[11.5px] truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359] shrink-0" />
                    <span className="truncate">
                      Make smarter property decisions with verified financial math
                    </span>
                  </div>
                  <Link
                    to="/calculators"
                    onClick={() => setCalcDropdownOpen(false)}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#D4A359] hover:text-white transition-colors shrink-0 ml-4 group"
                  >
                    <span>View All 12 Calculators</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Full-Width Menu Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-glass-menu"
              initial={{ opacity: 0, y: -8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden max-w-[1440px] mx-auto mt-2 rounded-[8px] overflow-hidden border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)] max-h-[82vh] overflow-y-auto"
              style={{
                background: "linear-gradient(180deg, #4A0811 0%, #540D17 100%)",
              }}
            >
              <nav className="p-4 sm:p-5 flex flex-col gap-1.5">
                {primaryNav.map((n) => {
                  if (n.isDropdown) {
                    return (
                      <div key={n.to} className="rounded-[6px] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setMobileCalcExpanded((prev) => !prev)}
                          className={`w-full flex items-center justify-between px-4 py-3 font-sans text-[13.5px] font-semibold leading-none uppercase rounded-[6px] transition-colors duration-200 min-h-[44px] ${
                            isCalculatorsActive
                              ? "text-white bg-white/[0.08] border border-white/25"
                              : "text-[#E8DCD5] hover:text-white hover:bg-white/[0.04] border border-transparent"
                          }`}
                        >
                          <span className="tracking-[0.08em] flex items-center gap-2">
                            <span>{n.label}</span>
                            <span className="text-[10px] font-bold text-[#D4A359] bg-[#D4A359]/20 px-1.5 py-0.5 rounded">
                              12
                            </span>
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              mobileCalcExpanded ? "rotate-180 text-[#D4A359]" : ""
                            }`}
                          />
                        </button>

                        {/* Mobile Expandable Calculator Sub-List */}
                        <AnimatePresence>
                          {mobileCalcExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-black/25 px-3 py-3 rounded-[6px] mt-1 space-y-3"
                            >
                              <Link
                                to="/calculators"
                                onClick={() => setMobileOpen(false)}
                                className="block text-[12px] font-bold text-[#D4A359] uppercase tracking-wider pb-2 border-b border-white/10"
                              >
                                View All 12 Calculators →
                              </Link>

                              {CALCULATOR_CATEGORIES.map((cat) => {
                                const catCalcs = CALCULATORS.filter(
                                  (c) => c.category === cat.id
                                );

                                return (
                                  <div key={cat.id} className="space-y-1">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 px-2 pt-1">
                                      {cat.name}
                                    </div>
                                    {catCalcs.map((item) => (
                                      <Link
                                        key={item.id}
                                        to={item.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-2 px-2.5 py-2 rounded-[5px] text-[12px] font-medium transition-colors ${
                                          pathname === item.path
                                            ? "text-[#D4A359] bg-white/[0.08]"
                                            : "text-[#E8DCD5] hover:text-white"
                                        }`}
                                      >
                                        <CalculatorIcon
                                          name={item.iconName}
                                          className="w-3.5 h-3.5 text-[#D4A359]"
                                        />
                                        <span className="truncate">{item.name}</span>
                                      </Link>
                                    ))}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  // Normal mobile navigation items
                  return (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      end={n.to === "/"}
                      data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => {
                        const active =
                          isActive || (n.to === "/about" && pathname === "/contact");
                        return `flex items-center justify-between px-4 py-3 font-sans text-[13.5px] font-semibold leading-none uppercase rounded-[6px] transition-colors duration-200 min-h-[44px] ${
                          active
                            ? "text-white bg-white/[0.08] border border-white/25"
                            : "text-[#E8DCD5] hover:text-white hover:bg-white/[0.04] border border-transparent"
                        }`;
                      }}
                    >
                      {({ isActive }) => {
                        const active =
                          isActive || (n.to === "/about" && pathname === "/contact");
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
                  );
                })}

                {/* Mobile CTA */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <Link
                    to="/contact"
                    data-testid="mobile-header-cta"
                    onClick={() => setMobileOpen(false)}
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
                </div>

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
