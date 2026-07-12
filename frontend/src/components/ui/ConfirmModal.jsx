import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Proceed", 
  cancelText = "Cancel",
  variant = "primary" // "primary", "danger", "warning"
}) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconColor: "text-status-danger bg-status-danger/8 border-status-danger/15",
          btnVariant: "danger"
        };
      case "warning":
        return {
          iconColor: "text-status-warning bg-status-warning/8 border-status-warning/15",
          btnVariant: "warning"
        };
      default:
        return {
          iconColor: "text-accent-purple bg-accent-purple/8 border-accent-purple/15",
          btnVariant: "primary"
        };
    }
  };

  const { iconColor, btnVariant } = getVariantStyles();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black cursor-pointer"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-md overflow-hidden rounded-xl border border-border-primary bg-bg-card p-5 shadow-2xl z-10 space-y-4"
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border shrink-0 ${iconColor}`}>
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">{title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-bg-secondary text-text-muted hover:text-text-primary rounded-md transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Message */}
          <p className="text-xs text-text-secondary leading-relaxed pl-1.5 pr-2.5">
            {message}
          </p>

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border-primary/60">
            <Button
              variant="secondary"
              onClick={onClose}
              size="sm"
            >
              {cancelText}
            </Button>
            <Button
              variant={btnVariant}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              size="sm"
            >
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
