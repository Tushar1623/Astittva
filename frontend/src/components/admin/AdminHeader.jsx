import React from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";

/**
 * Standardized Admin Page Header Component
 *
 * @param {string} category - Overline category (e.g. "INVENTORY", "EDITORIAL", "LEAD MANAGEMENT")
 * @param {string} [subcategory] - Optional subcategory / breadcrumb (e.g. "PROPERTIES", "BLOGS")
 * @param {string} title - Main page heading
 * @param {string} [subtitle] - Contextual description
 * @param {React.ReactNode} [actions] - Action buttons or links on the right
 * @param {Function} [onRefresh] - Optional refresh button handler
 * @param {boolean} [refreshing] - Loading state for refresh button
 */
export default function AdminHeader({
  category,
  subcategory,
  title,
  subtitle,
  actions,
  onRefresh,
  refreshing = false,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-copper/15">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {category && (
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper">
              {category}
            </span>
          )}
          {subcategory && (
            <>
              <span className="text-ivory/30">•</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/50">
                {subcategory}
              </span>
            </>
          )}
        </div>
        <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
          {title}
        </h1>
        {subtitle && (
          <p className="text-ivory/55 text-sm mt-1 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {actions}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh data"
            className="p-2 border border-copper/20 hover:border-copper/40 text-ivory/70 hover:text-copper rounded-[4px] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
}
