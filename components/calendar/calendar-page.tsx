"use client";

import { useEffect, useMemo, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { CalendarToolbar, type CalendarFilter, type CalendarViewMode } from "@/components/calendar/CalendarToolbar";
import { RaceCardGrid } from "@/components/calendar/RaceCardGrid";
import { RaceListView } from "@/components/calendar/RaceListView";
import { SeasonProgress } from "@/components/calendar/SeasonProgress";
import type { CalendarRaceCardItem } from "@/components/calendar/RaceCard";
import type { RaceStatus } from "@/components/calendar/RaceStatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  premiumSelectContentClass,
  premiumSelectTriggerClass,
} from "@/components/dashboard/page-primitives";

type CalendarStatus = "Cancelled" | "Completed" | "Upcoming" | "This Weekend";

type CalendarEvent = {
  round: string;
  grandPrix: string;
  country: string;
  flagCountry: string;
  circuit: string;
  date: string;
  status: CalendarStatus;
  href?: string;
  highlight?: boolean;
};

type CalendarRace = CalendarRaceCardItem & {
  monthLabel: string;
  sourceStatus: CalendarStatus;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Sep", "Oct", "Nov", "Dec"];
const monthNumberByShortName: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sept: 8,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function raceStatusFromEvent(event: CalendarEvent): RaceStatus {
  if (event.status === "Completed" || event.status === "Cancelled") {
    return "done";
  }

  return "upcoming";
}

function parseRound(round: string) {
  const parsed = Number.parseInt(round, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getMonthLabel(dateRange: string, season: string) {
  const match = dateRange.match(new RegExp(`(${monthNames.join("|")})\\b`, "i"));
  const monthToken = match?.[1] ?? "";
  const normalizedMonth =
    Object.keys(monthNumberByShortName).find((key) => key.toLowerCase() === monthToken.toLowerCase()) ?? "Jan";
  const date = new Date(Date.UTC(Number.parseInt(season, 10), monthNumberByShortName[normalizedMonth], 1));

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function normalizeEvents(events: CalendarEvent[], season: string): CalendarRace[] {
  const nextIndex = events.findIndex((event) => event.status === "This Weekend" || event.status === "Upcoming");

  return events.map((event, index) => {
    const round = parseRound(event.round);
    const status = raceStatusFromEvent(event);
    const isNext = index === nextIndex;

    return {
      id: `${event.round}-${event.grandPrix}-${event.date}`,
      round,
      name: event.grandPrix,
      country: event.country,
      flagCountry: event.flagCountry,
      circuit: event.circuit,
      dateRange: event.date,
      status,
      isNext,
      href: event.href,
      monthLabel: getMonthLabel(event.date, season),
      sourceStatus: event.status,
    };
  });
}

function groupByMonth(races: CalendarRace[]) {
  const groups: Array<{ monthLabel: string; races: CalendarRace[] }> = [];

  for (const race of races) {
    const existing = groups.find((group) => group.monthLabel === race.monthLabel);
    if (existing) {
      existing.races.push(race);
    } else {
      groups.push({ monthLabel: race.monthLabel, races: [race] });
    }
  }

  return groups;
}

export function CalendarPageView() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [season, setSeason] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filter, setFilter] = useState<CalendarFilter>("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<CalendarViewMode>("list");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSeasons() {
      setLoading(true);
      setError(null);

      try {
        const seasonRows = await fetchInternalApi<Array<{ year: number }>>("/api/seasons");
        if (cancelled) return;

        const nextSeasons = seasonRows.map((item) => String(item.year));
        setSeasons(nextSeasons);
        setSeason((current) => (nextSeasons.includes(current) ? current : (nextSeasons[0] ?? current)));
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load seasons.");
          setLoading(false);
        }
      }
    }

    void loadSeasons();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCalendar() {
      if (!season) {
        setEvents([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const payload = await fetchInternalApi<{ seasons: string[]; events: CalendarEvent[] }>(
          `/api/calendar/${season}`,
        );

        if (cancelled) return;

        setSeasons((current) => (current.length ? current : payload.seasons));
        setEvents(payload.events);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load calendar.");
          setEvents([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCalendar();

    return () => {
      cancelled = true;
    };
  }, [season]);

  const races = useMemo(() => normalizeEvents(events, season || String(new Date().getFullYear())), [events, season]);

  const filteredRaces = useMemo(() => {
    const query = search.trim().toLowerCase();

    return races.filter((race) => {
      const statusMatch =
        filter === "All" ||
        (filter === "Completed" && race.status === "done") ||
        (filter === "Upcoming" && (race.status === "upcoming" || race.isNext));

      const searchMatch =
        !query ||
        race.name.toLowerCase().includes(query) ||
        race.circuit.toLowerCase().includes(query) ||
        race.country.toLowerCase().includes(query);

      return statusMatch && searchMatch;
    });
  }, [filter, races, search]);

  const visibleMonthGroups = useMemo(() => groupByMonth(filteredRaces), [filteredRaces]);
  const totalRounds = races.length;
  const completedRounds = races.filter((race) => race.status === "done").length;
  const nextRace = races.find((race) => race.isNext);
  const remainingRounds = Math.max(totalRounds - completedRounds, 0);

  return (
    <div className="mx-auto max-w-[1140px] px-4 py-8 pb-20 sm:px-8 lg:py-10">
      <section className="mb-8 flex flex-col gap-6 animate-fade-up animate-fade-up-1 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-5 bg-[var(--color-red)]" />
            <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-ink3">
              Season Planner
            </span>
          </div>
          <h1 className="font-display text-[64px] leading-[0.92] tracking-[1px] text-ink">
            Calendar
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-ink3" />
              <span className="text-[11px] font-medium text-ink3">Total rounds</span>
              <span className="text-[12px] font-medium text-ink">{totalRounds}</span>
            </div>
            <div className="hidden h-3.5 w-px bg-[var(--color-line2)] sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cal-next)] animate-pulse" />
              <span className="text-[11px] font-medium text-ink3">Next event</span>
              <span className="text-[12px] font-medium text-ink">{nextRace?.name ?? "No upcoming event"}</span>
            </div>
            <div className="hidden h-3.5 w-px bg-[var(--color-line2)] sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cal-done)]" />
              <span className="text-[11px] font-medium text-ink3">Completed</span>
              <span className="text-[12px] font-medium text-ink">{completedRounds} of {totalRounds}</span>
            </div>
          </div>
        </div>

        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className={`${premiumSelectTriggerClass} h-10 w-full rounded-[8px] px-4 sm:w-[180px]`}>
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent className={premiumSelectContentClass}>
            {seasons.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="focus:bg-slate-950/8 focus:text-slate-950 dark:focus:bg-white/8 dark:focus:text-white"
              >
                Season {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <SeasonProgress
        completedRounds={completedRounds}
        totalRounds={totalRounds}
        remainingRounds={remainingRounds}
        firstRaceName={races[0]?.name ?? ""}
        lastRaceName={races[races.length - 1]?.name ?? ""}
      />

      <CalendarToolbar
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        view={view}
        onViewChange={setView}
      />

      {loading ? (
        <div className="rounded-[14px] border border-[var(--color-line2)] bg-white px-6 py-16 text-center text-sm text-ink3 animate-fade-up animate-fade-up-4">
          Loading season calendar...
        </div>
      ) : error ? (
        <div className="rounded-[14px] border border-[var(--color-line2)] bg-white px-6 py-16 text-center text-sm text-[var(--color-red)] animate-fade-up animate-fade-up-4">
          {error}
        </div>
      ) : view === "list" ? (
        <RaceListView groups={visibleMonthGroups} />
      ) : (
        <RaceCardGrid races={filteredRaces} />
      )}
    </div>
  );
}
