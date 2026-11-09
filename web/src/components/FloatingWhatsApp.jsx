import { useEffect, useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { whatsappLink, PHONE_E164 } from "@/lib/site";

export default function FloatingWhatsApp() {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 flex flex-col items-end gap-3 sm:gap-4">
      <AnimatePresence>
        {open && (
          <motion.div
            key="wa-card"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[130px] sm:bottom-[140px] right-0 w-[300px] sm:w-[330px] bg-white rounded-[12px] border border-[#E8DED2] shadow-[0_20px_48px_-10px_rgba(26,22,21,0.22)] overflow-hidden"
            data-testid="whatsapp-card"
          >
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2A080C] to-[#470E16] text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-emerald-400" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold tracking-wide">Astittva Concierge</div>
                <div className="text-[#E8DCD5]/75 text-[10px] tracking-[0.18em] uppercase">Replies within minutes</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
                data-testid="whatsapp-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 bg-[#FAF8F5]">
              <p className="text-[#3A3331] text-[13.5px] font-normal leading-[1.65]">
                Hello! Looking to invest in <span className="font-semibold text-[#B87333]">New Town, Rajarhat or Kolkata</span>? Our senior advisors will guide you to verified, WBRERA-compliant luxury homes.
              </p>
              <a
                href={whatsappLink("Hi Astittva, I'd like advice on premium properties in Kolkata.")}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="whatsapp-start-chat"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 text-[11.5px] tracking-[0.14em] uppercase py-3.5 rounded-[8px] transition-all font-semibold shadow-md shadow-emerald-500/20"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2.2} /> Start WhatsApp Chat
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={`tel:${PHONE_E164}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        data-testid="phone-fab"
        aria-label={`Call ${PHONE_E164}`}
        className="relative w-12 h-12 sm:w-[50px] sm:h-[50px] rounded-full bg-gradient-to-br from-[#BD7732] to-[#9C5D24] shadow-[0_8px_24px_rgba(189,119,50,0.40)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-white/25 group"
      >
        <Phone className="w-5 h-5 text-white transition-transform group-hover:rotate-12" strokeWidth={2} />
      </motion.a>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setOpen((v) => !v)}
        data-testid="whatsapp-fab"
        className="relative w-12 h-12 sm:w-[50px] sm:h-[50px] rounded-full bg-gradient-to-br from-[#25D366] to-[#1DA851] shadow-[0_8px_24px_rgba(37,211,102,0.40)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-white/25"
        aria-label="WhatsApp Concierge"
      >
        {open ? (
          <X className="w-5 h-5 text-white" strokeWidth={2.2} />
        ) : (
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
        )}
      </motion.button>
    </div>
  );
}
