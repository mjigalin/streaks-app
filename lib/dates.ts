/** Local calendar date helpers — never use toISOString() for YYYY-MM-DD. */

export function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayStr(): string {
  return formatLocalDate(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

export function formatDateLabel(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const today = parseLocalDate(getTodayStr());
  const yesterday = parseLocalDate(getTodayStr());
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) {
    return `Today, ${date.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`;
  }
  if (date.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function getPreviousDayLabel(currentDate: string): string {
  const prevDate = addDays(currentDate, -1);
  const yesterday = addDays(getTodayStr(), -1);
  return prevDate === yesterday ? "Yesterday" : formatDateLabel(prevDate);
}
