import "server-only";

import { asc, eq } from "drizzle-orm";

import type {
  TeamDriverRow,
  TeamGrandPrixRow,
  TeamProfileRecord,
  TeamQualifyingRow,
  TeamSeasonRow,
} from "@/lib/team-profile-data";
import {
  formatOrdinal,
  formatPoints,
  getConstructorRouteSlug,
  getConstructorTheme,
  getDriverNumber,
  isDnfStatus,
} from "@/lib/f1/presentation";
import { getDatabase } from "@/lib/db/client";
import { constructorSeasonStandings, constructors, drivers, qualifyingResults, raceResults, races, sprintResults } from "@/lib/db/schema";

export async function getTeamProfilePageDataBySlug(slug: string) {
  const { db } = getDatabase();

  const constructorRows = await db
    .select({
      constructorId: constructors.constructorId,
      name: constructors.name,
      nationality: constructors.nationality,
    })
    .from(constructors)
    .orderBy(asc(constructors.name));

  const constructor = constructorRows.find((row) => {
    const theme = getConstructorTheme(row.constructorId, row.name);
    return getConstructorRouteSlug(row.constructorId, theme.displayName) === slug;
  });

  if (!constructor) {
    return null;
  }

  const theme = getConstructorTheme(constructor.constructorId, constructor.name);

  const [raceRows, qualifyingRows, sprintRows, standingsRows, raceScheduleRows] = await Promise.all([
    db
      .select({
        seasonYear: races.seasonYear,
        round: races.round,
        raceName: races.name,
        date: races.date,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        nationality: drivers.nationality,
        position: raceResults.position,
        status: raceResults.status,
        points: raceResults.points,
        started: raceResults.started,
      })
      .from(raceResults)
      .innerJoin(races, eq(raceResults.raceId, races.raceId))
      .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
      .where(eq(raceResults.constructorId, constructor.constructorId))
      .orderBy(asc(races.seasonYear), asc(races.round), asc(drivers.familyName)),
    db
      .select({
        seasonYear: races.seasonYear,
        raceId: races.raceId,
        raceName: races.name,
        position: qualifyingResults.position,
      })
      .from(qualifyingResults)
      .innerJoin(races, eq(qualifyingResults.raceId, races.raceId))
      .where(eq(qualifyingResults.constructorId, constructor.constructorId))
      .orderBy(asc(races.seasonYear), asc(races.round)),
    db
      .select({
        seasonYear: races.seasonYear,
        raceName: races.name,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        position: sprintResults.position,
        status: sprintResults.status,
        points: sprintResults.points,
        started: sprintResults.started,
      })
      .from(sprintResults)
      .innerJoin(races, eq(sprintResults.raceId, races.raceId))
      .innerJoin(drivers, eq(sprintResults.driverId, drivers.driverId))
      .where(eq(sprintResults.constructorId, constructor.constructorId))
      .orderBy(asc(races.seasonYear), asc(races.round), asc(drivers.familyName)),
    db
      .select({
        seasonYear: constructorSeasonStandings.seasonYear,
        position: constructorSeasonStandings.position,
        points: constructorSeasonStandings.points,
        wins: constructorSeasonStandings.wins,
      })
      .from(constructorSeasonStandings)
      .where(eq(constructorSeasonStandings.constructorId, constructor.constructorId))
      .orderBy(asc(constructorSeasonStandings.seasonYear)),
    db
      .select({
        seasonYear: races.seasonYear,
        date: races.date,
      })
      .from(races)
      .orderBy(asc(races.seasonYear), asc(races.round)),
  ]);

  if (raceRows.length === 0) {
    return null;
  }

  const standingsBySeason = new Map<number, { position: number; points: number; wins: number }>(
    standingsRows.map((row) => [
      row.seasonYear,
      {
        position: row.position > 0 ? row.position : Number.POSITIVE_INFINITY,
        points: Number(row.points),
        wins: row.wins,
      },
    ]),
  );

  const seasonLatestDates = new Map<number, Date>();
  for (const row of raceScheduleRows) {
    const raceDate = new Date(`${row.date}T23:59:59Z`);
    const current = seasonLatestDates.get(row.seasonYear);
    if (!current || raceDate > current) {
      seasonLatestDates.set(row.seasonYear, raceDate);
    }
  }

  const seasonRowsMap = new Map<number, TeamSeasonRow & { pointsValue: number }>();
  for (const row of raceRows) {
    const driverName = `${row.givenName} ${row.familyName}`;
    const entry = seasonRowsMap.get(row.seasonYear) ?? {
      season: String(row.seasonYear),
      drivers: driverName,
      position: "--",
      wins: 0,
      podiums: 0,
      poles: 0,
      points: 0,
      starts: 0,
      pointsValue: 0,
    };

    const currentDrivers = new Set(entry.drivers.split(" / ").filter(Boolean));
    currentDrivers.add(driverName);
    entry.drivers = Array.from(currentDrivers).sort((left, right) => left.localeCompare(right)).join(" / ");
    entry.wins += row.position === 1 ? 1 : 0;
    entry.podiums += row.position !== null && row.position <= 3 ? 1 : 0;
    entry.starts += row.started ? 1 : 0;
    entry.pointsValue += Number(row.points);
    entry.points = Number(formatPoints(entry.pointsValue));
    seasonRowsMap.set(row.seasonYear, entry);
  }

  for (const row of qualifyingRows) {
    const season = seasonRowsMap.get(row.seasonYear);
    if (season && row.position === 1) {
      season.poles += 1;
    }
  }

  for (const row of sprintRows) {
    const season = seasonRowsMap.get(row.seasonYear);
    if (season) {
      season.pointsValue += Number(row.points);
      season.points = Number(formatPoints(season.pointsValue));
    }
  }

  const seasons: TeamSeasonRow[] = Array.from(seasonRowsMap.entries())
    .sort((left, right) => right[0] - left[0])
    .map(([seasonYear, row]) => ({
      season: row.season,
      drivers: row.drivers,
      position: Number.isFinite(standingsBySeason.get(seasonYear)?.position ?? Number.POSITIVE_INFINITY)
        ? formatOrdinal(standingsBySeason.get(seasonYear)!.position)
        : "--",
      wins: row.wins,
      podiums: row.podiums,
      poles: row.poles,
      points: standingsBySeason.get(seasonYear) ? Number(formatPoints(standingsBySeason.get(seasonYear)!.points)) : row.points,
      starts: row.starts,
    }));

  const driversMap = new Map<string, TeamDriverRow & { latestSeason: number; wins: number; podiums: number }>();
  for (const row of raceRows) {
    const fullName = `${row.givenName} ${row.familyName}`;
    const entry = driversMap.get(row.driverId) ?? {
      name: fullName,
      nationality: row.nationality,
      number: getDriverNumber(row.driverId),
      era: String(row.seasonYear),
      highlight: "",
      latestSeason: row.seasonYear,
      wins: 0,
      podiums: 0,
    };

    entry.latestSeason = Math.max(entry.latestSeason, row.seasonYear);
    entry.wins += row.position === 1 ? 1 : 0;
    entry.podiums += row.position !== null && row.position <= 3 ? 1 : 0;
    driversMap.set(row.driverId, entry);
  }

  const latestSeason = raceRows[raceRows.length - 1].seasonYear;
  const teamDrivers: TeamDriverRow[] = Array.from(driversMap.values())
    .sort((left, right) => right.latestSeason - left.latestSeason || right.wins - left.wins || left.name.localeCompare(right.name))
    .slice(0, 8)
    .map((row) => ({
      name: row.name,
      nationality: row.nationality,
      number: row.number === "--" ? undefined : row.number,
      era: row.latestSeason === latestSeason ? "Current-era coverage" : String(row.latestSeason),
      highlight:
        row.wins > 0
          ? `${row.wins} race win${row.wins === 1 ? "" : "s"} with ${theme.displayName} in stored coverage.`
          : `${row.podiums} podium${row.podiums === 1 ? "" : "s"} with ${theme.displayName} in stored coverage.`,
    }));

  const grandPrixMap = new Map<string, TeamGrandPrixRow & { pointsValue: number; bestFinishValue: number }>();
  for (const row of raceRows) {
    const entry = grandPrixMap.get(row.raceName) ?? {
      grandPrix: row.raceName,
      starts: 0,
      wins: 0,
      podiums: 0,
      bestFinish: "--",
      points: 0,
      pointsValue: 0,
      bestFinishValue: Number.POSITIVE_INFINITY,
    };

    entry.starts += row.started ? 1 : 0;
    entry.wins += row.position === 1 ? 1 : 0;
    entry.podiums += row.position !== null && row.position <= 3 ? 1 : 0;
    entry.pointsValue += Number(row.points);
    entry.points = Number(formatPoints(entry.pointsValue));

    if (row.position !== null && row.position < entry.bestFinishValue) {
      entry.bestFinishValue = row.position;
      entry.bestFinish = `P${row.position}`;
    }

    grandPrixMap.set(row.raceName, entry);
  }

  const qualifyingMap = new Map<string, TeamQualifyingRow & { totalGrid: number; entries: number }>();
  const lockoutsByWeekend = new Map<string, { raceName: string; positions: Set<number> }>();
  for (const row of qualifyingRows) {
    const entry = qualifyingMap.get(row.raceName) ?? {
      grandPrix: row.raceName,
      poles: 0,
      frontRows: 0,
      lockouts: 0,
      bestGridAverage: "--",
      totalGrid: 0,
      entries: 0,
    };

    if (row.position !== null) {
      entry.poles += row.position === 1 ? 1 : 0;
      entry.frontRows += row.position <= 2 ? 1 : 0;
      entry.totalGrid += row.position;
      entry.entries += 1;
      entry.bestGridAverage = (entry.totalGrid / entry.entries).toFixed(1);
    }

    const lockoutKey = `${row.seasonYear}-${row.raceId}-${row.raceName}`;
    const lockoutEntry = lockoutsByWeekend.get(lockoutKey) ?? { raceName: row.raceName, positions: new Set<number>() };
    if (row.position !== null && row.position <= 2) {
      lockoutEntry.positions.add(row.position);
    }
    lockoutsByWeekend.set(lockoutKey, lockoutEntry);
    qualifyingMap.set(row.raceName, entry);
  }

  const lockoutCountsByRaceName = new Map<string, number>();
  for (const row of lockoutsByWeekend.values()) {
    if (row.positions.has(1) && row.positions.has(2)) {
      lockoutCountsByRaceName.set(row.raceName, (lockoutCountsByRaceName.get(row.raceName) ?? 0) + 1);
    }
  }

  for (const [raceName, count] of lockoutCountsByRaceName.entries()) {
    const qualifyingEntry = qualifyingMap.get(raceName);
    if (qualifyingEntry) {
      qualifyingEntry.lockouts = count;
    }
  }

  const wins = raceRows.filter((row) => row.position === 1).length;
  const podiums = raceRows.filter((row) => row.position !== null && row.position <= 3).length;
  const sprintWins = sprintRows.filter((row) => row.position === 1).length;
  const sprintPoints = sprintRows.reduce((total, row) => total + Number(row.points), 0);
  const starts = raceRows.filter((row) => row.started).length;
  const points = raceRows.reduce((total, row) => total + Number(row.points), 0) + sprintPoints;
  const poles = qualifyingRows.filter((row) => row.position === 1).length;
  const dnfs = raceRows.filter((row) => row.started && isDnfStatus(row.status)).length;
  const now = new Date();
  const championships = standingsRows.filter((row) => row.position === 1 && (seasonLatestDates.get(row.seasonYear)?.getTime() ?? Number.POSITIVE_INFINITY) < now.getTime()).length;
  const firstRace = raceRows[0];
  const firstWin = raceRows.find((row) => row.position === 1);
  const lastRace = raceRows[raceRows.length - 1];

  const profile: TeamProfileRecord = {
    slug,
    name: theme.displayName,
    nationality: constructor.nationality,
    activeYears: theme.activeYears ?? `${firstRace.seasonYear}-${lastRace.seasonYear}`,
    firstSeason: theme.firstSeason ?? String(firstRace.seasonYear),
    eraLabel: theme.eraLabel,
    statusLabel: theme.statusLabel,
    accent: theme.accent,
    accentSoft: theme.accentSoft,
    overviewStats: [
      { label: "Wins", value: String(wins) },
      { label: "Podiums", value: String(podiums) },
      { label: "Poles", value: String(poles) },
      { label: "Starts", value: String(starts) },
      { label: "Constructors' Championships", value: String(championships) },
      { label: "Points", value: formatPoints(points) },
    ],
    secondaryStats: [
      { label: "Fastest Laps", value: "--" },
      { label: "1-2 Finishes", value: "--" },
      { label: "Front-row Lockouts", value: String(Array.from(lockoutCountsByRaceName.values()).reduce((total, value) => total + value, 0)) },
      { label: "Sprint Wins", value: String(sprintWins) },
      { label: "DNFs", value: String(dnfs) },
      { label: "Laps Led", value: "--" },
    ],
    summaryFacts: [
      { label: "Coverage Start", value: `${firstRace.seasonYear} ${firstRace.raceName}` },
      { label: "First Win", value: firstWin ? `${firstWin.seasonYear} ${firstWin.raceName}` : "No win in coverage" },
      { label: "Last Race", value: `${lastRace.seasonYear} ${lastRace.raceName}` },
      { label: "Active Years", value: theme.activeYears ?? `${firstRace.seasonYear}-${lastRace.seasonYear}` },
      { label: "Nationality", value: constructor.nationality },
      { label: "Constructor ID", value: constructor.constructorId },
    ],
    milestones: [
      { label: "Stored wins", value: `${wins} race wins recorded in current database coverage` },
      { label: "Stored poles", value: `${poles} qualifying poles recorded` },
      { label: "Coverage points", value: `${formatPoints(points)} total points recorded` },
    ],
    seasons,
    drivers: teamDrivers,
    grandPrixBreakdown: Array.from(grandPrixMap.values())
      .sort((left, right) => right.wins - left.wins || right.podiums - left.podiums || right.pointsValue - left.pointsValue)
      .slice(0, 8)
      .map((row) => ({
        grandPrix: row.grandPrix,
        starts: row.starts,
        wins: row.wins,
        podiums: row.podiums,
        bestFinish: row.bestFinish,
        points: row.points,
      })),
    qualifyingBreakdown: Array.from(qualifyingMap.values())
      .sort((left, right) => right.poles - left.poles || right.frontRows - left.frontRows || Number.parseFloat(left.bestGridAverage) - Number.parseFloat(right.bestGridAverage))
      .slice(0, 8)
      .map((row) => ({
        grandPrix: row.grandPrix,
        poles: row.poles,
        frontRows: row.frontRows,
        lockouts: row.lockouts,
        bestGridAverage: row.bestGridAverage,
      })),
    records: [
      { label: "Wins", value: String(wins), detail: "Race wins in stored coverage." },
      { label: "Podiums", value: String(podiums), detail: "Race-only podiums in stored coverage." },
      { label: "Poles", value: String(poles), detail: "Qualifying P1 starts in stored coverage." },
      { label: "Sprint Wins", value: String(sprintWins), detail: `${formatPoints(sprintPoints)} sprint points in stored coverage.` },
      { label: "Starts", value: String(starts), detail: "Started Grands Prix in stored coverage." },
      { label: "DNFs", value: String(dnfs), detail: "Attrition count in stored coverage." },
      { label: "Coverage", value: `${firstRace.seasonYear}-${lastRace.seasonYear}`, detail: "Current database range." },
    ],
  };

  return profile;
}
