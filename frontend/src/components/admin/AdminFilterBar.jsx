import React from "react";
import { Search, X, ArrowUpDown } from "lucide-react";

/**
 * Standardized Admin Search and Filter Toolbar
 */
export default function AdminFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search records...",
  statusFilter,
  onStatusChange,
  statusOptions = [],
  statusCounts = {},
  totalCount,
  children,
}) {
  return (
    <div className="bg-charcoal-2/40 border border-copper/15 p-4 rounded-[6px] space-y-3">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Status Filter Tabs */}
        {statusOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {statusOptions.map((st) => {
              const isActive = statusFilter === st;
              const count = st === "ALL" || st === "All" ? totalCount : statusCounts[st];
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onStatusChange && onStatusChange(st)}
                  className={`px-3 py-1.5 rounded-[4px] text-xs font-medium tracking-[0.08em] uppercase transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-copper text-white font-semibold shadow-sm"
                      : "bg-charcoal/60 text-ivory/70 hover:text-ivory hover:bg-charcoal"
                  }`}
                >
                  {st}
                  {typeof count === "number" ? ` (${count})` : ""}
                </button>
              );
            })}
          </div>
        )}

        {/* Search Input and Secondary Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {children}

          {typeof search === "string" && (
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-8 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-ivory"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
