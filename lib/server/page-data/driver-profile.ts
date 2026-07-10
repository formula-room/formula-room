import "server-only";

import { asc, eq } from "drizzle-orm";

import type {
  ChampionshipChronologyRow,
  DriverProfileRecord,
  DriverSeasonRow,
  GrandPrixBreakdownRow,
  QualifyingBreakdownRow,
  SprintBreakdownRow,
} from "@/lib/driver-profile-data";
import {
  formatOrdinal,
  formatPoints,
  getConstructorTheme,
  getDriverNumber,
  getDriverRouteSlug,
  getFlagEmoji,
  isDnfStatus,
} from "@/lib/f1/presentation";
import { getDatabase } from "@/lib/db/client";
import { constructors, driverSeasonStandings, drivers, qualifyingResults, raceResults, races, sprintResults } from "@/lib/db/schema";

function getBestPositionLabel(positions: string[]) {
  const numeric = positions
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => !Number.isNaN(value))
    .sort((left, right) => left - right);

  return numeric.length > 0 ? `${numeric[0]}${numeric[0] === 1 ? "st" : numeric[0] === 2 ? "nd" : numeric[0] === 3 ? "rd" : "th"}` : "--";
}

export async function getDriverProfilePageDataBySlug(slug: string) {
  const { db } = getDatabase();

  const driverRows = await db
    .select({
      driverId: drivers.driverId,
      givenName: drivers.givenName,
      familyName: drivers.familyName,
      code: drivers.code,
      nationality: drivers.nationality,
    })
    .from(drivers)
    .orderBy(asc(drivers.familyName), asc(drivers.givenName));

  const driver = driverRows.find((row) => getDriverRouteSlug(row.driverId, `${row.givenName} ${row.familyName}`) === slug);

  if (!driver) {
    return null;
  }

  const [raceRows, qualifyingRows, sprintRows, standingsRows, raceScheduleRows] = await Promise.all([
    db
      .select({
        seasonYear: races.seasonYear,
        round: races.round,
        raceName: races.name,
        date: races.date,
        constructorId: constructors.constructorId,
        constructorName: constructors.name,
        position: raceResults.position,
        positionText: raceResults.positionText,
        status: raceResults.status,
        points: raceResults.points,
        started: raceResults.started,
      })
      .from(raceResults)
      .innerJoin(races, eq(raceResults.raceId, races.raceId))
      .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
      .where(eq(raceResults.driverId, driver.driverId))
      .orderBy(asc(races.seasonYear), asc(races.round)),
    db
      .select({
        seasonYear: races.seasonYear,
        raceName: races.name,
        position: qualifyingResults.position,
        q3: qualifyingResults.q3,
      })
      .from(qualifyingResults)
      .innerJoin(races, eq(qualifyingResults.raceId, races.raceId))
      .where(eq(qualifyingResults.driverId, driver.driverId))
      .orderBy(asc(races.seasonYear), asc(races.round)),
    db
      .select({
        seasonYear: races.seasonYear,
        raceName: races.name,
        constructorId: constructors.constructorId,
        constructorName: constructors.name,
        position: sprintResults.position,
        status: sprintResults.status,
        points: sprintResults.points,
        started: sprintResults.started,
      })
      .from(sprintResults)
      .innerJoin(races, eq(sprintResults.raceId, races.raceId))
      .innerJoin(constructors, eq(sprintResults.constructorId, constructors.constructorId))
      .where(eq(sprintResults.driverId, driver.driverId))
      .orderBy(asc(races.seasonYear), asc(races.round)),
    db
      .select({
        seasonYear: driverSeasonStandings.seasonYear,
        position: driverSeasonStandings.position,
        points: driverSeasonStandings.points,
        wins: driverSeasonStandings.wins,
      })
      .from(driverSeasonStandings)
      .where(eq(driverSeasonStandings.driverId, driver.driverId))
      .orderBy(asc(driverSeasonStandings.seasonYear)),
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

  const seasonRowsMap = new Map<number, DriverSeasonRow & { pointsValue: number }>();
  for (const row of raceRows) {
    const entry = seasonRowsMap.get(row.seasonYear) ?? {
      season: String(row.seasonYear),
      team: getConstructorTheme(row.constructorId, row.constructorName).displayName,
      position: "--",
      wins: 0,
      podiums: 0,
      poles: 0,
      points: 0,
      starts: 0,
      pointsValue: 0,
    };

    entry.team = getConstructorTheme(row.constructorId, row.constructorName).displayName;
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

  const seasons: DriverSeasonRow[] = Array.from(seasonRowsMap.entries())
    .sort((left, right) => right[0] - left[0])
    .map(([seasonYear, row]) => ({
      season: row.season,
      team: row.team,
      position: Number.isFinite(standingsBySeason.get(seasonYear)?.position ?? Number.POSITIVE_INFINITY) ? formatOrdinal(standingsBySeason.get(seasonYear)!.position) : "--",
      wins: row.wins,
      podiums: row.podiums,
      poles: row.poles,
      points: standingsBySeason.get(seasonYear) ? Number(formatPoints(standingsBySeason.get(seasonYear)!.points)) : row.points,
      starts: row.starts,
    }));

  const grandPrixMap = new Map<string, GrandPrixBreakdownRow & { pointsValue: number; bestFinishValue: number }>();
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

  const qualifyingMap = new Map<string, QualifyingBreakdownRow & { totalGrid: number; entries: number }>();
  for (const row of qualifyingRows) {
    const entry = qualifyingMap.get(row.raceName) ?? {
      grandPrix: row.raceName,
      poles: 0,
      frontRows: 0,
      q3s: 0,
      bestGrid: "--",
      averageGrid: "--",
      totalGrid: 0,
      entries: 0,
    };

    entry.poles += row.position === 1 ? 1 : 0;
    entry.frontRows += row.position !== null && row.position <= 2 ? 1 : 0;
    entry.q3s += row.q3 ? 1 : 0;

    if (row.position !== null) {
      entry.totalGrid += row.position;
      entry.entries += 1;
      entry.averageGrid = (entry.totalGrid / entry.entries).toFixed(1);
      const currentBest = entry.bestGrid === "--" ? Number.POSITIVE_INFINITY : Number(entry.bestGrid.replace("P", ""));
      if (row.position < currentBest) {
        entry.bestGrid = `P${row.position}`;
      }
    }

    qualifyingMap.set(row.raceName, entry);
  }

  const latestRace = raceRows[raceRows.length - 1];
  const latestTheme = getConstructorTheme(latestRace.constructorId, latestRace.constructorName);
  const fullName = `${driver.givenName} ${driver.familyName}`;
  const wins = raceRows.filter((row) => row.position === 1).length;
  const podiums = raceRows.filter((row) => row.position !== null && row.position <= 3).length;
  const sprintWins = sprintRows.filter((row) => row.position === 1).length;
  const sprintPodiums = sprintRows.filter((row) => row.position !== null && row.position <= 3).length;
  const sprintPoints = sprintRows.reduce((total, row) => total + Number(row.points), 0);
  const starts = raceRows.filter((row) => row.started).length;
  const points = raceRows.reduce((total, row) => total + Number(row.points), 0) + sprintPoints;
  const poles = qualifyingRows.filter((row) => row.position === 1).length;
  const dnfs = raceRows.filter((row) => row.started && isDnfStatus(row.status)).length;
  const now = new Date();
  const championships = standingsRows.filter((row) => row.position === 1 && (seasonLatestDates.get(row.seasonYear)?.getTime() ?? Number.POSITIVE_INFINITY) < now.getTime()).length;
  const firstRace = raceRows[0];
  const firstWin = raceRows.find((row) => row.position === 1);
  const latestWin = [...raceRows].reverse().find((row) => row.position === 1);

  const sprintBreakdownMap = new Map<string, SprintBreakdownRow & { pointsValue: number; bestFinishValue: number }>();
  for (const row of sprintRows) {
    const entry = sprintBreakdownMap.get(row.raceName) ?? {
      grandPrix: row.raceName,
      sprintWins: 0,
      podiums: 0,
      points: 0,
      bestFinish: "--",
      pointsValue: 0,
      bestFinishValue: Number.POSITIVE_INFINITY,
    };

    entry.sprintWins += row.position === 1 ? 1 : 0;
    entry.podiums += row.position !== null && row.position <= 3 ? 1 : 0;
    entry.pointsValue += Number(row.points);
    entry.points = Number(formatPoints(entry.pointsValue));
    if (row.position !== null && row.position < entry.bestFinishValue) {
      entry.bestFinishValue = row.position;
      entry.bestFinish = `P${row.position}`;
    }

    sprintBreakdownMap.set(row.raceName, entry);
  }

  const sprintBreakdown: SprintBreakdownRow[] = sprintBreakdownMap.size > 0
    ? Array.from(sprintBreakdownMap.values())
        .sort((left, right) => right.sprintWins - left.sprintWins || right.podiums - left.podiums || right.pointsValue - left.pointsValue)
        .slice(0, 8)
        .map((row) => ({
          grandPrix: row.grandPrix,
          sprintWins: row.sprintWins,
          podiums: row.podiums,
          points: row.points,
          bestFinish: row.bestFinish,
        }))
    : [
        {
          grandPrix: "No sprint starts in coverage",
          sprintWins: 0,
          podiums: 0,
          points: 0,
          bestFinish: "--",
        },
      ];

  const chronology: ChampionshipChronologyRow[] = seasons.map((season) => ({
    season: season.season,
    result: season.position,
    detail: `${season.team} / ${formatPoints(season.points)} pts / ${season.wins} wins`,
  }));

  const profile: DriverProfileRecord = {
    slug,
    name: fullName,
    flag: getFlagEmoji(driver.nationality),
    number: getDriverNumber(driver.driverId),
    nationality: driver.nationality,
    teamLabel: latestTheme.displayName,
    eraLabel: `${firstRace.seasonYear}-Present Coverage`,
    accent: latestTheme.accent,
    accentSoft: latestTheme.accentSoft,
    overviewStats: [
      { label: "Wins", value: String(wins) },
      { label: "Podiums", value: String(podiums) },
      { label: "Poles", value: String(poles) },
      { label: "Starts", value: String(starts) },
      { label: "Championships", value: String(championships) },
      { label: "Points", value: formatPoints(points) },
    ],
    secondaryStats: [
      { label: "Fastest Laps", value: "--" },
      { label: "Hat-tricks", value: "--" },
      { label: "Grand Slams", value: "--" },
      { label: "Sprint Wins", value: String(sprintWins) },
      { label: "DNFs", value: String(dnfs) },
      { label: "Laps Led", value: "--" },
    ],
    summaryFacts: [
      { label: "Coverage Start", value: `${firstRace.seasonYear} ${firstRace.raceName}` },
      { label: "First Win", value: firstWin ? `${firstWin.seasonYear} ${firstWin.raceName}` : "No win in coverage" },
      { label: "Last Race", value: `${latestRace.seasonYear} ${latestRace.raceName}` },
      { label: "Current Team", value: latestTheme.displayName },
      { label: "Career Span", value: `${firstRace.seasonYear}-${latestRace.seasonYear}` },
      { label: "Driver Code", value: driver.code ?? driver.driverId.toUpperCase() },
    ],
    milestones: [
      { label: "Latest win", value: latestWin ? `${latestWin.seasonYear} ${latestWin.raceName}` : "No win in stored coverage" },
      { label: "Best season finish", value: getBestPositionLabel(seasons.map((row) => row.position)) },
      { label: "Coverage points", value: `${formatPoints(points)} total points recorded` },
    ],
    seasons,
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
      .sort((left, right) => right.poles - left.poles || right.frontRows - left.frontRows || Number.parseFloat(left.averageGrid) - Number.parseFloat(right.averageGrid))
      .slice(0, 8)
      .map((row) => ({
        grandPrix: row.grandPrix,
        poles: row.poles,
        frontRows: row.frontRows,
        q3s: row.q3s,
        bestGrid: row.bestGrid,
        averageGrid: row.averageGrid,
      })),
    sprintBreakdown,
    records: [
      { label: "Wins", value: String(wins), detail: "Race wins in stored coverage." },
      { label: "Podiums", value: String(podiums), detail: "Race-only podiums in stored coverage." },
      { label: "Poles", value: String(poles), detail: "Qualifying P1 results in stored coverage." },
      { label: "Sprint Wins", value: String(sprintWins), detail: `${formatPoints(sprintPoints)} sprint points across ${sprintPodiums} sprint podiums.` },
      { label: "Starts", value: String(starts), detail: "Started Grands Prix in stored coverage." },
      { label: "DNFs", value: String(dnfs), detail: "Attrition count in stored coverage." },
    ],
    championshipChronology: chronology,
  };

  return profile;
}
