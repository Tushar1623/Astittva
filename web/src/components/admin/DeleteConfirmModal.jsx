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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF8F5] border border-rose-300 rounded-[8px] max-w-md w-full p-6 text-[#1C1C1C] shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-medium text-[#1C1C1C]">{title}</h3>
            <p className="text-xs text-[#1C1C1C]/75 mt-1 leading-relaxed">
              Are you sure you want to permanently delete this {itemType.toLowerCase()}:{" "}
              <strong className="text-[#1C1C1C] font-semibold">{itemName}</strong>?
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-[4px] text-[11px] text-rose-800 leading-relaxed space-y-1">
          <div className="font-semibold text-rose-700 flex items-center gap-1.5">
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
            className="px-4 py-2 border border-copper/30 hover:border-copper text-[#1C1C1C] hover:bg-white text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors disabled:opacity-50 shadow-md cursor-pointer"
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
