import type { ReactNode } from "react";

import type { DriverProfile } from "@/lib/head-to-head-data";
import { cn } from "@/lib/utils";
import { raceType } from "@/components/home/rank-row";
import { TeamLogo } from "@/components/home/team-logo";

export type Summary = {
  raceH2H: { driverA: number; driverB: number };
  qualiH2H: { driverA: number; driverB: number };
  winsA: number;
  winsB: number;
  podiumsA: number;
  podiumsB: number;
  polesA: number;
  polesB: number;
  pointsA: number;
  pointsB: number;
  startsA: number;
  startsB: number;
  dnfsA: number;
  dnfsB: number;
};

export type Side = "A" | "B";

/** Summed half points can pick up floating-point noise such as 279.14000000000004. */
export function formatPoints(points: number) {
  return String(Number(points.toFixed(2)));
}

function DuelName({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const family = parts[parts.length - 1] ?? "";
  const given = parts.slice(0, -1).join(" ");

  return (
    <span className="block min-w-0 flex-1 text-ink">
      {given ? <span className={cn("block truncate pr-1 text-[12px] leading-[1.35] tracking-[0.3px] text-ink2", raceType)}>{given}</span> : null}
      <span className={cn("block truncate pr-1.5 text-[23px] leading-[1.25] tracking-[0.3px] sm:text-[26px]", raceType)}>{family}</span>
    </span>
  );
}

function DuelStrip({ side, driver, team }: { side: Side; driver: DriverProfile; team?: string }) {
  const isA = side === "A";

  return (
    <div className={cn("race-strip flex h-[66px] min-w-0 flex-1 -skew-x-12 items-stretch overflow-hidden rounded-[3px]", !isA && "flex-row-reverse")}>
      <div className="w-2 flex-shrink-0" style={{ backgroundColor: isA ? "var(--h2h-a)" : "var(--h2h-b)" }} />
      <div className={cn("flex min-w-0 flex-1 skew-x-12 items-center gap-3 px-4 sm:px-5", !isA && "flex-row-reverse text-right")}>
        <DuelName name={driver.name} />
        {team ? <TeamLogo team={team} /> : null}
      </div>
      <div aria-hidden="true" className="w-1 flex-shrink-0" style={{ backgroundColor: driver.accent }} />
    </div>
  );
}

/** Both drivers, Driver A on the left and Driver B mirrored on the right. */
export function DuelHeader({
  driverA,
  driverB,
  teamA,
  teamB,
}: {
  driverA: DriverProfile;
  driverB: DriverProfile;
  teamA?: string;
  teamB?: string;
}) {
  return (
    <div className="grid items-center gap-2 px-1.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-4">
      <DuelStrip side="A" driver={driverA} team={teamA} />
      <span aria-hidden="true" className={cn("justify-self-center text-[20px] leading-none tracking-[0.5px] text-ink2", raceType)}>VS</span>
      <DuelStrip side="B" driver={driverB} team={teamB} />
    </div>
  );
}

function ValueCell({
  side,
  value,
  leads,
  small,
  title,
}: {
  side: Side;
  value: string;
  leads: boolean;
  small?: boolean;
  title?: string;
}) {
  const stripe = leads ? (
    <span aria-hidden="true" className="w-1.5 flex-shrink-0" style={{ backgroundColor: side === "A" ? "var(--h2h-a)" : "var(--h2h-b)" }} />
  ) : null;

  return (
    <div
      title={title}
      className={cn(
        "flex w-[66px] flex-shrink-0 items-stretch max-[359px]:w-[56px] sm:w-[92px]",
        leads ? "race-black" : "text-ink",
        side === "B" && "flex-row-reverse",
      )}
    >
      {stripe}
      <span className="flex min-w-0 flex-1 skew-x-12 items-center justify-center px-1 text-center">
        <span
          className={cn(
            small
              ? "line-clamp-2 break-words text-[10px] font-semibold leading-[1.15]"
              : cn("whitespace-nowrap text-[18px] leading-none tracking-[0.4px] max-[359px]:text-[16px] sm:text-[23px]", raceType),
          )}
        >
          {value}
        </span>
      </span>
    </div>
  );
}

/** Angled row: Driver A's value, what is being compared, Driver B's value. The leader's cell turns black. */
export function ComparisonRow({
  valueA,
  valueB,
  leader,
  leaderName,
  className,
  smallA,
  smallB,
  children,
}: {
  valueA: string;
  valueB: string;
  leader: Side | null;
  /** Read out in place of the black cell, which screen readers can't see. */
  leaderName?: string;
  className?: string;
  smallA?: boolean;
  smallB?: boolean;
  children: ReactNode;
}) {
  return (
    <li className={cn("race-strip flex min-w-0 -skew-x-12 items-stretch overflow-hidden rounded-[3px]", className)}>
      <ValueCell side="A" value={valueA} leads={leader === "A"} small={smallA} title={smallA ? valueA : undefined} />
      <div className="flex min-w-0 flex-1 skew-x-12 flex-col items-center justify-center px-2 py-1.5 text-center sm:px-3">
        {children}
        {leaderName ? <span className="sr-only">Ahead: {leaderName}</span> : null}
      </div>
      <ValueCell side="B" value={valueB} leads={leader === "B"} small={smallB} title={smallB ? valueB : undefined} />
    </li>
  );
}

export function StatsOverview({
  driverA,
  driverB,
  summary,
}: {
  driverA: DriverProfile;
  driverB: DriverProfile;
  summary: Summary;
}) {
  // Starts count the races both drivers took part in, so they always match and nobody can lead.
  const stats: Array<{ label: string; a: number; b: number; lowerIsBetter?: boolean; format?: (value: number) => string }> = [
    { label: "Race H2H", a: summary.raceH2H.driverA, b: summary.raceH2H.driverB },
    { label: "Qualifying H2H", a: summary.qualiH2H.driverA, b: summary.qualiH2H.driverB },
    { label: "Wins", a: summary.winsA, b: summary.winsB },
    { label: "Podiums", a: summary.podiumsA, b: summary.podiumsB },
    { label: "Pole Positions", a: summary.polesA, b: summary.polesB },
    { label: "Points", a: summary.pointsA, b: summary.pointsB, format: formatPoints },
    { label: "Starts", a: summary.startsA, b: summary.startsB },
    { label: "DNFs", a: summary.dnfsA, b: summary.dnfsB, lowerIsBetter: true },
  ];

  return (
    <ul className="grid gap-x-6 gap-y-3 px-1.5 lg:grid-cols-2">
      {stats.map((stat) => {
        const aLeads = stat.lowerIsBetter ? stat.a < stat.b : stat.a > stat.b;
        const leader: Side | null = stat.a === stat.b ? null : aLeads ? "A" : "B";
        const format = stat.format ?? String;

        return (
          <ComparisonRow
            key={stat.label}
            className="h-[46px]"
            valueA={format(stat.a)}
            valueB={format(stat.b)}
            leader={leader}
            leaderName={leader === "A" ? driverA.name : leader === "B" ? driverB.name : undefined}
          >
            <span className="text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.8px] text-ink sm:text-[11px]">{stat.label}</span>
          </ComparisonRow>
        );
      })}
    </ul>
  );
}
