import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Calendar } from 'lucide-react';
import { useState } from 'react';
import { project } from '../data/project';
import logoImg from '../assets/logo.jpg';

const links = [
  { to: '/', label: 'Project' },
  { to: '/master-plan', label: 'Master Plan' },
  { to: '/location', label: 'Location' },
  { to: '/payment-plan', label: 'Pricing' },
  { to: '/gallery', label: 'Gallery' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-[#C88E00]/20 bg-[#FAF8F3]/95 backdrop-blur-md transition-all shadow-sm">
      <div className="container-main flex items-center justify-between py-2.5 sm:py-3.5">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 group">
          <img 
            src={logoImg} 
            alt="Riddhi Bhumi Logo" 
            className="h-10 sm:h-12 w-auto object-contain rounded-md shadow-sm border border-stone-200 transition-transform group-hover:scale-105" 
          />
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-lg font-bold tracking-wide text-[#C88E00] leading-tight">
              RIDHI BHOOMI
            </span>
            <span className="text-[8px] sm:text-[9.5px] font-bold uppercase tracking-widest text-[#388E3C]">
              WHERE PROSPERITY MEETS LAND
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-[#C88E00] ${
                location.pathname === l.to ? 'text-[#0F1F17] border-b-2 border-[#C88E00] pb-0.5' : 'text-[#6E736B]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right Action CTAs */}
        <div className="hidden items-center gap-2.5 md:flex">
          <a
            href={`tel:+91${project.phone}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0F1F17] bg-white border border-stone-200 hover:border-[#C88E00] hover:text-[#C88E00] transition-all shadow-sm"
          >
            <Phone size={13} className="text-[#388E3C]" />
            <span>9230374700</span>
          </a>

          <Link to="/site-visit" className="btn-gold text-xs py-2 px-4">
            <Calendar size={13} /> Book Site Visit
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="lg:hidden p-2 text-[#0F1F17]"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-[#C88E00]/20 bg-[#FAF8F3] px-5 py-5 lg:hidden space-y-3 shadow-xl">
          <nav className="flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-xs font-bold uppercase tracking-wider text-[#0F1F17] border-b border-stone-200/60 hover:text-[#C88E00]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 space-y-2">
            <Link to="/site-visit" className="btn-gold w-full py-2.5 text-xs" onClick={() => setOpen(false)}>
              Book Site Visit
            </Link>
            <a href={`tel:+91${project.phone}`} className="btn-secondary w-full py-2.5 text-xs">
              <Phone size={14} className="text-[#388E3C]" /> Call 9230374700
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
