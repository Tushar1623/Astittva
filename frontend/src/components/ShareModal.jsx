import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SITE_URL } from "@/lib/seoConfig";
import SafeImage from "@/components/SafeImage";

// Official platform branded SVGs
function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="currentColor" strokeWidth="0" className={className}>
      <path d="M12.031 2C6.495 2 2 6.494 2 12.029c0 1.97.57 3.81 1.554 5.367L2 22l4.75-1.52A9.957 9.957 0 0 0 12.031 22c5.534 0 10.029-4.495 10.029-10.029C22.06 6.494 17.565 2 12.031 2zm0 18.358a8.31 8.31 0 0 1-4.24-1.157l-.304-.18-2.82.902.902-2.75-.198-.314A8.307 8.307 0 0 1 3.704 12.03c0-4.591 3.736-8.327 8.327-8.327 4.592 0 8.328 3.736 8.328 8.327 0 4.592-3.736 8.328-8.328 8.328zm4.567-6.236c-.25-.125-1.48-.73-1.71-.813-.23-.083-.396-.125-.563.125-.166.25-.646.813-.792.98-.146.166-.292.187-.542.062s-1.057-.39-2.013-1.242c-.744-.664-1.247-1.484-1.393-1.734-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438s.167-.25.25-.417c.083-.167.042-.313-.02-.438-.063-.125-.563-1.354-.772-1.854-.203-.487-.41-.421-.563-.429l-.479-.008c-.167 0-.438.063-.667.313s-.875.854-.875 2.083c0 1.229.896 2.417 1.021 2.583.125.167 1.765 2.696 4.276 3.781.598.258 1.064.413 1.428.528.601.191 1.148.164 1.58.1.482-.072 1.48-.604 1.688-1.188.208-.583.208-1.083.146-1.188-.063-.104-.23-.166-.48-.291z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="currentColor" strokeWidth="0" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="currentColor" strokeWidth="0" className={className}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function XTwitterIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="currentColor" strokeWidth="0" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="currentColor" strokeWidth="0" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.832.942z" />
    </svg>
  );
}

export default function ShareModal({
  isOpen,
  onClose,
  title = "Astittva Marketing",
  description = "",
  url = "",
  image = "",
  type = "property", // "property" | "blog"
  location = "",
  price = "",
  propertyType = "",
}) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Compute absolute clean canonical share URL
  const shareUrl = React.useMemo(() => {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      return url;
    }
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      return url ? `${origin}${url.startsWith("/") ? url : `/${url}`}` : window.location.href;
    }
    return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  }, [url]);

  // Check Web Share API capability
  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Format custom WhatsApp text strictly matching requirements
  const whatsAppText = React.useMemo(() => {
    if (type === "property") {
      const parts = [
        "Check out this property on Astittva!",
        title ? `🏡 ${title}` : null,
        location ? `📍 Location: ${location}` : null,
        price ? `💰 Price: ${price}` : null,
        propertyType ? `🏷️ Type: ${propertyType}` : null,
        "",
        `View Details: ${shareUrl}`,
      ].filter(Boolean);
      return parts.join("\n");
    } else {
      const cleanDesc = description ? description.slice(0, 150).trim() + (description.length > 150 ? "…" : "") : "";
      const parts = [
        "Read this article on Astittva:",
        `📰 ${title}`,
        cleanDesc ? `\n${cleanDesc}` : null,
        "",
        `Read More: ${shareUrl}`,
      ].filter(Boolean);
      return parts.join("\n");
    }
  }, [type, title, location, price, propertyType, description, shareUrl]);

  // Twitter/X formatted text
  const xText = React.useMemo(() => {
    if (type === "property") {
      return `Explore ${title}${location ? ` in ${location}` : ""}, Kolkata on @AstittvaMarketing:`;
    }
    return `Read "${title}" on Astittva Kolkata Real Estate Journal:`;
  }, [type, title, location]);

  // Copy to clipboard with fallback
  const handleCopyLink = async () => {
    let success = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        success = true;
      }
    } catch {
      success = false;
    }

    if (!success) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
        success = true;
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      toast.success("Link copied to clipboard successfully!");
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error("Could not copy link automatically. Please copy the URL below.");
    }
  };

  // Device native share
  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: title || "Astittva Marketing",
        text: type === "property" ? `Check out ${title} on Astittva Marketing` : title,
        url: shareUrl,
      });
      onClose();
    } catch (err) {
      // User cancelled or share aborted
      if (err.name !== "AbortError") {
        console.warn("Share failed:", err);
      }
    }
  };

  const platforms = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: WhatsAppIcon,
      bgColor: "bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/30 text-[#25D366]",
      action: () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppText)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        onClose();
      },
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: FacebookIcon,
      bgColor: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/30 text-[#1877F2]",
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
        onClose();
      },
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: LinkedInIcon,
      bgColor: "bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border-[#0A66C2]/30 text-[#0A66C2]",
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer,width=600,height=550");
        onClose();
      },
    },
    {
      id: "x",
      name: "X (Twitter)",
      icon: XTwitterIcon,
      bgColor: "bg-white/10 hover:bg-white/20 border-white/30 text-ivory",
      action: () => {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(xText)}`;
        window.open(url, "_blank", "noopener,noreferrer,width=600,height=450");
        onClose();
      },
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: TelegramIcon,
      bgColor: "bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border-[#229ED9]/30 text-[#229ED9]",
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        onClose();
      },
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-md bg-[#181818] border border-copper/30 sm:rounded-[14px] rounded-t-[18px] shadow-2xl p-6 text-ivory z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Mobile Sheet Grab Handle */}
            <div className="w-12 h-1 bg-copper/30 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase text-copper font-medium mb-1">
                  <Sparkles className="w-3 h-3 text-copper" />
                  <span>Share with Network</span>
                </div>
                <h3 id="share-modal-title" className="font-serif text-xl sm:text-2xl text-ivory font-normal">
                  {type === "property" ? "Share Property" : "Share Article"}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close share dialog"
                className="p-1.5 rounded-full text-ivory/60 hover:text-ivory hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Item Preview Box */}
            <div className="p-3 rounded-[8px] bg-[#222222] border border-copper/20 flex items-center gap-3 mb-5">
              <div className="w-16 h-16 sm:w-14 sm:h-14 rounded overflow-hidden flex-shrink-0 bg-charcoal/50 border border-copper/15">
                <SafeImage
                  src={image}
                  alt={title}
                  type={type}
                  seed={title}
                  width={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-ivory truncate">{title}</h4>
                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-ivory/60 mt-0.5">
                  {location && <span className="truncate">{location}</span>}
                  {price && (
                    <>
                      <span>·</span>
                      <span className="text-copper font-semibold">{price}</span>
                    </>
                  )}
                  {propertyType && !price && (
                    <>
                      <span>·</span>
                      <span className="text-copper">{propertyType}</span>
                    </>
                  )}
                </div>
                <span className="text-[10px] font-mono text-ivory/40 truncate block mt-0.5">
                  {shareUrl.replace(/^https?:\/\//, "")}
                </span>
              </div>
            </div>

            {/* Social Grid */}
            <div className="mb-5">
              <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 mb-3">
                Select Platform
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {platforms.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={p.action}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-[10px] border transition-all duration-200 group ${p.bgColor}`}
                    >
                      <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                      <span className="text-[11px] font-medium text-ivory/90 group-hover:text-white">
                        {p.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Native Mobile Share Button (if supported) */}
            {canNativeShare && (
              <div className="mb-5">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-copper/10 hover:bg-copper/20 border border-copper/30 text-copper hover:text-copper-hover text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share via Device Menu</span>
                </button>
              </div>
            )}

            {/* Link Copy Bar */}
            <div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-ivory/50 mb-2">
                Page Link
              </div>
              <div className="flex items-center gap-2 bg-[#101010] border border-copper/20 rounded-[8px] p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  aria-label="Direct page link"
                  className="bg-transparent text-xs text-ivory/80 font-mono flex-1 focus:outline-none truncate"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  aria-label="Copy link to clipboard"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-xs font-semibold uppercase tracking-wider transition-all flex-shrink-0 ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-copper hover:bg-copper-hover text-white shadow-sm"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
