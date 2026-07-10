import "server-only";

import { asc, desc, eq } from "drizzle-orm";

import type { GrandPrixRecord, GrandPrixScope, GrandPrixSummary } from "@/lib/grand-prix-data";
import { resolveRaceFlagCountry } from "@/lib/f1/flag-country";
import { getConstructorRouteSlug, getConstructorTheme, getDriverRouteSlug, getFlagEmoji, slugifyF1Segment } from "@/lib/f1/presentation";
import { getDatabase } from "@/lib/db/client";
import { circuits, constructors, drivers, qualifyingResults, raceResults, races } from "@/lib/db/schema";

type GrandPrixAggregateRow = {
  seasonYear: number;
  raceId: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  country: string;
  locality: string;
  winner: string;
  winnerDriverId: string;
  winnerTeam: string;
  poleSitter: string | null;
  poleDriverId: string | null;
};

type GrandPrixRaceStatRow = {
  raceId: number;
  driverId: string;
  givenName: string;
  familyName: string;
  nationality: string;
  constructorId: string;
  constructorName: string;
  position: number | null;
  started: boolean;
};

type GrandPrixQualifyingStatRow = {
  raceId: number;
  driverId: string;
  constructorId: string;
  position: number | null;
};

function sortLeaderRows<T extends { wins: number; podiums: number; poles: number; starts: number }>(rows: T[]) {
  return rows.sort((left, right) => right.wins - left.wins || right.podiums - left.podiums || right.poles - left.poles || right.starts - left.starts);
}

function buildSummaryCard(label: string, name: string, flag: string, teamOrValue: string, stat: string): GrandPrixSummary {
  return { label, name, flag, teamOrValue, stat };
}

function buildScopeData(
  rows: GrandPrixAggregateRow[],
  raceStatRows: GrandPrixRaceStatRow[],
  qualifyingStatRows: GrandPrixQualifyingStatRow[],
  description: string,
) {
  const driverMap = new Map<
    string,
    {
      slug: string;
      flag: string;
      name: string;
      wins: number;
      podiums: number;
      poles: number;
      starts: number;
    }
  >();

  const teamMap = new Map<
    string,
    {
      slug: string;
      name: string;
      wins: number;
      podiums: number;
      poles: number;
      starts: number;
    }
  >();

  for (const row of raceStatRows) {
    const driverName = `${row.givenName} ${row.familyName}`;
    const driverEntry = driverMap.get(row.driverId) ?? {
      slug: getDriverRouteSlug(row.driverId, driverName),
      flag: getFlagEmoji(row.nationality),
      name: driverName,
      wins: 0,
      podiums: 0,
      poles: 0,
      starts: 0,
    };

    driverEntry.wins += row.position === 1 ? 1 : 0;
    driverEntry.podiums += row.position !== null && row.position <= 3 ? 1 : 0;
    driverEntry.starts += row.started ? 1 : 0;
    driverMap.set(row.driverId, driverEntry);

    const teamName = getConstructorTheme(row.constructorId, row.constructorName).displayName;
    const teamEntry = teamMap.get(row.constructorId) ?? {
      slug: getConstructorRouteSlug(row.constructorId, teamName),
      name: teamName,
      wins: 0,
      podiums: 0,
      poles: 0,
      starts: 0,
    };

    teamEntry.wins += row.position === 1 ? 1 : 0;
    teamEntry.podiums += row.position !== null && row.position <= 3 ? 1 : 0;
    teamEntry.starts += row.started ? 1 : 0;
    teamMap.set(row.constructorId, teamEntry);
  }

  for (const row of qualifyingStatRows) {
    if (row.position !== 1) continue;

    const driverEntry = driverMap.get(row.driverId);
    if (driverEntry) {
      driverEntry.poles += 1;
    }

    const teamEntry = teamMap.get(row.constructorId);
    if (teamEntry) {
      teamEntry.poles += 1;
    }
  }

  const driverLeaders = sortLeaderRows(Array.from(driverMap.values())).slice(0, 8);
  const teamLeaders = sortLeaderRows(Array.from(teamMap.values())).slice(0, 8);
  const latestRow = rows[0];
  const mostWins = driverLeaders[0];
  const mostPoles = [...driverLeaders].sort((left, right) => right.poles - left.poles || right.wins - left.wins)[0];
  const mostPodiums = [...driverLeaders].sort((left, right) => right.podiums - left.podiums || right.wins - left.wins)[0];

  return {
    description,
    summaryCards: [
      buildSummaryCard("Most Wins", mostWins?.name ?? "--", mostWins?.flag ?? "🏁", "Stored coverage", `${mostWins?.wins ?? 0} wins`),
      buildSummaryCard("Most Poles", mostPoles?.name ?? "--", mostPoles?.flag ?? "🏁", "Stored coverage", `${mostPoles?.poles ?? 0} poles`),
      buildSummaryCard("Most Podiums", mostPodiums?.name ?? "--", mostPodiums?.flag ?? "🏁", "Stored coverage", `${mostPodiums?.podiums ?? 0} podiums`),
      buildSummaryCard("Latest Winner", latestRow?.winner ?? "--", "🏁", latestRow?.winnerTeam ?? "--", latestRow ? `${latestRow.seasonYear} winner` : "--"),
    ],
    driverLeaders,
    teamLeaders,
    history: rows.map((row) => ({
      year: String(row.seasonYear),
      winner: row.winner,
      team: row.winnerTeam,
      poleSitter: row.poleSitter ?? "--",
      fastestLap: "--",
      circuit: row.circuitName,
    })),
  };
}

export async function getGrandPrixOptions() {
  const { db } = getDatabase();
  const rows = await db
    .select({
      name: races.name,
    })
    .from(races)
    .orderBy(asc(races.name));

  return Array.from(new Set(rows.map((row) => row.name))).map((name) => ({
    slug: slugifyF1Segment(name),
    name,
  }));
}

export async function getGrandPrixPageData(slug: string, seasonYear?: number) {
  const { db } = getDatabase();

  const raceRows = await db
    .select({
      raceId: races.raceId,
      seasonYear: races.seasonYear,
      raceName: races.name,
      circuitId: circuits.circuitId,
      circuitName: circuits.name,
      country: circuits.country,
      locality: circuits.locality,
    })
    .from(races)
    .innerJoin(circuits, eq(races.circuitId, circuits.circuitId))
    .orderBy(desc(races.seasonYear), desc(races.round));

  const matchingRaceRows = raceRows.filter((row) => slugifyF1Segment(row.raceName) === slug);

  if (matchingRaceRows.length === 0) {
    return null;
  }

  const selectedSeason = seasonYear ?? matchingRaceRows[0].seasonYear;

  const [winnerRows, poleRows] = await Promise.all([
    db
      .select({
        raceId: raceResults.raceId,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        constructorName: constructors.name,
      })
      .from(raceResults)
      .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
      .where(eq(raceResults.position, 1)),
    db
      .select({
        raceId: qualifyingResults.raceId,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
      })
      .from(qualifyingResults)
      .innerJoin(drivers, eq(qualifyingResults.driverId, drivers.driverId))
      .where(eq(qualifyingResults.position, 1)),
  ]);

  const winnersByRaceId = new Map(
    winnerRows.map((row) => [
      row.raceId,
      {
        winner: `${row.givenName} ${row.familyName}`,
        winnerDriverId: row.driverId,
        winnerTeam: getConstructorTheme("", row.constructorName).displayName,
      },
    ]),
  );
  const polesByRaceId = new Map(
    poleRows.map((row) => [
      row.raceId,
      {
        poleSitter: `${row.givenName} ${row.familyName}`,
        poleDriverId: row.driverId,
      },
    ]),
  );

  const allTimeRows: GrandPrixAggregateRow[] = matchingRaceRows
    .map((row) => {
      const winner = winnersByRaceId.get(row.raceId);
      const pole = polesByRaceId.get(row.raceId);

      if (!winner) {
        return null;
      }

      return {
        seasonYear: row.seasonYear,
        raceId: row.raceId,
        raceName: row.raceName,
        circuitId: row.circuitId,
        circuitName: row.circuitName,
        country: row.country,
        locality: row.locality,
        winner: winner.winner,
        winnerDriverId: winner.winnerDriverId,
        winnerTeam: winner.winnerTeam,
        poleSitter: pole?.poleSitter ?? null,
        poleDriverId: pole?.poleDriverId ?? null,
      };
    })
    .filter((row): row is GrandPrixAggregateRow => row !== null);

  const [raceStatRows, qualifyingStatRows] = await Promise.all([
    db
      .select({
        raceId: raceResults.raceId,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        nationality: drivers.nationality,
        constructorId: constructors.constructorId,
        constructorName: constructors.name,
        position: raceResults.position,
        started: raceResults.started,
      })
      .from(raceResults)
      .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId)),
    db
      .select({
        raceId: qualifyingResults.raceId,
        driverId: qualifyingResults.driverId,
        constructorId: qualifyingResults.constructorId,
        position: qualifyingResults.position,
      })
      .from(qualifyingResults),
  ]);

  const matchingRaceIds = new Set(allTimeRows.map((row) => row.raceId));
  const matchingRaceStats = raceStatRows.filter((row) => matchingRaceIds.has(row.raceId));
  const matchingQualifyingStats = qualifyingStatRows.filter((row) => matchingRaceIds.has(row.raceId));

  const seasonRows = allTimeRows.filter((row) => row.seasonYear === selectedSeason);
  const seasonRaceIds = new Set(seasonRows.map((row) => row.raceId));
  const seasonRaceStats = matchingRaceStats.filter((row) => seasonRaceIds.has(row.raceId));
  const seasonQualifyingStats = matchingQualifyingStats.filter((row) => seasonRaceIds.has(row.raceId));
  const latestRow = allTimeRows[0];
  const allSeasons = Array.from(new Set(allTimeRows.map((row) => String(row.seasonYear)))).sort((left, right) => Number(right) - Number(left));
  const firstHeld = Math.min(...allTimeRows.map((row) => row.seasonYear));

  const record: GrandPrixRecord = {
    slug,
    name: latestRow.raceName,
    flag: getFlagEmoji(resolveRaceFlagCountry(latestRow.raceName, latestRow.country)),
    location: `${latestRow.locality}, ${latestRow.country}`,
    firstHeld: `${firstHeld} in coverage`,
    currentCircuitId: latestRow.circuitId,
    currentCircuit: latestRow.circuitName,
    latestWinner: latestRow.winner,
    latestWinnerTeam: latestRow.winnerTeam,
    scopes: {
      "All-Time": buildScopeData(
        allTimeRows,
        matchingRaceStats,
        matchingQualifyingStats,
        `Stored coverage across ${allSeasons.length} seasons for ${latestRow.raceName}.`,
      ),
      Season: buildScopeData(
        seasonRows,
        seasonRaceStats,
        seasonQualifyingStats,
        seasonRows.length > 0 ? `${selectedSeason} season view for ${latestRow.raceName}.` : `No ${selectedSeason} data is stored for this Grand Prix.`,
      ),
    } satisfies Record<GrandPrixScope, ReturnType<typeof buildScopeData>>,
  };

  return {
    record,
    seasons: allSeasons,
    selectedSeason: String(selectedSeason),
  };
}
