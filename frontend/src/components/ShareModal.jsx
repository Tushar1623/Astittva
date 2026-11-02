import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2, Sparkles, MapPin } from "lucide-react";
import { toast } from "sonner";
import { SITE_URL } from "@/lib/seoConfig";
import SafeImage from "@/components/SafeImage";

// Official platform branded SVGs with precise viewBox & brand colors
function WhatsAppIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="#25D366" className={className}>
      <path d="M12.031 2C6.495 2 2 6.494 2 12.029c0 1.97.57 3.81 1.554 5.367L2 22l4.75-1.52A9.957 9.957 0 0 0 12.031 22c5.534 0 10.029-4.495 10.029-10.029C22.06 6.494 17.565 2 12.031 2zm0 18.358a8.31 8.31 0 0 1-4.24-1.157l-.304-.18-2.82.902.902-2.75-.198-.314A8.307 8.307 0 0 1 3.704 12.03c0-4.591 3.736-8.327 8.327-8.327 4.592 0 8.328 3.736 8.328 8.327 0 4.592-3.736 8.328-8.328 8.328zm4.567-6.236c-.25-.125-1.48-.73-1.71-.813-.23-.083-.396-.125-.563.125-.166.25-.646.813-.792.98-.146.166-.292.187-.542.062s-1.057-.39-2.013-1.242c-.744-.664-1.247-1.484-1.393-1.734-.146-.25-.015-.385.11-.51.112-.112.25-.292.375-.438s.167-.25.25-.417c.083-.167.042-.313-.02-.438-.063-.125-.563-1.354-.772-1.854-.203-.487-.41-.421-.563-.429l-.479-.008c-.167 0-.438.063-.667.313s-.875.854-.875 2.083c0 1.229.896 2.417 1.021 2.583.125.167 1.765 2.696 4.276 3.781.598.258 1.064.413 1.428.528.601.191 1.148.164 1.58.1.482-.072 1.48-.604 1.688-1.188.208-.583.208-1.083.146-1.188-.063-.104-.23-.166-.48-.291z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="#0A66C2" className={className}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function XTwitterIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="#0F1419" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="#229ED9" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.832.942z" />
    </svg>
  );
}

/**
 * Standardised Unified ShareModal Component
 *
 * Implements a shared luxury light design system supporting both Property and Blog sharing.
 */
export default function ShareModal({
  isOpen,
  onClose,
  title = "Astittva Real Estate",
  description = "",
  url = "",
  image = "",
  type = "property", // "property" | "blog" | "generic"
  location = "",
  price = "",
  propertyType = "",
  category = "",
  author = "",
  date = "",
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

  // Format custom WhatsApp text matching requirements
  const whatsAppText = React.useMemo(() => {
    if (type === "property") {
      const parts = [
        "Check out this property on Astittva!",
        title ? `🏡 ${title}` : null,
        location ? `📍 Location: ${location}` : null,
        price ? `💰 Price: ${price}` : null,
        propertyType ? `🏷️ Type: ${propertyType}` : null,
        category ? `✨ Category: ${category}` : null,
        "",
        `View Details: ${shareUrl}`,
      ].filter(Boolean);
      return parts.join("\n");
    } else if (type === "blog") {
      const cleanDesc = description ? description.slice(0, 150).trim() + (description.length > 150 ? "…" : "") : "";
      const parts = [
        "Read this article on Astittva:",
        `📰 ${title}`,
        category ? `🏷️ Category: ${category}` : null,
        author ? `✍️ By: ${author}` : null,
        date ? `📅 Date: ${date}` : null,
        cleanDesc ? `\n${cleanDesc}` : null,
        "",
        `Read More: ${shareUrl}`,
      ].filter(Boolean);
      return parts.join("\n");
    } else {
      const cleanDesc = description ? description.slice(0, 150).trim() + (description.length > 150 ? "…" : "") : "";
      const parts = [
        title ? `✨ ${title}` : "Check this out on Astittva:",
        cleanDesc ? `\n${cleanDesc}` : null,
        "",
        `Explore: ${shareUrl}`,
      ].filter(Boolean);
      return parts.join("\n");
    }
  }, [type, title, location, price, propertyType, category, author, date, description, shareUrl]);

  // Twitter/X formatted text
  const xText = React.useMemo(() => {
    if (type === "property") {
      return `Explore ${title}${location ? ` in ${location}` : ""}, Kolkata on @AstittvaMarketing:`;
    }
    if (type === "blog") {
      return `Read "${title}" on Astittva Kolkata Real Estate Journal:`;
    }
    return `Check out ${title} on Astittva:`;
  }, [type, title, location]);

  // Copy to clipboard with graceful fallback
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
      toast.error("Could not copy link automatically. Please select and copy the link below.");
    }
  };

  // Device native share
  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: title || "Astittva Real Estate",
        text:
          type === "property"
            ? `Check out ${title} on Astittva`
            : type === "blog"
              ? `Read "${title}" on Astittva Journal`
              : title,
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
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        onClose();
      },
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: LinkedInIcon,
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        onClose();
      },
    },
    {
      id: "x",
      name: "X",
      icon: XTwitterIcon,
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        onClose();
      },
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: TelegramIcon,
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E8DED2] sm:rounded-2xl rounded-t-2xl shadow-2xl p-5 sm:p-7 text-[#1C1C1C] z-10 max-h-[92vh] overflow-y-auto"
          >
            {/* Mobile Sheet Grab Handle */}
            <div className="w-12 h-1 bg-[#D8CEBF] rounded-full mx-auto mb-4 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5 border-b border-[#E8DED2] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase text-copper font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-copper" />
                  <span>Share with Network</span>
                </div>
                <h3 id="share-modal-title" className="font-serif text-2xl sm:text-3xl text-[#1C1C1C] font-normal leading-tight">
                  {type === "property" ? "Share Property" : type === "blog" ? "Share Article" : "Share"}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close share dialog"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF8F5] text-[#5F5F5F] hover:text-[#1C1C1C] border border-[#E8DED2] hover:border-copper/40 flex items-center justify-center transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-copper/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Item Preview Box */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#E8DED2] flex items-center gap-3.5 shadow-xs mb-5">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-lg overflow-hidden flex-shrink-0 bg-[#FAF8F5] border border-[#E8DED2]/80">
                <SafeImage
                  src={image}
                  alt={title}
                  type={type === "blog" ? "blog" : "property"}
                  seed={title}
                  width={240}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                {type === "property" ? (
                  <>
                    {category && (
                      <div className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase font-semibold text-copper mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-copper" />
                        <span>{category}</span>
                      </div>
                    )}
                    <h4 className="text-sm sm:text-base font-semibold text-[#1C1C1C] truncate leading-snug">
                      {title}
                    </h4>
                    {location && (
                      <div className="flex items-center gap-1 text-xs text-[#5F5F5F] mt-1 truncate">
                        <MapPin className="w-3 h-3 text-copper shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2 text-xs mt-1.5">
                      {price && (
                        <span className="text-copper font-semibold">
                          {price}
                        </span>
                      )}
                      {propertyType && (
                        <>
                          {price && <span className="text-[#A0988E]">·</span>}
                          <span className="text-[#5F5F5F] font-medium">{propertyType}</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {category && (
                      <div className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.2em] uppercase font-semibold text-copper mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-copper" />
                        <span>{category}</span>
                      </div>
                    )}
                    <h4 className="text-sm sm:text-base font-semibold text-[#1C1C1C] line-clamp-1 leading-snug">
                      {title}
                    </h4>
                    {description && (
                      <p className="text-xs text-[#5F5F5F] line-clamp-2 mt-1 leading-relaxed">
                        {description}
                      </p>
                    )}
                    {(author || date) && (
                      <div className="flex items-center gap-2 text-[11px] text-[#737373] mt-1.5">
                        {author && <span>By {author}</span>}
                        {author && date && <span>·</span>}
                        {date && <span>{date}</span>}
                      </div>
                    )}
                  </>
                )}
                <span className="text-[10px] font-mono text-[#A0988E] truncate block mt-1.5">
                  {shareUrl.replace(/^https?:\/\//, "")}
                </span>
              </div>
            </div>

            {/* Social Grid - Exactly uniform buttons with official platform brand colors */}
            <div className="mb-5">
              <div className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#737373] mb-2.5">
                Select Platform
              </div>
              <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                {platforms.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={p.action}
                      aria-label={`Share via ${p.name}`}
                      className="flex flex-col items-center justify-center gap-1.5 p-2 sm:p-2.5 h-[76px] sm:h-[84px] rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E8DED2] hover:border-copper/40 shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-copper/30"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-semibold text-[#1C1C1C] tracking-tight truncate w-full text-center">
                        {p.name}
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
                  className="w-full flex items-center justify-center gap-2 h-11 sm:h-12 rounded-xl bg-white hover:bg-copper/10 text-[#1C1C1C] hover:text-copper border border-[#E8DED2] hover:border-copper/40 transition-all font-semibold text-xs tracking-wider uppercase cursor-pointer shadow-xs active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-copper/30"
                >
                  <Share2 className="w-4 h-4 text-copper" />
                  <span>Share via Device Menu</span>
                </button>
              </div>
            )}

            {/* Link Copy Bar */}
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#737373] mb-2">
                Page Link
              </div>
              <div className="flex items-center gap-2 bg-white border border-[#E8DED2] focus-within:border-copper rounded-xl p-1.5 pl-3.5 shadow-xs transition-colors h-12">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  aria-label="Direct page link"
                  className="bg-transparent text-xs text-[#1C1C1C] font-mono flex-1 focus:outline-none truncate selection:bg-copper/20 selection:text-copper"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  aria-label="Copy link to clipboard"
                  className={`inline-flex items-center justify-center gap-1.5 px-4 h-9 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer ${
                    copied
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-copper hover:bg-copper-hover text-white shadow-xs active:scale-95"
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
