/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn, Download } from "lucide-react";

export default function ImageModal({ isOpen, onClose, imageUrl, title }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", title || "download.jpg");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      // Fallback: open in new window
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#09090B]/85 backdrop-blur-md cursor-zoom-out"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative bg-bg-card border border-border-primary rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl z-10"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between border-b border-border-primary px-5 py-3.5 bg-bg-secondary/40">
              <span className="text-xs font-semibold text-text-primary truncate max-w-xs sm:max-w-md">
                {title || "Photo Viewer"}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownload}
                  title="Download Image"
                  className="rounded-lg p-1.5 text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
                >
                  <Download className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => window.open(imageUrl, "_blank")}
                  title="Open original"
                  className="rounded-lg p-1.5 text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
                >
                  <ZoomIn className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={onClose}
                  title="Close (Esc)"
                  className="rounded-lg p-1.5 text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-bg-secondary/20 p-6 flex items-center justify-center overflow-auto select-none min-h-0">
              <img
                src={imageUrl}
                alt={title || "Asset View"}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md pointer-events-none"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
