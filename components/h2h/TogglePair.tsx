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
    <div className="grid grid-cols-2 gap-0.5 rounded-[8px] border border-[var(--color-line2)] bg-[var(--color-bg)] p-[3px]">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-[6px] py-2 text-center text-[11px] font-medium uppercase tracking-[0.5px] transition-all",
            value === option
              ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              : "text-ink3 hover:text-ink2",
          )}
        >
          {labels?.[option] ?? option}
        </button>
      ))}
    </div>
  );
}
