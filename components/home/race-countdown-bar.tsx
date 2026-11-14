"use client";

import { useId, useMemo, useState } from "react";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";

import { CircuitOutline } from "@/components/circuit/circuit-outline";
import { resolveTarget, RollingDigits, useCountdown } from "@/components/home/countdown-panel";
import { cn } from "@/lib/utils";

export type CountdownBarSession = {
  name: string;
  startsAtUtc?: string;
};

export type CountdownBarRace = {
  title: string;
  round: string;
  circuitId: string;
  circuitName: string;
  date: string;
  timeZone?: string;
  sessions: CountdownBarSession[];
  overview: {
    circuitLength: string;
    numberOfLaps: string;
    raceDistance: string;
    firstGrandPrix: string;
  };
};

type RaceCountdownBarProps = {
  race: CountdownBarRace;
  status: "loading" | "ready" | "unavailable";
};

const LIVE_WINDOW_MS = 3 * 60 * 60 * 1000;
const DIGIT_SIZE = "text-[40px] min-[360px]:text-[46px] sm:text-[56px] min-[1280px]:text-[60px]";

/** "19 – 21 November 2026" in the circuit's own time zone (falls back to the stored race date). */
function formatEventDates(sessions: CountdownBarSession[], timeZone: string | undefined, fallback: string) {
  const starts = sessions.map((session) => session.startsAtUtc).filter((value): value is string => Boolean(value && !Number.isNaN(Date.parse(value))));
  if (!starts.length) {
    return fallback;
  }

  const zone = timeZone ?? "UTC";
  const first = new Date(starts[0]);
  const last = new Date(starts[starts.length - 1]);
  const part = (date: Date, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: zone, ...options }).format(date);

  const sameYear = part(first, { year: "numeric" }) === part(last, { year: "numeric" });
  const sameMonth = sameYear && part(first, { month: "long" }) === part(last, { month: "long" });
  const end = part(last, { day: "numeric", month: "long", year: "numeric" });

  if (part(first, { day: "numeric", month: "long", year: "numeric" }) === end) {
    return end;
  }
  if (sameMonth) {
    return `${part(first, { day: "numeric" })} – ${end}`;
  }
  return `${part(first, sameYear ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" })} – ${end}`;
}

function Skeleton({ className }: { className?: string }) {
  return <span className={cn("block animate-pulse rounded-[6px] bg-[rgba(255,255,255,0.12)]", className)} aria-hidden="true" />;
}

function ViewButton({
  selected,
  onClick,
  id,
  controls,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  id: string;
  controls: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={controls}
      tabIndex={selected ? 0 : -1}
      onClick={onClick}
      className={cn(
        "flex min-h-11 w-full items-center justify-between gap-3 rounded-[10px] border px-4 text-[13px] font-semibold uppercase tracking-[0.6px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff]",
        selected
          ? "border-[var(--color-red)] bg-[var(--color-red)] text-[#fff] shadow-[0_8px_20px_rgba(200,32,26,0.35)]"
          : "border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.03)] text-[rgba(255,255,255,0.9)] hover:border-[rgba(255,255,255,0.55)] hover:bg-[rgba(255,255,255,0.1)] hover:text-[#fff]",
      )}
    >
      <span className="whitespace-nowrap">{children}</span>
      <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
    </button>
  );
}

export function RaceCountdownBar({ race, status }: RaceCountdownBarProps) {
  const [view, setView] = useState<"schedule" | "circuit">("schedule");
  const idBase = useId();
  const ready = status === "ready";

  const raceStartUtc = useMemo(() => race.sessions.find((session) => /^race$/i.test(session.name))?.startsAtUtc, [race.sessions]);
  const target = useMemo(() => (ready ? resolveTarget(raceStartUtc, race.date) : null), [ready, raceStartUtc, race.date]);
  const time = useCountdown(target);
  const started = target !== null && time.elapsed > 0;
  const live = started && time.elapsed < LIVE_WINDOW_MS;

  const eventDates = useMemo(() => formatEventDates(race.sessions, race.timeZone, race.date), [race.sessions, race.timeZone, race.date]);
  const circuitFields = [
    { label: "Circuit Length", value: race.overview.circuitLength },
    { label: "Number of Laps", value: race.overview.numberOfLaps },
    { label: "Race Distance", value: race.overview.raceDistance },
    { label: "First Grand Prix", value: race.overview.firstGrandPrix },
  ];
  const roundNumber = String(Number.parseInt(race.round, 10) || race.round);

  const scheduleTabId = `${idBase}-tab-schedule`;
  const circuitTabId = `${idBase}-tab-circuit`;
  const schedulePanelId = `${idBase}-panel-schedule`;
  const circuitPanelId = `${idBase}-panel-circuit`;

  const outline = (size: string) =>
    ready && (race.circuitId || race.circuitName) ? (
      <CircuitOutline circuitId={race.circuitId} circuitName={race.circuitName} alt={`${race.circuitName} layout`} theme="dark" className={size} strokeWidth={3.25} />
    ) : (
      <Skeleton className={size} />
    );

  return (
    <div
      className="relative w-full rounded-[18px] border border-[rgba(255,255,255,0.14)] bg-[rgba(12,12,14,0.72)] text-[#fff] shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md"
      aria-busy={status === "loading"}
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6 md:max-[1279px]:grid md:max-[1279px]:grid-cols-[minmax(0,1fr)_220px] md:max-[1279px]:items-center md:max-[1279px]:gap-x-8 min-[1280px]:flex min-[1280px]:flex-row min-[1280px]:items-stretch min-[1280px]:gap-0 min-[1280px]:px-8 min-[1280px]:py-6">
        {/* Race name */}
        <div className="min-w-0 min-[1280px]:flex min-[1280px]:w-[240px] min-[1280px]:shrink-0 min-[1280px]:flex-col min-[1280px]:justify-center min-[1280px]:pr-7">
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#ff5a52]">Next Race</p>
          {status === "loading" ? (
            <>
              <Skeleton className="mt-2 h-9 w-48" />
              <Skeleton className="mt-2 h-9 w-36" />
            </>
          ) : (
            <h2 className="mt-1.5 text-balance font-display text-[36px] uppercase leading-[0.95] tracking-[0.5px] sm:text-[42px] min-[1280px]:text-[44px]">
              {ready ? race.title : "No upcoming race scheduled"}
            </h2>
          )}
        </div>

        {/* Switchable content: both views share one grid cell so the bar keeps its size */}
        <div className="grid min-w-0 md:max-[1279px]:col-span-2 md:max-[1279px]:row-start-2 min-[1280px]:flex-1 min-[1280px]:border-l min-[1280px]:border-[rgba(255,255,255,0.12)]">
          <div
            id={schedulePanelId}
            role="tabpanel"
            aria-labelledby={scheduleTabId}
            inert={view !== "schedule"}
            className={cn(
              "col-start-1 row-start-1 flex flex-col gap-5 transition-opacity duration-300 ease-out sm:flex-row sm:items-center sm:gap-6 min-[1280px]:gap-0",
              view === "schedule" ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <div className="flex min-w-0 items-center gap-5 sm:flex-1 min-[1280px]:px-7">
              <div className="h-[64px] w-[96px] shrink-0 min-[1280px]:h-[78px] min-[1280px]:w-[118px]">{outline("size-full")}</div>
              <ul className="min-w-0 space-y-2 text-[13px] font-medium text-[rgba(255,255,255,0.88)] sm:text-[14px]">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#ff5a52]" aria-hidden="true" />
                  {status === "loading" ? <Skeleton className="h-4 w-40" /> : <span>{ready ? race.circuitName : "Awaiting calendar data"}</span>}
                </li>
                <li className="flex items-start gap-2.5">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#ff5a52]" aria-hidden="true" />
                  {status === "loading" ? <Skeleton className="h-4 w-36" /> : <span className="uppercase">{ready ? eventDates : "--"}</span>}
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-px w-4 shrink-0 bg-[rgba(255,255,255,0.5)]" aria-hidden="true" />
                  {status === "loading" ? <Skeleton className="h-4 w-20" /> : <span className="uppercase">{ready ? `Round ${roundNumber}` : "--"}</span>}
                </li>
              </ul>
            </div>

            <div className="flex justify-center border-t border-[rgba(255,255,255,0.12)] pt-5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 min-[1280px]:px-7" aria-live="off">
              {ready && started ? (
                <div className="flex min-h-[86px] flex-col items-center justify-center text-center">
                  <span className="flex items-center gap-2 font-display text-[40px] uppercase leading-none tracking-[1px] sm:text-[48px]">
                    {live ? <span className="size-2.5 animate-pulse rounded-full bg-[#ff5a52]" aria-hidden="true" /> : null}
                    {live ? "Race live" : "Race complete"}
                  </span>
                  <span className="mt-2 text-[11px] font-medium uppercase tracking-[1.6px] text-[rgba(255,255,255,0.6)]">
                    {live ? "Lights out" : "Results coming soon"}
                  </span>
                </div>
              ) : (
                <div className="flex items-start" role="timer" aria-label={ready ? `Race starts in ${time.d} days, ${time.h} hours, ${time.m} minutes` : "Countdown unavailable"}>
                  {[
                    { val: time.d, label: "Days" },
                    { val: time.h, label: "Hrs" },
                    { val: time.m, label: "Min" },
                    { val: time.s, label: "Sec" },
                  ].map((unit, index) => (
                    <div key={unit.label} className="flex items-start">
                      {index > 0 ? (
                        // Two drawn dots centred on the digits (the display font's colon sits too low).
                        <span className={cn("flex h-[1em] flex-col items-center justify-center gap-[0.2em] px-[0.12em] leading-none", DIGIT_SIZE)} aria-hidden="true">
                          <span className="size-[0.09em] min-h-[4px] min-w-[4px] bg-[#ff5a52]" />
                          <span className="size-[0.09em] min-h-[4px] min-w-[4px] bg-[#ff5a52]" />
                        </span>
                      ) : null}
                      <div className="text-center">
                        {ready ? (
                          <RollingDigits value={String(unit.val).padStart(2, "0")} sizeClass={DIGIT_SIZE} />
                        ) : (
                          <span className={cn("block font-display leading-none text-[rgba(255,255,255,0.4)]", DIGIT_SIZE)}>--</span>
                        )}
                        <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[1.6px] text-[rgba(255,255,255,0.62)]">{unit.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            id={circuitPanelId}
            role="tabpanel"
            aria-labelledby={circuitTabId}
            inert={view !== "circuit"}
            className={cn(
              "col-start-1 row-start-1 flex flex-col gap-5 transition-opacity duration-300 ease-out sm:flex-row sm:items-center sm:gap-6 min-[1280px]:gap-0",
              view === "circuit" ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <dl className="grid flex-1 grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4 min-[1280px]:px-7">
              {circuitFields.map((field) => (
                <div key={field.label} className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[rgba(255,255,255,0.62)]">{field.label}</dt>
                  <dd className="mt-1.5 font-display text-[28px] leading-none tracking-[0.5px] sm:text-[32px]">
                    {ready && field.value && field.value !== "--" ? field.value : "--"}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="hidden h-[86px] w-[150px] shrink-0 items-center justify-center sm:flex sm:border-l sm:border-[rgba(255,255,255,0.12)] sm:pl-6 min-[1280px]:px-7">
              {outline("h-[78px] w-[118px]")}
            </div>
          </div>
        </div>

        {/* View switch */}
        <div
          role="tablist"
          aria-label="Next race details"
          className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:max-[1279px]:col-start-2 md:max-[1279px]:row-start-1 md:max-[1279px]:grid-cols-1 min-[1280px]:flex min-[1280px]:w-[232px] min-[1280px]:shrink-0 min-[1280px]:flex-col min-[1280px]:justify-center min-[1280px]:border-l min-[1280px]:border-[rgba(255,255,255,0.12)] min-[1280px]:pl-7"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              const next = view === "schedule" ? "circuit" : "schedule";
              setView(next);
              document.getElementById(next === "schedule" ? scheduleTabId : circuitTabId)?.focus();
            }
          }}
        >
          <ViewButton id={scheduleTabId} controls={schedulePanelId} selected={view === "schedule"} onClick={() => setView("schedule")}>
            Weekend Schedule
          </ViewButton>
          <ViewButton id={circuitTabId} controls={circuitPanelId} selected={view === "circuit"} onClick={() => setView("circuit")}>
            Circuit Info
          </ViewButton>
        </div>
      </div>
    </div>
  );
}
