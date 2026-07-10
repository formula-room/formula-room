"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CountdownTimer } from "@/components/home/countdown-timer";
import { CountryFlag } from "@/components/shared/country-flag";
import { cn } from "@/lib/utils";

type Session = {
  name: string;
  label: string;
  time: string;
  startsAtUtc?: string;
  status?: "completed" | "live" | "upcoming";
};

type HeroCardProps = {
  className?: string;
  flagCountry: string;
  location: string;
  circuitName: string;
  eventHref: string | null;
  circuitHref: string | null;
  round: string;
  title: string;
  subtitle: string;
  date: string;
  sessions: Session[];
  overview: {
    numberOfLaps: string;
    fastestLap: string;
    fastestLapHolder: string;
    fastestLapYear: string;
  };
};

function splitRaceTitle(title: string) {
  const normalized = title.replace(/\s+Grand Prix$/i, "");
  return normalized || title;
}

function formatLocalSession(startsAtUtc?: string) {
  if (!startsAtUtc) {
    return null;
  }

  const date = new Date(startsAtUtc);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    label: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).format(date),
  };
}

export function HeroCard({
  className,
  flagCountry,
  location,
  circuitName,
  eventHref,
  circuitHref,
  round,
  title,
  subtitle,
  date,
  sessions,
  overview,
}: HeroCardProps) {
  const [timeMode, setTimeMode] = useState<"schedule" | "local">("schedule");
  const displayedSessions = useMemo(
    () =>
      sessions.map((session) => {
        const localSession = formatLocalSession(session.startsAtUtc);
        return timeMode === "local" && localSession
          ? { ...session, label: localSession.label, time: localSession.time }
          : session;
      }),
    [sessions, timeMode],
  );
  const raceTitle = splitRaceTitle(title);
  const lapRecord =
    overview.fastestLap && overview.fastestLap !== "--"
      ? `${overview.fastestLap}${overview.fastestLapHolder ? ` ${overview.fastestLapHolder}` : ""}${overview.fastestLapYear ? ` (${overview.fastestLapYear})` : ""}`
      : "--";

  return (
    <section
      className={cn(
        "relative grid overflow-hidden rounded-[16px] border border-[var(--color-line2)] bg-white lg:grid-cols-[1fr_420px]",
        "before:pointer-events-none before:absolute before:left-[35%] before:top-[60%] before:h-[500px] before:w-[500px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-[radial-gradient(ellipse,rgba(200,32,26,0.07)_0%,transparent_65%)]",
        "after:pointer-events-none after:absolute after:inset-0 after:bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.018)_0,rgba(0,0,0,0.018)_1px,transparent_1px,transparent_72px),repeating-linear-gradient(0deg,rgba(0,0,0,0.018)_0,rgba(0,0,0,0.018)_1px,transparent_1px,transparent_72px)]",
        className,
      )}
    >
      <div className="relative z-10 flex min-h-[480px] flex-col justify-between border-b border-[var(--color-line2)] p-7 sm:p-10 lg:border-r lg:border-b-0 lg:p-12 lg:pb-10">
        <div>
          <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-red-border)] bg-[var(--color-red-bg)] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-red)] animate-pulse" />
            <span className="text-[11px] font-medium uppercase tracking-[1px] text-[var(--color-red)]">Next Race</span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            {flagCountry ? <CountryFlag country={flagCountry} className="h-4 w-6 rounded-[3px]" /> : null}
            <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-ink3">
              Round {round} - {flagCountry || "FIA Formula One World Championship"}
            </p>
          </div>
          <h1 className="mb-3 font-display text-[58px] leading-[0.88] tracking-[1px] text-ink sm:text-[82px]">
            {raceTitle}
            <br />
            <span className="text-[var(--color-red)]">Grand Prix</span>
          </h1>
          <p className="text-[13px] font-light text-ink3">{subtitle || `${circuitName} - ${location}`}</p>
        </div>

        <div>
          <CountdownTimer raceDate={date} />
          <div className="mt-8 grid gap-5 border-t border-[var(--color-line2)] pt-8 sm:grid-cols-4">
            {[
              { label: "Race date", value: date },
              { label: "Location", value: location },
              { label: "Laps", value: overview.numberOfLaps },
              { label: "Lap record", value: lapRecord },
            ].map((fact, index) => (
              <div key={fact.label} className={cn(index > 0 && "sm:border-l sm:border-[var(--color-line2)] sm:pl-6")}>
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[1px] text-ink3">{fact.label}</p>
                <p className="text-[15px] font-medium text-ink">{fact.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="relative z-10 flex flex-col bg-[var(--color-bg)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line2)] px-7 pb-5 pt-6">
          <span className="text-[10px] font-semibold uppercase tracking-[1.3px] text-ink2">Weekend sessions</span>
          <div className="flex rounded-[6px] border border-[var(--color-line2)] bg-[var(--color-bg3)] p-0.5">
            <button
              type="button"
              aria-pressed={timeMode === "schedule"}
              onClick={() => setTimeMode("schedule")}
              className={cn(
                "rounded-[4px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.5px] transition-all",
                timeMode === "schedule" ? "bg-white text-ink shadow-sm" : "text-ink3 hover:text-ink",
              )}
            >
              Schedule
            </button>
            <button
              type="button"
              aria-pressed={timeMode === "local"}
              onClick={() => setTimeMode("local")}
              className={cn(
                "rounded-[4px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.5px] transition-all",
                timeMode === "local" ? "bg-white text-ink shadow-sm" : "text-ink3 hover:text-ink",
              )}
            >
              Local time
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 px-7 py-5">
          {displayedSessions.length ? (
            displayedSessions.map((session) => {
              const status = session.status ?? "upcoming";
              return (
                <div
                  key={`${session.name}-${session.label}`}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-[8px] border px-4 py-3.5 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-colors hover:bg-white",
                    status === "completed" && "border-[var(--color-line2)] bg-[rgba(255,255,255,0.72)]",
                    status === "live" && "border-[var(--color-red-border)] bg-[var(--color-red-bg)]",
                    status === "upcoming" && "border-[var(--color-line3)] bg-white",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", status === "completed" ? "bg-[#2E7D42]" : "bg-[var(--color-red)]")} />
                    <div>
                      <p className="text-[13px] font-medium text-ink">{session.name}</p>
                      <p className="mt-0.5 text-[11px] text-ink2">{session.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold tabular-nums text-ink">{session.time}</p>
                    <span className={cn("mt-1 inline-block rounded-[3px] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.6px]", status === "completed" ? "bg-[rgba(46,125,66,0.14)] text-[#256334]" : "border border-[var(--color-red-border)] bg-[var(--color-red-bg)] text-[var(--color-red)]")}>
                      {status === "completed" ? "Done" : status === "live" ? "Live" : "Upcoming"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[8px] border border-[var(--color-line2)] bg-white px-4 py-4 text-[13px] text-ink3">
              Session schedule data is unavailable.
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-[var(--color-line2)] p-5">
          <Link href={eventHref ?? "/event"} className="flex-1 rounded-[6px] bg-[var(--color-red)] py-3 text-center text-[12px] font-medium uppercase tracking-[0.5px] text-white">
            Full schedule
          </Link>
          <Link href={circuitHref ?? "/grand-prix"} className="flex-1 rounded-[6px] border border-[var(--color-line2)] py-3 text-center text-[12px] font-medium uppercase tracking-[0.5px] text-ink3">
            Circuit info
          </Link>
        </div>
      </aside>
    </section>
  );
}
