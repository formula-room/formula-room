import "server-only";

import { asc, eq, sql } from "drizzle-orm";

import { getDatabase } from "@/lib/db/client";
import {
  constructors,
  drivers,
  qualifyingResults,
  raceResults,
  races,
} from "@/lib/db/schema";

export async function getDriverProfileFoundation(driverId: string) {
  const { db } = getDatabase();

  const [driver] = await db.select().from(drivers).where(eq(drivers.driverId, driverId)).limit(1);

  if (!driver) {
    return null;
  }

  const [summary] = await db
    .select({
      raceStarts: sql<number>`sum(case when ${raceResults.started} then 1 else 0 end)`,
      raceWins: sql<number>`sum(case when ${raceResults.position} = 1 then 1 else 0 end)`,
      racePodiums: sql<number>`sum(case when ${raceResults.position} between 1 and 3 then 1 else 0 end)`,
      points: sql<string>`cast(sum(${raceResults.points}) as text)`,
      poles: sql<number>`(
        select count(*)
        from ${qualifyingResults}
        where ${qualifyingResults.driverId} = ${driverId}
          and ${qualifyingResults.position} = 1
      )`,
    })
    .from(raceResults)
    .where(eq(raceResults.driverId, driverId));

  const recentResults = await db
    .select({
      seasonYear: races.seasonYear,
      round: races.round,
      raceName: races.name,
      date: races.date,
      position: raceResults.position,
      positionText: raceResults.positionText,
      status: raceResults.status,
      points: raceResults.points,
      constructorId: constructors.constructorId,
      constructorName: constructors.name,
    })
    .from(raceResults)
    .innerJoin(races, eq(raceResults.raceId, races.raceId))
    .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
    .where(eq(raceResults.driverId, driverId))
    .orderBy(sql`${races.seasonYear} desc`, sql`${races.round} desc`)
    .limit(10);

  return {
    driver,
    summary,
    recentResults,
    coverage: {
      photosIncluded: false,
      raceOnlyWinsAndPodiums: true,
      polesAreQualifyingP1Only: true,
    },
  };
}

export async function getTeamProfileFoundation(constructorId: string) {
  const { db } = getDatabase();

  const [constructor] = await db
    .select()
    .from(constructors)
    .where(eq(constructors.constructorId, constructorId))
    .limit(1);

  if (!constructor) {
    return null;
  }

  const [summary] = await db
    .select({
      raceStarts: sql<number>`sum(case when ${raceResults.started} then 1 else 0 end)`,
      raceWins: sql<number>`sum(case when ${raceResults.position} = 1 then 1 else 0 end)`,
      racePodiums: sql<number>`sum(case when ${raceResults.position} between 1 and 3 then 1 else 0 end)`,
      points: sql<string>`cast(sum(${raceResults.points}) as text)`,
      poles: sql<number>`(
        select count(*)
        from ${qualifyingResults}
        where ${qualifyingResults.constructorId} = ${constructorId}
          and ${qualifyingResults.position} = 1
      )`,
    })
    .from(raceResults)
    .where(eq(raceResults.constructorId, constructorId));

  const recentResults = await db
    .select({
      seasonYear: races.seasonYear,
      round: races.round,
      raceName: races.name,
      date: races.date,
      driverId: drivers.driverId,
      givenName: drivers.givenName,
      familyName: drivers.familyName,
      position: raceResults.position,
      positionText: raceResults.positionText,
      status: raceResults.status,
      points: raceResults.points,
    })
    .from(raceResults)
    .innerJoin(races, eq(raceResults.raceId, races.raceId))
    .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
    .where(eq(raceResults.constructorId, constructorId))
    .orderBy(sql`${races.seasonYear} desc`, sql`${races.round} desc`, asc(drivers.familyName))
    .limit(12);

  return {
    constructor,
    summary,
    recentResults,
    coverage: {
      raceOnlyWinsAndPodiums: true,
      sprintIncluded: false,
      polesAreQualifyingP1Only: true,
    },
  };
}
