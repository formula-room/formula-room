import "server-only";

import { and, asc, eq, gte, lte } from "drizzle-orm";

import { getDatabase } from "@/lib/db/client";
import { raceResults, races } from "@/lib/db/schema";

type HeadToHeadOptions = {
  driverA: string;
  driverB: string;
  startSeason?: number;
  endSeason?: number;
  includeDnfs?: boolean;
};

function scoreResult(result: {
  position: number | null;
  positionText: string;
  status: string;
}) {
  if (result.position !== null) {
    return result.position;
  }

  if (result.status === "Disqualified") {
    return 9999;
  }

  return 9000;
}

export async function getHeadToHeadFoundation({
  driverA,
  driverB,
  startSeason,
  endSeason,
  includeDnfs = true,
}: HeadToHeadOptions) {
  const { db } = getDatabase();

  const rows = await db
    .select({
      raceId: races.raceId,
      seasonYear: races.seasonYear,
      round: races.round,
      raceName: races.name,
      date: races.date,
      driverId: raceResults.driverId,
      position: raceResults.position,
      positionText: raceResults.positionText,
      status: raceResults.status,
      started: raceResults.started,
      points: raceResults.points,
    })
    .from(races)
    .innerJoin(raceResults, eq(races.raceId, raceResults.raceId))
    .where(
      and(
        gte(races.seasonYear, startSeason ?? 1950),
        lte(races.seasonYear, endSeason ?? 9999),
      ),
    )
    .orderBy(asc(races.seasonYear), asc(races.round));

  const byRace = new Map<number, typeof rows>();

  for (const row of rows) {
    if (!byRace.has(row.raceId)) {
      byRace.set(row.raceId, []);
    }

    byRace.get(row.raceId)!.push(row);
  }

  let driverAWins = 0;
  let driverBWins = 0;
  const meetings = [];

  for (const raceRows of byRace.values()) {
    const resultA = raceRows.find((row) => row.driverId === driverA);
    const resultB = raceRows.find((row) => row.driverId === driverB);

    if (!resultA || !resultB) {
      continue;
    }

    if (!includeDnfs && (resultA.position === null || resultB.position === null)) {
      continue;
    }

    const scoreA = scoreResult(resultA);
    const scoreB = scoreResult(resultB);
    const winner = scoreA < scoreB ? driverA : scoreB < scoreA ? driverB : "tie";

    if (winner === driverA) driverAWins += 1;
    if (winner === driverB) driverBWins += 1;

    meetings.push({
      seasonYear: resultA.seasonYear,
      round: resultA.round,
      raceName: resultA.raceName,
      date: resultA.date,
      resultA,
      resultB,
      winner,
    });
  }

  return {
    filters: {
      driverA,
      driverB,
      startSeason: startSeason ?? 1950,
      endSeason: endSeason ?? new Date().getUTCFullYear(),
      includeDnfs,
      dsqTreatedAsLoss: true,
    },
    summary: {
      meetings: meetings.length,
      driverAWins,
      driverBWins,
    },
    meetings,
  };
}
