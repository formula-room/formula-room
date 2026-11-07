import { cn } from "@/lib/utils";

export function TogglePair<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly [T, T] | readonly T[];
  value: T;
  onChange: (value: T) => void;
  labels?: Partial<Record<T, string>>;
}) {
  return (
    <div className="grid h-10 grid-cols-2 gap-0.5 rounded-[8px] border border-[var(--color-line2)] bg-white p-[3px]">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-[5px] text-center text-[11px] font-medium uppercase tracking-[0.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-red)]",
            value === option ? "race-selected" : "text-ink hover:text-[var(--color-red)]",
          )}
        >
          {labels?.[option] ?? option}
        </button>
      ))}
    </div>
  );
}
