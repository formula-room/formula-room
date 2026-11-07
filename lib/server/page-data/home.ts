import "server-only";

import { and, asc, desc, eq, gte, lt } from "drizzle-orm";

import { getDatabase } from "@/lib/db/client";
import { getLatestNews } from "@/lib/db/news";
import {
  circuits,
  constructors,
  drivers,
  raceResults,
  raceSessions,
  races,
} from "@/lib/db/schema";
import type { NewsArticleView } from "@/components/news/NewsSlide";
import {
  getTeamColor,
  formatPoints,
} from "@/lib/f1/presentation";
import { resolveRaceFlagCountry } from "@/lib/f1/flag-country";
import { getCircuitRouteSlug } from "@/lib/f1/presentation";
import circuitFeatures from "@/lib/data/f1-circuits.json";
import { getEventRaceResultsHref } from "@/lib/route-helpers";
import { getStandingsPageData } from "@/lib/server/page-data/standings";
import { getSeasonsList } from "@/lib/server/queries/seasons";

type HomeSessionItem = {
  position?: string;
  name: string;
  label: string;
  time: string;
  startsAtUtc?: string;
  status?: "completed" | "live" | "upcoming";
  accentColor?: string;
};

type HomeInsightItem = {
  label: string;
  value: string;
};

type HomeRaceCardData = {
  flagCountry: string;
  location: string;
  circuitId: string;
  circuitName: string;
  eventHref: string | null;
  circuitHref: string | null;
  round: string;
  title: string;
  subtitle: string;
  date: string;
  status: string;
  sessions: HomeSessionItem[];
  overview: {
    circuitLength: string;
    numberOfLaps: string;
    raceDistance: string;
    firstGrandPrix: string;
    fastestLap: string;
    fastestLapHolder: string;
    fastestLapYear: string;
  };
  insights: HomeInsightItem[];
};

type HomeStandingsEntry = {
  position: string;
  name: string;
  points: number;
  sublabel: string;
  href: string | null;
  accentColor: string;
};

type CircuitFeature = {
  properties?: {
    Location?: string;
    Name?: string;
    firstgp?: number;
    length?: number;
  };
};

const raceLapsByCircuitId: Record<string, number> = {
  albert_park: 58,
  shanghai: 56,
  suzuka: 53,
  miami: 57,
  villeneuve: 70,
  monaco: 78,
  catalunya: 66,
  red_bull_ring: 71,
  silverstone: 52,
  spa: 44,
  hungaroring: 70,
  zandvoort: 72,
  monza: 53,
  mandalika: 57,
  madring: 57,
  baku: 51,
  marina_bay: 62,
  americas: 56,
  rodriguez: 71,
  interlagos: 71,
  vegas: 50,
  losail: 57,
  yas_marina: 58,
};

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findCircuitFeature(circuitId: string, circuitName: string, locality: string) {
  const normalizedCircuitId = normalizeKey(circuitId);
  const normalizedName = normalizeKey(circuitName);
  const normalizedLocality = normalizeKey(locality);

  return (circuitFeatures.features as CircuitFeature[]).find((feature) => {
    const name = normalizeKey(feature.properties?.Name ?? "");
    const location = normalizeKey(feature.properties?.Location ?? "");
    return (
      name === normalizedName ||
      location === normalizedLocality ||
      name.includes(normalizedCircuitId) ||
      normalizedCircuitId.includes(location)
    );
  });
}

function formatRaceDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatSessionTime(value: string | null) {
  if (!value) {
    return "Stored date";
  }

  const normalized = value.endsWith("Z") || /[+-]\d\d(:?\d\d)?$/.test(value) ? value : `${value}Z`;
  const [hours = "--", minutes = "--"] = normalized.replace(/Z|[+-]\d\d(?::?\d\d)?$/, "").split(":");
  return `${hours}:${minutes} UTC`;
}

function buildSessionStartUtc(date: string, time: string | null) {
  if (!time) {
    return undefined;
  }

  const normalized = time.endsWith("Z") || /[+-]\d\d(:?\d\d)?$/.test(time) ? time : `${time}Z`;
  const [hours = "00", minutes = "00", seconds = "00"] = normalized.replace(/Z|[+-]\d\d(?::?\d\d)?$/, "").split(":");
  return `${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}Z`;
}

function getSessionStatus(startsAtUtc?: string): HomeSessionItem["status"] {
  if (!startsAtUtc) {
    return "upcoming";
  }

  const start = Date.parse(startsAtUtc);
  if (Number.isNaN(start)) {
    return "upcoming";
  }

  const now = Date.now();
  const sessionWindowMs = 3 * 60 * 60 * 1000;

  if (now < start) {
    return "upcoming";
  }

  if (now - start <= sessionWindowMs) {
    return "live";
  }

  return "completed";
}

async function getRaceSessions(raceId: number, raceDate: string): Promise<HomeSessionItem[]> {
  const { db } = getDatabase();
  const sessions = await db
    .select({
      name: raceSessions.name,
      date: raceSessions.date,
      time: raceSessions.time,
    })
    .from(raceSessions)
    .where(eq(raceSessions.raceId, raceId))
    .orderBy(asc(raceSessions.sortOrder));

  if (sessions.length === 0) {
    return [
      {
        name: "Race",
        label: formatRaceDate(raceDate),
        time: "Stored date",
      },
    ];
  }

  return sessions.map((session) => ({
    name: session.name,
    label: formatRaceDate(session.date),
    time: formatSessionTime(session.time),
    startsAtUtc: buildSessionStartUtc(session.date, session.time),
    status: getSessionStatus(buildSessionStartUtc(session.date, session.time)),
  }));
}

async function getCircuitOverview(circuitId: string, circuitName: string, locality: string) {
  const { db } = getDatabase();
  const feature = findCircuitFeature(circuitId, circuitName, locality);
  const circuitLengthMeters = feature?.properties?.length;
  const numberOfLaps = raceLapsByCircuitId[circuitId];
  const raceDistanceKm =
    circuitLengthMeters && numberOfLaps
      ? ((circuitLengthMeters * numberOfLaps) / 1000).toFixed(1)
      : null;

  const firstRace = await db
    .select({
      seasonYear: races.seasonYear,
    })
    .from(races)
    .where(eq(races.circuitId, circuitId))
    .orderBy(asc(races.seasonYear), asc(races.round))
    .limit(1);

  return {
    circuitLength: circuitLengthMeters ? `${(circuitLengthMeters / 1000).toFixed(3)} km` : "--",
    numberOfLaps: numberOfLaps ? String(numberOfLaps) : "--",
    raceDistance: raceDistanceKm ? `${raceDistanceKm} km` : "--",
    firstGrandPrix: feature?.properties?.firstgp ? String(feature.properties.firstgp) : firstRace[0] ? String(firstRace[0].seasonYear) : "--",
    fastestLap: "--",
    fastestLapHolder: "Lap Record",
    fastestLapYear: "",
  };
}

function buildUnavailableRaceCard(title: string, subtitle: string): HomeRaceCardData {
  return {
    flagCountry: "",
    location: "Data unavailable",
    circuitId: "",
    circuitName: "Circuit unavailable",
    eventHref: null,
    circuitHref: null,
    round: "--",
    title,
    subtitle,
    date: "Awaiting schedule data",
    status: "Unavailable",
    sessions: [],
    overview: {
      circuitLength: "--",
      numberOfLaps: "--",
      raceDistance: "--",
      firstGrandPrix: "--",
      fastestLap: "--",
      fastestLapHolder: "Lap Record",
      fastestLapYear: "",
    },
    insights: [],
  };
}

function buildUnavailableStandingsEntry(position: string): HomeStandingsEntry {
  return {
    position,
    name: "Data unavailable",
    points: 0,
    sublabel: "Awaiting backend data",
    href: null,
    accentColor: "#ff6a3d",
  };
}

async function getRaceByDateBoundary(direction: "next" | "last") {
  const { db } = getDatabase();
  const today = new Date().toISOString().slice(0, 10);

  const query = db
    .select({
      raceId: races.raceId,
      circuitId: circuits.circuitId,
      seasonYear: races.seasonYear,
      round: races.round,
      name: races.name,
      slug: races.slug,
      date: races.date,
      circuitName: circuits.name,
      country: circuits.country,
      locality: circuits.locality,
    })
    .from(races)
    .innerJoin(circuits, eq(races.circuitId, circuits.circuitId));

  const rows =
    direction === "next"
      ? await query.where(gte(races.date, today)).orderBy(asc(races.date), asc(races.round)).limit(1)
      : await query.where(lt(races.date, today)).orderBy(desc(races.date), desc(races.round)).limit(1);

  return rows[0] ?? null;
}

async function getPodiumForRace(raceId: number) {
  const { db } = getDatabase();

  return db
    .select({
      position: raceResults.position,
      givenName: drivers.givenName,
      familyName: drivers.familyName,
      constructorId: raceResults.constructorId,
      constructorName: constructors.name,
      points: raceResults.points,
    })
    .from(raceResults)
    .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
    .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
    .where(and(eq(raceResults.raceId, raceId), gte(raceResults.position, 1), lt(raceResults.position, 4)))
    .orderBy(asc(raceResults.position));
}

/** The top of the same championship table Full Standings shows, so the two can't disagree. */
async function getTopStandingsForSeason(seasonYear: number) {
  const { drivers: driverRows, teams: teamRows } = await getStandingsPageData(seasonYear);

  return {
    topDrivers: driverRows.slice(0, 3).map((row) => ({
      position: row.position.padStart(2, "0"),
      name: row.driver,
      points: Number(row.points),
      sublabel: row.team,
      href: `/driver/${row.slug}`,
      accentColor: row.teamColor,
    })),
    topTeams: teamRows.slice(0, 3).map((row) => ({
      position: row.position.padStart(2, "0"),
      name: row.team,
      points: Number(row.points),
      sublabel: `${row.wins} wins`,
      href: `/team/${row.slug}`,
      accentColor: row.teamColor,
    })),
  };
}

function mapNewsArticles(rows: Awaited<ReturnType<typeof getLatestNews>>): NewsArticleView[] {
  return rows.map((row) => ({
    id: row.id,
    headline: row.headline,
    excerpt: row.excerpt,
    imageUrl: row.imageUrl,
    category: row.category,
    teamName: row.teamName,
    teamColor: row.teamColor,
    isBreaking: row.isBreaking,
    source: row.source,
    author: row.author,
    href: row.href,
    publishedAt: row.publishedAt.toISOString(),
  }));
}

export async function getHomePageData() {
  const seasons = await getSeasonsList();
  const latestSeason = seasons[0]?.year ?? null;
  const [nextRace, lastRace, news] = await Promise.all([
    getRaceByDateBoundary("next"),
    getRaceByDateBoundary("last"),
    getLatestNews(9),
  ]);

  const lastRacePodium = lastRace ? await getPodiumForRace(lastRace.raceId) : [];
  const [nextRaceOverview, lastRaceOverview, nextRaceSessions] = await Promise.all([
    nextRace ? getCircuitOverview(nextRace.circuitId, nextRace.circuitName, nextRace.locality) : Promise.resolve(buildUnavailableRaceCard("", "").overview),
    lastRace ? getCircuitOverview(lastRace.circuitId, lastRace.circuitName, lastRace.locality) : Promise.resolve(buildUnavailableRaceCard("", "").overview),
    nextRace ? getRaceSessions(nextRace.raceId, nextRace.date) : Promise.resolve([]),
  ]);
  const standings =
    latestSeason !== null
      ? await getTopStandingsForSeason(latestSeason)
      : {
          topDrivers: [buildUnavailableStandingsEntry("01"), buildUnavailableStandingsEntry("02"), buildUnavailableStandingsEntry("03")],
          topTeams: [buildUnavailableStandingsEntry("01"), buildUnavailableStandingsEntry("02"), buildUnavailableStandingsEntry("03")],
        };

  const nextRaceCard = nextRace
    ? {
        sessions: nextRaceSessions,
        flagCountry: resolveRaceFlagCountry(nextRace.name, nextRace.country),
        location: `${nextRace.locality}, ${nextRace.country}`,
        circuitId: nextRace.circuitId,
        circuitName: nextRace.circuitName,
        eventHref: `/event/${nextRace.slug}`,
        circuitHref: `/circuit/${getCircuitRouteSlug(nextRace.circuitId, nextRace.circuitName)}`,
        round: String(nextRace.round).padStart(2, "0"),
        title: nextRace.name,
        subtitle: `${nextRace.circuitName}, ${nextRace.locality}`,
        date: formatRaceDate(nextRace.date),
        status: "Upcoming",
        overview: nextRaceOverview,
        insights: [],
      }
    : buildUnavailableRaceCard("Next Race", "No upcoming race is available in the stored dataset.");

  const lastRaceWinner = lastRacePodium.find((row) => row.position === 1);
  const lastRaceCard = lastRace
    ? {
        flagCountry: resolveRaceFlagCountry(lastRace.name, lastRace.country),
        location: `${lastRace.locality}, ${lastRace.country}`,
        circuitId: lastRace.circuitId,
        circuitName: lastRace.circuitName,
        eventHref: getEventRaceResultsHref(lastRace.slug, lastRace.seasonYear, lastRace.round),
        circuitHref: `/circuit/${getCircuitRouteSlug(lastRace.circuitId, lastRace.circuitName)}`,
        round: String(lastRace.round).padStart(2, "0"),
        title: lastRace.name,
        subtitle: `${lastRace.circuitName}, ${lastRace.locality}`,
        date: formatRaceDate(lastRace.date),
        status: lastRaceWinner ? `${lastRaceWinner.givenName} ${lastRaceWinner.familyName}` : "Result unavailable",
        sessions: lastRacePodium.map((item) => ({
          position: String(item.position ?? "--").padStart(2, "0"),
          name: `${item.givenName} ${item.familyName}`,
          label: item.constructorName,
          time: `${formatPoints(Number(item.points))} pts`,
          accentColor: getTeamColor(item.constructorId, item.constructorName),
        })),
        overview: lastRaceOverview,
        insights: lastRaceWinner
          ? [
              { label: "Winning Team", value: lastRaceWinner.constructorName },
              { label: "Race Date", value: formatRaceDate(lastRace.date) },
            ]
          : [],
      }
    : buildUnavailableRaceCard("Last Race", "No completed race is available in the stored dataset.");

  return {
    seasonLabel: latestSeason ? `Season ${latestSeason}` : "Season data unavailable",
    nextRace: nextRaceCard,
    lastRace: lastRaceCard,
    news: mapNewsArticles(news),
    driverStandingsTopThree: standings.topDrivers.length
      ? standings.topDrivers
      : [buildUnavailableStandingsEntry("01"), buildUnavailableStandingsEntry("02"), buildUnavailableStandingsEntry("03")],
    teamStandingsTopThree: standings.topTeams.length
      ? standings.topTeams
      : [buildUnavailableStandingsEntry("01"), buildUnavailableStandingsEntry("02"), buildUnavailableStandingsEntry("03")],
  };
}
