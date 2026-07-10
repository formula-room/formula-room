import type { ComparisonMode, ComparisonScope, ComparisonType, DriverProfile } from "@/lib/head-to-head-data";
import { cn } from "@/lib/utils";
import { getBarWidth, getInitials } from "@/utils/h2h";

type Summary = {
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

function DriverIdentity({
  side,
  driver,
}: {
  side: "a" | "b";
  driver: DriverProfile;
}) {
  const isA = side === "a";

  return (
    <div className="px-6 py-5">
      <div className={cn("flex items-center gap-3", !isA && "flex-row-reverse")}>
        <div
          className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full border-2 font-display text-[18px] tracking-[1px]"
          style={{
            backgroundColor: isA ? "var(--h2h-a-bg)" : "var(--h2h-b-bg)",
            color: isA ? "var(--h2h-a)" : "var(--h2h-b)",
            borderColor: isA ? "var(--h2h-a-border)" : "var(--h2h-b-border)",
          }}
        >
          {getInitials(driver.name)}
        </div>
        <div className={cn(!isA && "text-right")}>
          <p
            className="mb-0.5 text-[10px] font-medium uppercase tracking-[1px]"
            style={{ color: isA ? "var(--h2h-a)" : "var(--h2h-b)" }}
          >
            {isA ? "Driver A" : "Driver B"}
          </p>
          <p className="font-display text-[20px] leading-none tracking-[0.5px] text-ink">
            {driver.name}
          </p>
          <p className="mt-0.5 text-[11px] text-ink3">{driver.shortName}</p>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  valueA,
  valueB,
  index,
}: {
  label: string;
  valueA: number;
  valueB: number;
  index: number;
}) {
  return (
    <div
      className={cn(
        "border-r border-[var(--color-line)] px-6 py-5 last:border-r-0",
        index >= 4 && "border-t border-[var(--color-line)]",
      )}
    >
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[1px] text-ink3">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <span
          className="font-display text-[32px] leading-none tracking-[0.5px]"
          style={{ color: "var(--h2h-a)" }}
        >
          {valueA}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-ink4">vs</span>
        <span
          className="font-display text-[32px] leading-none tracking-[0.5px]"
          style={{ color: "var(--h2h-b)" }}
        >
          {valueB}
        </span>
      </div>
      <div className="relative mt-3 h-[4px] overflow-hidden rounded-full bg-[var(--color-bg2)]">
        <div
          className="absolute left-0 top-0 h-full rounded-full opacity-70"
          style={{
            width: getBarWidth(valueA, valueA, valueB),
            backgroundColor: "var(--h2h-a)",
            animation: "barGrow 1s 0.5s cubic-bezier(0.16,1,0.3,1) both",
          }}
        />
        <div
          className="absolute right-0 top-0 h-full rounded-full opacity-70"
          style={{
            width: getBarWidth(valueB, valueA, valueB),
            backgroundColor: "var(--h2h-b)",
            animation: "barGrow 1s 0.5s cubic-bezier(0.16,1,0.3,1) both",
          }}
        />
      </div>
    </div>
  );
}

export function StatsOverview({
  driverA,
  driverB,
  summary,
  scope,
  type,
  mode,
  loading,
  error,
}: {
  driverA: DriverProfile;
  driverB: DriverProfile;
  summary: Summary | null;
  scope: ComparisonScope;
  type: ComparisonType;
  mode: ComparisonMode;
  loading: boolean;
  error: string | null;
}) {
  const stats = summary
    ? [
        { label: "Race H2H", valueA: summary.raceH2H.driverA, valueB: summary.raceH2H.driverB },
        { label: "Quali H2H", valueA: summary.qualiH2H.driverA, valueB: summary.qualiH2H.driverB },
        { label: "Wins", valueA: summary.winsA, valueB: summary.winsB },
        { label: "Podiums", valueA: summary.podiumsA, valueB: summary.podiumsB },
        { label: "Pole Positions", valueA: summary.polesA, valueB: summary.polesB },
        { label: "Points", valueA: summary.pointsA, valueB: summary.pointsB },
        { label: "Starts", valueA: summary.startsA, valueB: summary.startsB },
        { label: "DNFs", valueA: summary.dnfsA, valueB: summary.dnfsB },
      ]
    : [];

  return (
    <section className="mb-6 overflow-hidden rounded-[16px] border border-[var(--color-line2)] bg-white animate-fade-up animate-fade-up-3">
      <div className="grid border-b border-[var(--color-line2)] lg:grid-cols-[220px_1fr_220px]">
        <DriverIdentity side="a" driver={driverA} />
        <div className="flex flex-col items-center justify-center border-y border-[var(--color-line2)] px-4 py-4 lg:border-x lg:border-y-0">
          <p className="font-display text-[36px] leading-none tracking-[2px] text-ink3">VS</p>
          <p className="mt-1.5 text-center text-[10px] font-medium uppercase tracking-[0.8px] text-ink3">
            {scope} - {type} - {mode}
          </p>
        </div>
        <DriverIdentity side="b" driver={driverB} />
      </div>

      {loading ? (
        <div className="px-6 py-16 text-center text-sm text-ink3">Loading comparison data...</div>
      ) : error ? (
        <div className="px-6 py-16 text-center text-sm text-[var(--color-red)]">{error}</div>
      ) : stats.length ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCell
              key={stat.label}
              label={stat.label}
              valueA={stat.valueA}
              valueB={stat.valueB}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="px-6 py-16 text-center text-sm text-ink3">No comparison summary is available.</div>
      )}
    </section>
  );
}
