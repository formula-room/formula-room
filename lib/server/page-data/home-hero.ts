import "server-only";

import { and, eq, gte, lte } from "drizzle-orm";

import { FALLBACK_HERO_IMAGE, resolveGrandPrixHeroImage, type GrandPrixHeroImage } from "@/lib/data/grand-prix-hero-images";
import { getDatabase } from "@/lib/db/client";
import { circuits, raceSessions, races } from "@/lib/db/schema";
import { getCircuitTimeZone } from "@/lib/f1/circuit-timezones";
import { resolveRaceFlagCountry } from "@/lib/f1/flag-country";
import { selectRaceWeekRace, type RaceWeekCandidate } from "@/lib/race-week";

/** The Grand Prix whose race week the hero photo belongs to (shown in the hero's location label). */
export type HomeHeroRace = {
  name: string;
  location: string;
  flagCountry: string;
  round: string;
};

export type HomeHeroBackground = GrandPrixHeroImage & {
  tone: "bright" | "dark";
  /** Race-week Grand Prix the photo belongs to; null only when the calendar could not be read. */
  race: HomeHeroRace | null;
  /** True when no photo is mapped for that Grand Prix yet and the default photo is shown. */
  isFallback: boolean;
};

type CalendarRow = RaceWeekCandidate & { race: HomeHeroRace };

function toIsoDate(value: number) {
  return new Date(value).toISOString().slice(0, 10);
}

function buildRaceStartUtc(date: string, time: string | null) {
  if (!time) {
    // No stored start time: mid-afternoon UTC keeps the race on its stored date in every zone we use.
    return `${date}T14:00:00Z`;
  }
  const clock = time.replace(/Z|[+-]\d\d(?::?\d\d)?$/, "");
  const [hours = "00", minutes = "00", seconds = "00"] = clock.split(":");
  return `${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.slice(0, 2).padStart(2, "0")}Z`;
}

/** Races from roughly the last year up to the next few weeks, so off-season gaps keep the last race's photo. */
async function getRecentCalendar(now: number): Promise<CalendarRow[]> {
  const { db } = getDatabase();
  const rows = await db
    .select({
      seasonYear: races.seasonYear,
      round: races.round,
      name: races.name,
      date: races.date,
      circuitId: races.circuitId,
      lng: circuits.lng,
      locality: circuits.locality,
      country: circuits.country,
      raceDate: raceSessions.date,
      raceTime: raceSessions.time,
    })
    .from(races)
    .innerJoin(circuits, eq(races.circuitId, circuits.circuitId))
    .leftJoin(raceSessions, and(eq(raceSessions.raceId, races.raceId), eq(raceSessions.sessionKey, "race")))
    .where(and(gte(races.date, toIsoDate(now - 400 * 86400000)), lte(races.date, toIsoDate(now + 21 * 86400000))));

  return rows.map((row) => ({
    seasonYear: row.seasonYear,
    round: row.round,
    race: {
      name: row.name,
      location: `${row.locality}, ${row.country}`,
      flagCountry: resolveRaceFlagCountry(row.name, row.country),
      round: String(row.round),
    },
    circuitId: row.circuitId,
    raceStartUtc: buildRaceStartUtc(row.raceDate ?? row.date, row.raceTime),
    timeZone: getCircuitTimeZone(row.circuitId, row.lng),
  }));
}

function withDefaults(image: GrandPrixHeroImage, race: HomeHeroRace | null, isFallback: boolean): HomeHeroBackground {
  return { ...image, tone: image.tone ?? "bright", race, isFallback };
}

/** Pure selection step, separated so it can be tested with a simulated calendar and date. */
export function pickHeroBackground(calendar: CalendarRow[], now: number): HomeHeroBackground {
  const race = selectRaceWeekRace(calendar, now);
  const image = race ? resolveGrandPrixHeroImage(race.circuitId, race.seasonYear) : null;
  return image ? withDefaults(image, race?.race ?? null, false) : withDefaults(FALLBACK_HERO_IMAGE, race?.race ?? null, true);
}

export async function getHomeHeroBackground(now: number = Date.now()): Promise<HomeHeroBackground> {
  try {
    return pickHeroBackground(await getRecentCalendar(now), now);
  } catch (error) {
    console.error("[home-hero] Falling back to the default photo:", error);
    return withDefaults(FALLBACK_HERO_IMAGE, null, true);
  }
}
