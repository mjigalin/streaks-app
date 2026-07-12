"use client";

import { motion, AnimatePresence } from "framer-motion";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveBarProps {
  status: SaveStatus;
  trackedCount: number;
  totalCount: number;
}

export default function SaveBar({
  status,
  trackedCount,
  totalCount,
}: SaveBarProps) {
  const statusText =
    status === "saving"
      ? "Saving..."
      : status === "saved"
        ? "Saved ✓"
        : status === "error"
          ? "Save failed — retrying..."
          : trackedCount === totalCount
            ? "All tracked"
            : "Unsaved changes";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-surface/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mx-auto flex h-12 max-w-[480px] items-center justify-between px-4 text-sm"
        >
          <span
            className={
              status === "saved"
                ? "text-success"
                : status === "error"
                  ? "text-destructive"
                  : "text-secondary"
            }
          >
            {statusText}
          </span>
          <span className="tabular-nums text-secondary">
            {trackedCount} of {totalCount} tracked
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export type { SaveStatus };
