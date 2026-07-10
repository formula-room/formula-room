import "server-only";

import { asc, eq } from "drizzle-orm";

import { getConstructorTheme, getDriverRouteSlug, getFlagEmoji, formatOrdinal, formatPoints, isDnfStatus } from "@/lib/f1/presentation";
import { getDatabase } from "@/lib/db/client";
import { constructors, driverSeasonStandings, drivers, raceResults, races, sprintResults } from "@/lib/db/schema";
import { getSeasonsList } from "@/lib/server/queries/seasons";

export type StatisticsDetailSlug =
  | "championships"
  | "wins"
  | "podiums"
  | "pole-positions"
  | "points"
  | "dnf-reliability"
  | "laps-led"
  | "sprint"
  | "special-achievements";

type StatisticRow = {
  slug: string;
  name: string;
  flag: string;
  team: string;
  primaryValue: string;
  starts: string;
  secondaryValue: string;
};

type StatisticsDetailData = {
  slug: StatisticsDetailSlug;
  title: string;
  eyebrow: string;
  description: string;
  metricLabel: string;
  secondaryLabel: string;
  seasons: string[];
  selectedSeason: string;
  supportsSeasonScope: boolean;
  rows: StatisticRow[];
  foundation?: {
    message: string;
    links: Array<{ label: string; href: string }>;
  };
};

type DriverAggregate = {
  driverId: string;
  name: string;
  flag: string;
  latestTeam: string;
  starts: number;
  wins: number;
  podiums: number;
  poles: number;
  points: number;
  sprintWins: number;
  sprintPodiums: number;
  sprintPoints: number;
  sprintStarts: number;
  dnfs: number;
  seasonEntries: number;
  latestTitleSeason?: number;
  championships: number;
  bestSeasonFinish: number | null;
  selectedSeasonFinish: number | null;
};

function createFoundationPage(
  slug: StatisticsDetailSlug,
  title: string,
  description: string,
  message: string,
  links: Array<{ label: string; href: string }>,
  seasons: string[],
  selectedSeason: string,
): StatisticsDetailData {
  return {
    slug,
    title,
    eyebrow: "Statistics Detail",
    description,
    metricLabel: "Status",
    secondaryLabel: "Notes",
    seasons,
    selectedSeason,
    supportsSeasonScope: false,
    rows: [],
    foundation: {
      message,
      links,
    },
  };
}

function rankByPrimary(rows: StatisticRow[]) {
  return rows.filter((row) => row.primaryValue !== "0" && row.primaryValue !== "--");
}

export async function getStatisticsDetailPageData(
  slug: StatisticsDetailSlug,
  scope: "All-Time" | "Season",
  requestedSeason?: string,
): Promise<StatisticsDetailData | null> {
  const { db } = getDatabase();
  const seasons = (await getSeasonsList()).map((season) => String(season.year));
  const selectedSeason = requestedSeason && seasons.includes(requestedSeason) ? requestedSeason : (seasons[0] ?? "");

  if (slug === "laps-led") {
    return createFoundationPage(
      slug,
      "Laps Led",
      "Coverage-ready statistics surface prepared for later ingestion of lap-led level data.",
      "Laps led is not stored in the current schema yet, so this page is kept as a safe foundation.",
      [
        { label: "Open Grand Prix statistics", href: "/grand-prix" },
        { label: "Open results archive", href: "/results" },
      ],
      seasons,
      selectedSeason,
    );
  }

  if (slug === "special-achievements") {
    return createFoundationPage(
      slug,
      "Special Achievements",
      "Milestones and advanced records have a reusable surface ready for future derived calculations.",
      "Advanced milestone logic is not fully derived from the current schema yet, so this page stays in foundation mode.",
      [
        { label: "Open driver standings", href: "/standings" },
        { label: "Open driver profiles", href: "/driver/max-verstappen" },
      ],
      seasons,
      selectedSeason,
    );
  }

  const raceRows = await db
    .select({
      seasonYear: races.seasonYear,
      round: races.round,
      driverId: drivers.driverId,
      givenName: drivers.givenName,
      familyName: drivers.familyName,
      nationality: drivers.nationality,
      constructorId: constructors.constructorId,
      constructorName: constructors.name,
      position: raceResults.position,
      grid: raceResults.grid,
      status: raceResults.status,
      points: raceResults.points,
      started: raceResults.started,
    })
    .from(raceResults)
    .innerJoin(races, eq(raceResults.raceId, races.raceId))
    .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
    .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
    .orderBy(asc(races.seasonYear), asc(races.round), asc(drivers.familyName));

  const sprintRows = await db
    .select({
      seasonYear: races.seasonYear,
      driverId: drivers.driverId,
      nationality: drivers.nationality,
      givenName: drivers.givenName,
      familyName: drivers.familyName,
      constructorId: constructors.constructorId,
      constructorName: constructors.name,
      position: sprintResults.position,
      status: sprintResults.status,
      started: sprintResults.started,
      points: sprintResults.points,
    })
    .from(sprintResults)
    .innerJoin(races, eq(sprintResults.raceId, races.raceId))
    .innerJoin(drivers, eq(sprintResults.driverId, drivers.driverId))
    .innerJoin(constructors, eq(sprintResults.constructorId, constructors.constructorId))
    .orderBy(asc(races.seasonYear), asc(races.round), asc(drivers.familyName));

  const standingsRows = await db
    .select({
      seasonYear: driverSeasonStandings.seasonYear,
      driverId: driverSeasonStandings.driverId,
      position: driverSeasonStandings.position,
    })
    .from(driverSeasonStandings)
    .orderBy(asc(driverSeasonStandings.seasonYear), asc(driverSeasonStandings.position));

  const raceScheduleRows = await db
    .select({
      seasonYear: races.seasonYear,
      date: races.date,
    })
    .from(races)
    .orderBy(asc(races.seasonYear), asc(races.round));

  const activeRaceRows = scope === "Season"
    ? raceRows.filter((row) => String(row.seasonYear) === selectedSeason)
    : raceRows;

  const activeSprintRows = scope === "Season"
    ? sprintRows.filter((row) => String(row.seasonYear) === selectedSeason)
    : sprintRows;

  const championshipCounts = new Map<string, number>();
  const bestSeasonFinish = new Map<string, number>();
  const latestTitleSeason = new Map<string, number>();
  const selectedSeasonFinishByDriver = new Map<string, number>();
  const seasonLatestDates = new Map<number, Date>();
  const completedSeasons = new Set<number>();

  for (const row of raceScheduleRows) {
    const raceDate = new Date(`${row.date}T23:59:59Z`);
    const latestDate = seasonLatestDates.get(row.seasonYear);

    if (!latestDate || raceDate > latestDate) {
      seasonLatestDates.set(row.seasonYear, raceDate);
    }
  }

  const now = new Date();
  for (const row of standingsRows) {
    if (row.position > 0) {
      bestSeasonFinish.set(row.driverId, Math.min(bestSeasonFinish.get(row.driverId) ?? Number.POSITIVE_INFINITY, row.position));
    }

    if (String(row.seasonYear) === selectedSeason && row.position > 0) {
      selectedSeasonFinishByDriver.set(row.driverId, row.position);
    }

    const seasonComplete = (seasonLatestDates.get(row.seasonYear)?.getTime() ?? Number.POSITIVE_INFINITY) < now.getTime();
    if (seasonComplete) {
      completedSeasons.add(row.seasonYear);
    }

    if (row.position === 1 && seasonComplete) {
      championshipCounts.set(row.driverId, (championshipCounts.get(row.driverId) ?? 0) + 1);
      latestTitleSeason.set(row.driverId, Math.max(latestTitleSeason.get(row.driverId) ?? 0, row.seasonYear));
    }
  }

  const aggregateMap = new Map<string, DriverAggregate>();

  for (const row of activeRaceRows) {
    const fullName = `${row.givenName} ${row.familyName}`;
    const aggregate = aggregateMap.get(row.driverId) ?? {
      driverId: row.driverId,
      name: fullName,
      flag: getFlagEmoji(row.nationality),
      latestTeam: getConstructorTheme(row.constructorId, row.constructorName).displayName,
      starts: 0,
      wins: 0,
      podiums: 0,
      poles: 0,
      points: 0,
      sprintWins: 0,
      sprintPodiums: 0,
      sprintPoints: 0,
      sprintStarts: 0,
      dnfs: 0,
      seasonEntries: 0,
      latestTitleSeason: latestTitleSeason.get(row.driverId),
      championships:
        scope === "Season"
          ? (completedSeasons.has(Number(selectedSeason)) && selectedSeasonFinishByDriver.get(row.driverId) === 1 ? 1 : 0)
          : (championshipCounts.get(row.driverId) ?? 0),
      bestSeasonFinish: Number.isFinite(bestSeasonFinish.get(row.driverId) ?? Number.POSITIVE_INFINITY)
        ? (bestSeasonFinish.get(row.driverId) ?? null)
        : null,
      selectedSeasonFinish: selectedSeasonFinishByDriver.get(row.driverId) ?? null,
    };

    aggregate.latestTeam = getConstructorTheme(row.constructorId, row.constructorName).displayName;
    aggregate.starts += row.started ? 1 : 0;
    aggregate.wins += row.position === 1 ? 1 : 0;
    aggregate.podiums += row.position !== null && row.position <= 3 ? 1 : 0;
    aggregate.poles += row.grid === 1 ? 1 : 0;
    aggregate.points += Number(row.points);
    aggregate.dnfs += row.started && isDnfStatus(row.status) ? 1 : 0;
    aggregateMap.set(row.driverId, aggregate);
  }

  for (const row of activeSprintRows) {
    const aggregate = aggregateMap.get(row.driverId) ?? {
      driverId: row.driverId,
      name: `${row.givenName} ${row.familyName}`,
      flag: getFlagEmoji(row.nationality),
      latestTeam: getConstructorTheme(row.constructorId, row.constructorName).displayName,
      starts: 0,
      wins: 0,
      podiums: 0,
      poles: 0,
      points: 0,
      sprintWins: 0,
      sprintPodiums: 0,
      sprintPoints: 0,
      sprintStarts: 0,
      dnfs: 0,
      seasonEntries: 0,
      latestTitleSeason: latestTitleSeason.get(row.driverId),
      championships:
        scope === "Season"
          ? (completedSeasons.has(Number(selectedSeason)) && selectedSeasonFinishByDriver.get(row.driverId) === 1 ? 1 : 0)
          : (championshipCounts.get(row.driverId) ?? 0),
      bestSeasonFinish: Number.isFinite(bestSeasonFinish.get(row.driverId) ?? Number.POSITIVE_INFINITY)
        ? (bestSeasonFinish.get(row.driverId) ?? null)
        : null,
      selectedSeasonFinish: selectedSeasonFinishByDriver.get(row.driverId) ?? null,
    };

    aggregate.latestTeam = getConstructorTheme(row.constructorId, row.constructorName).displayName;
    aggregate.sprintStarts += row.started ? 1 : 0;
    aggregate.sprintWins += row.position === 1 ? 1 : 0;
    aggregate.sprintPodiums += row.position !== null && row.position <= 3 ? 1 : 0;
    aggregate.sprintPoints += Number(row.points);
    aggregateMap.set(row.driverId, aggregate);
  }

  const aggregates = Array.from(aggregateMap.values());

  const buildRows = (
    metric: (aggregate: DriverAggregate) => number,
    secondary: (aggregate: DriverAggregate) => string,
  ) =>
    rankByPrimary(
      aggregates
        .sort((left, right) => {
          const metricDelta = metric(right) - metric(left);
          if (metricDelta !== 0) return metricDelta;
          return right.points - left.points || left.name.localeCompare(right.name);
        })
        .map((aggregate) => ({
          slug: getDriverRouteSlug(aggregate.driverId, aggregate.name),
          name: aggregate.name,
          flag: aggregate.flag,
          team: aggregate.latestTeam,
          primaryValue: String(metric(aggregate)),
          starts: String(aggregate.starts),
          secondaryValue: secondary(aggregate),
        })),
    );

  switch (slug) {
    case "championships":
      return {
        slug,
        title: "Championships",
        eyebrow: "Statistics Detail",
        description: "Driver title counts derived from stored season-end championship totals.",
        metricLabel: "Championships",
        secondaryLabel: scope === "Season" ? "Season Position" : "Latest Title",
        seasons,
        selectedSeason,
        supportsSeasonScope: true,
        rows: buildRows(
          (aggregate) => aggregate.championships,
          (aggregate) =>
            scope === "Season"
              ? (aggregate.selectedSeasonFinish ? formatOrdinal(aggregate.selectedSeasonFinish) : "--")
              : (aggregate.latestTitleSeason ? String(aggregate.latestTitleSeason) : "--"),
        ),
      };
    case "wins":
      return {
        slug,
        title: "Wins",
        eyebrow: "Statistics Detail",
        description: "Race wins only. Sprint wins remain separate and are excluded here.",
        metricLabel: "Wins",
        secondaryLabel: "Points",
        seasons,
        selectedSeason,
        supportsSeasonScope: true,
        rows: buildRows((aggregate) => aggregate.wins, (aggregate) => formatPoints(aggregate.points)),
      };
    case "podiums":
      return {
        slug,
        title: "Podiums",
        eyebrow: "Statistics Detail",
        description: "Race podium finishes only, aggregated from stored Grand Prix results.",
        metricLabel: "Podiums",
        secondaryLabel: "Wins",
        seasons,
        selectedSeason,
        supportsSeasonScope: true,
        rows: buildRows((aggregate) => aggregate.podiums, (aggregate) => String(aggregate.wins)),
      };
    case "pole-positions":
      return {
        slug,
        title: "Pole Positions",
        eyebrow: "Statistics Detail",
        description: "Pole positions are counted from stored race grid P1 entries.",
        metricLabel: "Poles",
        secondaryLabel: "Podiums",
        seasons,
        selectedSeason,
        supportsSeasonScope: true,
        rows: buildRows((aggregate) => aggregate.poles, (aggregate) => String(aggregate.podiums)),
      };
    case "points":
      return {
        slug,
        title: "Points",
        eyebrow: "Statistics Detail",
        description: "Championship points aggregated from stored race and sprint results.",
        metricLabel: "Points",
        secondaryLabel: "Wins",
        seasons,
        selectedSeason,
        supportsSeasonScope: true,
        rows: buildRows((aggregate) => aggregate.points + aggregate.sprintPoints, (aggregate) => String(aggregate.wins)),
      };
    case "sprint":
      return {
        slug,
        title: "Sprint",
        eyebrow: "Statistics Detail",
        description: "Sprint race results only. Sprint shootout / sprint qualifying is not included.",
        metricLabel: "Sprint Wins",
        secondaryLabel: "Sprint Points",
        seasons,
        selectedSeason,
        supportsSeasonScope: true,
        rows: buildRows((aggregate) => aggregate.sprintWins, (aggregate) => formatPoints(aggregate.sprintPoints)),
      };
    case "dnf-reliability":
      return {
        slug,
        title: "DNF / Reliability",
        eyebrow: "Statistics Detail",
        description: "DNFs are derived from started races that did not finish classified. DSQ is treated separately in head-to-head logic.",
        metricLabel: "DNFs",
        secondaryLabel: "Starts",
        seasons,
        selectedSeason,
        supportsSeasonScope: true,
        rows: buildRows((aggregate) => aggregate.dnfs, (aggregate) => `${aggregate.starts} starts`),
      };
    default:
      return null;
  }
}
