import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MapPin,
  Sparkles,
  QrCode,
  Download,
  PenLine,
  Building2,
  Bed,
  Droplets,
  Maximize2,
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  Smartphone,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { pickPropertyFallback } from "@/components/PropertyCard";
import { pickBlogFallback } from "@/lib/blogImages";
import SafeImage from "@/components/SafeImage";
import { generateQrSvgString, generateBrandedQrPng } from "@/lib/qrCode";
import { renderShareCardToCanvas, downloadShareCard, generateShareCardDataUrl, shareCardFile } from "@/lib/shareCardGenerator";

// Brand Platform Icons (Official Vectors)
function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 2C6.504 2 2.016 6.488 2.016 12.016c0 1.953.563 3.774 1.54 5.313L2 22l4.828-1.516a9.98 9.98 0 005.203 1.531h.004c5.523 0 10.016-4.488 10.016-10.015C22.05 6.488 17.558 2 12.031 2zm0 18.281a8.26 8.26 0 01-4.218-1.156l-.305-.18-2.859.9.953-2.781-.195-.312A8.243 8.243 0 013.75 12.016c0-4.563 3.719-8.281 8.281-8.281 4.563 0 8.281 3.719 8.281 8.281 0 4.563-3.718 8.281-8.281 8.281zm4.532-6.195c-.25-.125-1.469-.727-1.695-.813-.227-.086-.391-.125-.555.125-.164.25-.648.813-.797.977-.148.164-.297.188-.547.063-.25-.125-1.05-.387-2.008-1.242-.742-.664-1.242-1.484-1.387-1.734-.148-.25-.016-.383.109-.508.113-.113.25-.297.375-.445.125-.148.164-.25.25-.414.086-.164.043-.313-.023-.438-.063-.125-.555-1.336-.762-1.836-.2-.488-.406-.422-.555-.43-.14-.008-.305-.008-.469-.008s-.43.063-.656.313c-.227.25-.859.84-.859 2.051s.883 2.375 1.008 2.543c.125.164 1.734 2.656 4.203 3.719.586.25 1.047.406 1.406.52.594.188 1.133.164 1.563.098.477-.07 1.469-.602 1.672-1.18.203-.578.203-1.07.141-1.18-.063-.109-.227-.172-.477-.297z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z" />
    </svg>
  );
}

const PROPERTY_MESSAGE_SUGGESTIONS = [
  "Take a look at this property.",
  "Sharing a property you might like.",
  "Interesting property in this location.",
  "Worth checking out!",
];

const BLOG_MESSAGE_SUGGESTIONS = [
  "Take a look at this article.",
  "Interesting read on Kolkata real estate.",
  "Valuable insights from Astittva Journal.",
  "Worth checking out!",
];

export default function ShareModal({
  isOpen,
  onClose,
  title = "Astittva Real Estate",
  description = "",
  url = "",
  image = "",
  price = "",
  location = "",
  category = "",
  propertyType = "",
  contentType = "property", // 'property' or 'blog'
  item = {},
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("share"); // 'share', 'card', 'qr'
  const [copied, setCopied] = useState(false);
  const [personalNote, setPersonalNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [cardDataUrl, setCardDataUrl] = useState("");
  const [downloadingQr, setDownloadingQr] = useState(false);
  const modalRef = useRef(null);

  // Client-side hydration check for Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute canonical URL
  const canonicalUrl = useMemo(() => {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) return url;
    if (typeof window !== "undefined") {
      if (url && url.startsWith("/")) return `${window.location.origin}${url}`;
      return window.location.href;
    }
    return url || "https://astittva.in";
  }, [url]);

  // Derived Title & Details
  const displayTitle = item?.project_name || item?.title || title || "Astittva Listing";
  const displayLocation = item?.location || item?.locality || item?.city || location || "Kolkata, WB";
  const displayPrice = item?.price_label || price || (item?.starting_price ? `₹${Number(item.starting_price).toLocaleString("en-IN")}` : "");
  const displayCategory = item?.property_type || item?.category || category || propertyType || (contentType === "blog" ? "Market Insights" : "Residential");

  // Dynamic Property Highlights
  const dynamicHighlights = useMemo(() => {
    if (contentType !== "property") return [];
    const list = [];
    if (item?.bedrooms) list.push({ icon: Bed, label: `${item.bedrooms}` });
    if (item?.bathrooms) list.push({ icon: Droplets, label: `${item.bathrooms} Baths` });
    if (item?.area_sqft) {
      const areaVal = typeof item.area_sqft === "number" ? `${item.area_sqft} sq.ft.` : `${item.area_sqft}`;
      list.push({ icon: Maximize2, label: areaVal });
    }
    if (item?.possession_date) list.push({ icon: Calendar, label: `Possession: ${item.possession_date}` });
    return list;
  }, [item, contentType]);

  // Blog Highlights
  const blogDate = useMemo(() => {
    if (contentType !== "blog") return "";
    const raw = item?.publish_date || item?.created_at;
    if (!raw) return "";
    try {
      return new Date(raw).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  }, [item, contentType]);

  // Fallback image pipeline
  const fallbackImg = useMemo(() => {
    const seedId = item?.id || item?._id || displayTitle;
    return contentType === "blog" ? pickBlogFallback(seedId) : pickPropertyFallback(seedId);
  }, [item, displayTitle, contentType]);

  const resolvedImage = image || item?.featured_image || (Array.isArray(item?.images) ? item.images[0] : "") || fallbackImg;

  // Reset tab on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab("share");
      setCopied(false);
      setPersonalNote("");
      setShowNoteInput(false);
      setCardDataUrl("");
    }
  }, [isOpen]);

  // CRITICAL FIX: Lock body scroll while open + support Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Construct dynamic share message with optional personal note
  const constructSharePayload = useCallback(() => {
    const notePrefix = personalNote.trim() ? `${personalNote.trim()}\n\n` : "";
    if (contentType === "property") {
      const parts = [
        `${notePrefix}Check out ${displayTitle} on Astittva Marketing`,
        displayLocation ? `📍 Location: ${displayLocation}` : null,
        displayPrice ? `💰 ${displayPrice}` : null,
        `🔗 ${canonicalUrl}`,
      ].filter(Boolean);
      return parts.join("\n");
    } else {
      const parts = [
        `${notePrefix}${displayTitle}`,
        description ? `"${description.slice(0, 140)}..."` : null,
        `Read more on Astittva Journal: ${canonicalUrl}`,
      ].filter(Boolean);
      return parts.join("\n");
    }
  }, [personalNote, contentType, displayTitle, displayLocation, displayPrice, canonicalUrl, description]);

  // Clipboard copy
  const handleCopy = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(canonicalUrl);
      } else {
        const input = document.createElement("input");
        input.value = canonicalUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [canonicalUrl]);

  // Native Web Share API
  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: displayTitle,
          text: constructSharePayload(),
          url: canonicalUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  }, [displayTitle, constructSharePayload, canonicalUrl, handleCopy]);

  // Social sharing handlers
  const handleSocialShare = useCallback((platform) => {
    const payloadText = constructSharePayload();
    const encodedUrl = encodeURIComponent(canonicalUrl);
    const encodedText = encodeURIComponent(payloadText);

    let targetUrl = "";
    switch (platform) {
      case "whatsapp":
        targetUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;
      case "facebook":
        targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "x":
        targetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          personalNote.trim() ? `${personalNote.trim()} ${displayTitle}` : displayTitle
        )}&url=${encodedUrl}&hashtags=Astittva,LuxuryRealEstate,Kolkata`;
        break;
      case "telegram":
        targetUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      default:
        break;
    }

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer,width=640,height=580");
    }
  }, [constructSharePayload, canonicalUrl, personalNote, displayTitle]);

  // Generate Share Card Preview
  const prepareCardPreview = useCallback(async () => {
    setGeneratingCard(true);
    try {
      const dataUrl = await generateShareCardDataUrl({
        item: {
          ...item,
          project_name: displayTitle,
          title: displayTitle,
          location: displayLocation,
          price_label: displayPrice,
          property_type: displayCategory,
        },
        contentType,
        url: canonicalUrl,
        imageUrl: resolvedImage,
      });
      setCardDataUrl(dataUrl);
    } catch (e) {
      console.error(e);
      toast.error("Could not generate share card preview");
    } finally {
      setGeneratingCard(false);
    }
  }, [item, displayTitle, displayLocation, displayPrice, displayCategory, contentType, canonicalUrl, resolvedImage]);

  // Auto-generate card preview when switching to card tab
  useEffect(() => {
    if (isOpen && activeTab === "card" && !cardDataUrl && !generatingCard) {
      prepareCardPreview();
    }
  }, [isOpen, activeTab, cardDataUrl, generatingCard, prepareCardPreview]);

  // Switch to Share Card tab
  const handleOpenShareCard = useCallback(() => {
    setActiveTab("card");
    if (!cardDataUrl) {
      prepareCardPreview();
    }
  }, [cardDataUrl, prepareCardPreview]);

  // Download Share Card
  const handleDownloadCard = useCallback(async () => {
    try {
      const cleanSlug = (displayTitle || "property").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      await downloadShareCard(
        {
          item: {
            ...item,
            project_name: displayTitle,
            title: displayTitle,
            location: displayLocation,
            price_label: displayPrice,
            property_type: displayCategory,
          },
          contentType,
          url: canonicalUrl,
          imageUrl: resolvedImage,
        },
        `Astittva-${cleanSlug}-Creative.png`,
        cardDataUrl
      );
      toast.success("Share Card downloaded successfully!");
    } catch (e) {
      toast.error("Failed to download share card");
    }
  }, [cardDataUrl, item, displayTitle, displayLocation, displayPrice, displayCategory, contentType, canonicalUrl, resolvedImage]);

  // Share Card directly via WhatsApp or mobile share sheet
  const handleShareCardWhatsApp = useCallback(async () => {
    try {
      const cleanSlug = (displayTitle || "property").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      const filename = `Astittva-${cleanSlug}-Creative.png`;
      const shared = await shareCardFile(
        {
          item: {
            ...item,
            project_name: displayTitle,
            title: displayTitle,
            location: displayLocation,
            price_label: displayPrice,
            property_type: displayCategory,
          },
          contentType,
          url: canonicalUrl,
          imageUrl: resolvedImage,
        },
        filename,
        constructSharePayload()
      );
      if (!shared) {
        await handleDownloadCard();
        handleSocialShare("whatsapp");
      }
    } catch {
      handleSocialShare("whatsapp");
    }
  }, [displayTitle, item, displayLocation, displayPrice, displayCategory, contentType, canonicalUrl, resolvedImage, constructSharePayload, handleDownloadCard, handleSocialShare]);

  // Download Branded QR Code PNG
  const handleDownloadQr = useCallback(async () => {
    setDownloadingQr(true);
    try {
      const dataUrl = await generateBrandedQrPng(canonicalUrl, displayTitle, displayLocation);
      if (!dataUrl) throw new Error("QR generation failed");
      const a = document.createElement("a");
      a.href = dataUrl;
      const cleanSlug = displayTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      a.download = `Astittva-${cleanSlug}-QRCode.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("QR Code downloaded!");
    } catch {
      toast.error("Failed to download QR code");
    } finally {
      setDownloadingQr(false);
    }
  }, [canonicalUrl, displayTitle, displayLocation]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        data-testid="share-studio-overlay"
        className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/75 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-studio-title"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[540px] max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] flex flex-col bg-[#FAF8F5] border border-[#E8DED2] rounded-2xl shadow-[0_24px_60px_-15px_rgba(28,28,28,0.38)] overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ===================== STICKY HEADER ===================== */}
          <div className="shrink-0 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-[#E8DED2] bg-[#FAF8F5]/95 backdrop-blur-sm z-20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] tracking-[0.25em] uppercase font-semibold text-[#B87333] bg-[#B87333]/10 border border-[#B87333]/20 mb-2">
                  <Sparkles className="w-3 h-3" />
                  Astittva Share Studio
                </div>
                <h2 id="share-studio-title" className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C] leading-tight">
                  {contentType === "blog" ? "Share this Story" : "Share this Property"}
                </h2>
                <p className="text-xs text-[#5F5F5F] font-light mt-0.5">
                  {contentType === "blog"
                    ? "Astittva Real Estate Journal • Editorial insights & analysis"
                    : "Curated real estate portfolio • Verified details & instant sharing"}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Share Studio"
                data-testid="share-studio-close-btn"
                className="w-8 h-8 rounded-full border border-[#E8DED2] bg-white text-[#5F5F5F] hover:text-[#1C1C1C] hover:border-[#B87333] hover:bg-[#F5F1EC] transition-all flex items-center justify-center shrink-0 shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB SELECTOR: Quick Share / Create Share Card / QR Code */}
            <div className="flex items-center gap-1.5 mt-4 p-1 rounded-xl bg-[#EFE9DF] border border-[#E8DED2]/80">
              <button
                type="button"
                onClick={() => setActiveTab("share")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                  activeTab === "share"
                    ? "bg-white text-[#1C1C1C] shadow-xs"
                    : "text-[#5F5F5F] hover:text-[#1C1C1C]"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                Quick Share
              </button>

              <button
                type="button"
                onClick={handleOpenShareCard}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                  activeTab === "card"
                    ? "bg-white text-[#B87333] shadow-xs"
                    : "text-[#5F5F5F] hover:text-[#1C1C1C]"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Share Card
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("qr")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                  activeTab === "qr"
                    ? "bg-white text-[#1C1C1C] shadow-xs"
                    : "text-[#5F5F5F] hover:text-[#1C1C1C]"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                QR Code
              </button>
            </div>
          </div>

          {/* ===================== SCROLLABLE MODAL BODY ===================== */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 sm:py-6 space-y-5 text-[#1C1C1C]">
            {/* ===================== TAB 1: QUICK SHARE ===================== */}
            {activeTab === "share" && (
              <>
                {/* 1. BALANCED PREVIEW CARD WITH DYNAMIC HIGHLIGHTS */}
                <div className="bg-white border border-[#E8DED2] rounded-xl p-3.5 sm:p-4 shadow-xs">
                  <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="relative w-24 sm:w-28 aspect-[4/3] rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#E8DED2] shrink-0">
                      <SafeImage
                        src={resolvedImage}
                        alt={displayTitle}
                        type={contentType}
                        seed={displayTitle}
                        fallbackSrc={fallbackImg}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-semibold tracking-wider uppercase bg-[#F5F1EC] text-[#5F5F5F] border border-[#E8DED2]">
                          {displayCategory}
                        </span>
                        {blogDate && (
                          <span className="text-[10px] text-[#737373] tracking-wider uppercase">
                            • {blogDate}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif-display text-base sm:text-lg text-[#1C1C1C] leading-snug line-clamp-1 font-semibold">
                        {displayTitle}
                      </h3>

                      {displayLocation && (
                        <div className="flex items-center gap-1 text-xs text-[#5F5F5F] mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-[#B87333] shrink-0" />
                          <span className="truncate">{displayLocation}</span>
                        </div>
                      )}

                      {displayPrice && (
                        <div className="text-sm font-semibold text-[#B87333] mt-1 font-serif-display">
                          {displayPrice}
                        </div>
                      )}

                      {contentType === "blog" && description && (
                        <p className="text-xs text-[#5F5F5F] font-light line-clamp-2 mt-1">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* DYNAMIC PROPERTY HIGHLIGHTS (Bedrooms, Bathrooms, Area - only if non-empty!) */}
                  {dynamicHighlights.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#E8DED2]/70 flex flex-wrap gap-1.5 sm:gap-2">
                      {dynamicHighlights.map((hl, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-medium bg-[#FAF8F5] text-[#2A2A2A] border border-[#E8DED2]"
                        >
                          <hl.icon className="w-3 h-3 text-[#B87333] shrink-0" />
                          <span>{hl.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2.5 pt-2.5 border-t border-[#E8DED2]/60 flex items-center justify-between text-[11px] text-[#737373]">
                    <span className="truncate max-w-[240px] sm:max-w-[320px] font-mono text-[10px]">
                      {canonicalUrl}
                    </span>
                    <a
                      href={canonicalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#B87333] hover:text-[#9E5821] font-medium transition-colors shrink-0 ml-2"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 2. PERSONALISE SHARE MESSAGE SECTION */}
                <div className="bg-white border border-[#E8DED2] rounded-xl p-3.5 sm:p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowNoteInput((v) => !v)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#1C1C1C] hover:text-[#B87333] transition-colors"
                    >
                      <PenLine className="w-3.5 h-3.5 text-[#B87333]" />
                      <span>{showNoteInput ? "Hide personal note" : "Add a personal note before sharing (optional)"}</span>
                    </button>
                    {personalNote && !showNoteInput && (
                      <span className="text-[10px] text-[#B87333] font-medium">1 note attached</span>
                    )}
                  </div>

                  {showNoteInput && (
                    <div className="mt-3 space-y-2.5">
                      <div className="relative">
                        <textarea
                          value={personalNote}
                          onChange={(e) => setPersonalNote(e.target.value)}
                          placeholder={
                            contentType === "blog"
                              ? "Found this article interesting. Thought you might like it!"
                              : "Found this property interesting. Thought you might like it!"
                          }
                          rows={2}
                          maxLength={180}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DED2] bg-[#FAF8F5] text-[#1C1C1C] placeholder:text-[#888] focus:outline-none focus:border-[#B87333] resize-none"
                        />
                        {personalNote && (
                          <button
                            type="button"
                            onClick={() => setPersonalNote("")}
                            className="absolute top-2 right-2 text-[#888] hover:text-[#1C1C1C] p-0.5"
                            title="Clear note"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Quick Suggestions Pills */}
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[#737373] mb-1.5 font-medium">
                          Quick Suggestions:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(contentType === "blog" ? BLOG_MESSAGE_SUGGESTIONS : PROPERTY_MESSAGE_SUGGESTIONS).map(
                            (sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setPersonalNote(sug)}
                                className={`text-[10.5px] px-2.5 py-1 rounded-full border transition-all ${
                                  personalNote === sug
                                    ? "bg-[#B87333] text-white border-[#B87333]"
                                    : "bg-[#FAF8F5] text-[#5F5F5F] border-[#E8DED2] hover:border-[#B87333] hover:text-[#1C1C1C]"
                                }`}
                              >
                                {sug}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. STANDARDISED SOCIAL SHARING BUTTONS (5 PLATFORMS) */}
                <div>
                  <div className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#5F5F5F] mb-2.5">
                    Share via Social Platforms
                  </div>

                  <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleSocialShare("whatsapp")}
                      data-testid="share-whatsapp-btn"
                      className="group flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl border border-[#E8DED2] bg-white hover:border-[#25D366]/40 hover:bg-[#25D366]/5 active:scale-95 transition-all min-h-[76px] shadow-xs"
                      title="Share to WhatsApp"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <WhatsAppIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-medium text-[#1C1C1C] truncate w-full text-center">
                        WhatsApp
                      </span>
                    </button>

                    {/* Facebook */}
                    <button
                      type="button"
                      onClick={() => handleSocialShare("facebook")}
                      data-testid="share-facebook-btn"
                      className="group flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl border border-[#E8DED2] bg-white hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5 active:scale-95 transition-all min-h-[76px] shadow-xs"
                      title="Share to Facebook"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FacebookIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-medium text-[#1C1C1C] truncate w-full text-center">
                        Facebook
                      </span>
                    </button>

                    {/* LinkedIn */}
                    <button
                      type="button"
                      onClick={() => handleSocialShare("linkedin")}
                      data-testid="share-linkedin-btn"
                      className="group flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl border border-[#E8DED2] bg-white hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5 active:scale-95 transition-all min-h-[76px] shadow-xs"
                      title="Share to LinkedIn"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <LinkedInIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-medium text-[#1C1C1C] truncate w-full text-center">
                        LinkedIn
                      </span>
                    </button>

                    {/* X (Twitter) */}
                    <button
                      type="button"
                      onClick={() => handleSocialShare("x")}
                      data-testid="share-x-btn"
                      className="group flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl border border-[#E8DED2] bg-white hover:border-black/30 hover:bg-black/5 active:scale-95 transition-all min-h-[76px] shadow-xs"
                      title="Share to X"
                    >
                      <div className="w-8 h-8 rounded-full bg-black/10 text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                        <XIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-medium text-[#1C1C1C] truncate w-full text-center">
                        X
                      </span>
                    </button>

                    {/* Telegram */}
                    <button
                      type="button"
                      onClick={() => handleSocialShare("telegram")}
                      data-testid="share-telegram-btn"
                      className="group flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-xl border border-[#E8DED2] bg-white hover:border-[#229ED9]/40 hover:bg-[#229ED9]/5 active:scale-95 transition-all min-h-[76px] shadow-xs"
                      title="Share to Telegram"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TelegramIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-medium text-[#1C1C1C] truncate w-full text-center">
                        Telegram
                      </span>
                    </button>
                  </div>
                </div>

                {/* 4. CREATIVE SHORTCUT ACTIONS: SHARE CARD & QR CODE */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenShareCard}
                    data-testid="trigger-share-card-btn"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#B87333]/30 bg-[#B87333]/5 hover:bg-[#B87333]/15 text-[#B87333] transition-all text-xs font-semibold shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create Share Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("qr")}
                    data-testid="trigger-qr-btn"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#E8DED2] bg-white hover:bg-[#F5F1EC] text-[#1C1C1C] transition-all text-xs font-semibold shadow-xs"
                  >
                    <QrCode className="w-4 h-4 text-[#B87333]" />
                    <span>Generate QR Code</span>
                  </button>
                </div>

                {/* 5. SHARE VIA DEVICE (Full-width button) */}
                {typeof navigator !== "undefined" && Boolean(navigator.share) && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    data-testid="share-device-btn"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#E8DED2] bg-white hover:border-[#B87333] hover:bg-[#F5F1EC] text-[#1C1C1C] text-xs font-semibold tracking-wider uppercase transition-all shadow-xs"
                  >
                    <Smartphone className="w-4 h-4 text-[#B87333]" />
                    <span>Share via Device Menu</span>
                  </button>
                )}

                {/* 6. CLEAN COPY LINK SECTION */}
                <div className="bg-white border border-[#E8DED2] rounded-xl p-2.5 sm:p-3 flex items-center gap-2 shadow-xs">
                  <div className="flex-1 min-w-0 px-2 py-1 bg-[#FAF8F5] rounded-lg border border-[#E8DED2]/80">
                    <div className="text-[9px] uppercase tracking-wider text-[#737373] font-medium">
                      Canonical Link
                    </div>
                    <div className="text-xs text-[#1C1C1C] font-mono truncate" title={canonicalUrl}>
                      {canonicalUrl}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    data-testid="share-copy-link-btn"
                    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all shrink-0 shadow-xs ${
                      copied
                        ? "bg-emerald-600 text-white border border-emerald-600"
                        : "bg-[#1C1C1C] text-white hover:bg-[#B87333] border border-[#1C1C1C] hover:border-[#B87333]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* ===================== TAB 2: CREATE SHARE CARD ===================== */}
            {activeTab === "card" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab("share")}
                    className="inline-flex items-center gap-1.5 text-xs text-[#5F5F5F] hover:text-[#1C1C1C] font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Quick Share
                  </button>
                  <span className="text-[11px] font-semibold text-[#B87333] uppercase tracking-wider">
                    WhatsApp & Social Creative
                  </span>
                </div>

                {/* Preview Container */}
                <div className="relative rounded-xl overflow-hidden border border-[#E8DED2] bg-[#140205] shadow-lg max-w-[340px] sm:max-w-[380px] mx-auto">
                  {generatingCard ? (
                    <div className="aspect-[3/4] flex flex-col items-center justify-center gap-3 p-6 text-center text-white/70">
                      <div className="w-8 h-8 border-2 border-[#B87333] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs uppercase tracking-widest text-[#E8DED2]">
                        Rendering Marketing Creative…
                      </span>
                      <span className="text-[10px] text-white/50">
                        Preparing verified property details & QR code
                      </span>
                    </div>
                  ) : cardDataUrl ? (
                    <div className="relative group">
                      <img
                        src={cardDataUrl}
                        alt="Astittva Share Card Preview"
                        className="w-full h-auto object-contain block"
                      />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-white/20 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                        1080 × 1440 HD
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] flex flex-col items-center justify-center gap-3 p-6 text-center text-white/70">
                      <p className="text-xs">Preview ready to render</p>
                      <button
                        type="button"
                        onClick={prepareCardPreview}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#B87333] text-white text-xs font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Preview
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="space-y-2 pt-1 max-w-[380px] mx-auto">
                  <button
                    type="button"
                    onClick={handleDownloadCard}
                    disabled={generatingCard}
                    data-testid="download-share-card-btn"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#B87333] hover:bg-[#A35D27] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Share Card (PNG)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShareCardWhatsApp}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 text-xs font-semibold transition-all shadow-xs"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Share on WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-[#E8DED2] bg-white hover:bg-[#F5F1EC] text-[#1C1C1C] text-xs font-semibold transition-all shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 3: QR CODE SHARING ===================== */}
            {activeTab === "qr" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab("share")}
                    className="inline-flex items-center gap-1.5 text-xs text-[#5F5F5F] hover:text-[#1C1C1C] font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Quick Share
                  </button>
                  <span className="text-[11px] font-semibold text-[#B87333] uppercase tracking-wider">
                    Instant Camera Scan
                  </span>
                </div>

                {/* Branded QR Card Display */}
                <div className="bg-white border border-[#E8DED2] rounded-2xl p-6 sm:p-7 text-center shadow-md max-w-[360px] mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-[#B87333]/10 text-[#B87333] border border-[#B87333]/20 mb-3">
                    Astittva Verified QR
                  </div>

                  <h4 className="font-serif-display text-lg text-[#1C1C1C] font-semibold line-clamp-1 mb-1">
                    {displayTitle}
                  </h4>
                  <p className="text-xs text-[#5F5F5F] mb-4">
                    Scan with any smartphone camera to open verified details
                  </p>

                  {/* QR Svg Box */}
                  <div className="w-[210px] h-[210px] mx-auto p-3 rounded-xl bg-white border-2 border-[#E8DED2] shadow-sm flex items-center justify-center">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: generateQrSvgString(canonicalUrl, {
                          size: 186,
                          margin: 1,
                          color: "#1C1C1C",
                          bgColor: "#FFFFFF",
                        }),
                      }}
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E8DED2] text-xs font-mono text-[#5F5F5F] truncate">
                    {canonicalUrl}
                  </div>
                </div>

                {/* QR Actions */}
                <div className="space-y-2 max-w-[360px] mx-auto pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    disabled={downloadingQr}
                    data-testid="download-qr-btn"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1C1C1C] hover:bg-[#B87333] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadingQr ? "Generating QR PNG…" : "Download QR Code (PNG)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#E8DED2] bg-white hover:bg-[#F5F1EC] text-[#1C1C1C] text-xs font-semibold transition-all shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Property URL</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
