import { cn } from "@/lib/utils";

export type RaceStatus = "done" | "next" | "upcoming";

const config: Record<RaceStatus, { label: string; className: string }> = {
  done: {
    label: "Completed",
    className: "border border-[var(--cal-done-border)] bg-[var(--cal-done-bg)] text-[var(--cal-done)]",
  },
  next: {
    label: "Next Race",
    className: "border border-[var(--cal-next-border)] bg-[var(--cal-next-bg)] text-[var(--cal-next)]",
  },
  upcoming: {
    label: "Upcoming",
    className: "border border-[var(--cal-up-border)] bg-[var(--cal-up-bg)] text-[var(--cal-up)]",
  },
};

export function RaceStatusBadge({ status }: { status: RaceStatus }) {
  const item = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.8px]",
        item.className,
      )}
    >
      <span className={cn("h-[5px] w-[5px] rounded-full bg-current", status === "next" && "animate-pulse")} />
      {item.label}
    </span>
  );
}
