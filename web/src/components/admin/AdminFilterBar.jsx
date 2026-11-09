import React from "react";
import { Search, X } from "lucide-react";

/**
 * Standardized Admin Search and Filter Toolbar (Theme Adaptive)
 * Supports both statusOptions/statusFilter and tabs/activeTab conventions.
 */
export default function AdminFilterBar({
  search,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search records...",
  statusFilter,
  activeTab,
  onStatusChange,
  onTabChange,
  statusOptions = [],
  statusCounts = {},
  totalCount,
  tabs = [],
  children,
}) {
  const currentSearch = search !== undefined ? search : searchValue || "";
  const currentStatus = statusFilter !== undefined ? statusFilter : activeTab;
  const handleStatusChange = onStatusChange || onTabChange;

  // Normalized list of tabs
  let normalizedTabs = [];
  if (Array.isArray(tabs) && tabs.length > 0) {
    normalizedTabs = tabs.map((t) =>
      typeof t === "string"
        ? { key: t, label: t, count: undefined }
        : { key: t.key ?? t.label, label: t.label ?? t.key, count: t.count }
    );
  } else if (Array.isArray(statusOptions) && statusOptions.length > 0) {
    normalizedTabs = statusOptions.map((st) => {
      const count =
        st === "ALL" || st === "All" ? totalCount : statusCounts[st];
      return { key: st, label: st, count };
    });
  }

  return (
    <div
      className="p-3.5 sm:p-4 rounded-lg border transition-colors space-y-3 shadow-2xs"
      style={{
        backgroundColor: "var(--admin-surface)",
        borderColor: "var(--admin-border)",
      }}
    >
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between">
        {/* Status Filter Tabs */}
        {normalizedTabs.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {normalizedTabs.map((t) => {
              const isActive =
                String(currentStatus).toLowerCase() ===
                String(t.key).toLowerCase();
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleStatusChange && handleStatusChange(t.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium tracking-[0.06em] uppercase transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[var(--admin-brand)] text-[var(--admin-brand-text)] font-semibold shadow-xs"
                      : "bg-[var(--admin-surface-2)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-hover)] border border-[var(--admin-border-subtle)]"
                  }`}
                >
                  {t.label}
                  {typeof t.count === "number" ? ` (${t.count})` : ""}
                </button>
              );
            })}
          </div>
        )}

        {/* Search Input and Secondary Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {children}

          {(typeof search === "string" || typeof searchValue === "string") && (
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-placeholder)] pointer-events-none" />
              <input
                type="text"
                value={currentSearch}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-8 rounded-md text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                style={{
                  backgroundColor: "var(--admin-input-bg)",
                  borderColor: "var(--admin-input-border)",
                  borderWidth: "1px",
                  color: "var(--admin-input-text)",
                }}
              />
              {currentSearch && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-placeholder)] hover:text-[var(--admin-text-primary)] p-0.5 cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
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
