"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { cn } from "@/lib/utils";
import { getDriverHref, getTeamHref, getTeamHrefByName } from "@/lib/route-helpers";
import {
  DashCard,
  DashCardHead,
  MedalPos,
  TeamIconBadge,
  TeamStripeV,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DriverStanding = {
  slug: string;
  position: string;
  driver: string;
  flag: string;
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
type ZoneKey = "points" | "lower" | "none";

const zoneLabels: Record<ZoneKey, string> = {
  points: "Points scorers",
  lower: "Lower scorers",
  none: "No points yet",
};

function toNumber(value: string | number) {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPosition(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 999;
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

function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) {
    return name;
  }

  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

function abbrFromName(name: string) {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words.map((word) => word[0]).join("").slice(0, 3).toUpperCase();
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

function zoneForPoints(points: string | number): ZoneKey {
  const value = toNumber(points);

  if (value > 10) {
    return "points";
  }

  if (value > 0) {
    return "lower";
  }

  return "none";
}

function groupByZone<T extends { points: string | number }>(rows: T[]) {
  const groups: Record<ZoneKey, T[]> = {
    points: [],
    lower: [],
    none: [],
  };

  for (const row of rows) {
    groups[zoneForPoints(row.points)].push(row);
  }

  return groups;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[12px] border border-dashed border-[var(--color-line2)] bg-[var(--color-bg)] px-6 text-center text-sm text-ink2">
      {message}
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full sm:w-[260px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink3" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-full border border-[var(--color-line2)] bg-white pl-9 pr-4 text-sm text-ink outline-none transition focus:border-[var(--color-red-border)] focus:bg-white"
      />
    </label>
  );
}

function ZoneDivider({ label, count }: { label: string; count: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3">
      <div className="h-px bg-[var(--color-line)]" />
      <div className="text-[10px] font-semibold uppercase tracking-[1.3px] text-ink3">
        {label} <span className="text-ink4">({count})</span>
      </div>
      <div className="h-px bg-[var(--color-line)]" />
    </div>
  );
}

function DriverRows({
  rows,
  leaderPoints,
}: {
  rows: DriverStanding[];
  leaderPoints: number;
}) {
  const groups = groupByZone(rows);
  const zones: ZoneKey[] = ["points", "lower", "none"];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[72px_2fr_1.35fr_120px_92px_104px_108px] items-center border-b border-[var(--color-line)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[1.2px] text-ink3">
          <div>Pos</div>
          <div>Driver</div>
          <div>Team</div>
          <div className="text-right">Points</div>
          <div className="text-right">Wins</div>
          <div className="text-right">Podiums</div>
          <div className="text-right">Gap</div>
        </div>

        {zones.map((zone) =>
          groups[zone].length ? (
            <div key={zone}>
              <ZoneDivider label={zoneLabels[zone]} count={groups[zone].length} />
              {groups[zone].map((row) => {
                const pos = toPosition(row.position);
                const driverHref = getDriverHref(row.slug);
                const teamHref = row.team.includes(" / ") ? null : getTeamHrefByName(row.team);

                return (
                  <div
                    key={row.slug}
                    className={cn(
                      "grid grid-cols-[72px_2fr_1.35fr_120px_92px_104px_108px] items-center border-b border-[var(--color-line)] px-4 py-3 transition hover:bg-[var(--color-bg)]",
                      toNumber(row.points) === 0 && "opacity-65",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <TeamStripeV color={row.teamColor} />
                      <MedalPos pos={pos} />
                    </div>
                    <div className="min-w-0">
                      {driverHref ? (
                        <Link href={driverHref} className="truncate font-semibold text-ink hover:text-[var(--color-red)]">
                          <span className="mr-2">{row.flag}</span>
                          {row.driver}
                        </Link>
                      ) : (
                        <span className="truncate font-semibold text-ink">
                          <span className="mr-2">{row.flag}</span>
                          {row.driver}
                        </span>
                      )}
                      <div className="mt-0.5 text-xs text-ink3">{shortName(row.driver)}</div>
                    </div>
                    <div className="min-w-0 text-sm text-ink2">
                      {teamHref ? (
                        <Link href={teamHref} className="truncate hover:text-ink">
                          {row.team}
                        </Link>
                      ) : (
                        <span className="truncate">{row.team}</span>
                      )}
                    </div>
                    <div className="text-right font-display text-[28px] leading-none tracking-[0.5px] text-ink">
                      {formatPoints(row.points)}
                    </div>
                    <div className="text-right text-sm font-medium text-ink2">{row.wins}</div>
                    <div className="text-right text-sm font-medium text-ink2">{row.podiums}</div>
                    <div className="text-right text-sm font-medium text-ink3">{gapToLeader(row.points, leaderPoints)}</div>
                  </div>
                );
              })}
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}

function TeamRows({
  rows,
  leaderPoints,
}: {
  rows: TeamStanding[];
  leaderPoints: number;
}) {
  const groups = groupByZone(rows);
  const zones: ZoneKey[] = ["points", "lower", "none"];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[72px_2fr_120px_92px_104px_108px] items-center border-b border-[var(--color-line)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[1.2px] text-ink3">
          <div>Pos</div>
          <div>Team</div>
          <div className="text-right">Points</div>
          <div className="text-right">Wins</div>
          <div className="text-right">Podiums</div>
          <div className="text-right">Gap</div>
        </div>

        {zones.map((zone) =>
          groups[zone].length ? (
            <div key={zone}>
              <ZoneDivider label={zoneLabels[zone]} count={groups[zone].length} />
              {groups[zone].map((row) => {
                const pos = toPosition(row.position);
                const teamId = teamIdFromText(row.slug || row.team);
                const teamHref = getTeamHref(row.slug);

                return (
                  <div
                    key={row.slug}
                    className={cn(
                      "grid grid-cols-[72px_2fr_120px_92px_104px_108px] items-center border-b border-[var(--color-line)] px-4 py-3 transition hover:bg-[var(--color-bg)]",
                      toNumber(row.points) === 0 && "opacity-65",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <TeamStripeV teamId={teamId} color={row.teamColor} />
                      <MedalPos pos={pos} />
                    </div>
                    <div className="flex min-w-0 items-center gap-3">
                      <TeamIconBadge teamId={teamId} color={row.teamColor} abbr={abbrFromName(row.team)} />
                      {teamHref ? (
                        <Link href={teamHref} className="truncate font-semibold text-ink hover:text-[var(--color-red)]">
                          {row.team}
                        </Link>
                      ) : (
                        <span className="truncate font-semibold text-ink">{row.team}</span>
                      )}
                    </div>
                    <div className="text-right font-display text-[28px] leading-none tracking-[0.5px] text-ink">
                      {formatPoints(row.points)}
                    </div>
                    <div className="text-right text-sm font-medium text-ink2">{row.wins}</div>
                    <div className="text-right text-sm font-medium text-ink2">{row.podiums}</div>
                    <div className="text-right text-sm font-medium text-ink3">{gapToLeader(row.points, leaderPoints)}</div>
                  </div>
                );
              })}
            </div>
          ) : null,
        )}
      </div>
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
        <div className="space-y-4 p-6">
          {topRows.map((row) => {
            const name = isDrivers ? (row as DriverStanding).driver : (row as TeamStanding).team;
            const color = row.teamColor;
            const width = leaderPoints > 0 ? Math.max((toNumber(row.points) / leaderPoints) * 100, 3) : 3;

            return (
              <div key={row.slug}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-semibold text-ink">{name}</span>
                  <span className="text-ink3">{gapToLeader(row.points, leaderPoints)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg2)]">
                  <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
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
                className="focus:bg-slate-950/8 focus:text-slate-950 dark:focus:bg-white/8 dark:focus:text-white"
              >
                Season {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashCard>
          <div className="flex flex-col gap-4 border-b border-[var(--color-line)] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={tab}
              onValueChange={(value) => {
                setTab(value as StandingsTab);
                setSearch("");
              }}
            >
              <TabsList className="h-auto rounded-full border border-[var(--color-line2)] bg-[var(--color-bg)] p-1">
                <TabsTrigger
                  value="drivers"
                  className="rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[1.2px] text-ink2 data-[state=active]:bg-ink data-[state=active]:text-white"
                >
                  Drivers
                </TabsTrigger>
                <TabsTrigger
                  value="teams"
                  className="rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[1.2px] text-ink2 data-[state=active]:bg-ink data-[state=active]:text-white"
                >
                  Teams
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="text-xs text-ink3">
                {activeRows.length} {tab === "drivers" ? "drivers" : "teams"}
              </div>
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder={tab === "drivers" ? "Search driver or team" : "Search team"}
              />
            </div>
          </div>

          <div className="p-4">
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
