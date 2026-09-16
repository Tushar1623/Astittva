import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export default function AdminPageHeader({
  overline,
  title,
  actionLabel,
  actionTo,
  actionOnClick,
  actionTestId,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-12">
      <div>
        {overline && <div className="overline mb-3">{overline}</div>}
        <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
          {title}
        </h1>
      </div>
      {actionLabel && actionTo && (
        <Link to={actionTo} data-testid={actionTestId} className="btn-primary">
          <Plus className="w-4 h-4" /> {actionLabel}
        </Link>
      )}
      {actionLabel && actionOnClick && (
        <button
          onClick={actionOnClick}
          data-testid={actionTestId}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> {actionLabel}
        </button>
      )}
    </div>
  );
}
