import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Standardized Admin Table Pagination Bar (Theme Adaptive)
 */
export default function AdminPagination({
  totalItems,
  currentPage,
  pageSize = 15,
  onPageChange,
  itemLabel = "records",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className="px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors"
      style={{
        backgroundColor: "var(--admin-surface-2)",
        borderColor: "var(--admin-border)",
        color: "var(--admin-text-secondary)",
      }}
    >
      <div>
        Showing <strong className="text-[var(--admin-text-primary)] font-semibold">{startItem}</strong> to{" "}
        <strong className="text-[var(--admin-text-primary)] font-semibold">{endItem}</strong> of{" "}
        <strong className="text-[var(--admin-accent)] font-semibold">{totalItems}</strong> {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2.5 py-1 rounded-md border border-[var(--admin-border)] hover:border-[var(--admin-accent)] disabled:opacity-40 disabled:pointer-events-none transition-colors text-[var(--admin-text-primary)] bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-hover)] cursor-pointer shadow-2xs font-medium"
        >
          <ChevronLeft className="w-3.5 h-3.5 inline mr-1 text-[var(--admin-accent)]" />
          Prev
        </button>
        <div className="font-mono text-xs px-2 text-[var(--admin-text-secondary)]">
          Page <strong className="text-[var(--admin-text-primary)] font-semibold">{currentPage}</strong> of {totalPages}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1 rounded-md border border-[var(--admin-border)] hover:border-[var(--admin-accent)] disabled:opacity-40 disabled:pointer-events-none transition-colors text-[var(--admin-text-primary)] bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-hover)] cursor-pointer shadow-2xs font-medium"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5 inline ml-1 text-[var(--admin-accent)]" />
        </button>
      </div>
    </div>
  );
}
