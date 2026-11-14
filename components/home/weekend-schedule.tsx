"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Timer, Zap } from "lucide-react";

import { ChequeredFlag } from "@/components/statistics/CategoryIcon";
import { cn } from "@/lib/utils";

type Session = {
  name: string;
  label: string;
  time: string;
  startsAtUtc?: string;
  status?: "completed" | "live" | "upcoming";
};

type WeekendScheduleProps = {
  sessions: Session[];
  eventHref?: string | null;
  status: "loading" | "ready" | "unavailable";
};

type TimeMode = "schedule" | "local";

/** Day line ("FRI · 20 NOV") and time for a session. "schedule" keeps the stored UTC times; "local" uses the visitor's zone. */
function describeSession(session: Session, mode: TimeMode) {
  const start = session.startsAtUtc ? new Date(session.startsAtUtc) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return { day: session.label, time: session.time };
  }

  const timeZone = mode === "schedule" ? "UTC" : undefined;
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone }).format(start);
  const date = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone }).format(start);
  const time =
    mode === "schedule"
      ? session.time
      : new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short" }).format(start);

  return { day: `${weekday} · ${date}`, time };
}

/** Small icon per session type: stopwatch for practice, bolt for the sprint, chequered flag for qualifying and the race. */
function SessionIcon({ name, className }: { name: string; className?: string }) {
  const key = name.toLowerCase();
  if (key.includes("practice")) {
    return <Timer className={className} strokeWidth={1.75} aria-hidden="true" />;
  }
  if (key.includes("sprint") && !key.includes("qualifying") && !key.includes("shootout")) {
    return <Zap className={className} strokeWidth={1.75} aria-hidden="true" />;
  }
  return <ChequeredFlag className={className} />;
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-9 flex-1 rounded-[7px] px-3 text-[11px] font-semibold uppercase tracking-[0.5px] transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-red)] sm:flex-none",
        active ? "bg-[#17140f] text-[#fff] shadow-sm dark:bg-[#f2f2f3] dark:text-[#16181d]" : "text-ink2 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/* Odd card out spans both columns on phones, so 5-session weekends end on a full-width card. */
const CARD_GRID =
  "grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:[grid-template-columns:repeat(var(--session-count),minmax(0,1fr))] max-sm:[&>*:last-child:nth-child(odd)]:col-span-2";

export function WeekendSchedule({ sessions, eventHref, status }: WeekendScheduleProps) {
  const [timeMode, setTimeMode] = useState<TimeMode>("schedule");

  const cards = useMemo(() => sessions.map((session) => ({ session, ...describeSession(session, timeMode) })), [sessions, timeMode]);
  // Highlight the session that is live now, otherwise the next one to start.
  const highlightIndex = useMemo(() => {
    const live = sessions.findIndex((session) => session.status === "live");
    return live >= 0 ? live : sessions.findIndex((session) => (session.status ?? "upcoming") === "upcoming");
  }, [sessions]);

  return (
    <section aria-labelledby="weekend-schedule-heading" className="fr-bleed pt-5 sm:pt-7">
      <div className="mx-auto w-full max-w-[calc(1280px+4rem)] px-4 sm:px-6 lg:px-8">
        <div className="home-card rounded-[16px] border border-[var(--color-line2)] bg-white p-4 sm:p-6 lg:px-7 lg:py-[22px]">
          <div className="grid gap-5 sm:gap-6 min-[1180px]:grid-cols-[minmax(220px,250px)_minmax(0,1fr)] min-[1180px]:items-center min-[1180px]:gap-0">
            {/* Heading and controls */}
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-[var(--color-line2)] pb-5 sm:pb-6 min-[1180px]:block min-[1180px]:h-full min-[1180px]:border-r min-[1180px]:border-b-0 min-[1180px]:pr-7 min-[1180px]:pb-0">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[var(--color-red)]">Race Weekend</p>
                <h2
                  id="weekend-schedule-heading"
                  className="mt-1 font-display text-[36px] uppercase leading-[0.95] tracking-[0.5px] text-ink sm:text-[42px] min-[1180px]:text-[44px]"
                >
                  Weekend Schedule
                </h2>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:max-[1179px]:flex-row sm:max-[1179px]:items-center sm:max-[1179px]:gap-5 min-[1180px]:mt-5 min-[1180px]:items-start">
                <div
                  className="flex rounded-[9px] border border-[var(--color-line2)] bg-[var(--color-bg3)] p-0.5"
                  role="group"
                  aria-label="Session times"
                >
                  <ModeButton active={timeMode === "schedule"} onClick={() => setTimeMode("schedule")}>
                    Schedule
                  </ModeButton>
                  <ModeButton active={timeMode === "local"} onClick={() => setTimeMode("local")}>
                    Local time
                  </ModeButton>
                </div>
                <Link
                  href={eventHref ?? "/event"}
                  className="inline-flex min-h-9 items-center gap-1.5 self-start whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.6px] text-ink2 transition-colors hover:text-[var(--color-red)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-red)] sm:max-[1179px]:self-auto"
                >
                  View full schedule
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Session cards */}
            <div className="min-[1180px]:pl-7">
              {status === "loading" ? (
                <div className={CARD_GRID} style={{ "--session-count": 5 } as React.CSSProperties} aria-hidden="true">
                  {Array.from({ length: 5 }, (_, index) => (
                    <div key={index} className="h-[118px] animate-pulse sm:h-[132px] rounded-[12px] border border-[var(--color-line2)] bg-[var(--color-bg3)]" />
                  ))}
                </div>
              ) : cards.length ? (
                <ol className={CARD_GRID} style={{ "--session-count": cards.length } as React.CSSProperties}>
                  {cards.map(({ session, day, time }, index) => {
                    const highlighted = index === highlightIndex;
                    const completed = session.status === "completed";
                    return (
                      <li
                        key={`${session.name}-${session.startsAtUtc ?? session.label}`}
                        aria-current={highlighted ? "true" : undefined}
                        className={cn(
                          "flex min-w-0 flex-col items-center justify-center rounded-[12px] border px-2 py-3 text-center transition-colors sm:py-5",
                          highlighted
                            ? "border-[var(--color-red)] bg-[var(--color-red-bg)] shadow-[0_6px_18px_rgba(200,32,26,0.12)]"
                            : "border-[var(--color-line2)] bg-white shadow-[0_1px_2px_rgba(23,20,15,0.05)] dark:bg-[var(--color-bg3)] dark:shadow-none",
                          // Faded on wider screens. Phones mute only the icon and name, so the day and time stay readable.
                          completed && !highlighted && "sm:opacity-60",
                        )}
                      >
                        <SessionIcon name={session.name} className={cn("size-[22px]", highlighted ? "text-[var(--color-red)]" : "text-ink", completed && !highlighted && "max-sm:opacity-45")} />
                        <span
                          className={cn(
                            "mt-2 max-w-full font-display text-[22px] uppercase leading-none tracking-[0.5px] [overflow-wrap:anywhere] sm:mt-2.5 sm:text-[24px]",
                            highlighted ? "text-[var(--color-red)]" : completed ? "text-ink max-sm:text-ink2" : "text-ink",
                          )}
                        >
                          {session.name}
                        </span>
                        <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-ink2 sm:mt-2">{day}</span>
                        <span className="mt-1 text-[13px] font-medium tabular-nums text-ink2">
                          {time}
                          {session.status === "live" ? <span className="ml-2 font-semibold text-[var(--color-red)] uppercase">Live</span> : null}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-[13px] text-ink2">Session schedule data is unavailable.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
