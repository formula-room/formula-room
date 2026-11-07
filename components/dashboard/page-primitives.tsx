import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const premiumSelectTriggerClass =
  "h-10 rounded-[8px] border border-[var(--color-line2)] bg-white px-4 text-ink shadow-none hover:border-[var(--color-line3)] hover:bg-white";

export const premiumSelectContentClass =
  "border border-[var(--color-line2)] bg-white text-ink shadow-[0_12px_32px_rgba(23,20,15,0.10)]";

export const premiumInputClass =
  "h-10 w-full rounded-[8px] border border-[var(--color-line2)] bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink3 focus:border-[var(--color-line3)] focus:bg-white";

export const premiumSegmentedListClass =
  "flex h-auto w-fit flex-wrap justify-start gap-1 rounded-[10px] border border-[var(--color-line2)] bg-white p-1";

export const premiumSegmentedTriggerClass =
  "rounded-[7px] border border-transparent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.8px] text-ink3 transition-all hover:text-ink data-[state=active]:bg-ink data-[state=active]:text-white";

export const premiumTabsListClass = premiumSegmentedListClass;

export const premiumTabsTriggerClass = premiumSegmentedTriggerClass;

export function premiumSegmentedButtonClass(active: boolean) {
  return cn(
    "rounded-[7px] border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.8px] transition-colors",
    active
      ? "border-ink bg-ink text-white"
      : "border-transparent bg-transparent text-ink3 hover:bg-[var(--color-bg)] hover:text-ink",
  );
}

type DashboardPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: string[];
  actions?: ReactNode;
};

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="mb-3 text-[11px] font-medium uppercase tracking-[2px] text-ink3">
          {eyebrow}
        </div>
        <h1 className="font-display text-[64px] leading-[0.9] tracking-[1px] text-ink sm:text-[78px]">
          {title}
        </h1>
        {description ? (
          <div className="mt-4 max-w-3xl text-sm leading-6 text-ink2">
            {description}
          </div>
        ) : null}
        {meta?.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink3">
            {meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ) : null}
      </div>

      {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
    </section>
  );
}

export function DashboardPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[14px] border border-[var(--color-line2)] bg-white p-4 lg:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function DataTableShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FilterPill({
  active,
  children,
  onClick,
  className,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(premiumSegmentedButtonClass(active), className)}
    >
      {children}
    </button>
  );
}

export function DashCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white", className)}>
      {children}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  onClear,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Shows a clear button while there is text. */
  onClear?: () => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full sm:w-[260px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink3" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-full border border-[var(--color-line2)] bg-white pl-9 pr-9 text-sm text-ink outline-none transition focus:border-[var(--color-red-border)] focus:bg-white"
      />
      {onClear && value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink3 transition-colors hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </label>
  );
}

export function DashCardHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-[var(--color-line)] px-7 py-5">
      <div>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">{eyebrow}</p>
        <h2 className="font-display text-[24px] leading-none tracking-[1px] text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({
  status,
  size = "md",
}: {
  status: "done" | "live" | "upcoming" | "next";
  size?: "sm" | "md";
}) {
  const base = size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]";
  const styles = {
    done: "border border-[var(--color-done-border)] bg-[var(--color-done-bg)] text-[var(--color-done)]",
    live: "bg-[var(--color-red)] text-white",
    upcoming: "border border-[var(--color-up-border)] bg-[var(--color-up-bg)] text-[var(--color-up)]",
    next: "border border-[var(--color-red-border)] bg-[var(--color-red-bg)] text-[var(--color-red)]",
  };
  const labels = { done: "Completed", live: "Live", upcoming: "Upcoming", next: "Next Race" };

  return (
    <span className={cn("inline-block rounded-[3px] font-semibold uppercase tracking-[0.8px]", base, styles[status])}>
      {status === "live" ? (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white align-middle animate-pulse" />
      ) : null}
      {labels[status]}
    </span>
  );
}

export function TeamStripe({ teamColor }: { teamColor: string }) {
  return (
    <div
      className="h-7 w-[3px] flex-shrink-0 rounded-[2px]"
      style={{ backgroundColor: teamColor }}
    />
  );
}

export function PosBadge({ pos }: { pos: number }) {
  const styles = [
    "",
    "bg-[rgba(138,104,32,0.12)] text-[#8A6820]",
    "bg-[rgba(106,106,106,0.10)] text-[#6A6A6A]",
    "bg-[rgba(139,94,42,0.10)] text-[#8B5E2A]",
  ];

  return (
    <div className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[6px] font-display text-[13px]", styles[pos] || "bg-[var(--color-bg2)] text-ink3")}>
      {String(pos).padStart(2, "0")}
    </div>
  );
}

const teamRgb: Record<string, string> = {
  mercedes: "0,137,123",
  ferrari: "232,0,45",
  redbull: "30,91,191",
  mclaren: "217,110,0",
  aston: "0,85,72",
  williams: "55,176,232",
  alpine: "255,75,125",
  haas: "176,176,176",
  sauber: "0,231,1",
  rb: "102,146,255",
  cadillac: "139,0,0",
  audi: "192,170,0",
};

function teamVar(teamId?: string, fallback?: string) {
  if (fallback) {
    return fallback;
  }

  return teamId ? `var(--team-${teamId}, var(--color-red))` : "var(--color-red)";
}

export function MedalPos({ pos }: { pos: number }) {
  const medalStyles: Record<number, string> = {
    1: "bg-[rgba(138,104,32,0.12)] text-[var(--color-gold)]",
    2: "bg-[rgba(106,106,106,0.10)] text-[var(--color-silver)]",
    3: "bg-[rgba(139,94,42,0.10)] text-[var(--color-bronze)]",
  };

  return (
    <div
      className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] font-display text-[14px] leading-none tracking-[0.5px]",
        medalStyles[pos] || "bg-[var(--color-bg2)] text-ink2",
      )}
    >
      {pos}
    </div>
  );
}

export function TeamStripeV({
  teamId,
  color,
  height = 32,
}: {
  teamId?: string;
  color?: string;
  height?: number;
}) {
  return (
    <div
      className="w-[3px] flex-shrink-0 rounded-full"
      style={{ height, backgroundColor: teamVar(teamId, color) }}
    />
  );
}

export function TeamIconBadge({
  teamId,
  abbr,
  color,
}: {
  teamId?: string;
  abbr: string;
  color?: string;
}) {
  const rgb = teamId ? teamRgb[teamId] : undefined;

  return (
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border text-[10px] font-bold uppercase tracking-[0.5px]"
      style={{
        borderColor: color ? `${color}33` : rgb ? `rgba(${rgb}, 0.24)` : "var(--color-line2)",
        backgroundColor: color ? `${color}14` : rgb ? `rgba(${rgb}, 0.10)` : "var(--color-bg2)",
        color: teamVar(teamId, color),
      }}
      aria-hidden="true"
    >
      {abbr.slice(0, 3)}
    </div>
  );
}
