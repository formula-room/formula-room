import { and, desc, eq, sql } from "drizzle-orm";

import { getDatabase } from "@/lib/db/client";
import {
  circuits,
  constructorSeasonStandings,
  constructors,
  driverSeasonStandings,
  drivers,
  qualifyingResults,
  raceResults,
  raceSessions,
  races,
  seasons,
  sprintResults,
} from "@/lib/db/schema";
import {
  fetchConstructorStandings,
  fetchDriverStandings,
  fetchQualifyingResults,
  fetchRaceResults,
  fetchSeasonSchedule,
  fetchSeasonSprintResults,
  type ErgastCircuit,
  type ErgastConstructorStanding,
  type ErgastConstructor,
  type ErgastDriver,
  type ErgastDriverStanding,
  type ErgastQualifyingResult,
  type ErgastRace,
  type ErgastRaceResult,
  type ErgastRaceWithSprint,
  type ErgastSprintResult,
} from "@/lib/f1/jolpica-client";

type IngestSeasonOptions = {
  seasonYear: number;
};

type IngestRangeOptions = {
  startYear: number;
  endYear: number;
};

type SeasonCoverage = {
  year: number;
  hasSchedule: boolean;
  raceCount: number;
  raceResultCount: number;
  qualifyingResultCount: number;
  sprintResultCount: number;
  driverStandingCount: number;
  constructorStandingCount: number;
};

type IngestSeasonResult = SeasonCoverage;

type IngestRangeResult = {
  requestedRange: {
    startYear: number;
    endYear: number;
  };
  ingestedYears: number[];
  skippedYears: number[];
  latestRace: {
    raceId: number;
    seasonYear: number;
    round: number;
  } | null;
  coverage: SeasonCoverage[];
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseInteger(value?: string | null) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseFloatValue(value?: string | null) {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function hasStartedRace(grid?: string | null, status?: string | null) {
  const nonStarterStatuses = new Set([
    "Did not qualify",
    "Withdrawn",
    "Did not prequalify",
    "Did not start",
  ]);

  if (status && nonStarterStatuses.has(status)) {
    return false;
  }

  const parsedGrid = parseInteger(grid);
  return parsedGrid !== null && parsedGrid > 0;
}

function getRaceResultSortKey(row: ErgastRaceResult) {
  const position = parseInteger(row.position);
  return {
    position: position ?? Number.POSITIVE_INFINITY,
    points: Number.parseFloat(row.points) || 0,
    started: hasStartedRace(row.grid, row.status) ? 1 : 0,
  };
}

function normalizeRaceResults(results: ErgastRaceResult[]) {
  const byDriver = new Map<string, ErgastRaceResult>();

  for (const row of results) {
    const existing = byDriver.get(row.Driver.driverId);

    if (!existing) {
      byDriver.set(row.Driver.driverId, row);
      continue;
    }

    const current = getRaceResultSortKey(row);
    const previous = getRaceResultSortKey(existing);
    const shouldReplace =
      current.position < previous.position ||
      (current.position === previous.position && current.points > previous.points) ||
      (current.position === previous.position && current.points === previous.points && current.started > previous.started);

    if (shouldReplace) {
      byDriver.set(row.Driver.driverId, {
        ...row,
        points: String(current.points + previous.points),
      });
    } else {
      byDriver.set(row.Driver.driverId, {
        ...existing,
        points: String(current.points + previous.points),
      });
    }
  }

  return Array.from(byDriver.values());
}

function normalizeQualifyingResults(results: ErgastQualifyingResult[]) {
  const byDriver = new Map<string, ErgastQualifyingResult>();

  for (const row of results) {
    const existing = byDriver.get(row.Driver.driverId);
    if (!existing) {
      byDriver.set(row.Driver.driverId, row);
      continue;
    }

    const currentPosition = parseInteger(row.position) ?? Number.POSITIVE_INFINITY;
    const previousPosition = parseInteger(existing.position) ?? Number.POSITIVE_INFINITY;

    if (currentPosition < previousPosition) {
      byDriver.set(row.Driver.driverId, row);
    }
  }

  return Array.from(byDriver.values());
}

function normalizeSprintResults(results: ErgastSprintResult[]) {
  return normalizeRaceResults(results as ErgastRaceResult[]) as ErgastSprintResult[];
}

type NormalizedRaceSession = {
  sessionKey: string;
  name: string;
  date: string;
  time: string | null;
  sortOrder: number;
};

type RaceSessionCandidate = {
  sessionKey: string;
  name: string;
  date?: string;
  time?: string;
  defaultOrder: number;
};

function normalizeRaceSessions(race: ErgastRace): NormalizedRaceSession[] {
  const candidates: RaceSessionCandidate[] = [
    {
      sessionKey: "fp1",
      name: "Practice 1",
      date: race.FirstPractice?.date,
      time: race.FirstPractice?.time,
      defaultOrder: 10,
    },
    {
      sessionKey: "fp2",
      name: "Practice 2",
      date: race.SecondPractice?.date,
      time: race.SecondPractice?.time,
      defaultOrder: 20,
    },
    {
      sessionKey: "fp3",
      name: "Practice 3",
      date: race.ThirdPractice?.date,
      time: race.ThirdPractice?.time,
      defaultOrder: 30,
    },
    {
      sessionKey: "sprint-qualifying",
      name: "Sprint Qualifying",
      date: race.SprintQualifying?.date ?? race.SprintShootout?.date,
      time: race.SprintQualifying?.time ?? race.SprintShootout?.time,
      defaultOrder: 35,
    },
    {
      sessionKey: "sprint",
      name: "Sprint",
      date: race.Sprint?.date,
      time: race.Sprint?.time,
      defaultOrder: 40,
    },
    {
      sessionKey: "qualifying",
      name: "Qualifying",
      date: race.Qualifying?.date,
      time: race.Qualifying?.time,
      defaultOrder: 50,
    },
    {
      sessionKey: "race",
      name: "Race",
      date: race.date,
      time: race.time,
      defaultOrder: 60,
    },
  ];

  return candidates
    .flatMap((session) =>
      session.date
        ? [
            {
              ...session,
              date: session.date,
            },
          ]
        : [],
    )
    .sort((a, b) => {
      const aTimestamp = `${a.date}T${a.time ?? "23:59:59Z"}`;
      const bTimestamp = `${b.date}T${b.time ?? "23:59:59Z"}`;
      const byDate = aTimestamp.localeCompare(bTimestamp);
      return byDate === 0 ? a.defaultOrder - b.defaultOrder : byDate;
    })
    .map((session, index) => ({
      sessionKey: session.sessionKey,
      name: session.name,
      date: session.date,
      time: session.time ?? null,
      sortOrder: index + 1,
    }));
}

async function upsertSeason(year: number) {
  const { db } = getDatabase();

  await db
    .insert(seasons)
    .values({
      year,
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: seasons.year,
      set: {
        updatedAt: sql`now()`,
      },
    });
}

async function upsertCircuit(circuit: ErgastCircuit) {
  const { db } = getDatabase();

  await db
    .insert(circuits)
    .values({
      circuitId: circuit.circuitId,
      name: circuit.circuitName,
      country: circuit.Location.country,
      locality: circuit.Location.locality,
      lat: parseFloatValue(circuit.Location.lat),
      lng: parseFloatValue(circuit.Location.long),
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: circuits.circuitId,
      set: {
        name: circuit.circuitName,
        country: circuit.Location.country,
        locality: circuit.Location.locality,
        lat: parseFloatValue(circuit.Location.lat),
        lng: parseFloatValue(circuit.Location.long),
        updatedAt: sql`now()`,
      },
    });
}

async function upsertDriver(driver: ErgastDriver) {
  const { db } = getDatabase();

  await db
    .insert(drivers)
    .values({
      driverId: driver.driverId,
      givenName: driver.givenName,
      familyName: driver.familyName,
      code: driver.code ?? null,
      nationality: driver.nationality,
      dob: driver.dateOfBirth ?? null,
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: drivers.driverId,
      set: {
        givenName: driver.givenName,
        familyName: driver.familyName,
        code: driver.code ?? null,
        nationality: driver.nationality,
        dob: driver.dateOfBirth ?? null,
        updatedAt: sql`now()`,
      },
    });
}

async function upsertConstructor(constructor: ErgastConstructor) {
  const { db } = getDatabase();

  await db
    .insert(constructors)
    .values({
      constructorId: constructor.constructorId,
      name: constructor.name,
      nationality: constructor.nationality,
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: constructors.constructorId,
      set: {
        name: constructor.name,
        nationality: constructor.nationality,
        updatedAt: sql`now()`,
      },
    });
}

async function upsertRace(seasonYear: number, round: number, name: string, dateValue: string, circuitId: string) {
  const { db } = getDatabase();

  const [row] = await db
    .insert(races)
    .values({
      seasonYear,
      round,
      name,
      slug: toSlug(name),
      date: dateValue,
      circuitId,
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: [races.seasonYear, races.round],
      set: {
        name,
        slug: toSlug(name),
        date: dateValue,
        circuitId,
        updatedAt: sql`now()`,
      },
    })
    .returning({ raceId: races.raceId });

  return row.raceId;
}

async function replaceRaceSessions(raceId: number, race: ErgastRace) {
  const { db } = getDatabase();
  const sessions = normalizeRaceSessions(race);

  await db.delete(raceSessions).where(eq(raceSessions.raceId, raceId));

  if (sessions.length === 0) {
    return;
  }

  await db.insert(raceSessions).values(
    sessions.map((session) => ({
      raceId,
      sessionKey: session.sessionKey,
      name: session.name,
      date: session.date,
      time: session.time,
      sortOrder: session.sortOrder,
      updatedAt: sql`now()`,
    })),
  );
}

async function upsertDriverSeasonStanding(seasonYear: number, standing: ErgastDriverStanding) {
  const { db } = getDatabase();

  await upsertDriver(standing.Driver);

  await db
    .insert(driverSeasonStandings)
    .values({
      seasonYear,
      driverId: standing.Driver.driverId,
      position: parseInteger(standing.position) ?? 0,
      points: standing.points,
      wins: parseInteger(standing.wins) ?? 0,
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: [driverSeasonStandings.seasonYear, driverSeasonStandings.driverId],
      set: {
        position: parseInteger(standing.position) ?? 0,
        points: standing.points,
        wins: parseInteger(standing.wins) ?? 0,
        updatedAt: sql`now()`,
      },
    });
}

async function upsertConstructorSeasonStanding(seasonYear: number, standing: ErgastConstructorStanding) {
  const { db } = getDatabase();

  await upsertConstructor(standing.Constructor);

  await db
    .insert(constructorSeasonStandings)
    .values({
      seasonYear,
      constructorId: standing.Constructor.constructorId,
      position: parseInteger(standing.position) ?? 0,
      points: standing.points,
      wins: parseInteger(standing.wins) ?? 0,
      updatedAt: sql`now()`,
    })
    .onConflictDoUpdate({
      target: [constructorSeasonStandings.seasonYear, constructorSeasonStandings.constructorId],
      set: {
        position: parseInteger(standing.position) ?? 0,
        points: standing.points,
        wins: parseInteger(standing.wins) ?? 0,
        updatedAt: sql`now()`,
      },
    });
}

export async function ingestSeason({ seasonYear }: IngestSeasonOptions): Promise<IngestSeasonResult> {
  const schedule = await fetchSeasonSchedule(seasonYear);

  if (schedule.length === 0) {
    return {
      year: seasonYear,
      hasSchedule: false,
      raceCount: 0,
      raceResultCount: 0,
      qualifyingResultCount: 0,
      sprintResultCount: 0,
      driverStandingCount: 0,
      constructorStandingCount: 0,
    };
  }

  await upsertSeason(seasonYear);

  let raceResultCount = 0;
  let qualifyingResultCount = 0;
  let sprintResultCount = 0;
  const seasonSprintRaces =
    seasonYear >= 2021 ? await fetchSeasonSprintResults(seasonYear) : [];
  const sprintRaceByRound = new Map<number, ErgastRaceWithSprint>();

  for (const race of seasonSprintRaces) {
    const round = Number.parseInt(race.round, 10);
    if (!Number.isNaN(round)) {
      sprintRaceByRound.set(round, race);
    }
  }

  for (const race of schedule) {
    const round = Number.parseInt(race.round, 10);

    await upsertCircuit(race.Circuit);
    const raceId = await upsertRace(
      seasonYear,
      round,
      race.raceName,
      race.date,
      race.Circuit.circuitId,
    );
    await replaceRaceSessions(raceId, race);

    const [resultsResponse, qualifyingResponse, sprintResponse] = await Promise.all([
      fetchRaceResults(seasonYear, round),
      fetchQualifyingResults(seasonYear, round),
      sprintRaceByRound.has(round) ? Promise.resolve([sprintRaceByRound.get(round)!]) : Promise.resolve([]),
    ]);

    const raceWithResults = resultsResponse[0];
    const raceWithQualifying = qualifyingResponse[0];
    const raceWithSprint = sprintResponse[0];

    const normalizedRaceResults = normalizeRaceResults(raceWithResults?.Results ?? []);
    const normalizedQualifyingResults = normalizeQualifyingResults(raceWithQualifying?.QualifyingResults ?? []);
    const normalizedSprintResults = normalizeSprintResults(raceWithSprint?.SprintResults ?? []);

    for (const row of normalizedRaceResults) {
      await upsertDriver(row.Driver);
      await upsertConstructor(row.Constructor);
    }

    for (const row of normalizedQualifyingResults) {
      await upsertDriver(row.Driver);
      await upsertConstructor(row.Constructor);
    }

    for (const row of normalizedSprintResults) {
      await upsertDriver(row.Driver);
      await upsertConstructor(row.Constructor);
    }

    const { db } = getDatabase();

    if (normalizedRaceResults.length) {
      raceResultCount += normalizedRaceResults.length;
      await db
        .insert(raceResults)
        .values(
          normalizedRaceResults.map((row) => ({
            raceId,
            driverId: row.Driver.driverId,
            constructorId: row.Constructor.constructorId,
            position: parseInteger(row.position),
            positionText: row.positionText,
            grid: parseInteger(row.grid),
            status: row.status,
            points: row.points,
            started: hasStartedRace(row.grid, row.status),
            updatedAt: sql`now()`,
          })),
        )
        .onConflictDoUpdate({
          target: [raceResults.raceId, raceResults.driverId],
          set: {
            constructorId: sql`excluded.constructor_id`,
            position: sql`excluded.position`,
            positionText: sql`excluded.position_text`,
            grid: sql`excluded.grid`,
            status: sql`excluded.status`,
            points: sql`excluded.points`,
            started: sql`excluded.started`,
            updatedAt: sql`now()`,
          },
        });
    }

    if (normalizedQualifyingResults.length) {
      qualifyingResultCount += normalizedQualifyingResults.length;
      await db
        .insert(qualifyingResults)
        .values(
          normalizedQualifyingResults.map((row) => ({
            raceId,
            driverId: row.Driver.driverId,
            constructorId: row.Constructor.constructorId,
            position: parseInteger(row.position),
            q1: row.Q1 ?? null,
            q2: row.Q2 ?? null,
            q3: row.Q3 ?? null,
            updatedAt: sql`now()`,
          })),
        )
        .onConflictDoUpdate({
          target: [qualifyingResults.raceId, qualifyingResults.driverId],
          set: {
            constructorId: sql`excluded.constructor_id`,
            position: sql`excluded.position`,
            q1: sql`excluded.q1`,
            q2: sql`excluded.q2`,
            q3: sql`excluded.q3`,
            updatedAt: sql`now()`,
          },
        });
    }

    if (normalizedSprintResults.length) {
      sprintResultCount += normalizedSprintResults.length;
      await db
        .insert(sprintResults)
        .values(
          normalizedSprintResults.map((row) => ({
            raceId,
            driverId: row.Driver.driverId,
            constructorId: row.Constructor.constructorId,
            position: parseInteger(row.position),
            positionText: row.positionText,
            grid: parseInteger(row.grid),
            laps: parseInteger(row.laps),
            status: row.status,
            points: row.points,
            started: hasStartedRace(row.grid, row.status),
            updatedAt: sql`now()`,
          })),
        )
        .onConflictDoUpdate({
          target: [sprintResults.raceId, sprintResults.driverId],
          set: {
            constructorId: sql`excluded.constructor_id`,
            position: sql`excluded.position`,
            positionText: sql`excluded.position_text`,
            grid: sql`excluded.grid`,
            laps: sql`excluded.laps`,
            status: sql`excluded.status`,
            points: sql`excluded.points`,
            started: sql`excluded.started`,
            updatedAt: sql`now()`,
          },
        });
    }
  }

  const [driverStandings, constructorStandings] = await Promise.all([
    fetchDriverStandings(seasonYear),
    fetchConstructorStandings(seasonYear),
  ]);

  for (const standing of driverStandings) {
    await upsertDriverSeasonStanding(seasonYear, standing);
  }

  for (const standing of constructorStandings) {
    await upsertConstructorSeasonStanding(seasonYear, standing);
  }

  return {
    year: seasonYear,
    hasSchedule: true,
    raceCount: schedule.length,
    raceResultCount,
    qualifyingResultCount,
    sprintResultCount,
    driverStandingCount: driverStandings.length,
    constructorStandingCount: constructorStandings.length,
  };
}

export async function ingestRange({ startYear, endYear }: IngestRangeOptions): Promise<IngestRangeResult> {
  const coverage: SeasonCoverage[] = [];

  for (let seasonYear = startYear; seasonYear <= endYear; seasonYear += 1) {
    coverage.push(await ingestSeason({ seasonYear }));
  }

  const { db } = getDatabase();
  const [latestRace] = await db
    .select({
      raceId: races.raceId,
      seasonYear: races.seasonYear,
      round: races.round,
    })
    .from(races)
    .orderBy(desc(races.seasonYear), desc(races.round))
    .limit(1);

  return {
    requestedRange: {
      startYear,
      endYear,
    },
    ingestedYears: coverage.filter((season) => season.hasSchedule).map((season) => season.year),
    skippedYears: coverage.filter((season) => !season.hasSchedule).map((season) => season.year),
    latestRace,
    coverage,
  };
}

export async function getRaceIdBySeasonRound(seasonYear: number, round: number) {
  const { db } = getDatabase();
  const [row] = await db
    .select({ raceId: races.raceId })
    .from(races)
    .where(and(eq(races.seasonYear, seasonYear), eq(races.round, round)))
    .limit(1);

  return row?.raceId ?? null;
}
