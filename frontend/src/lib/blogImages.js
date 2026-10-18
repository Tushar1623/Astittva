import { isGoogleDriveImage, driveImageUrl } from "@/lib/api";

export const BLOG_FALLBACK_IMAGES = [
  {
    src: "/images/luxe/property_villa_garden.webp",
    keywords: ["stamp duty", "stamp-duty", "registration"],
  },
  {
    src: "/images/luxe/property_tower.webp",
    keywords: ["emi", "home loan", "home-loan", "loan", "tax", "capital gains"],
  },
  {
    src: "/images/luxe/luxury_villa.webp",
    keywords: ["nri", "checklist", "documents", "rules", "buying guide", "buyers guide", "first-time", "first time"],
  },
  {
    src: "/images/luxe/property_heritage_estate.webp",
    keywords: ["resale", "under-construction", "plot", "plots", "land", "aramya", "estate"],
  },
  {
    src: "/images/luxe/victoria_memorial.webp",
    keywords: ["agent", "hire", "trustworthy", "checks", "choose", "mistakes"],
  },
  {
    src: "/images/luxe/howrah_bridge.webp",
    keywords: ["metro", "airport", "connectivity", "transit", "crossing", "bridge", "suburbs"],
  },
  {
    src: "/images/luxe/biswa_bangla_gate.webp",
    keywords: ["new town", "new-town", "biswa bangla", "action area", "hatisala"],
  },
  {
    src: "/images/luxe/locations_rajarhat.webp",
    keywords: ["rajarhat", "chinar park", "city centre"],
  },
  {
    src: "/images/luxe/locations_newtown.webp",
    keywords: ["investment", "roi", "price", "prices", "rates", "market trends", "corridor", "growth"],
  },
  {
    src: "/images/luxe/locations_kolkata.webp",
    keywords: ["salt lake", "sector v", "central kolkata", "housing board", "rera", "wbrera", "kolkata"],
  },
];

/**
 * Deterministically pick an editorial fallback image for a blog.
 * Uses keyword relevance first; falls back to a deterministic hash so the same blog
 * always gets the same high-resolution luxury photo across all pages.
 */
export function pickBlogFallback(blogOrKey) {
  if (!blogOrKey) return BLOG_FALLBACK_IMAGES[0].src;

  const text = (
    typeof blogOrKey === "string"
      ? blogOrKey
      : `${blogOrKey.slug || ""} ${blogOrKey.title || ""} ${blogOrKey.id || ""}`
  ).toLowerCase();

  // 1. Keyword-based contextual matching
  for (const item of BLOG_FALLBACK_IMAGES) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      return item.src;
    }
  }

  // 2. Deterministic hash fallback
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return BLOG_FALLBACK_IMAGES[hash % BLOG_FALLBACK_IMAGES.length].src;
}

/**
 * Resolve the primary image URL for a blog.
 * If featured_image is a valid Google Drive or HTTP URL, return its resolved URL.
 * If missing, invalid, or legacy storage path, return the editorial fallback.
 */
export function resolveBlogImage(blog, width = 1000) {
  if (!blog) return BLOG_FALLBACK_IMAGES[0].src;

  const raw = typeof blog === "string" ? blog : blog.featured_image;

  if (raw && typeof raw === "string" && raw.trim()) {
    const clean = raw.trim();
    if (isGoogleDriveImage(clean)) {
      return driveImageUrl(clean, width);
    }
    if (
      (clean.startsWith("http://") ||
        clean.startsWith("https://") ||
        clean.startsWith("/")) &&
      !clean.includes("drive.google.com") &&
      !clean.includes("docs.google.com")
    ) {
      return clean;
    }
  }

  return pickBlogFallback(blog);
}
