import React from "react";
import { FolderOpen } from "lucide-react";

/**
 * Standardized Empty State Component for Admin Tables
 */
export default function AdminEmptyState({
  icon: Icon = FolderOpen,
  title = "No records found",
  message = "No items matched your search or filter criteria.",
  onClearFilters,
}) {
  return (
    <div className="text-center py-20 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[6px] space-y-2">
      <Icon className="w-8 h-8 text-copper/40 mx-auto mb-2" strokeWidth={1.5} />
      <p className="text-sm font-normal text-ivory/70 not-italic">{title}</p>
      {message && <p className="text-xs text-ivory/50 not-italic">{message}</p>}
      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 text-xs text-copper underline underline-offset-4 hover:text-copper-light not-italic transition-colors"
        >
          Clear filters and show all records
        </button>
      )}
    </div>
  );
}
