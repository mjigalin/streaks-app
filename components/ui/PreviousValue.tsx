interface PreviousValueProps {
  label: string | null;
  dayLabel?: string;
}

export default function PreviousValue({
  label,
  dayLabel = "Yesterday",
}: PreviousValueProps) {
  if (!label) return null;

  return (
    <p className="text-xs text-secondary">
      {dayLabel}: <span className="text-primary/70">{label}</span>
    </p>
  );
}
