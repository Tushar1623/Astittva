import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LOGO_URL, BRAND_TAGLINE } from "@/lib/site";

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (open) document.body.classList.add("menu-open");
    else document.body.classList.remove("menu-open");
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "bg-[#FAF8F5]/85 backdrop-blur-xl border-b border-[#E8DED2] shadow-[0_1px_20px_-10px_rgba(94,31,40,0.15)]"
          : "bg-[#FAF8F5]/40 backdrop-blur-md"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-4 xl:gap-8 h-16 sm:h-20 md:h-24">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2.5 sm:gap-3.5 xl:gap-4 shrink-0 group">
          <img
            src={LOGO_URL}
            alt="Astittva Marketing"
            className="h-10 w-10 sm:h-12 sm:w-12 xl:h-14 xl:w-14 object-contain shrink-0"
          />
          <div className="leading-[1.05] border-l border-copper/25 pl-2.5 sm:pl-3.5">
            {/* Unified stacked brand-signature lockup at every breakpoint */}
            <div
              className="font-serif-display tracking-[0.16em] sm:tracking-[0.18em] text-[18px] sm:text-[20px] xl:text-[24px] whitespace-nowrap"
              style={{ color: "#7A1228", fontWeight: 800 }}
            >
              ASTITTVA
            </div>
            <div
              className="font-serif-display tracking-[0.42em] sm:tracking-[0.46em] text-[8.5px] sm:text-[9.5px] xl:text-[10.5px] mt-[2px] whitespace-nowrap"
              style={{ color: "#1C1C1C", fontWeight: 500 }}
            >
              MARKETING
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center justify-center gap-3.5 xl:gap-6 2xl:gap-8 min-w-0">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                `relative text-[10px] xl:text-[10.5px] tracking-[0.18em] xl:tracking-[0.24em] uppercase transition-colors duration-300 py-1.5 whitespace-nowrap ${
                  isActive ? "text-[#1C1C1C] font-medium" : n.isFeatured ? "text-copper font-medium hover:text-[#7A1228]" : "text-[#5F5F5F] hover:text-[#B87333]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    {n.label}
                    {n.isFeatured && (
                      <span className="text-[7.5px] xl:text-[8px] tracking-[0.12em] px-1.5 py-0.5 rounded-full bg-copper/10 text-copper font-semibold border border-copper/30 uppercase shrink-0">
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

        <div className="hidden lg:block shrink-0">
          <Link
            to="/contact"
            data-testid="header-cta"
            className="inline-flex items-center justify-center px-4 xl:px-6 py-2.5 xl:py-3 text-[10px] xl:text-[11px] tracking-[0.18em] uppercase font-medium text-white bg-[#B87333] hover:bg-[#C58A52] border border-[#B87333] transition-all duration-300 shadow-sm whitespace-nowrap"
            style={{ letterSpacing: "0.18em" }}
          >
            Book Consultation
          </Link>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          className="lg:hidden text-[#1C1C1C] relative w-10 h-10 flex items-center justify-center -mr-2"
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
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden bg-[#FAF8F5]/98 backdrop-blur-xl border-t border-[#E8DED2]"
          >
            <nav className="px-6 py-7 flex flex-col">
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
                    className={({ isActive }) =>
                      `flex items-center justify-between py-4 text-[17px] font-serif-display tracking-[0.06em] border-b border-[#E8DED2] ${
                        isActive ? "text-copper" : "text-[#1C1C1C]"
                      }`
                    }
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
                <Link to="/contact" data-testid="mobile-header-cta" className="btn-primary w-full">
                  Book Consultation
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
