"use client";

interface NotesInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function NotesInput({ value, onChange }: NotesInputProps) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      placeholder="Anything to note about today..."
      rows={2}
      className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-primary placeholder:text-secondary/60 outline-none focus:border-accent"
    />
  );
}
