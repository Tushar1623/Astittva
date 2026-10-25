import React from "react";

const SEMANTIC_STYLES = {
  // Success / Green
  published: "border-green-500/40 text-green-400 bg-green-500/10",
  selected: "border-green-500/40 text-green-400 bg-green-500/10",
  converted: "border-green-500/40 text-green-400 bg-green-500/10",
  sold: "border-green-500/40 text-green-400 bg-green-500/10",
  active: "border-green-500/40 text-green-400 bg-green-500/10",

  // Primary / Blue
  new: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  negotiation: "border-blue-500/40 text-blue-400 bg-blue-500/10",

  // Warning / Amber
  draft: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  "under review": "border-amber-500/40 text-amber-400 bg-amber-500/10",
  reviewing: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  contacted: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  "site visit": "border-amber-500/40 text-amber-400 bg-amber-500/10",
  "follow up": "border-amber-500/40 text-amber-400 bg-amber-500/10",
  "pending review": "border-amber-500/40 text-amber-400 bg-amber-500/10",
  inspection: "border-amber-500/40 text-amber-400 bg-amber-500/10",

  // Emerald / Verified
  shortlisted: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  qualified: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",

  // Purple / Interview
  interview: "border-purple-500/40 text-purple-400 bg-purple-500/10",
  "interview scheduled": "border-purple-500/40 text-purple-400 bg-purple-500/10",

  // Destructive / Red
  rejected: "border-red-500/40 text-red-400 bg-red-500/10",
  lost: "border-red-500/40 text-red-400 bg-red-500/10",

  // Neutral / Slate
  closed: "border-zinc-500/40 text-zinc-400 bg-zinc-500/10",
  archived: "border-zinc-500/40 text-zinc-400 bg-zinc-500/10",
  withdrawn: "border-zinc-500/40 text-zinc-400 bg-zinc-500/10",
  inactive: "border-zinc-500/40 text-zinc-400 bg-zinc-500/10",

  // Roles
  admin: "border-copper text-copper bg-copper/15 font-semibold",
  sales: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  marketing: "border-purple-500/40 text-purple-400 bg-purple-500/10",
};

/**
 * Standardized Semantic Status Badge
 *
 * @param {string} status - Raw status label
 * @param {string} [className] - Optional additional classes
 */
export default function StatusBadge({ status, className = "" }) {
  if (!status) return null;
  const key = String(status).trim().toLowerCase();
  const style = SEMANTIC_STYLES[key] || "border-copper/30 text-copper bg-copper/5";

  return (
    <span
      className={`inline-block text-[10px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-[3px] border font-medium font-mono ${style} ${className}`}
    >
      {status}
    </span>
  );
}
