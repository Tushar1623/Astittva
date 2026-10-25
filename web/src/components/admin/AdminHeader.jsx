import React, { isValidElement } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";

/**
 * Render an individual action configuration object or passthrough React node.
 * This ensures that configuration objects with { label, icon, variant, onClick, to }
 * are rendered as valid interactive React elements (buttons/links) and never as raw child objects.
 */
function renderAction(action, index) {
  if (!action) return null;

  // If already a valid React element (e.g. <Link ...>, <button ...>, or custom JSX), render directly
  if (isValidElement(action)) {
    return React.cloneElement(action, { key: action.key || index });
  }

  // If primitive (string, number), render in span
  if (typeof action !== "object") {
    return <span key={index}>{action}</span>;
  }

  // Destructure configuration properties
  const {
    label,
    icon: Icon,
    to,
    onClick,
    variant = "outline",
    disabled = false,
    className = "",
    target,
    rel,
    testId,
    title,
  } = action;

  // Determine styling based on semantic variant
  let variantClasses =
    "border border-copper/30 hover:border-copper text-ivory/80 hover:text-white bg-charcoal/40";
  if (variant === "primary") {
    variantClasses =
      "bg-copper hover:bg-copper-light text-white font-semibold shadow-sm border border-copper";
  } else if (variant === "destructive") {
    variantClasses =
      "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium";
  } else if (variant === "secondary") {
    variantClasses =
      "bg-charcoal-2/60 hover:bg-charcoal-2 text-ivory border border-copper/20 font-medium";
  }

  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.15em] rounded-[4px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const finalClass = `${baseClasses} ${variantClasses} ${className}`.trim();

  // Safely render icon: could be a Lucide component, a function, or a pre-instantiated element
  let iconElement = null;
  if (Icon) {
    if (isValidElement(Icon)) {
      iconElement = Icon;
    } else if (typeof Icon === "function") {
      iconElement = <Icon className="w-3.5 h-3.5 shrink-0" />;
    }
  }

  const content = (
    <>
      {iconElement}
      {label && <span>{label}</span>}
    </>
  );

  const key = action.key || (label ? `admin-action-${label}-${index}` : `action-${index}`);

  // If `to` is provided, render as React Router <Link> or external <a>
  if (to) {
    const isExternal = typeof to === "string" && (to.startsWith("http://") || to.startsWith("https://") || target === "_blank");
    if (isExternal) {
      return (
        <a
          key={key}
          href={to}
          target={target || "_blank"}
          rel={rel || "noopener noreferrer"}
          className={finalClass}
          title={title || label}
          data-testid={testId}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        key={key}
        to={to}
        target={target}
        rel={rel}
        className={finalClass}
        title={title || label}
        data-testid={testId}
      >
        {content}
      </Link>
    );
  }

  // Otherwise, render as a button
  return (
    <button
      key={key}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={finalClass}
      title={title || label}
      data-testid={testId}
    >
      {content}
    </button>
  );
}

/**
 * Standardized Admin Page Header Component
 *
 * @param {string} category - Overline category (e.g. "INVENTORY", "EDITORIAL", "LEAD MANAGEMENT")
 * @param {string} [subcategory] - Optional subcategory / breadcrumb (e.g. "PROPERTIES", "BLOGS")
 * @param {string} title - Main page heading
 * @param {string} [subtitle] - Contextual description
 * @param {Array<Object>|React.ReactNode} [actions] - Action configuration objects [{ label, icon, to, onClick, variant }] or JSX elements
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
  // Parse and safely render actions whether passed as an array of config objects, single object, or JSX
  let renderedActions = null;
  if (actions) {
    if (Array.isArray(actions)) {
      renderedActions = actions.map((act, idx) => renderAction(act, idx));
    } else {
      renderedActions = renderAction(actions, 0);
    }
  }

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
        {renderedActions}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh data"
            className="p-2 border border-copper/20 hover:border-copper/40 text-ivory/70 hover:text-copper rounded-[4px] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
}
