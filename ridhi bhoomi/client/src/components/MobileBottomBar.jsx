import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Calendar } from 'lucide-react';
import { project } from '../data/project';
import { getWhatsAppUrl } from '../services/api';

export default function MobileBottomBar() {
  const waUrl = getWhatsAppUrl(project.whatsapp, `Hi, I am interested in ${project.name} plots.`);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-3 border-t border-slate-200 bg-[#F7F5F0]/95 backdrop-blur-md shadow-2xl md:hidden">
      <a
        href={`tel:+91${project.phone}`}
        className="flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-bold uppercase tracking-wider text-[#18251D]"
      >
        <Phone size={18} className="text-[#B8955A]" />
        <span>Call</span>
      </a>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center gap-1 border-x border-slate-200 py-3 text-[11px] font-bold uppercase tracking-wider text-[#18251D]"
      >
        <MessageCircle size={18} className="text-emerald-700" />
        <span>WhatsApp</span>
      </a>

      <Link
        to="/site-visit"
        className="flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-bold uppercase tracking-wider bg-[#18251D] text-white"
      >
        <Calendar size={18} className="text-[#B8955A]" />
        <span>Site Visit</span>
      </Link>
    </div>
  );
}
