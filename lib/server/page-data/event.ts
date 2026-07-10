import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { getDatabase } from "@/lib/db/client";
import {
  circuits,
  constructors,
  drivers,
  qualifyingResults,
  raceResults,
  raceSessions,
  races,
  sprintResults,
} from "@/lib/db/schema";
import { resolveRaceFlagCountry } from "@/lib/f1/flag-country";
import { deriveRaceStatus } from "@/lib/server/page-data/calendar";

type EventLookupInput = {
  slug: string;
  seasonYear?: number;
  round?: number;
};

function formatDateRange(value: string) {
  const raceDate = new Date(`${value}T00:00:00Z`);
  const friday = new Date(raceDate);
  friday.setUTCDate(friday.getUTCDate() - 2);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${formatter.format(friday)} - ${formatter.format(raceDate)}`;
}

function getCountryFlag(country: string) {
  const flags: Record<string, string> = {
    Australia: "AU",
    Bahrain: "BH",
    China: "CN",
    Italy: "IT",
    Japan: "JP",
    Monaco: "MC",
    "Saudi Arabia": "SA",
    "United States": "US",
    "United Kingdom": "GB",
  };

  const code = flags[country];
  if (!code) {
    return "F1";
  }

  return String.fromCodePoint(...code.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)));
}

function formatRaceDay(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function buildStoredSchedule(dateValue: string, hasQualifying: boolean) {
  const raceDay = formatRaceDay(dateValue);
  const raceSession = {
    key: "race",
    day: raceDay,
    session: "Race",
    localTime: "Stored date",
    yourTime: dateValue,
  };

  if (!hasQualifying) {
    return [raceSession];
  }

  const raceDate = new Date(`${dateValue}T00:00:00Z`);
  const qualifyingDate = new Date(raceDate);
  qualifyingDate.setUTCDate(qualifyingDate.getUTCDate() - 1);

  return [
    {
      key: "qualifying",
      day: formatRaceDay(qualifyingDate.toISOString().slice(0, 10)),
      session: "Qualifying",
      localTime: "Stored session",
      yourTime: qualifyingDate.toISOString().slice(0, 10),
    },
    raceSession,
  ];
}

function formatSessionTime(value: string | null) {
  if (!value) {
    return "Stored date";
  }

  const normalized = value.endsWith("Z") || /[+-]\d\d(:?\d\d)?$/.test(value) ? value : `${value}Z`;
  const [hours = "--", minutes = "--"] = normalized.replace(/Z|[+-]\d\d(?::?\d\d)?$/, "").split(":");
  return `${hours}:${minutes} UTC`;
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

async function getStoredSchedule(raceId: number, raceDate: string, hasQualifying: boolean) {
  const { db } = getDatabase();
  const sessions = await db
    .select({
      key: raceSessions.sessionKey,
      day: raceSessions.date,
      session: raceSessions.name,
      time: raceSessions.time,
    })
    .from(raceSessions)
    .where(eq(raceSessions.raceId, raceId))
    .orderBy(asc(raceSessions.sortOrder));

  if (sessions.length === 0) {
    return buildStoredSchedule(raceDate, hasQualifying);
  }

  return sessions.map((session) => ({
    key: session.key,
    day: formatRaceDay(session.day),
    session: session.session,
    localTime: formatSessionTime(session.time),
    yourTime: formatSessionDate(session.day),
  }));
}

async function findRaceByLookup({ slug, seasonYear, round }: EventLookupInput) {
  const { db } = getDatabase();

  if (seasonYear && round) {
    const [row] = await db
      .select({
        raceId: races.raceId,
        seasonYear: races.seasonYear,
        round: races.round,
        name: races.name,
        slug: races.slug,
        date: races.date,
        circuitId: circuits.circuitId,
        circuitName: circuits.name,
        country: circuits.country,
        locality: circuits.locality,
        lat: circuits.lat,
        lng: circuits.lng,
      })
      .from(races)
      .innerJoin(circuits, eq(races.circuitId, circuits.circuitId))
      .where(and(eq(races.seasonYear, seasonYear), eq(races.round, round)))
      .limit(1);

    if (row) {
      return row;
    }
  }

  const [fallback] = await db
    .select({
      raceId: races.raceId,
      seasonYear: races.seasonYear,
      round: races.round,
      name: races.name,
      slug: races.slug,
      date: races.date,
      circuitId: circuits.circuitId,
      circuitName: circuits.name,
      country: circuits.country,
      locality: circuits.locality,
      lat: circuits.lat,
      lng: circuits.lng,
    })
    .from(races)
    .innerJoin(circuits, eq(races.circuitId, circuits.circuitId))
    .where(eq(races.slug, slug))
    .orderBy(desc(races.seasonYear), desc(races.round))
    .limit(1);

  return fallback ?? null;
}

export async function getEventPageData(input: EventLookupInput) {
  const race = await findRaceByLookup(input);

  if (!race) {
    return null;
  }

  const { db } = getDatabase();

  const [raceRows, qualifyingRows, sprintRows] = await Promise.all([
    db
      .select({
        position: raceResults.position,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        team: constructors.name,
        value: raceResults.points,
      })
      .from(raceResults)
      .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
      .where(eq(raceResults.raceId, race.raceId))
      .orderBy(asc(raceResults.position)),
    db
      .select({
        position: qualifyingResults.position,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        team: constructors.name,
        q1: qualifyingResults.q1,
        q2: qualifyingResults.q2,
        q3: qualifyingResults.q3,
      })
      .from(qualifyingResults)
      .innerJoin(drivers, eq(qualifyingResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(qualifyingResults.constructorId, constructors.constructorId))
      .where(eq(qualifyingResults.raceId, race.raceId))
      .orderBy(asc(qualifyingResults.position)),
    db
      .select({
        position: sprintResults.position,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        team: constructors.name,
        value: sprintResults.points,
      })
      .from(sprintResults)
      .innerJoin(drivers, eq(sprintResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(sprintResults.constructorId, constructors.constructorId))
      .where(eq(sprintResults.raceId, race.raceId))
      .orderBy(asc(sprintResults.position)),
  ]);

  const hasQualifying = qualifyingRows.length > 0;
  const [status, storedSchedule] = await Promise.all([
    Promise.resolve(deriveRaceStatus(race.date)),
    getStoredSchedule(race.raceId, race.date, hasQualifying),
  ]);

  return {
    slug: race.slug,
    grandPrix: race.name,
    flag: getCountryFlag(resolveRaceFlagCountry(race.name, race.country)),
    circuitId: race.circuitId,
    circuit: race.circuitName,
    country: race.country,
    city: race.locality,
    round: String(race.round).padStart(2, "0"),
    dateRange: formatDateRange(race.date),
    status,
    nextSession: status === "Completed" ? "Weekend complete" : (storedSchedule[0]?.session ?? "Race date pending"),
    schedule: storedSchedule,
    results: [
      {
        key: "qualifying",
        label: "Qualifying",
        rows: qualifyingRows.slice(0, 3).map((row) => ({
          position: row.position ? `P${row.position}` : "--",
          entry: `${row.givenName} ${row.familyName}`,
          team: row.team,
          value: row.q3 ?? row.q2 ?? row.q1 ?? "--",
        })),
      },
      {
        key: "race",
        label: "Race",
        rows: raceRows.slice(0, 3).map((row) => ({
          position: row.position ? `P${row.position}` : "--",
          entry: `${row.givenName} ${row.familyName}`,
          team: row.team,
          value: row.value ? `${row.value} pts` : "--",
        })),
      },
      {
        key: "sprint",
        label: "Sprint",
        rows: sprintRows.slice(0, 3).map((row) => ({
          position: row.position ? `P${row.position}` : "--",
          entry: `${row.givenName} ${row.familyName}`,
          team: row.team,
          value: row.value ? `${row.value} pts` : "--",
        })),
      },
    ].filter((tab) => tab.rows.length > 0),
    facts: [
      { label: "Circuit ID", value: race.circuitId },
      { label: "Locality", value: race.locality },
      { label: "Country", value: race.country },
      { label: "Race Date", value: race.date },
    ],
    records: [
      { label: "Latitude", value: race.lat !== null ? String(race.lat) : "Pending" },
      { label: "Longitude", value: race.lng !== null ? String(race.lng) : "Pending" },
      { label: "Season", value: String(race.seasonYear) },
      { label: "Round", value: String(race.round) },
    ],
  };
}
