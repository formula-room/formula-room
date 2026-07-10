"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  Calendar,
  Clock,
  List,
  MapPin,
  Play,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { CircuitOutline } from "@/components/circuit/circuit-outline";
import { DashCard, StatusBadge } from "@/components/dashboard/page-primitives";
import {
  getCircuitHrefByName,
  getDriverHrefByName,
  getTeamHrefByName,
} from "@/lib/route-helpers";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type EventStatus = "Upcoming" | "This Weekend" | "Completed";

type EventSession = {
  day: string;
  session: string;
  localTime: string;
  yourTime: string;
  key: string;
};

type ResultRow = {
  position: string;
  entry: string;
  team: string;
  value: string;
};

type ResultTab = {
  key: string;
  label: string;
  rows: ResultRow[];
};

type CircuitFact = {
  label: string;
  value: string;
};

type EventWeekend = {
  slug: string;
  grandPrix: string;
  flag: string;
  circuitId?: string;
  circuit: string;
  country: string;
  city: string;
  round: string;
  dateRange: string;
  status: EventStatus;
  nextSession: string;
  schedule: EventSession[];
  results: ResultTab[];
  facts: CircuitFact[];
  records: CircuitFact[];
};

type SessionState = "upcoming" | "live" | "completed";
type SessionType = "practice" | "qualifying" | "race" | "sprint";
type TimezoneMode = "UTC" | "Local";

function normalizeSessionLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getWeekendFormat(schedule: EventSession[]) {
  return schedule.some((session) => normalizeSessionLabel(session.session).includes("sprint"))
    ? "Sprint Weekend"
    : "Standard Weekend";
}

function getSessionType(session: EventSession): SessionType {
  const normalized = normalizeSessionLabel(session.session);

  if (normalized.includes("sprint")) return "sprint";
  if (normalized.includes("qualifying")) return "qualifying";
  if (normalized.includes("race")) return "race";
  return "practice";
}

function getSessionStateMap(weekend: EventWeekend): Map<string, SessionState> {
  if (weekend.status === "Completed") {
    return new Map(weekend.schedule.map((session) => [session.key, "completed" satisfies SessionState]));
  }

  if (weekend.status === "Upcoming") {
    return new Map(weekend.schedule.map((session) => [session.key, "upcoming" satisfies SessionState]));
  }

  const normalizedNextSession = normalizeSessionLabel(weekend.nextSession);
  const nextSessionIndex = weekend.schedule.findIndex((session) =>
    normalizedNextSession.includes(normalizeSessionLabel(session.session)),
  );
  const isLiveWeekend = /\blive\b|\bnow\b|\bin progress\b/.test(normalizedNextSession);

  return new Map(
    weekend.schedule.map((session, index) => {
      if (nextSessionIndex === -1) return [session.key, "upcoming" satisfies SessionState];
      if (index < nextSessionIndex) return [session.key, "completed" satisfies SessionState];
      if (index === nextSessionIndex) return [session.key, isLiveWeekend ? "live" : "upcoming"];
      return [session.key, "upcoming" satisfies SessionState];
    }),
  );
}

function mapWeekendStatus(status: EventStatus) {
  if (status === "Completed") return "done";
  if (status === "This Weekend") return "live";
  return "upcoming";
}

function mapSessionStatus(state: SessionState) {
  if (state === "completed") return "done";
  if (state === "live") return "live";
  return "upcoming";
}

const sessionTypeRgb: Record<SessionType, string> = {
  practice: "30,91,191",
  qualifying: "138,104,32",
  race: "200,32,26",
  sprint: "14,124,138",
};

const sessionTypeLabel: Record<SessionType, string> = {
  practice: "Practice",
  qualifying: "Qualifying",
  race: "Grand Prix",
  sprint: "Sprint",
};

function getFactValue(items: CircuitFact[], label: string) {
  return items.find((item) => item.label === label)?.value ?? "--";
}

function groupSessionsByDate(sessions: EventSession[]) {
  const groups = new Map<string, EventSession[]>();
  for (const session of sessions) {
    const key = `${session.day}|${session.yourTime}`;
    groups.set(key, [...(groups.get(key) ?? []), session]);
  }
  return Array.from(groups.entries()).map(([key, rows]) => {
    const [dayName, dayDate] = key.split("|");
    return { dayName, dayDate, rows };
  });
}

function WeekendHero({ weekend }: { weekend: EventWeekend }) {
  const circuitHref = getCircuitHrefByName(weekend.circuit);
  const format = getWeekendFormat(weekend.schedule);

  return (
    <DashCard className="mb-6 animate-fade-up animate-fade-up-1 rounded-[16px]">
      <div className="grid min-h-[200px] lg:grid-cols-[280px_1fr]">
        <div className="relative flex items-center justify-center overflow-hidden border-b border-[var(--color-line2)] bg-[var(--color-bg2)] p-8 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.015)_10px,rgba(0,0,0,0.015)_11px)] lg:border-r lg:border-b-0">
          <div className="relative z-10 flex flex-col items-center gap-3">
            <CircuitOutline
              circuitId={weekend.circuitId}
              circuitName={weekend.circuit}
              alt={`${weekend.circuit} outline`}
              theme="light"
              className="h-[130px] w-[180px] opacity-70"
            />
            <p className="text-center text-[10px] font-medium uppercase tracking-[1px] text-ink3">
              {weekend.circuit}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between p-7 sm:p-10 sm:pb-8">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <StatusBadge status={mapWeekendStatus(weekend.status)} />
              <span className="inline-flex rounded-[4px] border border-[var(--color-line2)] bg-[var(--color-bg2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.8px] text-ink3">
                Event Weekend
              </span>
            </div>
            <p className="mb-1.5 text-[12px] font-medium tracking-[0.5px] text-ink3">
              F1 - FIA Formula One World Championship
            </p>
            <h1 className="mb-3 font-display text-[44px] leading-[0.9] tracking-[1px] text-ink sm:text-[52px]">
              {weekend.grandPrix.replace(/\s+Grand Prix$/i, "")}{" "}
              <span className="text-[var(--color-red)]">Grand Prix</span>
            </h1>
            <div className="flex items-center gap-2 text-[14px] font-light text-ink3">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {weekend.circuit} / {weekend.country}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-[var(--color-line2)] pt-5 lg:gap-8">
            {[
              { label: "Round", value: weekend.round },
              { label: "Dates", value: weekend.dateRange },
              { label: "Format", value: format },
              { label: "Sessions", value: String(weekend.schedule.length) },
              { label: "Status", value: weekend.status, colored: true },
            ].map((item, index) => (
              <div key={item.label} className={cn(index > 0 && "border-l border-[var(--color-line2)] pl-5 lg:pl-8")}>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-[1px] text-ink3">{item.label}</p>
                <p className={cn("text-[14px] font-medium text-ink", item.colored && "text-[var(--color-done)]")}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-line2)] bg-[var(--color-bg)] px-5 py-4 sm:px-10">
        {circuitHref ? (
          <Link className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--color-line2)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.5px] text-ink3 transition-all hover:border-[var(--color-line3)] hover:text-ink" href={circuitHref}>
            <Clock className="h-3 w-3" />
            Open circuit profile
          </Link>
        ) : null}
        <Link className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--color-line2)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.5px] text-ink3 transition-all hover:border-[var(--color-line3)] hover:text-ink" href="/results">
          <List className="h-3 w-3" />
          Open results archive
        </Link>
        <Link className="inline-flex items-center gap-1.5 rounded-[6px] border border-[var(--color-line2)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.5px] text-ink3 transition-all hover:border-[var(--color-line3)] hover:text-ink" href="/grand-prix">
          <BarChart2 className="h-3 w-3" />
          Open Grand Prix statistics
        </Link>
      </div>
    </DashCard>
  );
}

function SchedulePanel({ weekend }: { weekend: EventWeekend }) {
  const [timezone, setTimezone] = useState<TimezoneMode>("UTC");
  const sessionStates = useMemo(() => getSessionStateMap(weekend), [weekend]);
  const groups = useMemo(() => groupSessionsByDate(weekend.schedule), [weekend.schedule]);
  const format = getWeekendFormat(weekend.schedule);

  if (weekend.schedule.length === 0) {
    return (
      <DashCard className="animate-fade-up animate-fade-up-3 p-8 text-center text-[13px] text-ink3">
        Weekend session schedule data is unavailable from the current backend dataset.
      </DashCard>
    );
  }

  return (
    <DashCard className="animate-fade-up animate-fade-up-3">
      <div className="flex flex-col gap-6 border-b border-[var(--color-line2)] px-6 py-7 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Weekend Schedule</p>
          <h2 className="font-display text-[28px] tracking-[0.5px] text-ink">Session Timeline</h2>
          <p className="mt-1.5 max-w-[400px] text-[12px] font-light leading-relaxed text-ink3">
            All sessions pulled from the live event payload, arranged in weekend order with state and timing.
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col gap-2 lg:items-end">
          <div className="flex rounded-[7px] border border-[var(--color-line2)] bg-[var(--color-bg2)] p-0.5">
            {(["UTC", "Local"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTimezone(value)}
                className={cn(
                  "rounded-[5px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.5px] transition-all",
                  timezone === value ? "bg-white text-ink shadow-sm" : "text-ink3",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <span className="rounded-[4px] border border-[var(--color-line2)] bg-[var(--color-bg2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.6px] text-ink3">
              {format}
            </span>
            <span className="rounded-[4px] border border-[var(--color-line2)] bg-[var(--color-bg2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.6px] text-ink3">
              {weekend.schedule.length} Sessions
            </span>
          </div>
        </div>
      </div>

      <div>
        {groups.map((group) => (
          <div key={`${group.dayName}-${group.dayDate}`}>
            <div className="flex items-center gap-3 bg-[var(--color-bg)] px-6 py-3 lg:px-8">
              <span className="text-[10px] font-semibold uppercase tracking-[1.2px] text-ink3">{group.dayName}</span>
              <span className="text-[10px] font-medium text-ink3">{group.dayDate}</span>
              <div className="h-px flex-1 bg-[var(--color-line2)]" />
            </div>

            {group.rows.map((session, index) => {
              const sessionType = getSessionType(session);
              const state = sessionStates.get(session.key) ?? "upcoming";
              const sessionNumber = weekend.schedule.findIndex((item) => item.key === session.key) + 1 || index + 1;
              const accent = `var(--session-${sessionType})`;
              const displayedTime = session.localTime;

              return (
                <div
                  key={session.key}
                  className={cn(
                    "relative grid cursor-pointer grid-cols-[64px_1fr] items-stretch overflow-hidden border-t border-[var(--color-line)] transition-colors hover:bg-[var(--color-bg)] md:grid-cols-[64px_1fr_auto]",
                    sessionType === "race" && "bg-[rgba(200,32,26,0.025)]",
                  )}
                  style={{ boxShadow: `inset 3px 0 0 ${accent}` }}
                >
                  <div className="flex flex-col items-center justify-center border-r border-[var(--color-line)] py-5 pl-[3px]">
                    <span className="text-[9px] font-semibold uppercase tracking-[1px] text-ink3">{session.day}</span>
                    <span className="mt-0.5 font-display text-[26px] leading-none tracking-[0.5px]" style={{ color: accent }}>
                      {String(sessionNumber).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="px-6 py-5">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className="rounded-[3px] px-2 py-1 text-[9px] font-bold uppercase tracking-[1px]"
                        style={{
                          backgroundColor: `rgba(${sessionTypeRgb[sessionType]}, 0.10)`,
                          color: accent,
                        }}
                      >
                        {sessionTypeLabel[sessionType]}
                      </span>
                      <StatusBadge status={mapSessionStatus(state)} size="sm" />
                    </div>

                    <p className={cn("text-[18px] font-medium leading-tight text-ink", sessionType === "race" && "text-[var(--color-red)]")}>
                      {session.session}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink3">
                      <span>{weekend.grandPrix}</span>
                      <span className="text-[var(--color-line3)]">/</span>
                      <span>{weekend.circuit}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex min-w-[130px] flex-row items-center justify-between gap-4 border-t border-[var(--color-line)] px-6 py-4 md:col-span-1 md:flex-col md:items-end md:justify-center md:border-t-0 md:border-l md:px-8 md:pl-4">
                    <div className="md:text-right">
                      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[1px] text-ink3">Time</p>
                      <p className="font-display text-[20px] leading-none tracking-[0.5px] text-ink">{displayedTime}</p>
                      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[1px] text-ink3">{timezone}</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[1px] text-ink3">Date</p>
                      <p className="text-[13px] font-medium text-ink2">{session.yourTime}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </DashCard>
  );
}

function WeekendSidebar({ weekend }: { weekend: EventWeekend }) {
  const sessionStates = getSessionStateMap(weekend);
  const completedSessions = Array.from(sessionStates.values()).filter((state) => state === "completed").length;
  const totalSessions = Math.max(weekend.schedule.length, 1);
  const progressPct = (completedSessions / totalSessions) * 100;
  const format = getWeekendFormat(weekend.schedule);
  const stats = [
    { label: getFactValue(weekend.facts, "Circuit ID") !== "--" ? "Circuit ID" : weekend.facts[0]?.label ?? "Fact", value: getFactValue(weekend.facts, "Circuit ID") !== "--" ? getFactValue(weekend.facts, "Circuit ID") : weekend.facts[0]?.value ?? "--", sub: "reference" },
    { label: "Locality", value: getFactValue(weekend.facts, "Locality"), sub: weekend.country },
    { label: "Latitude", value: getFactValue(weekend.records, "Latitude"), sub: "coordinate" },
    { label: "Longitude", value: getFactValue(weekend.records, "Longitude"), sub: "coordinate" },
  ];

  return (
    <aside className="flex flex-col gap-4 animate-fade-up animate-fade-up-4">
      <DashCard>
        <div className="border-b border-[var(--color-line2)] px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-ink3">Weekend Summary</p>
        </div>
        {[
          { icon: Calendar, label: "Date Range", value: weekend.dateRange },
          { icon: Clock, label: "Circuit", value: weekend.circuit },
          { icon: MapPin, label: "Country", value: `${weekend.flag} ${weekend.country}` },
          { icon: ArrowRight, label: "Next Session", value: weekend.nextSession, highlight: true },
          { icon: Play, label: "Format", value: format },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 border-b border-[var(--color-line)] px-6 py-3.5 transition-colors last:border-b-0 hover:bg-[var(--color-bg)]">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-bg2)] text-ink3">
              <row.icon className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.8px] text-ink3">{row.label}</p>
              <p className={cn("text-[13px] font-medium text-ink", row.highlight && "text-[var(--color-done)]")}>{row.value}</p>
            </div>
          </div>
        ))}
      </DashCard>

      <DashCard>
        <div className="border-b border-[var(--color-line2)] px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-ink3">Session Progress</p>
        </div>
        <div className="flex flex-col gap-2 px-6 py-4">
          {weekend.schedule.map((session) => {
            const sessionType = getSessionType(session);
            const state = sessionStates.get(session.key) ?? "upcoming";
            return (
              <div key={session.key} className="flex items-center gap-2.5">
                <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: `var(--session-${sessionType})` }} />
                <p className="flex-1 text-[12px] font-medium text-ink2">{session.session}</p>
                <p className="text-[11px] tabular-nums text-ink3">{session.localTime}</p>
                {state === "completed" ? <span className="text-[11px] text-[var(--color-done)]">OK</span> : null}
              </div>
            );
          })}
        </div>
        <div className="px-6 pb-5">
          <div className="h-1 overflow-hidden rounded-full bg-[var(--color-bg3)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, var(--session-practice) 60%, var(--session-qualifying) 80%, var(--session-race) 100%)",
              }}
            />
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-[10px] text-ink3">FP1</span>
            <span className="text-[10px] font-medium text-ink3">{completedSessions}/{totalSessions} complete</span>
            <span className="text-[10px] text-ink3">Race</span>
          </div>
        </div>
      </DashCard>

      <DashCard>
        <div className="border-b border-[var(--color-line2)] px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-ink3">Circuit Stats</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-[var(--color-line)]">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-5">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.8px] text-ink3">{stat.label}</p>
              <p className="font-display text-[22px] leading-none tracking-[0.5px] text-ink">{stat.value}</p>
              <p className="mt-1 text-[11px] text-ink3">{stat.sub}</p>
            </div>
          ))}
        </div>
      </DashCard>
    </aside>
  );
}

function ResultsTables({ weekend }: { weekend: EventWeekend }) {
  if (weekend.results.length === 0) {
    return (
      <DashCard className="p-8 text-center text-[13px] text-ink3">
        Event-linked result data is unavailable for this weekend.
      </DashCard>
    );
  }

  const defaultTab = weekend.results.find((result) => result.key === "qualifying")?.key ?? weekend.results[0]?.key;

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="flex w-fit rounded-[10px] border border-[var(--color-line2)] bg-white p-1">
        {weekend.results.map((result) => (
          <TabsTrigger
            key={result.key}
            value={result.key}
            className="rounded-[7px] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.8px] text-ink3 transition-all data-[state=active]:bg-ink data-[state=active]:text-white"
          >
            {result.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {weekend.results.map((result) => (
        <TabsContent key={result.key} value={result.key}>
          <DashCard>
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--color-line)] hover:bg-transparent">
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[1px] text-ink3">Pos</TableHead>
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[1px] text-ink3">Entry</TableHead>
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[1px] text-ink3">Team</TableHead>
                  <TableHead className="px-5 py-4 text-[10px] uppercase tracking-[1px] text-ink3">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.map((row) => (
                  <TableRow key={`${result.key}-${row.position}-${row.entry}`} className="border-[var(--color-line)] hover:bg-[var(--color-bg)]">
                    <TableCell className="px-5 py-4 text-[13px] font-medium text-ink2">{row.position}</TableCell>
                    <TableCell className="px-5 py-4 text-[13px] font-medium text-ink">
                      {getDriverHrefByName(row.entry) ? (
                        <Link href={getDriverHrefByName(row.entry)!} className="hover:text-[var(--color-red)]">
                          {row.entry}
                        </Link>
                      ) : row.entry}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-[13px] text-ink2">
                      {getTeamHrefByName(row.team) ? (
                        <Link href={getTeamHrefByName(row.team)!} className="hover:text-ink">
                          {row.team}
                        </Link>
                      ) : row.team}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-[13px] font-medium text-ink">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DashCard>
        </TabsContent>
      ))}
    </Tabs>
  );
}

function OverviewPanel({ weekend }: { weekend: EventWeekend }) {
  return (
    <DashCard className="p-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Round", value: weekend.round },
          { label: "Date Range", value: weekend.dateRange },
          { label: "Next Session", value: weekend.nextSession },
        ].map((item) => (
          <div key={item.label} className="rounded-[10px] border border-[var(--color-line2)] bg-[var(--color-bg)] p-5">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[1px] text-ink3">{item.label}</p>
            <p className="text-[15px] font-medium text-ink">{item.value}</p>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

function CircuitInfoPanel({ weekend }: { weekend: EventWeekend }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DashCard>
        <div className="border-b border-[var(--color-line2)] px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-ink3">Circuit Facts</p>
        </div>
        {weekend.facts.map((fact) => (
          <div key={fact.label} className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] px-6 py-3.5 last:border-b-0">
            <span className="text-[12px] text-ink3">{fact.label}</span>
            <span className="text-right text-[13px] font-medium text-ink">{fact.value}</span>
          </div>
        ))}
      </DashCard>
      <DashCard>
        <div className="border-b border-[var(--color-line2)] px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-ink3">Record Book</p>
        </div>
        {weekend.records.map((record) => (
          <div key={record.label} className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] px-6 py-3.5 last:border-b-0">
            <span className="text-[12px] text-ink3">{record.label}</span>
            <span className="text-right text-[13px] font-medium text-ink">{record.value}</span>
          </div>
        ))}
      </DashCard>
    </div>
  );
}

type EventPageViewProps = {
  slug: string;
  season?: number;
  round?: number;
};

export function EventPageView({ slug, season, round }: EventPageViewProps) {
  const [weekend, setWeekend] = useState<EventWeekend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (season) query.set("season", String(season));
      if (round) query.set("round", String(round));

      const suffix = query.toString() ? `?${query.toString()}` : "";

      try {
        const data = await fetchInternalApi<EventWeekend>(`/api/events/by-slug/${slug}${suffix}`);
        if (!cancelled) {
          setWeekend(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load event.");
          setWeekend(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      cancelled = true;
    };
  }, [round, season, slug]);

  if (loading) {
    return (
      <DashCard className="p-8 text-center text-[13px] text-ink3">
        Loading event weekend...
      </DashCard>
    );
  }

  if (error || !weekend) {
    return (
      <DashCard className="border-[var(--color-red-border)] bg-[var(--color-red-bg)] p-8 text-center text-[13px] text-[var(--color-red)]">
        {error ?? "Event data is not available yet."}
      </DashCard>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1140px] px-0 pb-20">
      <WeekendHero weekend={weekend} />

      <Tabs defaultValue="weekend-schedule" className="space-y-6">
        <TabsList className="flex w-fit flex-wrap rounded-[10px] border border-[var(--color-line2)] bg-white p-1 animate-fade-up animate-fade-up-2">
          {[
            ["overview", "Overview"],
            ["weekend-schedule", "Weekend Schedule"],
            ["results", "Results"],
            ["circuit-info", "Circuit Info"],
          ].map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-[7px] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.8px] text-ink3 transition-all data-[state=active]:bg-ink data-[state=active]:text-white sm:px-6"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
          <div>
            <TabsContent value="overview">
              <OverviewPanel weekend={weekend} />
            </TabsContent>
            <TabsContent value="weekend-schedule">
              <SchedulePanel weekend={weekend} />
            </TabsContent>
            <TabsContent value="results">
              <ResultsTables weekend={weekend} />
            </TabsContent>
            <TabsContent value="circuit-info">
              <CircuitInfoPanel weekend={weekend} />
            </TabsContent>
          </div>

          <WeekendSidebar weekend={weekend} />
        </div>
      </Tabs>
    </div>
  );
}
