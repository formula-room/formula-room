import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const premiumSelectTriggerClass =
  "h-12 rounded-full border border-slate-900/10 bg-white/88 px-5 text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-none dark:hover:bg-white/[0.06]";

export const premiumSelectContentClass =
  "border border-slate-900/10 bg-[#fbfaf7] text-slate-950 shadow-[0_18px_44px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[#101722] dark:text-white dark:shadow-[0_18px_44px_rgba(0,0,0,0.28)]";

export const premiumInputClass =
  "h-12 w-full rounded-full border border-slate-900/10 bg-white/82 px-4 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-500 focus:border-[#ff6a3d]/30 focus:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 dark:focus:bg-white/[0.05]";

export const premiumSegmentedListClass =
  "flex h-auto flex-wrap justify-start gap-2 rounded-full border border-slate-900/10 bg-[#2f3540]/94 p-1 shadow-[0_12px_28px_rgba(15,23,42,0.08)] dark:border-white/8 dark:bg-[#0f1520]/88 dark:shadow-none";

export const premiumSegmentedTriggerClass =
  "rounded-full border border-transparent px-5 text-xs uppercase tracking-[0.26em] text-slate-100/90 transition-colors hover:bg-white/[0.05] hover:text-white data-[state=active]:border-slate-950/60 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:text-white/62 dark:hover:bg-white/[0.06] dark:hover:text-white dark:data-[state=active]:border-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950";

export const premiumTabsListClass = premiumSegmentedListClass;

export const premiumTabsTriggerClass = premiumSegmentedTriggerClass;

export function premiumSegmentedButtonClass(active: boolean) {
  return cn(
    "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] transition-colors",
    active
      ? "border-slate-950/60 bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:border-white dark:bg-white dark:text-slate-950 dark:shadow-none"
      : "border-transparent bg-transparent text-slate-100/90 hover:bg-white/[0.05] hover:text-white dark:text-white/56 dark:hover:bg-white/[0.08] dark:hover:text-white",
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
      <div className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.38em] text-slate-500 dark:text-white/38">
          {eyebrow}
        </div>
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <div className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-white/52">
            {description}
          </div>
        ) : null}
        {meta?.length ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-white/52">
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
        "rounded-[2rem] border border-white/10 bg-[#0f1520]/88 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.3)] lg:p-5",
        "border-slate-900/10 bg-[#2f3540]/92 shadow-[0_24px_80px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-[#0f1520]/88 dark:shadow-[0_24px_80px_rgba(0,0,0,0.3)]",
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
        "overflow-hidden rounded-[1.75rem] border border-white/8 bg-[#0b111a]/88",
        "border-slate-900/10 bg-[#161d28]/92 dark:border-white/8 dark:bg-[#0b111a]/88",
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
