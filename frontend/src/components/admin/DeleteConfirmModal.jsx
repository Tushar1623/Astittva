import React from "react";
import { Trash2, AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Standardized Admin Delete Confirmation Modal
 * Replaces raw browser `window.confirm()` across all admin modules.
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {string} title - Main confirmation title
 * @param {string} itemName - Name of item being deleted (e.g. Property name, applicant name, user email)
 * @param {string} itemType - Type of item (e.g. "Property", "Blog Post", "Lead", "User")
 * @param {string} [warning] - Custom warning message
 * @param {Function} onConfirm - Action callback when confirmed
 * @param {Function} onCancel - Action callback when cancelled
 * @param {boolean} isDeleting - Loading spinner state during async deletion
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#18181b] border border-red-500/40 rounded-[8px] max-w-md w-full p-6 text-ivory shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display text-ivory">{title}</h3>
            <p className="text-xs text-ivory/70 mt-1 leading-relaxed">
              Are you sure you want to permanently delete this {itemType.toLowerCase()}:{" "}
              <strong className="text-ivory font-semibold">{itemName}</strong>?
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-[4px] text-[11px] text-red-200 leading-relaxed space-y-1">
          <div className="font-semibold text-red-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Permanent Deletion Warning:
          </div>
          <div>
            {warning ||
              `This action is irreversible. All associated data and media references for this ${itemType.toLowerCase()} will be permanently removed.`}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 border border-copper/20 hover:border-copper/40 text-ivory/70 hover:text-ivory text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors disabled:opacity-50 shadow-md"
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
