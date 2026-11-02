/**
 * Astittva Share Studio - Share Card Generator
 * Produces high-resolution (1080x1440) real-estate marketing creatives
 * ready for WhatsApp Status, Instagram, LinkedIn, and social media.
 * Zero external paid APIs, 100% client-side HTML5 canvas rendering.
 */

import { drawQrToCanvas } from "./qrCode";
import { isGoogleDriveImage, driveProxyUrl, driveImageUrl } from "@/lib/api";
import { pickPropertyFallback } from "@/components/PropertyCard";
import { pickBlogFallback } from "@/lib/blogImages";

function setLetterSpacing(ctx, val) {
  try {
    ctx.letterSpacing = val;
  } catch (e) {}
}

function drawRoundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  let radius = r;
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else if (!radius) {
    radius = { tl: 0, tr: 0, br: 0, bl: 0 };
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + w - radius.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius.tr);
  ctx.lineTo(x + w, y + h - radius.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius.br, y + h);
  ctx.lineTo(x + radius.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  if (!text) return y;
  const words = text.split(" ");
  let line = "";
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      linesCount++;
      if (linesCount === maxLines) {
        ctx.fillText(line.trim() + "...", x, y);
        return y + lineHeight;
      }
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
  return y + lineHeight;
}

/**
 * Build an array of candidate image URLs to try loading, ordered from highest quality to fallback
 */
function getCandidateUrls(item = {}, contentType = "property", rawImageUrl = "") {
  const candidates = [];

  if (rawImageUrl && typeof rawImageUrl === "string" && rawImageUrl.trim()) {
    candidates.push(rawImageUrl.trim());
  }

  if (item?.featured_image && typeof item.featured_image === "string") {
    candidates.push(item.featured_image.trim());
  }

  if (Array.isArray(item?.images)) {
    item.images.forEach((img) => {
      if (typeof img === "string" && img.trim()) candidates.push(img.trim());
    });
  }

  const seed = item?.id || item?._id || item?.project_name || item?.title || "astittva";
  const contextualFallback = contentType === "blog" ? pickBlogFallback(seed) : pickPropertyFallback(seed);
  if (contextualFallback) {
    candidates.push(contextualFallback);
  }

  candidates.push("/images/luxe/luxury_villa.webp");

  // Transform candidates into actual fetchable URLs
  const resolved = [];
  for (const c of candidates) {
    if (isGoogleDriveImage(c)) {
      resolved.push(driveProxyUrl(c, 1000));
      resolved.push(driveImageUrl(c, 1000));
    } else if (c.startsWith("http://") || c.startsWith("https://") || c.startsWith("/")) {
      resolved.push(c);
    }
  }

  return [...new Set(resolved)];
}

/**
 * Safely loads an image for the HTML5 canvas without tainting the canvas.
 * Uses blob conversion via fetch where possible to guarantee same-origin safety.
 */
async function loadImageSafeForCanvas(candidateUrls) {
  for (const url of candidateUrls) {
    try {
      // 1. If it's a relative URL from our own origin (e.g. /images/...)
      if (url.startsWith("/")) {
        const img = await new Promise((resolve, reject) => {
          const i = new Image();
          i.crossOrigin = "anonymous";
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = url;
          setTimeout(() => reject(new Error("Timeout")), 3000);
        });
        if (img && img.naturalWidth > 10) {
          return { img, cleanup: null };
        }
      }

      // 2. Fetch remote / proxy URLs as blob to guarantee CORS compliance and avoid canvas taint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, { signal: controller.signal, mode: "cors" });
      clearTimeout(timeoutId);

      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 200 && blob.type.startsWith("image/")) {
          const blobUrl = URL.createObjectURL(blob);
          const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = blobUrl;
          });
          if (img && img.naturalWidth > 10) {
            return { img, cleanup: () => URL.revokeObjectURL(blobUrl) };
          }
        }
      }
    } catch {
      // Proceed to next candidate URL
    }
  }
  return { img: null, cleanup: null };
}

export async function renderShareCardToCanvas(options) {
  const {
    item = {},
    contentType = "property",
    url = "https://astittva.in",
    imageUrl = "",
  } = options;

  if (typeof document === "undefined") return null;

  // Ensure fonts are ready before drawing
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch {}

  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1440;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 1. Deep Luxury Background Gradient (Astittva Signature Maroon to Noir)
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#3D060E");
  bg.addColorStop(0.35, "#270308");
  bg.addColorStop(0.75, "#150204");
  bg.addColorStop(1, "#0A0102");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient radial glow
  const radialGlow = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 500);
  radialGlow.addColorStop(0, "rgba(184, 115, 51, 0.20)");
  radialGlow.addColorStop(1, "transparent");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. Luxury Outer Frame & Border
  ctx.save();
  ctx.strokeStyle = "rgba(232, 222, 210, 0.28)";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, 28, 28, width - 56, height - 56, 28);
  ctx.stroke();

  // Inner Copper Accent Border
  ctx.strokeStyle = "rgba(184, 115, 51, 0.50)";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, 36, 36, width - 72, height - 72, 22);
  ctx.stroke();
  ctx.restore();

  // 3. Top Header Bar (Emblem + Wordmark + Category Pill)
  // Emblem square badge
  ctx.save();
  ctx.fillStyle = "#470811";
  ctx.strokeStyle = "#B87333";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, 64, 58, 56, 56, 12);
  ctx.fill();
  ctx.stroke();

  // Gold "A" Monogram in emblem
  ctx.fillStyle = "#FAF8F5";
  ctx.font = 'bold 32px "Cinzel", "Times New Roman", serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", 92, 86);
  ctx.restore();

  // Brand Name & Subtitle
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = 'bold 26px "Cinzel", "Times New Roman", serif';
  setLetterSpacing(ctx, "4px");
  ctx.fillText("ASTITTVA MARKETING", 136, 82);

  ctx.fillStyle = "#E8DED2";
  ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  setLetterSpacing(ctx, "3px");
  const headerSubtitle =
    contentType === "blog"
      ? "REAL ESTATE JOURNAL • KOLKATA INTELLIGENCE"
      : "VERIFIED REAL ESTATE ADVISORY • KOLKATA";
  ctx.fillText(headerSubtitle, 138, 104);
  ctx.restore();

  // Right-side badge
  ctx.save();
  const badgeLabel = contentType === "blog" ? "EDITORIAL STORY" : "VERIFIED PORTFOLIO";
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const badgeWidth = ctx.measureText(badgeLabel).width + 32;
  const badgeX = width - 64 - badgeWidth;
  ctx.fillStyle = "rgba(184, 115, 51, 0.25)";
  ctx.strokeStyle = "rgba(184, 115, 51, 0.65)";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, badgeX, 66, badgeWidth, 38, 19);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#FAF8F5";
  ctx.textAlign = "center";
  ctx.fillText(badgeLabel, badgeX + badgeWidth / 2, 90);
  ctx.restore();

  // 4. Hero Property / Blog Image Container
  const imgX = 64;
  const imgY = 142;
  const imgW = width - 128;
  const imgH = 610;
  const cornerRadius = 22;

  ctx.save();
  drawRoundRect(ctx, imgX, imgY, imgW, imgH, cornerRadius);
  ctx.clip();

  // Load safe image
  const candidateUrls = getCandidateUrls(item, contentType, imageUrl);
  const { img: loadedImg, cleanup } = await loadImageSafeForCanvas(candidateUrls);

  if (loadedImg) {
    // Cover fit
    const imgRatio = loadedImg.width / loadedImg.height;
    const targetRatio = imgW / imgH;
    let sw, sh, sx, sy;

    if (imgRatio > targetRatio) {
      sh = loadedImg.height;
      sw = loadedImg.height * targetRatio;
      sx = (loadedImg.width - sw) / 2;
      sy = 0;
    } else {
      sw = loadedImg.width;
      sh = loadedImg.width / targetRatio;
      sx = 0;
      sy = (loadedImg.height - sh) / 2;
    }

    ctx.drawImage(loadedImg, sx, sy, sw, sh, imgX, imgY, imgW, imgH);
    if (cleanup) cleanup();
  } else {
    drawLuxuryImageFallback(ctx, imgX, imgY, imgW, imgH, item);
  }

  // Bottom shadow vignette over image for readable chips
  const imgGrad = ctx.createLinearGradient(0, imgY + imgH - 180, 0, imgY + imgH);
  imgGrad.addColorStop(0, "transparent");
  imgGrad.addColorStop(1, "rgba(10, 1, 2, 0.88)");
  ctx.fillStyle = imgGrad;
  ctx.fillRect(imgX, imgY + imgH - 180, imgW, 180);

  ctx.restore(); // end clip

  // Image Frame Border
  ctx.save();
  ctx.strokeStyle = "rgba(232, 222, 210, 0.35)";
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, imgX, imgY, imgW, imgH, cornerRadius);
  ctx.stroke();
  ctx.restore();

  // Floating Category Chip on Image (Top-Left)
  const categoryText =
    item.property_type ||
    item.propertyType ||
    item.property_category ||
    item.category ||
    (contentType === "blog" ? "Market Insights" : "Luxury Living");
  ctx.save();
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const catWidth = ctx.measureText(categoryText.toUpperCase()).width + 36;
  ctx.fillStyle = "rgba(250, 248, 245, 0.96)";
  drawRoundRect(ctx, imgX + 24, imgY + 24, catWidth, 36, 18);
  ctx.fill();
  ctx.fillStyle = "#B87333";
  ctx.beginPath();
  ctx.arc(imgX + 42, imgY + 42, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1C1C1C";
  ctx.textAlign = "left";
  ctx.fillText(categoryText.toUpperCase(), imgX + 54, imgY + 46);
  ctx.restore();

  // Floating Location Chip on Image (Bottom-Left)
  const locationText =
    item.location ||
    item.locality ||
    item.city ||
    (contentType === "blog" ? "Kolkata Real Estate" : "Kolkata, WB");
  ctx.save();
  ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = "#FAF8F5";
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 8;
  ctx.fillText(`📍 ${locationText}`, imgX + 24, imgY + imgH - 24);
  ctx.restore();

  // 5. Details Section (Title, Highlights, Price)
  let cursorY = imgY + imgH + 52;

  // Title
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = 'bold 44px "Cinzel", "Times New Roman", serif';
  ctx.textAlign = "left";
  const titleText = item.project_name || item.title || "Exclusive Astittva Property";
  cursorY = wrapText(ctx, titleText, 64, cursorY, width - 128, 52, 2);
  ctx.restore();

  // Builder or Author Subline
  const subline =
    contentType === "blog"
      ? item.author ? `By ${item.author} • Astittva Journal` : "Astittva Editorial Advisory"
      : item.builder ? `By ${item.builder} • Verified Developer Partner` : "Curated Real Estate Advisory";
  ctx.save();
  ctx.fillStyle = "#B87333";
  ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  setLetterSpacing(ctx, "1.5px");
  ctx.fillText(subline.toUpperCase(), 64, cursorY + 12);
  ctx.restore();
  cursorY += 42;

  // Dynamic Property Highlights
  const highlights = [];
  if (contentType === "property") {
    if (item.bedrooms) highlights.push(`${item.bedrooms}`);
    if (item.bathrooms) highlights.push(`${item.bathrooms} Baths`);
    if (item.area_sqft) highlights.push(typeof item.area_sqft === "number" ? `${item.area_sqft} sq.ft.` : `${item.area_sqft}`);
    if (item.possession_date) highlights.push(`Possession: ${item.possession_date}`);
  } else {
    if (item.publish_date || item.created_at) {
      try {
        const d = new Date(item.publish_date || item.created_at);
        highlights.push(d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }));
      } catch {}
    }
    highlights.push("Astittva Verified Analysis");
  }

  if (highlights.length > 0) {
    ctx.save();
    let hlX = 64;
    ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    highlights.slice(0, 3).forEach((hl) => {
      const w = ctx.measureText(hl).width + 36;
      if (hlX + w < width - 64) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.strokeStyle = "rgba(232, 222, 210, 0.35)";
        ctx.lineWidth = 1;
        drawRoundRect(ctx, hlX, cursorY, w, 38, 19);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#E8DED2";
        ctx.textAlign = "center";
        ctx.fillText(hl, hlX + w / 2, cursorY + 24);
        hlX += w + 16;
      }
    });
    ctx.restore();
    cursorY += 60;
  } else {
    cursorY += 16;
  }

  // Price Banner (for properties) or Excerpt (for blogs)
  if (contentType === "property") {
    const priceText =
      item.price_label ||
      (item.starting_price ? `Starting ₹${Number(item.starting_price).toLocaleString("en-IN")}` : "Price on Request");

    ctx.save();
    const bannerH = 74;
    const bannerW = width - 128;
    const bannerGrad = ctx.createLinearGradient(64, cursorY, 64 + bannerW, cursorY);
    bannerGrad.addColorStop(0, "#B87333");
    bannerGrad.addColorStop(0.5, "#9E5821");
    bannerGrad.addColorStop(1, "#520C16");

    ctx.fillStyle = bannerGrad;
    drawRoundRect(ctx, 64, cursorY, bannerW, bannerH, 18);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    drawRoundRect(ctx, 64, cursorY, bannerW, bannerH, 18);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    setLetterSpacing(ctx, "2px");
    ctx.fillText("EXCLUSIVE OFFERING", 92, cursorY + 28);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = 'bold 30px "Cinzel", "Times New Roman", serif';
    ctx.fillText(priceText, 92, cursorY + 58);

    ctx.textAlign = "right";
    ctx.fillStyle = "#FAF8F5";
    ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText("Verified Title & Diligence →", 64 + bannerW - 28, cursorY + 44);

    ctx.restore();
  } else {
    // Blog Short Description
    const excerpt = item.short_description || "Read full research article on the Kolkata property market on Astittva.";
    ctx.save();
    ctx.fillStyle = "#D6C7B7";
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    wrapText(ctx, excerpt, 64, cursorY + 20, width - 128, 28, 2);
    ctx.restore();
  }

  // 6. Bottom Footer & Scannable QR Code
  const footerY = 1200;
  const qrBoxSize = 160;
  const qrBoxX = width - 64 - qrBoxSize;
  const qrBoxY = footerY;

  // Left Footer Info
  ctx.save();
  ctx.fillStyle = "#FAF8F5";
  ctx.font = 'bold 22px "Cinzel", "Times New Roman", serif';
  ctx.fillText("ASTITTVA ADVISORY DESK", 64, footerY + 36);

  ctx.fillStyle = "#B87333";
  ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText("Direct Developer Allocations • Private Site Visits", 64, footerY + 68);

  ctx.fillStyle = "#A89787";
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText("Kolkata: New Town • Rajarhat • Salt Lake • Alipore", 64, footerY + 98);

  ctx.fillStyle = "#FAF8F5";
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText("astittva.in", 64, footerY + 134);
  ctx.restore();

  // QR Code Box on Bottom Right
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 18);
  ctx.fill();
  ctx.restore();

  // Draw QR code modules
  drawQrToCanvas(ctx, url, {
    x: qrBoxX + 12,
    y: qrBoxY + 12,
    size: qrBoxSize - 24,
    margin: 1,
    color: "#1C1C1C",
    bgColor: "#FFFFFF",
  });

  // Label under QR Code
  ctx.save();
  ctx.fillStyle = "#FAF8F5";
  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  setLetterSpacing(ctx, "1px");
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO VIEW LISTING", qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 22);
  ctx.restore();

  return canvas;
}

function drawLuxuryImageFallback(ctx, x, y, w, h, item) {
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, "#4A0B13");
  grad.addColorStop(0.5, "#2C050B");
  grad.addColorStop(1, "#180205");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Geometric Luxury Grid Lines
  ctx.strokeStyle = "rgba(184, 115, 51, 0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i += 60) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i, y + h);
    ctx.stroke();
  }
  for (let j = 0; j < h; j += 60) {
    ctx.beginPath();
    ctx.moveTo(x, y + j);
    ctx.lineTo(x + w, y + j);
    ctx.stroke();
  }

  // Astittva Watermark in center
  ctx.fillStyle = "rgba(232, 222, 210, 0.30)";
  ctx.font = 'bold 48px "Cinzel", "Times New Roman", serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ASTITTVA", x + w / 2, y + h / 2 - 20);
  ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  setLetterSpacing(ctx, "4px");
  ctx.fillText("VERIFIED LUXURY PORTFOLIO", x + w / 2, y + h / 2 + 25);
}

/**
 * Generate Share Card Data URL for direct download or display
 */
export async function generateShareCardDataUrl(options) {
  const canvas = await renderShareCardToCanvas(options);
  if (!canvas) return "";
  try {
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.warn("toDataURL failed, attempting blob fallback:", err);
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob) return URL.createObjectURL(blob);
    } catch {}
    return "";
  }
}

/**
 * Generate Share Card as Blob
 */
export async function generateShareCardBlob(options) {
  const canvas = await renderShareCardToCanvas(options);
  if (!canvas) return null;
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

/**
 * Trigger immediate download of the share card
 */
export async function downloadShareCard(options, filename = "Astittva-Share-Card.png", existingDataUrl = null) {
  let fileUrl = existingDataUrl;

  if (!fileUrl) {
    fileUrl = await generateShareCardDataUrl(options);
  }

  if (!fileUrl) {
    const blob = await generateShareCardBlob(options);
    if (blob) fileUrl = URL.createObjectURL(blob);
  }

  if (!fileUrl) throw new Error("Could not generate share card");

  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
  }, 100);
  return true;
}

/**
 * Share card via native navigator.share with files (mobile)
 */
export async function shareCardFile(options, filename = "Astittva-Share-Card.png", text = "") {
  if (typeof navigator === "undefined" || !navigator.share) return false;

  const blob = await generateShareCardBlob(options);
  if (!blob) return false;

  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: options?.item?.project_name || options?.item?.title || "Astittva Listing",
      text: text || "Check out this verified property on Astittva Marketing",
      files: [file],
    });
    return true;
  }
  return false;
}
