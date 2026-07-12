"use client";

import DateNav from "./DateNav";

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  onExport: () => void;
  onLogout: () => void;
}

export default function Header({
  currentDate,
  onDateChange,
  onExport,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[480px] items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onLogout}
          className="text-xs text-secondary hover:text-primary"
        >
          Log out
        </button>
        <DateNav currentDate={currentDate} onDateChange={onDateChange} />
        <button
          type="button"
          onClick={onExport}
          className="text-xs font-medium text-accent hover:text-accent/80"
        >
          Export
        </button>
      </div>
    </header>
  );
}
