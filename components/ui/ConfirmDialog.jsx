"use client";

import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useBodyScrollLock } from "@/utils/useBodyScrollLock";

// Replaces the browser's native window.confirm() for destructive admin
// actions (delete/remove/replace) with something that matches the rest of
// the app's modal language -- same backdrop/click-away/scale-in pattern as
// RequestWizardModal.jsx and OfferFormModal.jsx.
//
// Callers own the "which row am I confirming" state (e.g. `const
// [pendingDelete, setPendingDelete] = useState(null)`); this component is
// purely presentational -- `open` just gates the render, `onConfirm` does
// the actual delete/PATCH call.
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  useBodyScrollLock(open);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-900/60 dark:bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-h2 text-ink-900 dark:text-white">{title}</h2>
            {description && (
              <p className="mt-2 text-sm text-ink-500 dark:text-surface-400">{description}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant={variant}
                size="sm"
                isLoading={isLoading}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
