"use client";

import {
  addDays,
  formatDateLabel,
  getTodayStr,
} from "@/lib/dates";

interface DateNavProps {
  currentDate: string;
  onDateChange: (date: string) => void;
}

export default function DateNav({ currentDate, onDateChange }: DateNavProps) {
  const isToday = currentDate === getTodayStr();

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onDateChange(addDays(currentDate, -1))}
        className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-primary hover:bg-surface"
        aria-label="Previous day"
      >
        ←
      </button>
      <span className="min-w-[140px] text-center text-sm font-medium text-primary">
        {formatDateLabel(currentDate)}
      </span>
      {!isToday ? (
        <button
          type="button"
          onClick={() => onDateChange(addDays(currentDate, 1))}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-primary hover:bg-surface"
          aria-label="Next day"
        >
          →
        </button>
      ) : (
        <div className="h-11 w-11" />
      )}
    </div>
  );
}
