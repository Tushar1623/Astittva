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
            className="absolute bottom-[148px] sm:bottom-[164px] right-0 w-[300px] sm:w-[320px] bg-[#121212] border border-copper/25 shadow-2xl shadow-black/50"
            data-testid="whatsapp-card"
          >
            <div className="p-5 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-[#25D366]" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-ivory text-sm font-medium">Astittva Advisory</div>
                <div className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Replies within minutes</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto text-white/40 hover:text-ivory"
                aria-label="Close"
                data-testid="whatsapp-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-white/65 text-sm font-light leading-[1.7]">
                Hello! Looking to invest in <span className="text-copper">New Town, Rajarhat or Kolkata</span>? Our advisors will guide you to the right opportunity — verified, RERA-compliant, ready to view.
              </p>
              <a
                href={whatsappLink("Hi Astittva, I'd like advice on premium properties in Kolkata.")}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="whatsapp-start-chat"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-[#0a0a0a] text-xs tracking-[0.18em] uppercase py-3.5 hover:bg-[#1ebe57] transition font-medium"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2} /> Start Chat
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
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#B97832] hover:bg-[#A66A2C] shadow-2xl shadow-black/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full bg-[#B97832] animate-ping opacity-20" />
        <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
      </motion.a>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setOpen((v) => !v)}
        data-testid="whatsapp-fab"
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#1ebe57] shadow-2xl shadow-black/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
        {open ? (
          <X className="w-6 h-6 text-[#0a0a0a]" strokeWidth={2} />
        ) : (
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-[#0a0a0a]" strokeWidth={2} />
        )}
      </motion.button>
    </div>
  );
}
