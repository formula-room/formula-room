import "server-only";

import { asc, eq } from "drizzle-orm";

import { getDatabase } from "@/lib/db/client";
import { circuits, races } from "@/lib/db/schema";

export async function getCalendarBySeason(seasonYear: number) {
  const { db } = getDatabase();

  return db
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
    })
    .from(races)
    .innerJoin(circuits, eq(races.circuitId, circuits.circuitId))
    .where(eq(races.seasonYear, seasonYear))
    .orderBy(asc(races.round));
}

export async function getEventBySeasonRound(seasonYear: number, round: number) {
  const rows = await getCalendarBySeason(seasonYear);
  return rows.find((row) => row.round === round) ?? null;
}
