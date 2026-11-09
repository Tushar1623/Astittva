import React, { useState, useEffect, useMemo } from "react";
import { isGoogleDriveImage, driveImageUrl, driveDirectFallbackUrl, getGoogleDriveFileId } from "@/lib/api";
import { pickPropertyFallback } from "@/components/PropertyCard";
import { pickBlogFallback } from "@/lib/blogImages";
import { Building2, Image as ImageIcon } from "lucide-react";

/**
 * SafeImage - Production-grade resilient image component for Astittva.
 *
 * Requirements fulfilled:
 * 1. Validates URLs before rendering (rejects empty/null/dead paths like 'astitva-realestate/...').
 * 2. Resolves Google Drive links to high-res Google CDN (lh3.googleusercontent.com).
 * 3. Supports absolute HTTPS URLs and valid relative paths (/images/...).
 * 4. Provides contextual, deterministic fallback images based on type and seed/id.
 * 5. Multi-stage error recovery with strict anti-infinite-loop protection.
 * 6. Prevents Cumulative Layout Shift (CLS) with responsive aspect ratios.
 * 7. Lazy loads below-the-fold images, supports high priority for hero images.
 * 8. Never crashes the page on broken images.
 */
export default function SafeImage({
  src,
  alt = "",
  type = "property", // "property" | "blog" | "resale" | "generic"
  seed = "", // id, slug, or title for deterministic fallback matching
  fallbackSrc = null,
  width = 1000,
  priority = false,
  eager = false,
  className = "",
  style = {},
  aspectRatio = null,
  sizes = null,
  onClick = null,
  dataTestId = null,
  ...props
}) {
  const isEager = priority || eager;

  // Determine deterministic contextual fallback
  const contextualFallback = useMemo(() => {
    if (fallbackSrc) return fallbackSrc;
    if (type === "blog") {
      return pickBlogFallback(seed || alt || "blog");
    }
    if (type === "property" || type === "resale") {
      return pickPropertyFallback(seed || alt || "property");
    }
    return "/images/luxe/luxury_villa.webp";
  }, [fallbackSrc, type, seed, alt]);

  // Determine clean initial source
  const initialResolvedSrc = useMemo(() => {
    if (!src || typeof src !== "string") {
      return contextualFallback;
    }
    const clean = src.trim();
    if (!clean) {
      return contextualFallback;
    }
    // Filter dead legacy sandbox paths
    if (clean.startsWith("astitva-realestate/")) {
      return contextualFallback;
    }
    // Google Drive URLs
    if (isGoogleDriveImage(clean)) {
      return driveImageUrl(clean, width);
    }
    // HTTP to HTTPS auto-upgrade for security & CSP compliance
    if (clean.startsWith("http://")) {
      return clean.replace(/^http:\/\//i, "https://");
    }
    // Absolute or local relative path
    if (clean.startsWith("https://") || clean.startsWith("/")) {
      return clean;
    }
    return contextualFallback;
  }, [src, contextualFallback, width]);

  // Retry stage: 0 = primary, 1 = drive direct fallback, 2 = contextual fallback, 3 = terminal placeholder
  const [stage, setStage] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(initialResolvedSrc);

  // Synchronize when src or fallback changes
  useEffect(() => {
    setStage(0);
    setCurrentSrc(initialResolvedSrc);
  }, [initialResolvedSrc]);

  const isDrive = useMemo(() => isGoogleDriveImage(src), [src]);

  const handleError = (e) => {
    const failedSrc = e.currentTarget.src || currentSrc;

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[SafeImage] Image load failed: ${failedSrc} (stage ${stage})`);
    }

    // Stage 0 -> Stage 1: Try Google Drive direct thumbnail API if applicable
    if (stage === 0 && isDrive) {
      const fallbackUrl = driveDirectFallbackUrl(src, width);
      if (fallbackUrl && fallbackUrl !== failedSrc) {
        setStage(1);
        setCurrentSrc(fallbackUrl);
        return;
      }
    }

    // Stage 0 or 1 -> Stage 2: Try contextual luxury fallback WebP
    if (stage < 2) {
      if (contextualFallback && contextualFallback !== failedSrc) {
        setStage(2);
        setCurrentSrc(contextualFallback);
        return;
      }
    }

    // Stage 2 -> Stage 3: Terminal fallback (stop all retries to avoid loops)
    e.currentTarget.onerror = null;
    setStage(3);
  };

  // Combine aspect ratio styles if provided
  const combinedStyle = useMemo(() => {
    const base = { ...style };
    if (aspectRatio) {
      base.aspectRatio = aspectRatio;
    }
    return base;
  }, [style, aspectRatio]);

  // Terminal state: render a luxury styled fallback box
  if (stage >= 3) {
    return (
      <div
        data-testid={dataTestId || "safe-image-placeholder"}
        className={`w-full h-full flex flex-col items-center justify-center bg-[#F5F1EC] text-[#B87333]/60 p-4 border border-[#E8DED2] select-none ${className}`}
        style={combinedStyle}
        onClick={onClick}
        role="img"
        aria-label={alt || "Image preview"}
      >
        {type === "property" || type === "resale" ? (
          <Building2 className="w-8 h-8 mb-2 opacity-60 text-copper" />
        ) : (
          <ImageIcon className="w-8 h-8 mb-2 opacity-60 text-copper" />
        )}
        <span className="text-[10px] tracking-[0.25em] uppercase font-light text-[#5F5F5F] text-center">
          Astittva Luxury Living
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={isEager ? "eager" : "lazy"}
      decoding={isEager ? "sync" : "async"}
      fetchPriority={isEager ? "high" : "auto"}
      referrerPolicy="no-referrer"
      sizes={sizes}
      onError={handleError}
      className={className}
      style={combinedStyle}
      onClick={onClick}
      data-testid={dataTestId}
      {...props}
    />
  );
}
