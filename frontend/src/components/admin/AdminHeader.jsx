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
    "border border-[#D4A359]/30 hover:border-[#D4A359] text-white/90 hover:text-white bg-[#180509]";
  if (variant === "primary") {
    variantClasses =
      "bg-gradient-to-r from-[#B87333] to-[#D4A359] hover:from-[#A06028] hover:to-[#B87333] text-white font-semibold shadow-xs border-0";
  } else if (variant === "destructive") {
    variantClasses =
      "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium";
  } else if (variant === "secondary") {
    variantClasses =
      "bg-[#22070D] hover:bg-[#2F0A12] text-white border border-[#D4A359]/20 font-medium";
  }

  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.14em] rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs font-semibold";
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
  let renderedActions = null;
  if (actions) {
    if (Array.isArray(actions)) {
      renderedActions = actions.map((act, idx) => renderAction(act, idx));
    } else {
      renderedActions = renderAction(actions, 0);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D4A359]/20">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {category && (
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#D4A359]">
              {category}
            </span>
          )}
          {subcategory && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/60">
                {subcategory}
              </span>
            </>
          )}
        </div>
        <h1 className="font-serif-display font-medium text-3xl sm:text-4xl text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/60 text-sm mt-1 max-w-3xl leading-relaxed">
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
            className="p-2.5 border border-[#D4A359]/25 hover:border-[#D4A359] text-white/70 hover:text-[#D4A359] rounded-lg transition-colors disabled:opacity-50 cursor-pointer bg-[#180509]"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
}
