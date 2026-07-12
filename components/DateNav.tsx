"use client";

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const compare = new Date(dateStr + "T12:00:00");
  compare.setHours(12, 0, 0, 0);

  if (compare.getTime() === today.getTime()) {
    return `Today, ${date.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`;
  }
  if (compare.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

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

export { getTodayStr, addDays };
