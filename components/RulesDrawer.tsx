"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RULES_OUT, RULES_IN, CHALLENGE_MONTH } from "@/lib/rules";

interface RulesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function RulesDrawer({ open, onClose }: RulesDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[min(320px,85vw)] flex-col border-l border-border bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <h2 className="text-lg font-bold text-primary">Rules</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-secondary hover:text-primary"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              <p className="text-xs text-secondary">{CHALLENGE_MONTH} challenge</p>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-destructive">
                  Out for the month
                </h3>
                <ul className="space-y-2">
                  {RULES_OUT.map((rule) => (
                    <li
                      key={rule}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary"
                    >
                      {rule}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-success">
                  In place all month
                </h3>
                <ul className="space-y-2">
                  {RULES_IN.map((rule) => (
                    <li
                      key={rule}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary"
                    >
                      {rule}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">
                  Weekly
                </h3>
                <ul className="space-y-2 text-sm text-primary">
                  <li className="rounded-lg border border-border bg-background px-3 py-2">
                    Date night with Sarah
                  </li>
                  <li className="rounded-lg border border-border bg-background px-3 py-2">
                    Sunday: 45-min review — wins, misses, next week&apos;s one
                    priority
                  </li>
                </ul>
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
