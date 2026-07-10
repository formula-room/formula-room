import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: ".env.local" });
dotenv.config();

const DEFAULT_BASE_URL = "https://api.jolpi.ca/ergast/f1";
const MAX_RETRIES = 20;
const BASE_RETRY_DELAY_MS = 10000;
const MIN_REQUEST_INTERVAL_MS = 1000;
const QUALIFYING_COVERAGE_START_YEAR = 1994;
const CONSTRUCTOR_STANDINGS_START_YEAR = 1958;
const SPRINT_START_YEAR = 2021;

let lastRequestTimestamp = 0;

function parseYear(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function getBaseUrl() {
  return (process.env.JOLPICA_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

function buildUrl(resourcePath) {
  const url = new URL(`${getBaseUrl()}/${resourcePath.replace(/^\//, "")}`);
  url.searchParams.set("limit", "2000");
  return url;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttleRequests() {
  const now = Date.now();
  const elapsed = now - lastRequestTimestamp;

  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
  }

  lastRequestTimestamp = Date.now();
}

function getRetryDelayMs(response, attempt) {
  const retryAfterHeader = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : Number.NaN;

  if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  return BASE_RETRY_DELAY_MS * (attempt + 1);
}

async function fetchJson(resourcePath) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    let response;

    try {
      await throttleRequests();

      response = await fetch(buildUrl(resourcePath), {
        headers: {
          accept: "application/json",
          "user-agent": "f1-dashboard-historical-ingestion/1.0",
        },
      });
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        await sleep(BASE_RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      throw error;
    }

    if (response.ok) {
      return response.json();
    }

    if (response.status === 404) {
      return null;
    }

    const shouldRetry =
      response.status === 429 || (response.status >= 500 && response.status < 600);

    if (shouldRetry && attempt < MAX_RETRIES) {
      await sleep(getRetryDelayMs(response, attempt));
      continue;
    }

    throw new Error(`Jolpica request failed for ${resourcePath}: ${response.status}`);
  }

  return null;
}

function parseInteger(value) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseFloatValue(value) {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasStartedRace(grid, status) {
  const nonStarterStatuses = new Set([
    "Did not qualify",
    "Withdrawn",
    "Did not prequalify",
    "Did not start",
  ]);

  if (status && nonStarterStatuses.has(status)) {
    return false;
  }

  const parsedGrid = parseInteger(grid);
  return parsedGrid !== null && parsedGrid > 0;
}

function getRaceResultSortKey(row) {
  const position = parseInteger(row.position);
  return {
    position: position ?? Number.POSITIVE_INFINITY,
    points: Number.parseFloat(row.points) || 0,
    started: hasStartedRace(row.grid, row.status) ? 1 : 0,
  };
}

function normalizeRaceResults(results) {
  const byDriver = new Map();

  for (const row of results) {
    const existing = byDriver.get(row.Driver.driverId);

    if (!existing) {
      byDriver.set(row.Driver.driverId, row);
      continue;
    }

    const current = getRaceResultSortKey(row);
    const previous = getRaceResultSortKey(existing);
    const shouldReplace =
      current.position < previous.position ||
      (current.position === previous.position && current.points > previous.points) ||
      (current.position === previous.position && current.points === previous.points && current.started > previous.started);

    if (shouldReplace) {
      byDriver.set(row.Driver.driverId, {
        ...row,
        points: String(current.points + previous.points),
      });
    } else {
      byDriver.set(row.Driver.driverId, {
        ...existing,
        points: String(current.points + previous.points),
      });
    }
  }

  return Array.from(byDriver.values());
}

function normalizeQualifyingResults(results) {
  const byDriver = new Map();

  for (const row of results) {
    const existing = byDriver.get(row.Driver.driverId);
    if (!existing) {
      byDriver.set(row.Driver.driverId, row);
      continue;
    }

    const currentPosition = parseInteger(row.position) ?? Number.POSITIVE_INFINITY;
    const previousPosition = parseInteger(existing.position) ?? Number.POSITIVE_INFINITY;

    if (currentPosition < previousPosition) {
      byDriver.set(row.Driver.driverId, row);
    }
  }

  return Array.from(byDriver.values());
}

function normalizeSprintResults(results) {
  return normalizeRaceResults(results);
}

function normalizeRaceSessions(race) {
  const candidates = [
    {
      sessionKey: "fp1",
      name: "Practice 1",
      date: race.FirstPractice?.date,
      time: race.FirstPractice?.time,
      defaultOrder: 10,
    },
    {
      sessionKey: "fp2",
      name: "Practice 2",
      date: race.SecondPractice?.date,
      time: race.SecondPractice?.time,
      defaultOrder: 20,
    },
    {
      sessionKey: "fp3",
      name: "Practice 3",
      date: race.ThirdPractice?.date,
      time: race.ThirdPractice?.time,
      defaultOrder: 30,
    },
    {
      sessionKey: "sprint-qualifying",
      name: "Sprint Qualifying",
      date: race.SprintQualifying?.date ?? race.SprintShootout?.date,
      time: race.SprintQualifying?.time ?? race.SprintShootout?.time,
      defaultOrder: 35,
    },
    {
      sessionKey: "sprint",
      name: "Sprint",
      date: race.Sprint?.date,
      time: race.Sprint?.time,
      defaultOrder: 40,
    },
    {
      sessionKey: "qualifying",
      name: "Qualifying",
      date: race.Qualifying?.date,
      time: race.Qualifying?.time,
      defaultOrder: 50,
    },
    {
      sessionKey: "race",
      name: "Race",
      date: race.date,
      time: race.time,
      defaultOrder: 60,
    },
  ]
    .filter((session) => Boolean(session.date))
    .sort((a, b) => {
      const aTimestamp = `${a.date}T${a.time ?? "23:59:59Z"}`;
      const bTimestamp = `${b.date}T${b.time ?? "23:59:59Z"}`;
      const byDate = aTimestamp.localeCompare(bTimestamp);
      return byDate === 0 ? a.defaultOrder - b.defaultOrder : byDate;
    });

  return candidates.map((session, index) => ({
    sessionKey: session.sessionKey,
    name: session.name,
    date: session.date,
    time: session.time ?? null,
    sortOrder: index + 1,
  }));
}

async function upsertSeason(sql, year) {
  await sql`
    insert into seasons (year, updated_at)
    values (${year}, now())
    on conflict (year) do update
      set updated_at = now()
  `;
}

async function upsertCircuit(sql, circuit) {
  await sql`
    insert into circuits (circuit_id, name, country, locality, lat, lng, updated_at)
    values (
      ${circuit.circuitId},
      ${circuit.circuitName},
      ${circuit.Location.country},
      ${circuit.Location.locality},
      ${parseFloatValue(circuit.Location.lat)},
      ${parseFloatValue(circuit.Location.long)},
      now()
    )
    on conflict (circuit_id) do update
      set name = excluded.name,
          country = excluded.country,
          locality = excluded.locality,
          lat = excluded.lat,
          lng = excluded.lng,
          updated_at = now()
  `;
}

async function upsertDriver(sql, driver) {
  await sql`
    insert into drivers (driver_id, given_name, family_name, code, nationality, dob, updated_at)
    values (
      ${driver.driverId},
      ${driver.givenName},
      ${driver.familyName},
      ${driver.code ?? null},
      ${driver.nationality},
      ${driver.dateOfBirth ?? null},
      now()
    )
    on conflict (driver_id) do update
      set given_name = excluded.given_name,
          family_name = excluded.family_name,
          code = excluded.code,
          nationality = excluded.nationality,
          dob = excluded.dob,
          updated_at = now()
  `;
}

async function upsertConstructor(sql, constructor) {
  await sql`
    insert into constructors (constructor_id, name, nationality, updated_at)
    values (
      ${constructor.constructorId},
      ${constructor.name},
      ${constructor.nationality},
      now()
    )
    on conflict (constructor_id) do update
      set name = excluded.name,
          nationality = excluded.nationality,
          updated_at = now()
  `;
}

async function upsertRace(sql, seasonYear, round, name, dateValue, circuitId) {
  const rows = await sql`
    insert into races (season_year, round, name, slug, date, circuit_id, updated_at)
    values (
      ${seasonYear},
      ${round},
      ${name},
      ${toSlug(name)},
      ${dateValue},
      ${circuitId},
      now()
    )
    on conflict (season_year, round) do update
      set name = excluded.name,
          slug = excluded.slug,
          date = excluded.date,
          circuit_id = excluded.circuit_id,
          updated_at = now()
    returning race_id
  `;

  return rows[0].race_id;
}

async function replaceRaceSessions(sql, raceId, race) {
  const sessions = normalizeRaceSessions(race);

  await sql`delete from race_sessions where race_id = ${raceId}`;

  for (const session of sessions) {
    await sql`
      insert into race_sessions (
        race_id,
        session_key,
        name,
        date,
        time,
        sort_order,
        updated_at
      )
      values (
        ${raceId},
        ${session.sessionKey},
        ${session.name},
        ${session.date},
        ${session.time},
        ${session.sortOrder},
        now()
      )
    `;
  }
}

async function upsertRaceResult(sql, raceId, row) {
  await upsertDriver(sql, row.Driver);
  await upsertConstructor(sql, row.Constructor);

  await sql`
    insert into race_results (
      race_id,
      driver_id,
      constructor_id,
      position,
      position_text,
      grid,
      status,
      points,
      started,
      updated_at
    )
    values (
      ${raceId},
      ${row.Driver.driverId},
      ${row.Constructor.constructorId},
      ${parseInteger(row.position)},
      ${row.positionText},
      ${parseInteger(row.grid)},
      ${row.status},
      ${row.points},
      ${hasStartedRace(row.grid, row.status)},
      now()
    )
    on conflict (race_id, driver_id) do update
      set constructor_id = excluded.constructor_id,
          position = excluded.position,
          position_text = excluded.position_text,
          grid = excluded.grid,
          status = excluded.status,
          points = excluded.points,
          started = excluded.started,
          updated_at = now()
  `;
}

async function upsertQualifyingResult(sql, raceId, row) {
  await upsertDriver(sql, row.Driver);
  await upsertConstructor(sql, row.Constructor);

  await sql`
    insert into qualifying_results (
      race_id,
      driver_id,
      constructor_id,
      position,
      q1,
      q2,
      q3,
      updated_at
    )
    values (
      ${raceId},
      ${row.Driver.driverId},
      ${row.Constructor.constructorId},
      ${parseInteger(row.position)},
      ${row.Q1 ?? null},
      ${row.Q2 ?? null},
      ${row.Q3 ?? null},
      now()
    )
    on conflict (race_id, driver_id) do update
      set constructor_id = excluded.constructor_id,
          position = excluded.position,
          q1 = excluded.q1,
          q2 = excluded.q2,
          q3 = excluded.q3,
          updated_at = now()
  `;
}

async function upsertSprintResult(sql, raceId, row) {
  await upsertDriver(sql, row.Driver);
  await upsertConstructor(sql, row.Constructor);

  await sql`
    insert into sprint_results (
      race_id,
      driver_id,
      constructor_id,
      position,
      position_text,
      grid,
      laps,
      status,
      points,
      started,
      updated_at
    )
    values (
      ${raceId},
      ${row.Driver.driverId},
      ${row.Constructor.constructorId},
      ${parseInteger(row.position)},
      ${row.positionText},
      ${parseInteger(row.grid)},
      ${parseInteger(row.laps)},
      ${row.status},
      ${row.points},
      ${hasStartedRace(row.grid, row.status)},
      now()
    )
    on conflict (race_id, driver_id) do update
      set constructor_id = excluded.constructor_id,
          position = excluded.position,
          position_text = excluded.position_text,
          grid = excluded.grid,
          laps = excluded.laps,
          status = excluded.status,
          points = excluded.points,
          started = excluded.started,
          updated_at = now()
  `;
}

async function upsertDriverSeasonStanding(sql, seasonYear, standing) {
  await upsertDriver(sql, standing.Driver);

  await sql`
    insert into driver_season_standings (
      season_year,
      driver_id,
      position,
      points,
      wins,
      updated_at
    )
    values (
      ${seasonYear},
      ${standing.Driver.driverId},
      ${parseInteger(standing.position) ?? 0},
      ${standing.points},
      ${parseInteger(standing.wins) ?? 0},
      now()
    )
    on conflict (season_year, driver_id) do update
      set position = excluded.position,
          points = excluded.points,
          wins = excluded.wins,
          updated_at = now()
  `;
}

async function upsertConstructorSeasonStanding(sql, seasonYear, standing) {
  await upsertConstructor(sql, standing.Constructor);

  await sql`
    insert into constructor_season_standings (
      season_year,
      constructor_id,
      position,
      points,
      wins,
      updated_at
    )
    values (
      ${seasonYear},
      ${standing.Constructor.constructorId},
      ${parseInteger(standing.position) ?? 0},
      ${standing.points},
      ${parseInteger(standing.wins) ?? 0},
      now()
    )
    on conflict (season_year, constructor_id) do update
      set position = excluded.position,
          points = excluded.points,
          wins = excluded.wins,
          updated_at = now()
  `;
}

async function fetchSchedule(seasonYear) {
  const payload = await fetchJson(`${seasonYear}.json`);
  return payload?.MRData?.RaceTable?.Races ?? [];
}

async function fetchRaceResults(seasonYear, round) {
  const payload = await fetchJson(`${seasonYear}/${round}/results.json`);
  return payload?.MRData?.RaceTable?.Races ?? [];
}

async function fetchQualifyingResults(seasonYear, round) {
  const payload = await fetchJson(`${seasonYear}/${round}/qualifying.json`);
  return payload?.MRData?.RaceTable?.Races ?? [];
}

async function fetchDriverStandings(seasonYear) {
  const payload = await fetchJson(`${seasonYear}/driverStandings.json`);
  return payload?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
}

async function fetchConstructorStandings(seasonYear) {
  const payload = await fetchJson(`${seasonYear}/constructorStandings.json`);
  return payload?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
}

async function fetchSeasonSprintResults(seasonYear) {
  const payload = await fetchJson(`${seasonYear}/sprint.json`);
  return payload?.MRData?.RaceTable?.Races ?? [];
}

async function getExistingCoverage(sql) {
  const seasonRows = await sql`
    select
      s.year,
      (
        select count(*)::int
        from races r
        where r.season_year = s.year
      ) as race_count,
      (
        select count(*)::int
        from races r
        where r.season_year = s.year
          and r.date < current_date
      ) as completed_race_count,
      (
        select count(*)::int
        from race_results rr
        inner join races r on r.race_id = rr.race_id
        where r.season_year = s.year
      ) as race_result_count,
      (
        select count(distinct rr.race_id)::int
        from race_results rr
        inner join races r on r.race_id = rr.race_id
        where r.season_year = s.year
          and r.date < current_date
      ) as completed_result_race_count,
      (
        select count(*)::int
        from qualifying_results qr
        inner join races r on r.race_id = qr.race_id
        where r.season_year = s.year
      ) as qualifying_result_count,
      (
        select count(*)::int
        from sprint_results sr
        inner join races r on r.race_id = sr.race_id
        where r.season_year = s.year
      ) as sprint_result_count,
      (
        select count(distinct sr.race_id)::int
        from sprint_results sr
        inner join races r on r.race_id = sr.race_id
        where r.season_year = s.year
      ) as sprint_race_count,
      (
        select count(distinct rs.race_id)::int
        from race_sessions rs
        inner join races r on r.race_id = rs.race_id
        where r.season_year = s.year
      ) as scheduled_race_count,
      (
        select count(*)::int
        from driver_season_standings dss
        where dss.season_year = s.year
      ) as driver_standing_count,
      (
        select count(*)::int
        from constructor_season_standings css
        where css.season_year = s.year
      ) as constructor_standing_count
    from seasons s
    order by s.year
  `;

  return new Map(seasonRows.map((row) => [row.year, row]));
}

async function main() {
  const currentYear = new Date().getUTCFullYear();
  const startYear = parseYear(process.env.F1_INGEST_START_YEAR, 1950);
  const endYear = parseYear(process.env.F1_INGEST_END_YEAR, currentYear);

  if (startYear > endYear) {
    throw new Error("F1_INGEST_START_YEAR cannot be greater than F1_INGEST_END_YEAR.");
  }

  const sql = postgres(process.env.DATABASE_URL, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    const existingCoverage = await getExistingCoverage(sql);
    const report = [];

    for (let seasonYear = startYear; seasonYear <= endYear; seasonYear += 1) {
      const schedule = await fetchSchedule(seasonYear);

      if (schedule.length === 0) {
        report.push({
          year: seasonYear,
          ingested: false,
          reason: "No season schedule returned by source API.",
          races: 0,
          raceResults: 0,
          qualifyingResults: 0,
          sprintResults: 0,
          driverStandings: 0,
          constructorStandings: 0,
        });
        continue;
      }

      const existing = existingCoverage.get(seasonYear);
      const expectedCompletedSeason = seasonYear < currentYear;
      const needsRaceIngest =
        !existing ||
        existing.race_count !== schedule.length ||
        existing.scheduled_race_count < schedule.length ||
        existing.race_result_count === 0 ||
        existing.completed_result_race_count < existing.completed_race_count;
      const needsDriverStandings =
        !existing ||
        existing.driver_standing_count === 0 ||
        seasonYear >= currentYear;
      const needsConstructorStandings =
        !existing ||
        (
          seasonYear >= CONSTRUCTOR_STANDINGS_START_YEAR &&
          (
            existing.constructor_standing_count === 0 ||
            seasonYear >= currentYear
          )
        );

      await upsertSeason(sql, seasonYear);

      let raceResultCount = existing?.race_result_count ?? 0;
      let qualifyingResultCount = existing?.qualifying_result_count ?? 0;
      let sprintResultCount = existing?.sprint_result_count ?? 0;
      let seasonHasQualifying = qualifyingResultCount > 0 || seasonYear >= QUALIFYING_COVERAGE_START_YEAR;
      let seasonHasSprint = false;
      const seasonSprintRaces = seasonYear >= SPRINT_START_YEAR ? await fetchSeasonSprintResults(seasonYear) : [];
      const sprintRaceByRound = new Map();
      let firstRaceQualifyingRows = null;

      for (const sprintRace of seasonSprintRaces) {
        const sprintRound = Number.parseInt(sprintRace.round, 10);
        if (Number.isNaN(sprintRound)) {
          continue;
        }

        const normalizedSprintRows = normalizeSprintResults(sprintRace.SprintResults ?? []);
        if (normalizedSprintRows.length > 0) {
          seasonHasSprint = true;
          sprintRaceByRound.set(sprintRound, normalizedSprintRows);
        }
      }

      if (seasonHasQualifying && schedule.length > 0) {
        const firstRound = Number.parseInt(schedule[0].round, 10);
        const firstRoundQualifying = await fetchQualifyingResults(seasonYear, firstRound);
        firstRaceQualifyingRows = normalizeQualifyingResults(firstRoundQualifying[0]?.QualifyingResults ?? []);
        seasonHasQualifying = firstRaceQualifyingRows.length > 0;
      }

      const needsQualifyingIngest =
        seasonHasQualifying &&
        (
          qualifyingResultCount === 0 ||
          (expectedCompletedSeason && qualifyingResultCount < schedule.length * 10)
        );

      const needsSprintIngest =
        seasonHasSprint &&
        (
          !existing ||
          existing.sprint_result_count === 0 ||
          existing.sprint_race_count < sprintRaceByRound.size
        );

      const seasonLooksComplete =
        existing &&
        existing.race_count === schedule.length &&
        existing.scheduled_race_count >= schedule.length &&
        existing.race_result_count > 0 &&
        existing.completed_result_race_count >= existing.completed_race_count &&
        existing.driver_standing_count > 0 &&
        (seasonYear < CONSTRUCTOR_STANDINGS_START_YEAR || existing.constructor_standing_count > 0) &&
        seasonYear < currentYear &&
        (!seasonHasQualifying || (!needsQualifyingIngest && existing.qualifying_result_count > 0)) &&
        (!seasonHasSprint || !needsSprintIngest);

      if (seasonLooksComplete) {
        report.push({
          year: seasonYear,
          ingested: true,
          reason: "Already complete for current schema coverage.",
          races: existing.race_count,
          scheduledRaces: existing.scheduled_race_count,
          raceResults: existing.race_result_count,
          qualifyingResults: existing.qualifying_result_count,
          sprintResults: existing.sprint_result_count,
          driverStandings: existing.driver_standing_count,
          constructorStandings: existing.constructor_standing_count,
        });
        continue;
      }

      if (needsRaceIngest || needsQualifyingIngest || needsSprintIngest) {
        raceResultCount = 0;
        qualifyingResultCount = seasonHasQualifying ? 0 : qualifyingResultCount;
        sprintResultCount = seasonHasSprint ? 0 : sprintResultCount;

        for (const race of schedule) {
          const round = Number.parseInt(race.round, 10);
          const firstRound = Number.parseInt(schedule[0].round, 10);

          await upsertCircuit(sql, race.Circuit);
          const raceId = await upsertRace(sql, seasonYear, round, race.raceName, race.date, race.Circuit.circuitId);
          await replaceRaceSessions(sql, raceId, race);

          const resultRaces = await fetchRaceResults(seasonYear, round);
          const qualifyingRaces =
            seasonHasQualifying && !(round === firstRound && firstRaceQualifyingRows !== null)
              ? await fetchQualifyingResults(seasonYear, round)
              : null;
          const normalizedRaceResults = normalizeRaceResults(resultRaces[0]?.Results ?? []);
          const normalizedQualifyingResults =
            round === firstRound && firstRaceQualifyingRows !== null
              ? firstRaceQualifyingRows
              : normalizeQualifyingResults(qualifyingRaces?.[0]?.QualifyingResults ?? []);
          const normalizedSprintResults = sprintRaceByRound.get(round) ?? [];

          for (const row of normalizedRaceResults) {
            await upsertRaceResult(sql, raceId, row);
          }

          if (seasonHasQualifying) {
            for (const row of normalizedQualifyingResults) {
              await upsertQualifyingResult(sql, raceId, row);
            }
          }

          if (seasonHasSprint) {
            for (const row of normalizedSprintResults) {
              await upsertSprintResult(sql, raceId, row);
            }
          }

          raceResultCount += normalizedRaceResults.length;
          if (seasonHasQualifying) {
            qualifyingResultCount += normalizedQualifyingResults.length;
          }
          if (seasonHasSprint) {
            sprintResultCount += normalizedSprintResults.length;
          }
        }
      }

      let driverStandingCount = existing?.driver_standing_count ?? 0;
      if (needsDriverStandings) {
        const driverStandings = await fetchDriverStandings(seasonYear);
        driverStandingCount = 0;

        for (const standing of driverStandings) {
          await upsertDriverSeasonStanding(sql, seasonYear, standing);
          driverStandingCount += 1;
        }
      }

      let constructorStandingCount = existing?.constructor_standing_count ?? 0;
      if (needsConstructorStandings) {
        const constructorStandings = await fetchConstructorStandings(seasonYear);
        constructorStandingCount = 0;

        for (const standing of constructorStandings) {
          await upsertConstructorSeasonStanding(sql, seasonYear, standing);
          constructorStandingCount += 1;
        }
      }

      report.push({
        year: seasonYear,
        ingested: true,
        reason:
          needsRaceIngest || needsQualifyingIngest || needsDriverStandings || needsConstructorStandings
            ? "Updated from source API."
            : "Already complete for current schema coverage.",
        races: schedule.length,
        raceResults: raceResultCount,
        qualifyingResults: qualifyingResultCount,
        sprintResults: sprintResultCount,
        driverStandings: driverStandingCount,
        constructorStandings: constructorStandingCount,
      });
    }

    const finalCoverage = await getExistingCoverage(sql);
    const coverageRows = Array.from(finalCoverage.values()).sort((left, right) => left.year - right.year);
    const output = {
      requestedRange: { startYear, endYear },
      ingestedYears: report.filter((row) => row.ingested).map((row) => row.year),
      skippedYears: report.filter((row) => !row.ingested).map((row) => row.year),
      report,
      finalCoverage: coverageRows,
    };

    const outputPath = path.join(process.cwd(), "historical-ingest-report.json");
    fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
    console.log(JSON.stringify(output, null, 2));
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
