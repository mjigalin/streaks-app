"use client";

interface SliderInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  minLabel: string;
  maxLabel: string;
}

export default function SliderInput({
  value,
  onChange,
  minLabel,
  maxLabel,
}: SliderInputProps) {
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    const newValue = Math.min(10, Math.max(1, Math.round(ratio * 9 + 1)));
    onChange(newValue === value ? null : newValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-secondary">{minLabel}</span>
        <span className="text-3xl font-bold tabular-nums text-primary">
          {value ?? "—"}
        </span>
        <span className="text-xs text-secondary">{maxLabel}</span>
      </div>
      <div
        className="relative h-8 cursor-pointer"
        onClick={handleTrackClick}
        role="slider"
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value ?? undefined}
      >
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-border" />
        <div className="absolute top-1/2 flex w-full -translate-y-1/2 justify-between px-0.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className={`h-2 w-2 rounded-full ${
                value !== null && n <= value ? "bg-accent" : "bg-border"
              }`}
            />
          ))}
        </div>
        {value !== null && (
          <div
            className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-lg"
            style={{ left: `${((value - 1) / 9) * 100}%` }}
          />
        )}
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value ?? 5}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sr-only"
        aria-hidden
      />
    </div>
  );
}
