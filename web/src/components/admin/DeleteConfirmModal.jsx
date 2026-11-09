import React from "react";
import { Trash2, AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Standardized Admin Delete Confirmation Modal (Theme Adaptive)
 * Replaces raw browser `window.confirm()` across all admin modules.
 */
export default function DeleteConfirmModal({
  isOpen,
  title = "Permanently Delete Record",
  itemName,
  itemType = "record",
  warning,
  onConfirm,
  onCancel,
  isDeleting = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn"
    >
      <div
        className="rounded-xl border max-w-md w-full p-6 shadow-2xl space-y-4 transition-colors"
        style={{
          backgroundColor: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
          color: "var(--admin-text-primary)",
        }}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[var(--admin-error-bg)] border border-[var(--admin-error-border)] flex items-center justify-center text-[var(--admin-error)] shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="delete-modal-title"
              className="text-lg font-serif-display font-medium text-[var(--admin-text-primary)]"
            >
              {title}
            </h3>
            <p className="text-xs text-[var(--admin-text-secondary)] mt-1 leading-relaxed">
              Are you sure you want to permanently delete this {itemType.toLowerCase()}:{" "}
              <strong className="text-[var(--admin-text-primary)] font-semibold">{itemName}</strong>?
            </p>
          </div>
        </div>

        <div
          className="p-3.5 rounded-lg border text-xs leading-relaxed space-y-1"
          style={{
            backgroundColor: "var(--admin-error-bg)",
            borderColor: "var(--admin-error-border)",
            color: "var(--admin-error)",
          }}
        >
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Permanent Deletion Warning:
          </div>
          <div className="opacity-90">
            {warning ||
              `This action is irreversible. All associated data and media references for this ${itemType.toLowerCase()} will be permanently removed.`}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 border rounded-md text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--admin-surface-2)",
              borderColor: "var(--admin-border)",
              color: "var(--admin-text-primary)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
