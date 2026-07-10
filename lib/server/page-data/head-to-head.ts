import "server-only";

import { asc, desc, eq } from "drizzle-orm";

import type {
  ComparisonMode,
  ComparisonScope,
  ComparisonType,
  DnfMode,
  DriverMeetingResult,
  DriverProfile,
} from "@/lib/head-to-head-data";
import { getConstructorTheme, getDriverRouteSlug, getFlagEmoji, isDnfStatus } from "@/lib/f1/presentation";
import { getDatabase } from "@/lib/db/client";
import { constructors, drivers, qualifyingResults, raceResults, races, sprintResults } from "@/lib/db/schema";

type HeadToHeadFilters = {
  driverA: string;
  driverB: string;
  scope: ComparisonScope;
  season?: string;
  seasonFrom?: string;
  seasonTo?: string;
  mode: ComparisonMode;
  dnfMode: DnfMode;
};

type ComparableMeeting = {
  season: string;
  round: string;
  grandPrix: string;
  type: ComparisonType;
  notes: string;
  results: [DriverMeetingResult, DriverMeetingResult];
};

function scoreComparableResult(result: DriverMeetingResult) {
  if (Number.isFinite(result.position)) {
    return result.position;
  }

  return result.label === "DSQ" ? 9999 : 9000;
}

function countHeadToHead(meetings: ComparableMeeting[]) {
  let driverA = 0;
  let driverB = 0;

  for (const meeting of meetings) {
    const scoreA = scoreComparableResult(meeting.results[0]);
    const scoreB = scoreComparableResult(meeting.results[1]);
    if (scoreA < scoreB) driverA += 1;
    if (scoreB < scoreA) driverB += 1;
  }

  return { driverA, driverB };
}

export async function getHeadToHeadOptions() {
  const { db } = getDatabase();

  const [driverRows, latestTeamRows, seasonRows] = await Promise.all([
    db
      .select({
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        nationality: drivers.nationality,
      })
      .from(drivers)
      .orderBy(asc(drivers.familyName), asc(drivers.givenName)),
    db
      .select({
        driverId: raceResults.driverId,
        constructorId: constructors.constructorId,
        constructorName: constructors.name,
        seasonYear: races.seasonYear,
        round: races.round,
      })
      .from(raceResults)
      .innerJoin(races, eq(raceResults.raceId, races.raceId))
      .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
      .orderBy(desc(races.seasonYear), desc(races.round)),
    db
      .select({
        seasonYear: races.seasonYear,
      })
      .from(races)
      .orderBy(desc(races.seasonYear)),
  ]);

  const latestTeamByDriver = new Map<string, { constructorId: string; constructorName: string }>();
  for (const row of latestTeamRows) {
    if (!latestTeamByDriver.has(row.driverId)) {
      latestTeamByDriver.set(row.driverId, {
        constructorId: row.constructorId,
        constructorName: row.constructorName,
      });
    }
  }

  const driverOptions: DriverProfile[] = driverRows.map((row) => {
    const fullName = `${row.givenName} ${row.familyName}`;
    const latestTeam = latestTeamByDriver.get(row.driverId);
    const theme = latestTeam ? getConstructorTheme(latestTeam.constructorId, latestTeam.constructorName) : getConstructorTheme("", "");

    return {
      slug: getDriverRouteSlug(row.driverId, fullName),
      name: fullName,
      shortName: row.familyName,
      flag: getFlagEmoji(row.nationality),
      accent: theme.accent,
    };
  });

  const seasons = Array.from(new Set(seasonRows.map((row) => String(row.seasonYear))));

  return {
    drivers: driverOptions,
    seasons,
  };
}

export async function getHeadToHeadPageData(filters: HeadToHeadFilters) {
  const { db } = getDatabase();
  const options = await getHeadToHeadOptions();

  const driverAOption = options.drivers.find((driver) => driver.slug === filters.driverA);
  const driverBOption = options.drivers.find((driver) => driver.slug === filters.driverB);

  if (!driverAOption || !driverBOption) {
    return null;
  }

  const raceRows = await db
    .select({
      raceId: races.raceId,
      seasonYear: races.seasonYear,
      round: races.round,
      raceName: races.name,
      driverId: drivers.driverId,
      givenName: drivers.givenName,
      familyName: drivers.familyName,
      constructorId: constructors.constructorId,
      constructorName: constructors.name,
      position: raceResults.position,
      status: raceResults.status,
      points: raceResults.points,
      started: raceResults.started,
    })
    .from(raceResults)
    .innerJoin(races, eq(raceResults.raceId, races.raceId))
    .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
    .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
    .orderBy(asc(races.seasonYear), asc(races.round));

  const qualifyingRows = await db
    .select({
      raceId: races.raceId,
      seasonYear: races.seasonYear,
      round: races.round,
      raceName: races.name,
      driverId: drivers.driverId,
      givenName: drivers.givenName,
      familyName: drivers.familyName,
      constructorId: constructors.constructorId,
      constructorName: constructors.name,
      position: qualifyingResults.position,
    })
    .from(qualifyingResults)
    .innerJoin(races, eq(qualifyingResults.raceId, races.raceId))
    .innerJoin(drivers, eq(qualifyingResults.driverId, drivers.driverId))
    .innerJoin(constructors, eq(qualifyingResults.constructorId, constructors.constructorId))
    .orderBy(asc(races.seasonYear), asc(races.round));

  const sprintRows = await db
    .select({
      raceId: races.raceId,
      seasonYear: races.seasonYear,
      round: races.round,
      raceName: races.name,
      driverId: drivers.driverId,
      givenName: drivers.givenName,
      familyName: drivers.familyName,
      constructorId: constructors.constructorId,
      constructorName: constructors.name,
      position: sprintResults.position,
      status: sprintResults.status,
      points: sprintResults.points,
      started: sprintResults.started,
    })
    .from(sprintResults)
    .innerJoin(races, eq(sprintResults.raceId, races.raceId))
    .innerJoin(drivers, eq(sprintResults.driverId, drivers.driverId))
    .innerJoin(constructors, eq(sprintResults.constructorId, constructors.constructorId))
    .orderBy(asc(races.seasonYear), asc(races.round));

  const driverIdBySlug = new Map<string, string>();
  for (const row of raceRows) {
    const fullName = `${row.givenName} ${row.familyName}`;
    const slug = getDriverRouteSlug(row.driverId, fullName);
    driverIdBySlug.set(slug, row.driverId);
  }

  const driverAId = driverIdBySlug.get(filters.driverA);
  const driverBId = driverIdBySlug.get(filters.driverB);

  if (!driverAId || !driverBId) {
    return null;
  }

  const buildRaceResult = (row: (typeof raceRows)[number]): DriverMeetingResult => ({
    driverSlug: getDriverRouteSlug(row.driverId, `${row.givenName} ${row.familyName}`),
    team: getConstructorTheme(row.constructorId, row.constructorName).displayName,
    position: row.position ?? Number.POSITIVE_INFINITY,
    label: row.position !== null ? `P${row.position}` : row.status === "Disqualified" ? "DSQ" : row.status,
    points: Number(row.points),
    dnf: row.started && isDnfStatus(row.status),
  });

  const buildQualifyingResult = (row: (typeof qualifyingRows)[number]): DriverMeetingResult => ({
    driverSlug: getDriverRouteSlug(row.driverId, `${row.givenName} ${row.familyName}`),
    team: getConstructorTheme(row.constructorId, row.constructorName).displayName,
    position: row.position ?? Number.POSITIVE_INFINITY,
    label: row.position !== null ? `P${row.position}` : "No time",
    points: 0,
    dnf: row.position === null,
  });

  const buildSprintResult = (row: (typeof sprintRows)[number]): DriverMeetingResult => ({
    driverSlug: getDriverRouteSlug(row.driverId, `${row.givenName} ${row.familyName}`),
    team: getConstructorTheme(row.constructorId, row.constructorName).displayName,
    position: row.position ?? Number.POSITIVE_INFINITY,
    label: row.position !== null ? `P${row.position}` : row.status === "Disqualified" ? "DSQ" : row.status,
    points: Number(row.points),
    dnf: row.started && isDnfStatus(row.status),
  });

  const raceMeetingsByRaceId = new Map<number, (typeof raceRows)>();
  for (const row of raceRows) {
    const meetingRows = raceMeetingsByRaceId.get(row.raceId) ?? [];
    meetingRows.push(row);
    raceMeetingsByRaceId.set(row.raceId, meetingRows);
  }

  const qualifyingMeetingsByRaceId = new Map<number, (typeof qualifyingRows)>();
  for (const row of qualifyingRows) {
    const meetingRows = qualifyingMeetingsByRaceId.get(row.raceId) ?? [];
    meetingRows.push(row);
    qualifyingMeetingsByRaceId.set(row.raceId, meetingRows);
  }

  const sprintMeetingsByRaceId = new Map<number, (typeof sprintRows)>();
  for (const row of sprintRows) {
    const meetingRows = sprintMeetingsByRaceId.get(row.raceId) ?? [];
    meetingRows.push(row);
    sprintMeetingsByRaceId.set(row.raceId, meetingRows);
  }

  const allMeetings: ComparableMeeting[] = [];

  for (const rows of raceMeetingsByRaceId.values()) {
    const rowA = rows.find((row) => row.driverId === driverAId);
    const rowB = rows.find((row) => row.driverId === driverBId);
    if (!rowA || !rowB) continue;

    const resultA = buildRaceResult(rowA);
    const resultB = buildRaceResult(rowB);
    allMeetings.push({
      season: String(rowA.seasonYear),
      round: String(rowA.round).padStart(2, "0"),
      grandPrix: rowA.raceName,
      type: "Race",
      notes: `${getConstructorTheme(rowA.constructorId, rowA.constructorName).displayName} vs ${getConstructorTheme(rowB.constructorId, rowB.constructorName).displayName}`,
      results: [resultA, resultB],
    });
  }

  for (const rows of qualifyingMeetingsByRaceId.values()) {
    const rowA = rows.find((row) => row.driverId === driverAId);
    const rowB = rows.find((row) => row.driverId === driverBId);
    if (!rowA || !rowB) continue;

    const resultA = buildQualifyingResult(rowA);
    const resultB = buildQualifyingResult(rowB);
    allMeetings.push({
      season: String(rowA.seasonYear),
      round: String(rowA.round).padStart(2, "0"),
      grandPrix: rowA.raceName,
      type: "Qualifying",
      notes: `${getConstructorTheme(rowA.constructorId, rowA.constructorName).displayName} vs ${getConstructorTheme(rowB.constructorId, rowB.constructorName).displayName}`,
      results: [resultA, resultB],
    });
  }

  for (const rows of sprintMeetingsByRaceId.values()) {
    const rowA = rows.find((row) => row.driverId === driverAId);
    const rowB = rows.find((row) => row.driverId === driverBId);
    if (!rowA || !rowB) continue;

    const resultA = buildSprintResult(rowA);
    const resultB = buildSprintResult(rowB);
    allMeetings.push({
      season: String(rowA.seasonYear),
      round: String(rowA.round).padStart(2, "0"),
      grandPrix: rowA.raceName,
      type: "Sprint",
      notes: `${getConstructorTheme(rowA.constructorId, rowA.constructorName).displayName} vs ${getConstructorTheme(rowB.constructorId, rowB.constructorName).displayName}`,
      results: [resultA, resultB],
    });
  }

  const filteredMeetings = allMeetings.filter((meeting) => {
    if (filters.scope === "Season" && filters.season && meeting.season !== filters.season) {
      return false;
    }

    if (filters.scope === "Season Range") {
      if (filters.seasonFrom && meeting.season < filters.seasonFrom) return false;
      if (filters.seasonTo && meeting.season > filters.seasonTo) return false;
    }

    if (filters.mode === "Teammates only" && meeting.results[0].team !== meeting.results[1].team) {
      return false;
    }

    if (filters.dnfMode === "Exclude DNFs" && (meeting.results[0].dnf || meeting.results[1].dnf)) {
      return false;
    }

    return true;
  });

  const raceMeetings = filteredMeetings.filter((meeting) => meeting.type === "Race");
  const qualifyingMeetings = filteredMeetings.filter((meeting) => meeting.type === "Qualifying");
  const sprintMeetings = filteredMeetings.filter((meeting) => meeting.type === "Sprint");
  const raceH2H = countHeadToHead(raceMeetings);
  const qualiH2H = countHeadToHead(qualifyingMeetings);

  const summary = {
    raceH2H,
    qualiH2H,
    winsA: raceMeetings.filter((meeting) => meeting.results[0].position === 1).length,
    winsB: raceMeetings.filter((meeting) => meeting.results[1].position === 1).length,
    podiumsA: raceMeetings.filter((meeting) => Number.isFinite(meeting.results[0].position) && meeting.results[0].position <= 3).length,
    podiumsB: raceMeetings.filter((meeting) => Number.isFinite(meeting.results[1].position) && meeting.results[1].position <= 3).length,
    polesA: qualifyingMeetings.filter((meeting) => meeting.results[0].position === 1).length,
    polesB: qualifyingMeetings.filter((meeting) => meeting.results[1].position === 1).length,
    pointsA:
      raceMeetings.reduce((total, meeting) => total + meeting.results[0].points, 0) +
      sprintMeetings.reduce((total, meeting) => total + meeting.results[0].points, 0),
    pointsB:
      raceMeetings.reduce((total, meeting) => total + meeting.results[1].points, 0) +
      sprintMeetings.reduce((total, meeting) => total + meeting.results[1].points, 0),
    startsA: raceMeetings.length,
    startsB: raceMeetings.length,
    dnfsA: raceMeetings.filter((meeting) => meeting.results[0].dnf).length,
    dnfsB: raceMeetings.filter((meeting) => meeting.results[1].dnf).length,
  };

  const bySeason = options.seasons
    .map((season) => {
      const seasonMeetings = filteredMeetings.filter((meeting) => meeting.season === season);
      if (seasonMeetings.length === 0) {
        return null;
      }

      const seasonRace = countHeadToHead(seasonMeetings.filter((meeting) => meeting.type === "Race"));
      const seasonQuali = countHeadToHead(seasonMeetings.filter((meeting) => meeting.type === "Qualifying"));
      const seasonRaceMeetings = seasonMeetings.filter((meeting) => meeting.type === "Race");
      const seasonSprintMeetings = seasonMeetings.filter((meeting) => meeting.type === "Sprint");

      return {
        season,
        raceH2H: `${seasonRace.driverA}-${seasonRace.driverB}`,
        qualiH2H: `${seasonQuali.driverA}-${seasonQuali.driverB}`,
        points: `${seasonRaceMeetings.reduce((total, meeting) => total + meeting.results[0].points, 0) + seasonSprintMeetings.reduce((total, meeting) => total + meeting.results[0].points, 0)}-${seasonRaceMeetings.reduce((total, meeting) => total + meeting.results[1].points, 0) + seasonSprintMeetings.reduce((total, meeting) => total + meeting.results[1].points, 0)}`,
        wins: `${seasonRaceMeetings.filter((meeting) => meeting.results[0].position === 1).length}-${seasonRaceMeetings.filter((meeting) => meeting.results[1].position === 1).length}`,
        podiums: `${seasonRaceMeetings.filter((meeting) => Number.isFinite(meeting.results[0].position) && meeting.results[0].position <= 3).length}-${seasonRaceMeetings.filter((meeting) => Number.isFinite(meeting.results[1].position) && meeting.results[1].position <= 3).length}`,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return {
    drivers: options.drivers,
    seasons: options.seasons,
    selectedDrivers: {
      driverA: driverAOption,
      driverB: driverBOption,
    },
    summary,
    meetings: filteredMeetings.map((meeting) => ({
      season: meeting.season,
      round: meeting.round,
      grandPrix: meeting.grandPrix,
      type: meeting.type,
      notes: meeting.notes,
      resultA: meeting.results[0],
      resultB: meeting.results[1],
    })),
    bySeason,
    sprintSupported: sprintMeetings.length > 0,
  };
}
