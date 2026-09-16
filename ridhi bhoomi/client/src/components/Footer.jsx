import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';
import { project } from '../data/project';
import { WhatsAppButton } from './WhatsApp';
import logoImg from '../assets/logo.jpg';

export default function Footer() {
  return (
    <footer className="border-t border-[#C88E00]/30 bg-[#0F1F17] text-stone-300">
      <div className="container-main py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={logoImg} 
                alt="Riddhi Bhumi Logo" 
                className="h-11 w-auto object-contain rounded-md bg-white p-1 shadow-md transition-transform group-hover:scale-105" 
              />
              <div>
                <h3 className="font-serif text-xl font-bold tracking-wide text-[#C88E00]">RIDHI BHOOMI</h3>
                <p className="text-[10px] text-[#388E3C] font-semibold uppercase tracking-widest">WHERE PROSPERITY MEETS LAND</p>
              </div>
            </Link>
            <p className="text-xs text-stone-400 font-light pt-2">
              Developed by <strong className="text-stone-200">{project.developer}</strong>
            </p>
          </div>

          {/* Project */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs uppercase tracking-widest text-[#C88E00] font-bold">PROJECT</h4>
            <div className="flex flex-col gap-2 text-xs text-stone-300">
              <Link to="/master-plan" className="hover:text-[#C88E00] transition-colors">Master Plan</Link>
              <Link to="/location" className="hover:text-[#C88E00] transition-colors">Location & Connectivity</Link>
            </div>
          </div>

          {/* Information */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs uppercase tracking-widest text-[#C88E00] font-bold">INFORMATION</h4>
            <div className="flex flex-col gap-2 text-xs text-stone-300">
              <Link to="/gallery" className="hover:text-[#C88E00] transition-colors">Gallery</Link>
              <Link to="/documents" className="hover:text-[#C88E00] transition-colors">Documents</Link>
              <Link to="/faq" className="hover:text-[#C88E00] transition-colors">FAQ</Link>
              <Link to="/contact" className="hover:text-[#C88E00] transition-colors">Contact Us</Link>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h4 className="font-serif text-xs uppercase tracking-widest text-[#C88E00] font-bold">CONNECT</h4>
            <div className="flex flex-col gap-2.5 text-xs text-stone-300">
              <a href={`tel:+91${project.phone}`} className="flex items-center gap-2 font-bold text-white hover:text-[#C88E00]">
                <Phone size={14} className="text-[#388E3C]" /> +91 9230374700
              </a>
              <a href={`mailto:${project.email}`} className="flex items-center gap-2 hover:text-white">
                <Mail size={14} className="text-[#C88E00]" /> {project.email}
              </a>
              <WhatsAppButton className="btn-gold py-2 text-xs w-full mt-2" />
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[#24382B] pt-8 text-center text-[11px] text-stone-400 space-y-2">
          <p>© {new Date().getFullYear()} {project.name}. Developed by {project.developer}. All rights reserved.</p>
          <p className="text-stone-400 max-w-2xl mx-auto">
            Information and visuals are conceptual/representative. Booking agreement terms shall be final and binding.
          </p>
        </div>
      </div>
    </footer>
  );
}
