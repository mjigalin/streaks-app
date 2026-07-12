"use client";

import { motion, AnimatePresence } from "framer-motion";

type SaveStatus = "synced" | "pending" | "saving" | "saved" | "error";

interface SaveBarProps {
  status: SaveStatus;
  isDirty: boolean;
  trackedCount: number;
  totalCount: number;
  onSaveAll: () => void;
}

function getStatusText(status: SaveStatus, isDirty: boolean): string {
  switch (status) {
    case "saving":
      return "Saving...";
    case "pending":
      return "Auto-saving...";
    case "saved":
    case "synced":
      return "Saved ✓";
    case "error":
      return "Save failed";
    default:
      return isDirty ? "Not saved yet" : "Saved ✓";
  }
}

export default function SaveBar({
  status,
  isDirty,
  trackedCount,
  totalCount,
  onSaveAll,
}: SaveBarProps) {
  const statusText = getStatusText(status, isDirty);
  const showSaveButton = isDirty || status === "error" || status === "pending";

  const statusColor =
    status === "saved" || status === "synced"
      ? "text-success"
      : status === "error"
        ? "text-destructive"
        : status === "saving" || status === "pending"
          ? "text-accent"
          : "text-secondary";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-surface/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-14 max-w-[480px] items-center gap-3 px-4 text-sm">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${status}-${isDirty}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`min-w-[90px] ${statusColor}`}
          >
            {statusText}
          </motion.span>
        </AnimatePresence>

        <div className="flex flex-1 justify-center">
          {showSaveButton && (
            <button
              type="button"
              onClick={onSaveAll}
              disabled={status === "saving"}
              className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Save all
            </button>
          )}
        </div>

        <span className="min-w-[90px] text-right tabular-nums text-secondary">
          {trackedCount} of {totalCount} tracked
        </span>
      </div>
    </div>
  );
}

export type { SaveStatus };
