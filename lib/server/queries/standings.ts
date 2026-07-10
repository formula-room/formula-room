import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { getDatabase } from "@/lib/db/client";
import { constructors, drivers, raceResults, races } from "@/lib/db/schema";

export async function getStandingsFoundation(seasonYear: number) {
  const { db } = getDatabase();

  const driverStandings = await db
    .select({
      driverId: drivers.driverId,
      givenName: drivers.givenName,
      familyName: drivers.familyName,
      code: drivers.code,
      nationality: drivers.nationality,
      points: sql<string>`cast(sum(${raceResults.points}) as text)`,
      wins: sql<number>`sum(case when ${raceResults.position} = 1 then 1 else 0 end)`,
      podiums: sql<number>`sum(case when ${raceResults.position} between 1 and 3 then 1 else 0 end)`,
      starts: sql<number>`sum(case when ${raceResults.started} then 1 else 0 end)`,
    })
    .from(raceResults)
    .innerJoin(races, eq(raceResults.raceId, races.raceId))
    .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
    .where(eq(races.seasonYear, seasonYear))
    .groupBy(drivers.driverId, drivers.givenName, drivers.familyName, drivers.code, drivers.nationality)
    .orderBy(
      desc(sql`sum(${raceResults.points})`),
      desc(sql`sum(case when ${raceResults.position} = 1 then 1 else 0 end)`),
      asc(drivers.familyName),
    );

  const constructorStandings = await db
    .select({
      constructorId: constructors.constructorId,
      name: constructors.name,
      nationality: constructors.nationality,
      points: sql<string>`cast(sum(${raceResults.points}) as text)`,
      wins: sql<number>`sum(case when ${raceResults.position} = 1 then 1 else 0 end)`,
      podiums: sql<number>`sum(case when ${raceResults.position} between 1 and 3 then 1 else 0 end)`,
      starts: sql<number>`sum(case when ${raceResults.started} then 1 else 0 end)`,
    })
    .from(raceResults)
    .innerJoin(races, eq(raceResults.raceId, races.raceId))
    .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
    .where(eq(races.seasonYear, seasonYear))
    .groupBy(constructors.constructorId, constructors.name, constructors.nationality)
    .orderBy(
      desc(sql`sum(${raceResults.points})`),
      desc(sql`sum(case when ${raceResults.position} = 1 then 1 else 0 end)`),
      asc(constructors.name),
    );

  return {
    seasonYear,
    drivers: driverStandings,
    constructors: constructorStandings,
    coverage: {
      raceOnly: true,
      sprintIncluded: false,
      polesAreQualifyingP1Only: true,
    },
  };
}
