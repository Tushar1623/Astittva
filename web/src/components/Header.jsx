import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LOGO_URL } from "@/lib/site";

const nav = [
  { to: "/", label: "Home" },
  { to: "/properties", label: "Properties" },
  { to: "/ridhi-bhoomi", label: "Ridhi Bhoomi", isFeatured: true },
  { to: "/market-intelligence", label: "Market Intelligence" },
  { to: "/blogs", label: "Blogs" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  // Ref to the toggle button so we can restore focus when the drawer closes
  const toggleRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer and restore focus to toggle on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Escape key closes the mobile drawer and restores focus (NAV-02)
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  useEffect(() => {
    if (open) document.body.classList.add("menu-open");
    else document.body.classList.remove("menu-open");
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "bg-[#FAF8F5]/85 backdrop-blur-xl border-b border-[#E8DED2] shadow-[0_1px_20px_-10px_rgba(94,31,40,0.15)]"
          : "bg-[#FAF8F5]/40 backdrop-blur-md"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 flex items-center justify-between h-16 sm:h-20 md:h-24">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3 sm:gap-4 group">
          <img
            src={LOGO_URL}
            alt="Astittva Marketing"
            className="h-11 w-11 sm:h-12 sm:w-12 lg:h-16 lg:w-16 object-contain"
          />
          <div className="leading-[1.05] border-l border-copper/25 pl-3 sm:pl-4">
            {/* Unified stacked brand-signature lockup at every breakpoint —
                like a couture house mark. ASTITTVA is the dominant typography,
                MARKETING sits below as a refined subtitle. */}
            <div
              className="font-serif-display tracking-[0.16em] sm:tracking-[0.18em] lg:tracking-[0.2em] text-[18px] sm:text-[22px] lg:text-[28px] whitespace-nowrap"
              style={{ color: "#7A1228", fontWeight: 800 }}
            >
              ASTITTVA
            </div>
            <div
              className="font-serif-display tracking-[0.42em] sm:tracking-[0.46em] lg:tracking-[0.5em] text-[8.5px] sm:text-[10px] lg:text-[11px] mt-[2px] sm:mt-[3px] whitespace-nowrap"
              style={{ color: "#1C1C1C", fontWeight: 500 }}
            >
              MARKETING
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 xl:gap-10">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                `relative text-[10.5px] tracking-[0.26em] uppercase transition-colors duration-300 py-2 ${
                  isActive ? "text-[#1C1C1C]" : n.isFeatured ? "text-copper font-medium hover:text-[#7A1228]" : "text-[#5F5F5F] hover:text-[#B87333]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    {n.label}
                    {n.isFeatured && (
                      <span className="text-[8px] tracking-[0.15em] px-1.5 py-0.5 rounded-full bg-copper/10 text-copper font-semibold border border-copper/30 uppercase">
                        Township
                      </span>
                    )}
                  </span>
                  {isActive && <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-copper" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link to="/contact" data-testid="header-cta" className="btn-primary">
            Book Consultation
          </Link>
        </div>

        <button
          ref={toggleRef}
          data-testid="mobile-menu-toggle"
          className="lg:hidden text-[#1C1C1C] relative w-10 h-10 flex items-center justify-center -mr-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "x" : "menu"}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="absolute"
            >
              {open ? <X className="w-6 h-6" strokeWidth={1.4} /> : <Menu className="w-6 h-6" strokeWidth={1.4} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav-panel"
            key="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden bg-[#FAF8F5]/98 backdrop-blur-xl border-t border-[#E8DED2]"
          >
            <nav
              aria-label="Mobile navigation"
              className="px-6 py-7 flex flex-col"
            >
              {nav.map((n, i) => (
                <motion.div
                  key={n.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i + 0.1, duration: 0.4 }}
                >
                  <NavLink
                    to={n.to}
                    data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center justify-between py-4 text-[17px] font-serif-display tracking-[0.06em] border-b border-[#E8DED2] ${
                        isActive ? "text-copper" : "text-[#1C1C1C]"
                      }`
                    }
                    aria-current={pathname === n.to ? "page" : undefined}
                  >
                    <span>{n.label}</span>
                    {n.isFeatured && (
                      <span className="text-[9px] tracking-[0.2em] px-2 py-0.5 rounded-full bg-copper/10 text-copper font-sans font-semibold border border-copper/30 uppercase">
                        Featured Township
                      </span>
                    )}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="mt-7"
              >
                <Link
                  to="/contact"
                  data-testid="mobile-header-cta"
                  className="btn-primary w-full"
                  onClick={closeMenu}
                >
                  Book a Consultation
                </Link>
              </motion.div>
              <div className="mt-7 pt-5 border-t border-[#E8DED2] text-[10px] tracking-[0.4em] uppercase text-[#5F5F5F]">
                Real Estate Consulting &amp; Marketing
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
