"use client";

interface NumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: string;
  placeholder?: string;
}

export default function NumberInput({
  value,
  onChange,
  unit = "kg",
  placeholder = "—",
}: NumberInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.1"
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "" ? null : parseFloat(val));
        }}
        placeholder={placeholder}
        className="w-full border-b border-border bg-transparent py-2 text-lg tabular-nums text-primary outline-none focus:border-accent"
      />
      <span className="text-secondary">{unit}</span>
    </div>
  );
}
