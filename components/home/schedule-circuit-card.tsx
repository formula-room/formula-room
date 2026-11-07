"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Flag, Timer } from "lucide-react";

import { CircuitOutline } from "@/components/circuit/circuit-outline";
import { DashCard } from "@/components/dashboard/page-primitives";
import { SectionTabs, tabButtonId, tabPanelId } from "@/components/home/section-tabs";
import { resolveCircuitOutline } from "@/lib/circuit-outlines";
import { cn } from "@/lib/utils";

type Session = {
  name: string;
  label: string;
  time: string;
  startsAtUtc?: string;
  status?: "completed" | "live" | "upcoming";
};

type CircuitOverview = {
  circuitLength: string;
  numberOfLaps: string;
  raceDistance: string;
  firstGrandPrix: string;
};

type ScheduleCircuitCardProps = {
  circuitId: string;
  circuitName: string;
  sessions: Session[];
  overview: CircuitOverview;
  eventHref?: string | null;
};

function formatLocalSession(startsAtUtc?: string) {
  if (!startsAtUtc) {
    return null;
  }

  const date = new Date(startsAtUtc);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    label: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(date),
    time: new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short" }).format(date),
  };
}

function SessionIcon({ name }: { name: string }) {
  const isRace = /^race$/i.test(name);
  const Icon = isRace ? Flag : Timer;
  return <Icon className="size-3.5" aria-hidden="true" />;
}

const ID_PREFIX = "home-schedule-circuit";

export function ScheduleCircuitCard({ circuitId, circuitName, sessions, overview, eventHref }: ScheduleCircuitCardProps) {
  const [tab, setTab] = useState<"schedule" | "circuit">("schedule");
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

  const circuitFields: { label: string; value: string }[] = [
    { label: "Circuit Length", value: overview.circuitLength },
    { label: "Number of Laps", value: overview.numberOfLaps },
    { label: "Race Distance", value: overview.raceDistance },
    { label: "First Grand Prix", value: overview.firstGrandPrix },
  ].filter((field) => field.value && field.value !== "--");

  const hasRealOutline = Boolean(resolveCircuitOutline({ circuitId, circuitName }));

  return (
    <DashCard className="rounded-t-none rounded-b-[14px] border-t-0">
      <SectionTabs
        idPrefix={ID_PREFIX}
        tabs={[
          { value: "schedule", label: "Weekend Schedule" },
          { value: "circuit", label: "Circuit Info" },
        ]}
        active={tab}
        onChange={(value) => setTab(value as "schedule" | "circuit")}
        className="pt-3"
        trailing={
          tab === "schedule" ? (
            <div className="mb-2.5 flex rounded-[8px] border border-[var(--color-line2)] bg-[var(--color-bg3)] p-0.5">
              <button
                type="button"
                aria-pressed={timeMode === "schedule"}
                onClick={() => setTimeMode("schedule")}
                className={cn(
                  "rounded-[6px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.5px] transition-all",
                  timeMode === "schedule" ? "bg-white text-ink shadow-sm" : "text-ink2 hover:text-ink",
                )}
              >
                Schedule
              </button>
              <button
                type="button"
                aria-pressed={timeMode === "local"}
                onClick={() => setTimeMode("local")}
                className={cn(
                  "rounded-[6px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.5px] transition-all",
                  timeMode === "local" ? "bg-white text-ink shadow-sm" : "text-ink2 hover:text-ink",
                )}
              >
                Local time
              </button>
            </div>
          ) : null
        }
      />

      <div
        id={tabPanelId(ID_PREFIX, "schedule")}
        role="tabpanel"
        aria-labelledby={tabButtonId(ID_PREFIX, "schedule")}
        hidden={tab !== "schedule"}
        tabIndex={0}
        className="p-5 sm:p-6"
      >
        {displayedSessions.length ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-5 md:overflow-visible">
              {displayedSessions.map((session) => {
                const status = session.status ?? "upcoming";
                const isNext = status === "upcoming" && displayedSessions.find((s) => (s.status ?? "upcoming") === "upcoming") === session;
                return (
                  <div
                    key={`${session.name}-${session.label}`}
                    className={cn(
                      "flex min-w-[140px] flex-shrink-0 flex-col gap-2 rounded-[10px] border px-4 py-3.5 md:min-w-0",
                      isNext
                        ? "border-[var(--color-red-border)] bg-[var(--color-red-bg)]"
                        : status === "completed"
                          ? "border-[var(--color-line2)] bg-[var(--color-bg2)]"
                          : "border-[var(--color-line2)] bg-white",
                    )}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-[0.8px] text-ink2">{session.label}</span>
                    <span className={cn("flex items-center gap-1.5 text-[14px] font-semibold", isNext ? "text-[var(--color-red)]" : "text-ink")}>
                      <SessionIcon name={session.name} />
                      {session.name}
                    </span>
                    <span className="text-[13px] font-medium tabular-nums text-ink2">{session.time}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Link
                href={eventHref ?? "/event"}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.6px] text-ink2 transition-colors hover:text-[var(--color-red)]"
              >
                View full schedule
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-ink2">Session schedule data is unavailable.</p>
        )}
      </div>

      <div
        id={tabPanelId(ID_PREFIX, "circuit")}
        role="tabpanel"
        aria-labelledby={tabButtonId(ID_PREFIX, "circuit")}
        hidden={tab !== "circuit"}
        tabIndex={0}
        className={cn("grid gap-6 p-5 sm:p-6", hasRealOutline && "sm:grid-cols-[1fr_180px]")}
      >
        {circuitFields.length ? (
          <dl className={cn("grid gap-x-6 gap-y-5", hasRealOutline ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4")}>
            {circuitFields.map((field) => (
              <div key={field.label}>
                <dt className="mb-1.5 text-[11px] font-medium uppercase tracking-[1px] text-ink2">{field.label}</dt>
                <dd className="font-display text-[26px] leading-none tracking-[0.5px] text-ink">{field.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-[13px] text-ink2">Circuit information is unavailable.</p>
        )}
        {hasRealOutline ? (
          <div className="hidden items-center justify-center rounded-[10px] border border-[var(--color-line2)] bg-[var(--color-bg)] p-3 sm:flex">
            <CircuitOutline
              circuitId={circuitId}
              circuitName={circuitName}
              alt={`${circuitName} outline`}
              theme="light"
              className="h-28 w-full"
              strokeWidth={2.25}
            />
          </div>
        ) : null}
      </div>
    </DashCard>
  );
}
