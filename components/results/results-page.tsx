"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import {
  DashboardPageHeader,
  DashboardPanel,
  DataTableShell,
  FilterPill,
  premiumInputClass,
  premiumSelectContentClass,
  premiumSelectTriggerClass,
} from "@/components/dashboard/page-primitives";
import { getDriverHrefByName, getEventHrefBySlug, getTeamHrefByName } from "@/lib/route-helpers";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ResultsSessionType = "Race" | "Qualifying" | "Sprint";

type ResultsSummaryCard = {
  label: string;
  driver: string;
  flag: string;
  team: string;
  value: string;
};

type ResultsRow = {
  position: string;
  driver: string;
  flag: string;
  team: string;
  teamColor: string;
  laps?: string;
  timeOrGap: string;
  points?: string;
  status: string;
};

type ResultsSession = {
  type: ResultsSessionType;
  date: string;
  summaryCards: ResultsSummaryCard[];
  rows: ResultsRow[];
};

type ResultsEvent = {
  slug: string;
  href: string;
  grandPrix: string;
  circuit: string;
  dateRange: string;
  season: string;
  sessions: ResultsSession[];
};

type CalendarEventOption = {
  round: string;
  grandPrix: string;
  circuit: string;
  date: string;
  href: string;
  status?: "Cancelled" | "Completed" | "Upcoming" | "This Weekend";
};

function SummaryCard({
  label,
  driver,
  flag,
  team,
  value,
}: {
  label: string;
  driver: string;
  flag: string;
  team: string;
  value: string;
}) {
  return (
    <Card className="rounded-[1.5rem] border-white/10 bg-[#0f1520]/88 p-5">
      <div className="text-[11px] uppercase tracking-[0.28em] text-white/36">{label}</div>
      <div className="mt-4 flex items-start gap-3">
        <div className="flex size-11 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-xl">
          {flag}
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-white">{driver}</div>
          <div className="mt-1 text-sm text-white/48">{team}</div>
          <div className="mt-3 text-lg font-medium text-[#ff8b68]">{value}</div>
        </div>
      </div>
    </Card>
  );
}

function EventHeader({
  event,
  session,
}: {
  event: ResultsEvent;
  session: ResultsSession;
}) {
  const eventHref = event.href || getEventHrefBySlug(event.slug);

  return (
    <Card className="rounded-[1.75rem] border-white/10 bg-[#0f1520]/88 p-6">
      <div className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.34em] text-white/36">Selected Session</div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{event.grandPrix}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/54">
              <span>{event.circuit}</span>
              <span>{session.date}</span>
              <Badge className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/70">
                {session.type}
              </Badge>
            </div>
          </div>
          {eventHref ? (
            <Link href={eventHref} className="text-sm text-[#ff8b68] hover:text-[#ffab91]">
              Open weekend schedule
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function ResultsTable({
  rows,
  sessionType,
  query,
}: {
  rows: ResultsRow[];
  sessionType: ResultsSessionType;
  query: string;
}) {
  const filteredRows = useMemo(() => {
    return rows.filter((row) => `${row.driver} ${row.team}`.toLowerCase().includes(query.toLowerCase()));
  }, [rows, query]);

  const showRaceColumns = sessionType === "Race";

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow className="border-white/8 hover:bg-transparent">
            <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Position</TableHead>
            <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Driver</TableHead>
            <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Team</TableHead>
            {showRaceColumns ? (
              <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Laps</TableHead>
            ) : null}
            <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Time / Gap</TableHead>
            {showRaceColumns ? (
              <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Points</TableHead>
            ) : null}
            <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.map((row) => {
            const driverHref = getDriverHrefByName(row.driver);
            const teamHref = getTeamHrefByName(row.team);

            return (
              <TableRow key={`${sessionType}-${row.position}-${row.driver}`} className="border-white/8 hover:bg-white/[0.03]">
                <TableCell className="px-5 py-4 text-sm font-semibold text-white/88">{row.position}</TableCell>
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-1 rounded-full" style={{ backgroundColor: row.teamColor }} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">
                        {driverHref ? (
                          <Link href={driverHref} className="inline-flex items-center gap-2 hover:text-[#ff8b68]">
                            <span>{row.flag}</span>
                            <span>{row.driver}</span>
                          </Link>
                        ) : (
                          <>
                            <span className="mr-2">{row.flag}</span>
                            {row.driver}
                          </>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-white/36 lg:hidden">{row.team}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-white/58">
                  {teamHref ? <Link href={teamHref} className="hover:text-white">{row.team}</Link> : row.team}
                </TableCell>
                {showRaceColumns ? (
                  <TableCell className="px-5 py-4 text-sm text-white/72">{row.laps ?? "--"}</TableCell>
                ) : null}
                <TableCell className="px-5 py-4 text-sm text-white/82">{row.timeOrGap}</TableCell>
                {showRaceColumns ? (
                  <TableCell className="px-5 py-4 text-sm text-white/82">{row.points ?? "--"}</TableCell>
                ) : null}
                <TableCell className="px-5 py-4 text-sm text-white/56">{row.status}</TableCell>
              </TableRow>
            );
          })}
          {filteredRows.length === 0 ? (
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableCell colSpan={showRaceColumns ? 7 : 5} className="px-5 py-14 text-center text-sm text-white/44">
                No matching entries for the current search.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}

export function ResultsPageView() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [season, setSeason] = useState("");
  const [availableEvents, setAvailableEvents] = useState<CalendarEventOption[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [query, setQuery] = useState("");
  const [sessionType, setSessionType] = useState<ResultsSessionType>("Race");
  const [selectedEvent, setSelectedEvent] = useState<ResultsEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSeasons() {
      setLoading(true);

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

    async function loadSeasonEvents() {
      if (!season) {
        setAvailableEvents([]);
        setSelectedRound("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const payload = await fetchInternalApi<{ seasons: string[]; selectedRound: string; events: CalendarEventOption[] }>(
          `/api/calendar/${season}`,
        );

        if (cancelled) return;

        setSeasons((current) => (current.length ? current : payload.seasons));
        setAvailableEvents(payload.events);
        setSelectedRound((current) =>
          payload.events.some((event) => event.round === current)
            ? current
            : (payload.selectedRound || payload.events[0]?.round || ""),
        );
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
          setAvailableEvents([]);
          setSelectedRound("");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSeasonEvents();

    return () => {
      cancelled = true;
    };
  }, [season]);

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      if (!season || !selectedRound) {
        setSelectedEvent(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const payload = await fetchInternalApi<{
          seasonYear: number;
          round: number;
          slug: string;
          grandPrix: string;
          circuit: string;
          date: string;
          sessions: {
            sprint: { summaryCards: ResultsSummaryCard[]; rows: ResultsRow[] };
            race: { summaryCards: ResultsSummaryCard[]; rows: ResultsRow[] };
            qualifying: { summaryCards: ResultsSummaryCard[]; rows: ResultsRow[] };
          };
        }>(`/api/results/${season}/${Number.parseInt(selectedRound, 10)}`);

        if (cancelled) return;

        setSelectedEvent({
          slug: payload.slug,
          href: `/event/${payload.slug}?season=${payload.seasonYear}&round=${payload.round}`,
          grandPrix: payload.grandPrix,
          circuit: payload.circuit,
          dateRange: payload.date,
          season: String(payload.seasonYear),
          sessions: [
            {
              type: "Sprint" as ResultsSessionType,
              date: payload.date,
              summaryCards: payload.sessions.sprint.summaryCards,
              rows: payload.sessions.sprint.rows,
            },
            {
              type: "Race" as ResultsSessionType,
              date: payload.date,
              summaryCards: payload.sessions.race.summaryCards,
              rows: payload.sessions.race.rows,
            },
            {
              type: "Qualifying" as ResultsSessionType,
              date: payload.date,
              summaryCards: payload.sessions.qualifying.summaryCards,
              rows: payload.sessions.qualifying.rows,
            },
          ].filter((session) => session.rows.length > 0 || session.summaryCards.length > 0),
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load results.");
          setSelectedEvent(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadResults();

    return () => {
      cancelled = true;
    };
  }, [season, selectedRound]);

  const validSessionTypes = useMemo(
    () => selectedEvent?.sessions.map((session) => session.type) ?? [],
    [selectedEvent],
  );
  useEffect(() => {
    if (validSessionTypes.length > 0 && !validSessionTypes.includes(sessionType)) {
      setSessionType("Race");
    }
  }, [sessionType, validSessionTypes]);

  const selectedSession =
    selectedEvent?.sessions.find((session) => session.type === sessionType) ??
    selectedEvent?.sessions.find((session) => session.type === "Race") ??
    selectedEvent?.sessions[0];

  return (
    <div className="space-y-6 lg:space-y-8">
      <DashboardPageHeader
        eyebrow="Session Archive"
        title="Results"
        meta={[
          `Season: ${season}`,
          `Events Available: ${availableEvents.length}`,
          `Current Focus: ${selectedEvent?.grandPrix ?? "No event dataset"}`,
        ]}
        actions={
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className={`${premiumSelectTriggerClass} w-full sm:w-[180px]`}>
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent className={premiumSelectContentClass}>
              {seasons.map((option) => (
                <SelectItem key={option} value={option} className="focus:bg-white/8 focus:text-white">
                  Season {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <DashboardPanel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              value={selectedRound}
              onValueChange={(value) => {
                setSelectedRound(value);
                setSessionType("Race");
              }}
            >
              <SelectTrigger className={`${premiumSelectTriggerClass} min-w-[260px]`}>
                <SelectValue placeholder="Grand Prix" />
              </SelectTrigger>
              <SelectContent className={premiumSelectContentClass}>
                {availableEvents.map((event) => (
                  <SelectItem key={event.href} value={event.round} className="focus:bg-white/8 focus:text-white">
                    {event.grandPrix}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sessionType} onValueChange={(value) => setSessionType(value as ResultsSessionType)}>
              <SelectTrigger className={`${premiumSelectTriggerClass} min-w-[220px]`}>
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent className={premiumSelectContentClass}>
                {validSessionTypes.map((type) => (
                  <SelectItem key={type} value={type} className="focus:bg-white/8 focus:text-white">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full lg:max-w-[320px]">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/34" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search drivers or teams"
              className={`${premiumInputClass} pr-4 pl-11`}
            />
          </div>
        </div>
      </DashboardPanel>

      {selectedEvent && selectedSession ? (
        <>
          <EventHeader event={selectedEvent} session={selectedSession} />

          <div className="flex flex-wrap items-center gap-2">
            {validSessionTypes.map((type) => (
              <FilterPill
                key={type}
                active={type === sessionType}
                onClick={() => setSessionType(type)}
                className={
                  type === sessionType
                    ? undefined
                    : "text-slate-700 hover:bg-slate-950/6 hover:text-slate-950 dark:text-white/56 dark:hover:bg-white/[0.08] dark:hover:text-white"
                }
              >
                {type}
              </FilterPill>
            ))}
          </div>

          {selectedSession.summaryCards.length > 0 ? (
            <section className="grid gap-4 xl:grid-cols-4">
              {selectedSession.summaryCards.map((card) => (
                <SummaryCard key={`${selectedSession.type}-${card.label}`} {...card} />
              ))}
            </section>
          ) : null}

          {selectedSession.rows.length > 0 ? (
            <ResultsTable rows={selectedSession.rows} sessionType={selectedSession.type} query={query} />
          ) : (
            <Card className="rounded-[1.75rem] border-white/10 bg-[#0f1520]/88 p-8 text-center text-white/56">
              {selectedSession.type} data is unavailable for this event.
            </Card>
          )}
        </>
      ) : (
        <Card className="rounded-[1.75rem] border-white/10 bg-[#0f1520]/88 p-8 text-center text-white/56">
          {loading ? "Loading results..." : (error ?? `No event dataset is wired for season ${season} yet.`)}
        </Card>
      )}
    </div>
  );
}
