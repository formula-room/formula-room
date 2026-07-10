import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { getDatabase } from "@/lib/db/client";
import {
  circuits,
  constructors,
  drivers,
  qualifyingResults,
  raceResults,
  races,
  sprintResults,
} from "@/lib/db/schema";
import { formatPoints, getConstructorTheme, getFlagEmoji } from "@/lib/f1/presentation";
import { getSeasonsList } from "@/lib/server/queries/seasons";

export async function getResultsPageSeasons() {
  const seasons = await getSeasonsList();
  return seasons.map((item) => String(item.year));
}

export async function getResultsEventsForSeason(seasonYear: number) {
  const { db } = getDatabase();

  return db
    .select({
      seasonYear: races.seasonYear,
      round: races.round,
      slug: races.slug,
      grandPrix: races.name,
      circuit: circuits.name,
      dateRange: races.date,
    })
    .from(races)
    .innerJoin(circuits, eq(races.circuitId, circuits.circuitId))
    .where(eq(races.seasonYear, seasonYear))
    .orderBy(asc(races.round));
}

export async function getResultsPageData(seasonYear: number, round: number) {
  const { db } = getDatabase();

  const [race] = await db
    .select({
      raceId: races.raceId,
      seasonYear: races.seasonYear,
      round: races.round,
      slug: races.slug,
      grandPrix: races.name,
      circuit: circuits.name,
      date: races.date,
    })
    .from(races)
    .innerJoin(circuits, eq(races.circuitId, circuits.circuitId))
    .where(and(eq(races.seasonYear, seasonYear), eq(races.round, round)))
    .limit(1);

  if (!race) {
    return null;
  }

  const [raceRows, qualifyingRows, sprintRows] = await Promise.all([
    db
      .select({
        position: raceResults.position,
        driver: drivers.givenName,
        familyName: drivers.familyName,
        nationality: drivers.nationality,
        constructorId: constructors.constructorId,
        constructorName: constructors.name,
        points: raceResults.points,
        status: raceResults.status,
      })
      .from(raceResults)
      .innerJoin(drivers, eq(raceResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(raceResults.constructorId, constructors.constructorId))
      .where(eq(raceResults.raceId, race.raceId))
      .orderBy(asc(raceResults.position)),
    db
      .select({
        position: qualifyingResults.position,
        driver: drivers.givenName,
        familyName: drivers.familyName,
        nationality: drivers.nationality,
        constructorId: constructors.constructorId,
        constructorName: constructors.name,
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
        driver: drivers.givenName,
        familyName: drivers.familyName,
        nationality: drivers.nationality,
        constructorId: constructors.constructorId,
        constructorName: constructors.name,
        laps: sprintResults.laps,
        points: sprintResults.points,
        status: sprintResults.status,
      })
      .from(sprintResults)
      .innerJoin(drivers, eq(sprintResults.driverId, drivers.driverId))
      .innerJoin(constructors, eq(sprintResults.constructorId, constructors.constructorId))
      .where(eq(sprintResults.raceId, race.raceId))
      .orderBy(asc(sprintResults.position)),
  ]);

  const winner = raceRows.find((row) => row.position === 1);
  const pole = qualifyingRows.find((row) => row.position === 1);
  const podium = raceRows.filter((row) => row.position !== null && row.position <= 3);
  const sprintWinner = sprintRows.find((row) => row.position === 1);
  const sprintPodium = sprintRows.filter((row) => row.position !== null && row.position <= 3);

  return {
    seasonYear: race.seasonYear,
    round: race.round,
    slug: race.slug,
    grandPrix: race.grandPrix,
    circuit: race.circuit,
    date: race.date,
    sessions: {
      sprint: {
        summaryCards: [
          sprintWinner
            ? {
                label: "Sprint Winner",
                driver: `${sprintWinner.driver} ${sprintWinner.familyName}`,
                flag: getFlagEmoji(sprintWinner.nationality),
                team: sprintWinner.constructorName,
                value: `${formatPoints(Number(sprintWinner.points))} pts`,
              }
            : null,
          sprintPodium.length
            ? {
                label: "Sprint Podium",
                driver: sprintPodium.map((row) => `${row.driver} ${row.familyName}`).join(" / "),
                flag: getFlagEmoji(sprintPodium[0]?.nationality ?? ""),
                team: "Top 3 Finishers",
                value: sprintPodium.map((row) => `${formatPoints(Number(row.points))} pts`).join(" / "),
              }
            : null,
        ].filter(Boolean),
        rows: sprintRows.map((row) => ({
          position: row.position ? String(row.position) : "--",
          driver: `${row.driver} ${row.familyName}`,
          flag: getFlagEmoji(row.nationality),
          team: row.constructorName,
          teamColor: getConstructorTheme(row.constructorId, row.constructorName).teamColor,
          laps: row.laps !== null ? String(row.laps) : "--",
          timeOrGap: row.status,
          points: formatPoints(Number(row.points)),
          status: row.status,
        })),
      },
      race: {
        summaryCards: [
          winner
            ? {
                label: "Winner",
                driver: `${winner.driver} ${winner.familyName}`,
                flag: getFlagEmoji(winner.nationality),
                team: winner.constructorName,
                value: `${formatPoints(Number(winner.points))} pts`,
              }
            : null,
          podium.length
            ? {
                label: "Podium",
                driver: podium.map((row) => `${row.driver} ${row.familyName}`).join(" / "),
                flag: getFlagEmoji(podium[0]?.nationality ?? ""),
                team: "Top 3 Finishers",
                value: podium.map((row) => `${formatPoints(Number(row.points))} pts`).join(" / "),
              }
            : null,
        ].filter(Boolean),
        rows: raceRows.map((row) => ({
          position: row.position ? String(row.position) : "--",
          driver: `${row.driver} ${row.familyName}`,
          flag: getFlagEmoji(row.nationality),
          team: row.constructorName,
          teamColor: getConstructorTheme(row.constructorId, row.constructorName).teamColor,
          timeOrGap: row.status,
          points: formatPoints(Number(row.points)),
          status: row.status,
        })),
      },
      qualifying: {
        summaryCards: [
          pole
            ? {
                label: "Pole Position",
                driver: `${pole.driver} ${pole.familyName}`,
                flag: getFlagEmoji(pole.nationality),
                team: pole.constructorName,
                value: pole.q3 ?? pole.q2 ?? pole.q1 ?? "--",
              }
            : null,
        ].filter(Boolean),
        rows: qualifyingRows.map((row) => ({
          position: row.position ? String(row.position) : "--",
          driver: `${row.driver} ${row.familyName}`,
          flag: getFlagEmoji(row.nationality),
          team: row.constructorName,
          teamColor: getConstructorTheme(row.constructorId, row.constructorName).teamColor,
          timeOrGap: row.q3 ?? row.q2 ?? row.q1 ?? "--",
          status: "Qualified",
        })),
      },
    },
  };
}
