"use client";

import { motion } from "framer-motion";
import { getTodayStr } from "@/lib/dates";

interface WelcomeBannerProps {
  currentDate: string;
  overallStreak: number;
  trackedToday: number;
  totalMetrics: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getSubMessage(
  overallStreak: number,
  trackedToday: number,
  totalMetrics: number
): string {
  if (trackedToday === totalMetrics) {
    return "All metrics logged — nice work today.";
  }
  if (overallStreak >= 7) {
    return `${overallStreak} days strong. Keep the momentum going.`;
  }
  if (trackedToday > 0) {
    return `${totalMetrics - trackedToday} left to log today. You've got this.`;
  }
  return "Ready to log today? Tap through your metrics below.";
}

export default function WelcomeBanner({
  currentDate,
  overallStreak,
  trackedToday,
  totalMetrics,
}: WelcomeBannerProps) {
  const isToday = currentDate === getTodayStr();

  if (!isToday) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-surface px-4 py-4"
      >
        <p className="text-sm text-secondary">Viewing a past day</p>
        <p className="text-xs text-secondary/70">
          Edit and save — changes sync automatically.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-gradient-to-br from-surface to-background px-4 py-4"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-accent">
        {getGreeting()}
      </p>
      <h2 className="mt-1 text-2xl font-bold text-primary">Hey Matt!</h2>
      <p className="mt-1 text-sm text-secondary">
        {getSubMessage(overallStreak, trackedToday, totalMetrics)}
      </p>
    </motion.div>
  );
}
