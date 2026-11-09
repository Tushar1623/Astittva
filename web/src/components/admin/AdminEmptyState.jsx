import React from "react";
import { Link } from "react-router-dom";
import { FolderOpen } from "lucide-react";

/**
 * Standardized Empty State Component for Admin Tables (Theme Adaptive)
 */
export default function AdminEmptyState({
  icon: Icon = FolderOpen,
  title = "No records found",
  message = "No items matched your search or filter criteria.",
  onClearFilters,
  actionLabel,
  actionTo,
  onAction,
}) {
  const finalActionLabel = actionLabel || (onClearFilters ? "Clear filters and show all records" : null);
  const handleAction = onAction || onClearFilters;

  return (
    <div
      className="text-center py-16 px-6 border rounded-lg space-y-2.5 shadow-2xs transition-colors"
      style={{
        backgroundColor: "var(--admin-surface)",
        borderColor: "var(--admin-border)",
      }}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--admin-surface-2)] border border-[var(--admin-border)] flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-[var(--admin-accent)]" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-semibold text-[var(--admin-text-primary)]">{title}</p>
      {message && (
        <p className="text-xs text-[var(--admin-text-secondary)] max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      )}

      {actionTo && finalActionLabel && (
        <Link
          to={actionTo}
          className="btn-admin-primary mt-4 inline-flex shadow-xs"
        >
          {finalActionLabel}
        </Link>
      )}

      {!actionTo && handleAction && finalActionLabel && (
        <button
          type="button"
          onClick={handleAction}
          className="mt-3 text-xs font-semibold text-[var(--admin-accent)] underline underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer"
        >
          {finalActionLabel}
        </button>
      )}
    </div>
  );
}
