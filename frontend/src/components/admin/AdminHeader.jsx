import React, { isValidElement } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";

/**
 * Render an individual action configuration object or passthrough React node.
 */
function renderAction(action, index) {
  if (!action) return null;

  if (isValidElement(action)) {
    return React.cloneElement(action, { key: action.key || index });
  }

  if (typeof action !== "object") {
    return <span key={index}>{action}</span>;
  }

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

  let variantClasses =
    "border border-[var(--admin-border)] hover:border-[var(--admin-accent)] text-[var(--admin-text-primary)] bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-hover)]";
  if (variant === "primary") {
    variantClasses =
      "bg-gradient-to-r from-[#B87333] to-[#D4A359] hover:from-[#A06028] hover:to-[#B87333] text-white font-semibold shadow-xs border-0";
  } else if (variant === "destructive") {
    variantClasses =
      "bg-[var(--admin-error-bg)] hover:bg-rose-500/20 text-[var(--admin-error)] border border-[var(--admin-error-border)] font-medium";
  } else if (variant === "secondary") {
    variantClasses =
      "bg-[var(--admin-surface-2)] hover:bg-[var(--admin-surface-hover)] text-[var(--admin-text-primary)] border border-[var(--admin-border)] font-medium";
  }

  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs uppercase tracking-[0.1em] rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs font-semibold";
  const finalClass = `${baseClasses} ${variantClasses} ${className}`.trim();

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

  if (to) {
    const isExternal =
      typeof to === "string" &&
      (to.startsWith("http://") || to.startsWith("https://") || target === "_blank");
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
 * Standardized Admin Page Header Component (Theme Adaptive)
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
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b transition-colors"
      style={{ borderColor: "var(--admin-border)" }}
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          {category && (
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--admin-accent)]">
              {category}
            </span>
          )}
          {subcategory && (
            <>
              <span className="text-[var(--admin-text-muted)] opacity-40">•</span>
              <span className="text-[11px] tracking-[0.18em] uppercase text-[var(--admin-text-muted)] font-medium">
                {subcategory}
              </span>
            </>
          )}
        </div>
        <h1
          className="font-serif-display font-medium text-2xl sm:text-3xl lg:text-4xl tracking-tight transition-colors"
          style={{ color: "var(--admin-text-primary)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-sm mt-1 max-w-3xl leading-relaxed transition-colors"
            style={{ color: "var(--admin-text-secondary)" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {renderedActions}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh data"
            aria-label="Refresh data"
            className="p-2 border border-[var(--admin-border)] hover:border-[var(--admin-accent)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] rounded-md transition-colors disabled:opacity-50 cursor-pointer bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-hover)] shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
    </div>
  );
}
