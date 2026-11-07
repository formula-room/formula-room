"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { getDriverHref, getTeamHref, getTeamHrefByName } from "@/lib/route-helpers";
import { SectionTabs, tabButtonId, tabPanelId } from "@/components/home/section-tabs";
import { StandingsRow } from "@/components/home/rank-row";
import {
  DashCard,
  DashCardHead,
  SearchBox,
  TeamIconBadge,
  premiumSelectContentClass,
  premiumSelectTriggerClass,
} from "@/components/dashboard/page-primitives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DriverStanding = {
  slug: string;
  position: string;
  driver: string;
  flag: string;
  flagCountry: string;
  team: string;
  teamColor: string;
  points: string;
  wins: number;
  podiums: number;
};

type TeamStanding = {
  slug: string;
  position: string;
  team: string;
  teamColor: string;
  points: string;
  wins: number;
  podiums: number;
};

type StandingsTab = "drivers" | "teams";
const STANDINGS_TABS_ID = "standings-page";

function toNumber(value: string | number) {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPoints(value: string | number) {
  const points = toNumber(value);
  return Number.isInteger(points) ? String(points) : points.toFixed(1);
}

function gapToLeader(points: string | number, leaderPoints: number) {
  const gap = leaderPoints - toNumber(points);
  if (gap <= 0) {
    return "Leader";
  }

  return `-${formatPoints(gap)}`;
}

function abbrFromName(name: string) {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words.map((word) => word[0]).join("").slice(0, 3).toUpperCase();
}

function displayDriverName(name: string) {
  return name === "Andrea Kimi Antonelli" ? "Kimi Antonelli" : name;
}

function teamIdFromText(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("red bull")) return "redbull";
  if (normalized.includes("racing bulls") || normalized === "rb") return "rb";
  if (normalized.includes("aston")) return "aston";
  if (normalized.includes("mercedes")) return "mercedes";
  if (normalized.includes("ferrari")) return "ferrari";
  if (normalized.includes("mclaren") || normalized.includes("mc laren")) return "mclaren";
  if (normalized.includes("williams")) return "williams";
  if (normalized.includes("alpine")) return "alpine";
  if (normalized.includes("haas")) return "haas";
  if (normalized.includes("sauber")) return "sauber";
  if (normalized.includes("cadillac")) return "cadillac";
  if (normalized.includes("audi")) return "audi";

  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[12px] border border-dashed border-[var(--color-line2)] bg-[var(--color-bg)] px-6 text-center text-sm text-ink2">
      {message}
    </div>
  );
}

function statLabel(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function splitColumns<T>(rows: T[]) {
  const midpoint = Math.ceil(rows.length / 2);
  return [rows.slice(0, midpoint), rows.slice(midpoint)];
}

function StandingsMeta({ team, wins, podiums, gap }: { team: string; wins: number; podiums: number; gap: string }) {
  const teamHref = team.includes(" / ") ? null : getTeamHrefByName(team);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-ink3 sm:text-xs">
      {teamHref ? (
        <Link href={teamHref} className="truncate hover:text-ink">
          {team}
        </Link>
      ) : (
        <span className="truncate">{team}</span>
      )}
      <span aria-hidden="true">·</span>
      <span>{statLabel(wins, "Win", "Wins")}</span>
      <span aria-hidden="true">·</span>
      <span>{statLabel(podiums, "Podium", "Podiums")}</span>
      <span aria-hidden="true">·</span>
      <span>{gap}</span>
    </div>
  );
}

function DriverRows({ rows, leaderPoints }: { rows: DriverStanding[]; leaderPoints: number }) {
  const columns = splitColumns(rows);

  return (
    <div className="grid gap-x-6 gap-y-4 lg:grid-cols-2">
      {columns.map((column, columnIndex) => (
        <ol key={columnIndex} className="space-y-4">
          {column.map((row) => (
            <StandingsRow
              key={row.slug}
              pos={Number.parseInt(row.position, 10) || 0}
              name={displayDriverName(row.driver)}
              team={row.team}
              points={formatPoints(row.points)}
              accentColor={row.teamColor}
              href={getDriverHref(row.slug)}
              showFlag
              flagCountry={row.flagCountry}
              meta={
                <StandingsMeta
                  team={row.team}
                  wins={row.wins}
                  podiums={row.podiums}
                  gap={gapToLeader(row.points, leaderPoints)}
                />
              }
            />
          ))}
        </ol>
      ))}
    </div>
  );
}

function TeamRows({ rows, leaderPoints }: { rows: TeamStanding[]; leaderPoints: number }) {
  const columns = splitColumns(rows);

  return (
    <div className="grid gap-x-6 gap-y-4 lg:grid-cols-2">
      {columns.map((column, columnIndex) => (
        <ol key={columnIndex} className="space-y-4">
          {column.map((row) => (
            <StandingsRow
              key={row.slug}
              pos={Number.parseInt(row.position, 10) || 0}
              name={row.team}
              team={row.team}
              points={formatPoints(row.points)}
              accentColor={row.teamColor}
              href={getTeamHref(row.slug)}
              meta={
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-ink3 sm:text-xs">
                  <span>{statLabel(row.wins, "Win", "Wins")}</span>
                  <span aria-hidden="true">·</span>
                  <span>{statLabel(row.podiums, "Podium", "Podiums")}</span>
                  <span aria-hidden="true">·</span>
                  <span>{gapToLeader(row.points, leaderPoints)}</span>
                </div>
              }
            />
          ))}
        </ol>
      ))}
    </div>
  );
}

function LeaderPanel({
  tab,
  drivers,
  teams,
  season,
  latestRound,
  lastUpdated,
}: {
  tab: StandingsTab;
  drivers: DriverStanding[];
  teams: TeamStanding[];
  season: string;
  latestRound: number | null;
  lastUpdated: string;
}) {
  const isDrivers = tab === "drivers";
  const rows = isDrivers ? drivers : teams;
  const leader = rows[0];
  const leaderPoints = leader ? toNumber(leader.points) : 0;
  const topRows = rows.slice(0, 7);

  if (!leader) {
    return (
      <aside className="space-y-4">
        <DashCard>
          <DashCardHead eyebrow="Leader" title="No data" />
          <div className="p-6 text-sm text-ink2">No standings are available for this season.</div>
        </DashCard>
      </aside>
    );
  }

  const leaderName = isDrivers ? (leader as DriverStanding).driver : (leader as TeamStanding).team;
  const leaderTeam = isDrivers ? (leader as DriverStanding).team : "Constructor";
  const leaderColor = isDrivers ? (leader as DriverStanding).teamColor : (leader as TeamStanding).teamColor;
  const leaderTeamId = teamIdFromText(isDrivers ? leaderTeam : (leader as TeamStanding).slug);

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <DashCard>
        <DashCardHead eyebrow={isDrivers ? "Drivers leader" : "Teams leader"} title="Championship" />
        <div className="p-6">
          <div className="flex items-center gap-4">
            <TeamIconBadge teamId={leaderTeamId} color={leaderColor} abbr={abbrFromName(leaderName)} />
            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold tracking-[-0.02em] text-ink">{leaderName}</h3>
              <p className="mt-1 truncate text-sm text-ink2">{leaderTeam}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <div className="rounded-[10px] bg-[var(--color-bg)] p-3">
              <div className="text-[10px] uppercase tracking-[1px] text-ink3">Points</div>
              <div className="mt-1 font-display text-[28px] leading-none text-ink">{formatPoints(leader.points)}</div>
            </div>
            <div className="rounded-[10px] bg-[var(--color-bg)] p-3">
              <div className="text-[10px] uppercase tracking-[1px] text-ink3">Wins</div>
              <div className="mt-1 font-display text-[28px] leading-none text-ink">{leader.wins}</div>
            </div>
            <div className="rounded-[10px] bg-[var(--color-bg)] p-3">
              <div className="text-[10px] uppercase tracking-[1px] text-ink3">Podiums</div>
              <div className="mt-1 font-display text-[28px] leading-none text-ink">{leader.podiums}</div>
            </div>
          </div>
        </div>
      </DashCard>

      <DashCard>
        <DashCardHead eyebrow="Gap watch" title="Top runners" />
        <div className="divide-y divide-[var(--color-line)] px-6 py-2 text-sm">
          {topRows.map((row) => (
            <div key={row.slug} className="flex items-center justify-between gap-3 py-3">
              <span className="truncate font-semibold text-ink">
                {isDrivers ? (row as DriverStanding).driver : (row as TeamStanding).team}
              </span>
              <span className="flex-shrink-0 text-ink2">{gapToLeader(row.points, leaderPoints)}</span>
            </div>
          ))}
        </div>
      </DashCard>

      <DashCard>
        <DashCardHead eyebrow="Season" title={season || "Season"} />
        <div className="divide-y divide-[var(--color-line)] px-6 py-2 text-sm">
          <div className="flex items-center justify-between py-3">
            <span className="text-ink2">Rounds included</span>
            <span className="font-semibold text-ink">{latestRound ?? 0}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-ink2">Entries</span>
            <span className="font-semibold text-ink">{rows.length}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-ink2">Points leader</span>
            <span className="max-w-[150px] truncate text-right font-semibold text-ink">{leaderName}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-ink2">Last updated</span>
            <span className="truncate text-right font-semibold text-ink">{lastUpdated || "Awaiting data"}</span>
          </div>
        </div>
      </DashCard>
    </aside>
  );
}

export function StandingsPageView() {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [season, setSeason] = useState("");
  const [tab, setTab] = useState<StandingsTab>("drivers");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "teams") {
      setTab("teams");
    }
  }, []);
  const [search, setSearch] = useState("");
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [teams, setTeams] = useState<TeamStanding[]>([]);
  const [latestRound, setLatestRound] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSeasons() {
      setLoading(true);
      setError(null);

      try {
        const seasonRows = await fetchInternalApi<Array<{ year: number }>>("/api/seasons");
        if (cancelled) {
          return;
        }

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

    async function loadStandings() {
      if (!season) {
        setDrivers([]);
        setTeams([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const payload = await fetchInternalApi<{
          seasonYear: number;
          seasons: string[];
          lastUpdated: string;
          latestRound: number;
          drivers: DriverStanding[];
          teams: TeamStanding[];
        }>(`/api/standings/${season}`);

        if (cancelled) {
          return;
        }

        setSeasons((current) => (current.length ? current : payload.seasons));
        setDrivers(payload.drivers);
        setTeams(payload.teams);
        setLatestRound(payload.latestRound);
        setLastUpdated(payload.lastUpdated);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load standings.");
          setDrivers([]);
          setTeams([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadStandings();

    return () => {
      cancelled = true;
    };
  }, [season]);

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return drivers;
    }

    return drivers.filter((row) =>
      [row.driver, row.team, row.position].some((value) => value.toLowerCase().includes(query)),
    );
  }, [drivers, search]);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return teams;
    }

    return teams.filter((row) =>
      [row.team, row.position].some((value) => value.toLowerCase().includes(query)),
    );
  }, [teams, search]);

  const activeRows = tab === "drivers" ? filteredDrivers : filteredTeams;
  const leaderPoints = tab === "drivers" ? toNumber(drivers[0]?.points ?? 0) : toNumber(teams[0]?.points ?? 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[2px] text-ink3">
            Championship table
          </p>
          <h1 className="font-display text-[64px] leading-[0.9] tracking-[1px] text-ink sm:text-[78px]">
            Standings
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-ink2">
            Track the championship order, points gaps, and scoring zones across the current season data.
          </p>
        </div>

        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className={`${premiumSelectTriggerClass} w-full sm:w-[180px]`}>
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent className={premiumSelectContentClass}>
            {seasons.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="focus:bg-[var(--color-bg)] focus:text-ink"
              >
                Season {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashCard>
          <SectionTabs
            idPrefix={STANDINGS_TABS_ID}
            tabs={[
              { value: "drivers", label: "Driver Championship" },
              { value: "teams", label: "Team Championship" },
            ]}
            active={tab}
            onChange={(value) => {
              setTab(value as StandingsTab);
              setSearch("");
            }}
            className="overflow-x-auto"
          />

          <div className="flex flex-col gap-3 border-b border-[var(--color-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-ink3">
              {activeRows.length} {tab === "drivers" ? "drivers" : "teams"}
            </div>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder={tab === "drivers" ? "Search driver or team" : "Search team"}
            />
          </div>

          <div
            id={tabPanelId(STANDINGS_TABS_ID, tab)}
            role="tabpanel"
            aria-labelledby={tabButtonId(STANDINGS_TABS_ID, tab)}
            tabIndex={0}
            className="p-5 sm:p-6"
          >
            {loading ? (
              <EmptyState message="Loading standings..." />
            ) : error ? (
              <EmptyState message={error} />
            ) : tab === "drivers" ? (
              filteredDrivers.length > 0 ? (
                <DriverRows rows={filteredDrivers} leaderPoints={leaderPoints} />
              ) : (
                <EmptyState message="No driver standings match the current search." />
              )
            ) : filteredTeams.length > 0 ? (
              <TeamRows rows={filteredTeams} leaderPoints={leaderPoints} />
            ) : (
              <EmptyState message="No constructor standings match the current search." />
            )}
          </div>
        </DashCard>

        <LeaderPanel
          tab={tab}
          drivers={drivers}
          teams={teams}
          season={season}
          latestRound={latestRound}
          lastUpdated={lastUpdated}
        />
      </div>
    </div>
  );
}
