import { MessageCircle } from 'lucide-react';
import { project } from '../data/project';
import { getWhatsAppUrl } from '../services/api';

export function WhatsAppButton({ message, className = 'btn-primary', children, plotNumber, propertyType }) {
  const defaultMsg = plotNumber
    ? `Hi, I am interested in ${project.name} – ${propertyType || 'Plot'} – ${plotNumber}. Please share details.`
    : `Hi, I am interested in ${project.name}. Please share details about available plots.`;

  const url = getWhatsAppUrl(project.whatsapp, message || defaultMsg);

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      <MessageCircle size={18} />
      {children || 'WhatsApp'}
    </a>
  );
}

export function FloatingWhatsApp() {
  const url = getWhatsAppUrl(project.whatsapp, `Hi, I am interested in ${project.name} plots. Please send details.`);

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2 group">
      <span className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 whitespace-nowrap">
        Chat with Sales on WhatsApp (9230374700)
      </span>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 border-2 border-white/20"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30"></span>
        <MessageCircle size={28} className="relative z-10 fill-white/20" />
      </a>
    </div>
  );
}

export default FloatingWhatsApp;
