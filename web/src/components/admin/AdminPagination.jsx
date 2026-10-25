import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Standardized Admin Table Pagination Bar
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
    <div className="px-4 py-3 bg-charcoal border-t border-copper/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/60">
      <div>
        Showing <strong className="text-ivory">{startItem}</strong> to{" "}
        <strong className="text-ivory">{endItem}</strong> of{" "}
        <strong className="text-copper">{totalItems}</strong> {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2.5 py-1 border border-copper/20 hover:border-copper rounded-[3px] disabled:opacity-30 disabled:pointer-events-none transition-colors text-ivory/80 hover:text-white"
        >
          <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
          Prev
        </button>
        <div className="font-mono text-xs px-2">
          Page <strong className="text-ivory">{currentPage}</strong> of {totalPages}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1 border border-copper/20 hover:border-copper rounded-[3px] disabled:opacity-30 disabled:pointer-events-none transition-colors text-ivory/80 hover:text-white"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
        </button>
      </div>
    </div>
  );
}
