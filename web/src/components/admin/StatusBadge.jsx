import React, { useContext } from "react";
import AdminThemeContext from "@/context/AdminThemeContext";

const LIGHT_STYLES = {
  // Success / Green (AAA on light)
  published: "border-emerald-300 text-emerald-800 bg-emerald-50 font-semibold",
  selected: "border-emerald-300 text-emerald-800 bg-emerald-50 font-semibold",
  converted: "border-emerald-300 text-emerald-800 bg-emerald-50 font-semibold",
  sold: "border-emerald-300 text-emerald-800 bg-emerald-50 font-semibold",
  active: "border-emerald-300 text-emerald-800 bg-emerald-50 font-semibold",

  // Primary / Blue (AAA on light)
  new: "border-blue-300 text-blue-800 bg-blue-50 font-semibold",
  negotiation: "border-blue-300 text-blue-800 bg-blue-50 font-semibold",

  // Warning / Amber (AAA on light)
  draft: "border-amber-300 text-amber-900 bg-amber-50 font-semibold",
  "under review": "border-amber-300 text-amber-900 bg-amber-50 font-semibold",
  reviewing: "border-amber-300 text-amber-900 bg-amber-50 font-semibold",
  contacted: "border-amber-300 text-amber-900 bg-amber-50 font-semibold",
  "site visit": "border-amber-300 text-amber-900 bg-amber-50 font-semibold",
  "follow up": "border-amber-300 text-amber-900 bg-amber-50 font-semibold",
  "pending review": "border-amber-300 text-amber-900 bg-amber-50 font-semibold",
  inspection: "border-amber-300 text-amber-900 bg-amber-50 font-semibold",

  // Teal / Verified (AAA on light)
  shortlisted: "border-teal-300 text-teal-800 bg-teal-50 font-semibold",
  qualified: "border-teal-300 text-teal-800 bg-teal-50 font-semibold",

  // Purple / Interview (AAA on light)
  interview: "border-purple-300 text-purple-900 bg-purple-50 font-semibold",
  "interview scheduled": "border-purple-300 text-purple-900 bg-purple-50 font-semibold",

  // Destructive / Red (AAA on light)
  rejected: "border-rose-300 text-rose-800 bg-rose-50 font-semibold",
  lost: "border-rose-300 text-rose-800 bg-rose-50 font-semibold",

  // Neutral / Slate (AAA on light)
  closed: "border-zinc-300 text-zinc-800 bg-zinc-100 font-semibold",
  archived: "border-zinc-300 text-zinc-800 bg-zinc-100 font-semibold",
  withdrawn: "border-zinc-300 text-zinc-800 bg-zinc-100 font-semibold",
  inactive: "border-zinc-300 text-zinc-800 bg-zinc-100 font-semibold",

  // Roles
  admin: "border-amber-400 text-amber-900 bg-amber-100 font-semibold",
  sales: "border-blue-300 text-blue-800 bg-blue-50 font-semibold",
  marketing: "border-purple-300 text-purple-900 bg-purple-50 font-semibold",
};

const DARK_STYLES = {
  // Success / Green (AAA on dark)
  published: "border-emerald-500/40 text-emerald-300 bg-emerald-950/40 font-semibold",
  selected: "border-emerald-500/40 text-emerald-300 bg-emerald-950/40 font-semibold",
  converted: "border-emerald-500/40 text-emerald-300 bg-emerald-950/40 font-semibold",
  sold: "border-emerald-500/40 text-emerald-300 bg-emerald-950/40 font-semibold",
  active: "border-emerald-500/40 text-emerald-300 bg-emerald-950/40 font-semibold",

  // Primary / Blue (AAA on dark)
  new: "border-blue-500/40 text-blue-300 bg-blue-950/40 font-semibold",
  negotiation: "border-blue-500/40 text-blue-300 bg-blue-950/40 font-semibold",

  // Warning / Amber (AAA on dark)
  draft: "border-amber-500/40 text-amber-300 bg-amber-950/40 font-semibold",
  "under review": "border-amber-500/40 text-amber-300 bg-amber-950/40 font-semibold",
  reviewing: "border-amber-500/40 text-amber-300 bg-amber-950/40 font-semibold",
  contacted: "border-amber-500/40 text-amber-300 bg-amber-950/40 font-semibold",
  "site visit": "border-amber-500/40 text-amber-300 bg-amber-950/40 font-semibold",
  "follow up": "border-amber-500/40 text-amber-300 bg-amber-950/40 font-semibold",
  "pending review": "border-amber-500/40 text-amber-300 bg-amber-950/40 font-semibold",
  inspection: "border-amber-500/40 text-amber-300 bg-amber-950/40 font-semibold",

  // Teal / Verified (AAA on dark)
  shortlisted: "border-teal-500/40 text-teal-300 bg-teal-950/40 font-semibold",
  qualified: "border-teal-500/40 text-teal-300 bg-teal-950/40 font-semibold",

  // Purple / Interview (AAA on dark)
  interview: "border-purple-500/40 text-purple-300 bg-purple-950/40 font-semibold",
  "interview scheduled": "border-purple-500/40 text-purple-300 bg-purple-950/40 font-semibold",

  // Destructive / Red (AAA on dark)
  rejected: "border-rose-500/40 text-rose-300 bg-rose-950/40 font-semibold",
  lost: "border-rose-500/40 text-rose-300 bg-rose-950/40 font-semibold",

  // Neutral / Slate (AAA on dark)
  closed: "border-zinc-600/40 text-zinc-300 bg-zinc-800/40 font-semibold",
  archived: "border-zinc-600/40 text-zinc-300 bg-zinc-800/40 font-semibold",
  withdrawn: "border-zinc-600/40 text-zinc-300 bg-zinc-800/40 font-semibold",
  inactive: "border-zinc-600/40 text-zinc-300 bg-zinc-800/40 font-semibold",

  // Roles
  admin: "border-[var(--admin-accent)] text-[var(--admin-accent)] bg-[var(--admin-surface-2)] font-semibold",
  sales: "border-blue-500/40 text-blue-300 bg-blue-950/40 font-semibold",
  marketing: "border-purple-500/40 text-purple-300 bg-purple-950/40 font-semibold",
};

/**
 * Standardized Semantic Status Badge (Dual-Theme Contrast Verified)
 */
export default function StatusBadge({ status, className = "" }) {
  const themeCtx = useContext(AdminThemeContext);
  const isLight = themeCtx?.resolvedTheme === "light";

  if (!status) return null;
  const key = String(status).trim().toLowerCase();

  const stylesMap = isLight ? LIGHT_STYLES : DARK_STYLES;
  const fallback = isLight
    ? "border-zinc-300 text-zinc-800 bg-zinc-100 font-semibold"
    : "border-zinc-600/40 text-zinc-300 bg-zinc-800/40 font-semibold";

  const style = stylesMap[key] || fallback;

  return (
    <span
      className={`inline-block text-[10.5px] tracking-[0.08em] uppercase px-2.5 py-0.5 rounded-md border font-medium font-mono shadow-2xs ${style} ${className}`}
    >
      {status}
    </span>
  );
}
