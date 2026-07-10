import "server-only";

import { asc, eq } from "drizzle-orm";

import { getConstructorRouteSlug, getConstructorTheme, getDriverRouteSlug, getFlagEmoji, formatPoints } from "@/lib/f1/presentation";
import { getDatabase } from "@/lib/db/client";
import { constructorSeasonStandings, constructors, driverSeasonStandings, drivers, raceResults, races, sprintResults } from "@/lib/db/schema";
import { getSeasonsList } from "@/lib/server/queries/seasons";

const CONSTRUCTOR_CHAMPIONSHIP_START_YEAR = 1958;

function normalizeStandingPosition(position: number) {
  return position > 0 ? position : Number.POSITIVE_INFINITY;
}

function formatStandingPosition(position: number) {
  return position > 0 ? String(position) : "--";
}

export async function getStandingsPageData(seasonYear: number) {
  const { db } = getDatabase();
  const seasons = await getSeasonsList();

  const [raceRows, sprintRows] = await Promise.all([
    db
      .select({
        round: races.round,
        date: races.date,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        driverNationality: drivers.nationality,
        constructorId: constructors.constructorId,
        constructorName: constructors.name,
        position: raceResults.position,
        points: raceResults.points,
      })
      .from(raceResults)
      .innerJoin(races, eq(raceResults.raceId, races.raceId))
      .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
      .where(eq(races.seasonYear, seasonYear))
      .orderBy(asc(races.round), asc(drivers.familyName)),
    db
      .select({
        round: races.round,
        date: races.date,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        driverNationality: drivers.nationality,
        constructorId: constructors.constructorId,
        constructorName: constructors.name,
        position: sprintResults.position,
        points: sprintResults.points,
      })
      .from(sprintResults)
      .innerJoin(races, eq(sprintResults.raceId, races.raceId))
      .innerJoin(drivers, eq(sprintResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(sprintResults.constructorId, constructors.constructorId))
      .where(eq(races.seasonYear, seasonYear))
      .orderBy(asc(races.round), asc(drivers.familyName)),
  ]);

  const rows = [
    ...raceRows.map((row) => ({ ...row, session: "race" as const })),
    ...sprintRows.map((row) => ({ ...row, session: "sprint" as const })),
  ].sort((left, right) => left.round - right.round || left.familyName.localeCompare(right.familyName));

  const [driverStandingsRows, constructorStandingsRows] = await Promise.all([
    db
      .select({
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        nationality: drivers.nationality,
        points: driverSeasonStandings.points,
        wins: driverSeasonStandings.wins,
        position: driverSeasonStandings.position,
      })
      .from(driverSeasonStandings)
      .innerJoin(drivers, eq(driverSeasonStandings.driverId, drivers.driverId))
      .where(eq(driverSeasonStandings.seasonYear, seasonYear))
      .orderBy(asc(driverSeasonStandings.position), asc(drivers.familyName)),
    db
      .select({
        constructorId: constructors.constructorId,
        constructorName: constructors.name,
        points: constructorSeasonStandings.points,
        wins: constructorSeasonStandings.wins,
        position: constructorSeasonStandings.position,
      })
      .from(constructorSeasonStandings)
      .innerJoin(constructors, eq(constructorSeasonStandings.constructorId, constructors.constructorId))
      .where(eq(constructorSeasonStandings.seasonYear, seasonYear))
      .orderBy(asc(constructorSeasonStandings.position), asc(constructors.name)),
  ]);

  const driverMap = new Map<
    string,
    {
      driver: string;
      slug: string;
      flag: string;
      team: string;
      teamColor: string;
      points: number;
      wins: number;
      podiums: number;
      latestRound: number;
      sortFamilyName: string;
      constructorNames: Set<string>;
    }
  >();

  const teamMap = new Map<
    string,
    {
      team: string;
      slug: string;
      teamColor: string;
      points: number;
      wins: number;
      podiums: number;
    }
  >();

  let latestRound = 0;
  let lastUpdated = "";

  for (const row of rows) {
    const fullName = `${row.givenName} ${row.familyName}`;
    const driverSlug = getDriverRouteSlug(row.driverId, fullName);
    const constructorTheme = getConstructorTheme(row.constructorId, row.constructorName);
    const teamName = constructorTheme.displayName;
    const points = Number(row.points);

    latestRound = Math.max(latestRound, row.round);
    if (row.round === latestRound) {
      lastUpdated = row.date;
    }

    const driverStanding = driverMap.get(row.driverId) ?? {
      driver: fullName,
      slug: driverSlug,
      flag: getFlagEmoji(row.driverNationality),
      team: teamName,
      teamColor: constructorTheme.teamColor,
      points: 0,
      wins: 0,
      podiums: 0,
      latestRound: row.round,
      sortFamilyName: row.familyName,
      constructorNames: new Set<string>(),
    };

    driverStanding.points += points;
    driverStanding.wins += row.session === "race" && row.position === 1 ? 1 : 0;
    driverStanding.podiums += row.position !== null && row.position <= 3 ? 1 : 0;
    driverStanding.constructorNames.add(teamName);

    if (row.round >= driverStanding.latestRound) {
      driverStanding.team = teamName;
      driverStanding.teamColor = constructorTheme.teamColor;
      driverStanding.latestRound = row.round;
    }

    driverMap.set(row.driverId, driverStanding);

    const teamStanding = teamMap.get(row.constructorId) ?? {
      team: teamName,
      slug: getConstructorRouteSlug(row.constructorId, teamName),
      teamColor: constructorTheme.teamColor,
      points: 0,
      wins: 0,
      podiums: 0,
    };

    teamStanding.points += points;
    teamStanding.wins += row.session === "race" && row.position === 1 ? 1 : 0;
    teamStanding.podiums += row.position !== null && row.position <= 3 ? 1 : 0;
    teamMap.set(row.constructorId, teamStanding);
  }

  const computedDriverStandings = Array.from(driverMap.values())
    .sort((left, right) => {
      if (right.points !== left.points) return right.points - left.points;
      if (right.wins !== left.wins) return right.wins - left.wins;
      if (right.podiums !== left.podiums) return right.podiums - left.podiums;
      return left.sortFamilyName.localeCompare(right.sortFamilyName);
    })
    .map((row, index) => ({
      slug: row.slug,
      position: String(index + 1),
      driver: row.driver,
      flag: row.flag,
      team: row.team,
      teamColor: row.teamColor,
      points: formatPoints(row.points),
      wins: row.wins,
      podiums: row.podiums,
    }));

  const computedTeamStandings = Array.from(teamMap.values())
    .sort((left, right) => {
      if (right.points !== left.points) return right.points - left.points;
      if (right.wins !== left.wins) return right.wins - left.wins;
      if (right.podiums !== left.podiums) return right.podiums - left.podiums;
      return left.team.localeCompare(right.team);
    })
    .map((row, index) => ({
      slug: row.slug,
      position: String(index + 1),
      team: row.team,
      teamColor: row.teamColor,
      points: formatPoints(row.points),
      wins: row.wins,
      podiums: row.podiums,
    }));

  const driversStandings = driverStandingsRows.length > 0
    ? [...driverStandingsRows]
        .sort((left, right) => normalizeStandingPosition(left.position) - normalizeStandingPosition(right.position) || left.familyName.localeCompare(right.familyName))
        .map((row) => {
        const fullName = `${row.givenName} ${row.familyName}`;
        const fallback = driverMap.get(row.driverId);

        return {
          slug: getDriverRouteSlug(row.driverId, fullName),
          position: formatStandingPosition(row.position),
          driver: fullName,
          flag: getFlagEmoji(row.nationality),
          team: fallback?.constructorNames.size ? Array.from(fallback.constructorNames).join(" / ") : "Unknown Team",
          teamColor: fallback?.teamColor ?? "#ff6a3d",
          points: formatPoints(Number(row.points)),
          wins: row.wins,
          podiums: fallback?.podiums ?? 0,
        };
      })
    : computedDriverStandings;

  const teamsStandings = seasonYear < CONSTRUCTOR_CHAMPIONSHIP_START_YEAR
    ? []
    : constructorStandingsRows.length > 0
    ? [...constructorStandingsRows]
        .sort((left, right) => normalizeStandingPosition(left.position) - normalizeStandingPosition(right.position) || left.constructorName.localeCompare(right.constructorName))
        .map((row) => {
        const constructorTheme = getConstructorTheme(row.constructorId, row.constructorName);
        const fallback = teamMap.get(row.constructorId);

        return {
          slug: getConstructorRouteSlug(row.constructorId, constructorTheme.displayName),
          position: formatStandingPosition(row.position),
          team: constructorTheme.displayName,
          teamColor: constructorTheme.teamColor,
          points: formatPoints(Number(row.points)),
          wins: row.wins,
          podiums: fallback?.podiums ?? 0,
        };
      })
    : computedTeamStandings;

  return {
    seasonYear,
    seasons: seasons.map((season) => String(season.year)),
    lastUpdated,
    latestRound,
    drivers: driversStandings,
    teams: teamsStandings,
  };
}
