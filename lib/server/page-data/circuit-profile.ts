import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import type { CircuitProfileRecord } from "@/lib/circuit-profile-data";
import { getCircuitRouteSlug, slugifyF1Segment } from "@/lib/f1/presentation";
import { getDatabase } from "@/lib/db/client";
import { circuits, constructors, drivers, qualifyingResults, raceResults, races } from "@/lib/db/schema";

function createStatValue(holder: string | null, value: number | string) {
  return holder ? `${holder} / ${value}` : "--";
}

export async function getCircuitProfilePageDataBySlug(slug: string) {
  const { db } = getDatabase();

  const circuitRows = await db
    .select({
      circuitId: circuits.circuitId,
      name: circuits.name,
      country: circuits.country,
      locality: circuits.locality,
      lat: circuits.lat,
      lng: circuits.lng,
    })
    .from(circuits)
    .orderBy(asc(circuits.name));

  const circuit = circuitRows.find((row) => {
    return (
      getCircuitRouteSlug(row.circuitId, row.name) === slug ||
      slugifyF1Segment(row.name) === slug
    );
  });

  if (!circuit) {
    return null;
  }

  const raceRows = await db
    .select({
      raceId: races.raceId,
      seasonYear: races.seasonYear,
      raceName: races.name,
      date: races.date,
    })
    .from(races)
    .where(eq(races.circuitId, circuit.circuitId))
    .orderBy(desc(races.seasonYear), desc(races.round));

  if (raceRows.length === 0) {
    return null;
  }

  const [winnerRows, poleRows, circuitRaceRows, circuitQualifyingRows] = await Promise.all([
    db
      .select({
        raceId: raceResults.raceId,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        constructorName: constructors.name,
      })
      .from(raceResults)
      .innerJoin(races, eq(raceResults.raceId, races.raceId))
      .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
      .where(and(eq(raceResults.position, 1), eq(races.circuitId, circuit.circuitId))),
    db
      .select({
        raceId: qualifyingResults.raceId,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        constructorName: constructors.name,
      })
      .from(qualifyingResults)
      .innerJoin(drivers, eq(qualifyingResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(qualifyingResults.constructorId, constructors.constructorId))
      .innerJoin(races, eq(qualifyingResults.raceId, races.raceId))
      .where(and(eq(qualifyingResults.position, 1), eq(races.circuitId, circuit.circuitId))),
    db
      .select({
        raceId: raceResults.raceId,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        constructorName: constructors.name,
        position: raceResults.position,
        started: raceResults.started,
      })
      .from(raceResults)
      .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
      .innerJoin(races, eq(raceResults.raceId, races.raceId))
      .where(eq(races.circuitId, circuit.circuitId)),
    db
      .select({
        raceId: qualifyingResults.raceId,
        driverId: drivers.driverId,
        givenName: drivers.givenName,
        familyName: drivers.familyName,
        position: qualifyingResults.position,
      })
      .from(qualifyingResults)
      .innerJoin(drivers, eq(qualifyingResults.driverId, drivers.driverId))
      .innerJoin(races, eq(qualifyingResults.raceId, races.raceId))
      .where(eq(races.circuitId, circuit.circuitId)),
  ]);

  const winnersByRace = new Map(
    winnerRows.map((row) => [
      row.raceId,
      {
        winner: `${row.givenName} ${row.familyName}`,
        team: row.constructorName,
      },
    ]),
  );
  const polesByRace = new Map(
    poleRows.map((row) => [
      row.raceId,
      {
        poleSitter: `${row.givenName} ${row.familyName}`,
        team: row.constructorName,
      },
    ]),
  );

  const winCounts = new Map<string, number>();
  const poleCounts = new Map<string, number>();
  const podiumCounts = new Map<string, number>();
  const startCounts = new Map<string, number>();

  for (const row of circuitRaceRows) {
    const driverName = `${row.givenName} ${row.familyName}`;
    if (row.position === 1) {
      winCounts.set(driverName, (winCounts.get(driverName) ?? 0) + 1);
    }
    if (row.position !== null && row.position <= 3) {
      podiumCounts.set(driverName, (podiumCounts.get(driverName) ?? 0) + 1);
    }
    if (row.started) {
      startCounts.set(driverName, (startCounts.get(driverName) ?? 0) + 1);
    }
  }

  for (const row of circuitQualifyingRows) {
    if (row.position === 1) {
      const driverName = `${row.givenName} ${row.familyName}`;
      poleCounts.set(driverName, (poleCounts.get(driverName) ?? 0) + 1);
    }
  }

  const getLeader = (entries: Map<string, number>) =>
    Array.from(entries.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0] ?? null;

  const mostWins = getLeader(winCounts);
  const mostPoles = getLeader(poleCounts);
  const mostPodiums = getLeader(podiumCounts);
  const mostStarts = getLeader(startCounts);
  const latestRace = raceRows[0];
  const latestRaceWithWinner = raceRows.find((row) => winnersByRace.has(row.raceId));
  const latestWinner = winnersByRace.get(latestRace.raceId);
  const latestStoredWinner = latestRaceWithWinner ? winnersByRace.get(latestRaceWithWinner.raceId) : undefined;
  const latestPole = polesByRace.get(latestRace.raceId);

  const raceHistory = raceRows.map((row) => ({
    year: String(row.seasonYear),
    grandPrix: row.raceName,
    winner: winnersByRace.get(row.raceId)?.winner ?? "--",
    team: winnersByRace.get(row.raceId)?.team ?? "--",
    poleSitter: polesByRace.get(row.raceId)?.poleSitter ?? "--",
    fastestLap: "--",
    poleTeam: polesByRace.get(row.raceId)?.team ?? "--",
  }));

  const profile: CircuitProfileRecord = {
    slug,
    circuitId: circuit.circuitId,
    name: circuit.name,
    location: `${circuit.locality}, ${circuit.country}`,
    activeGrandPrix: latestRace.raceName,
    sinceYear: String(Math.min(...raceRows.map((row) => row.seasonYear))),
    supportingInfo: `Real circuit history from the stored race archive for ${circuit.locality}, ${circuit.country}.`,
    outlineAsset: "/track-outline.svg",
    overviewStats: [
      { label: "Length", value: "--" },
      { label: "Turns", value: "--" },
      { label: "Race Distance", value: "--" },
      { label: "Lap Record", value: "--" },
      { label: "First F1 Race", value: `${Math.min(...raceRows.map((row) => row.seasonYear))} in coverage` },
      { label: "Current Grand Prix", value: latestRace.raceName },
    ],
    secondaryStats: [
      { label: "Most Wins", value: createStatValue(mostWins?.[0] ?? null, mostWins?.[1] ?? "--") },
      { label: "Most Poles", value: createStatValue(mostPoles?.[0] ?? null, mostPoles?.[1] ?? "--") },
      { label: "Most Podiums", value: createStatValue(mostPodiums?.[0] ?? null, mostPodiums?.[1] ?? "--") },
      { label: "Most Starts", value: createStatValue(mostStarts?.[0] ?? null, mostStarts?.[1] ?? "--") },
      { label: "Latest Winner", value: latestStoredWinner?.winner ?? "--" },
      { label: "Events in Coverage", value: String(raceRows.length) },
    ],
    facts: [
      { label: "Circuit ID", value: circuit.circuitId },
      { label: "Locality", value: circuit.locality },
      { label: "Country", value: circuit.country },
      { label: "Latitude", value: circuit.lat !== null ? String(circuit.lat) : "--" },
      { label: "Longitude", value: circuit.lng !== null ? String(circuit.lng) : "--" },
      { label: "Current Grand Prix", value: latestRace.raceName },
    ],
    latestEventSummary: [
      { label: "Latest Event", value: `${latestRace.seasonYear} ${latestRace.raceName}` },
      { label: "Winner", value: latestWinner ? `${latestWinner.winner} / ${latestWinner.team}` : "--" },
      { label: "Pole", value: latestPole ? `${latestPole.poleSitter} / ${latestPole.team}` : "--" },
      { label: "Fastest Lap", value: "--" },
      { label: "Location", value: `${circuit.locality}, ${circuit.country}` },
      { label: "Coverage", value: `${raceRows[raceRows.length - 1].seasonYear}-${latestRace.seasonYear}` },
    ],
    records: [
      { record: "Lap Record", holder: "Pending", value: "--" },
      { record: "Most Wins", holder: mostWins?.[0] ?? "--", value: mostWins ? String(mostWins[1]) : "--" },
      { record: "Most Poles", holder: mostPoles?.[0] ?? "--", value: mostPoles ? String(mostPoles[1]) : "--" },
      { record: "Most Podiums", holder: mostPodiums?.[0] ?? "--", value: mostPodiums ? String(mostPodiums[1]) : "--" },
      { record: "Most Starts", holder: mostStarts?.[0] ?? "--", value: mostStarts ? String(mostStarts[1]) : "--" },
      { record: "Current Grand Prix", holder: "Latest Event", value: latestRace.raceName },
    ],
    raceHistory,
    winners: raceHistory.map((row) => ({
      year: row.year,
      entry: row.winner,
      teamOrContext: row.team,
      note: row.winner === "--" ? "Winner data unavailable." : `Race win at ${circuit.name}.`,
    })),
    poleSitters: raceHistory.map((row) => ({
      year: row.year,
      entry: row.poleSitter,
      teamOrContext: row.poleTeam,
      note: row.poleSitter === "--" ? "Qualifying data unavailable." : `Qualifying P1 at ${circuit.name}.`,
    })),
    fastestLaps: raceHistory.map((row) => ({
      year: row.year,
      entry: "--",
      teamOrContext: "--",
      note: "Fastest lap data is not in the current schema yet.",
    })),
  };

  return profile;
}
