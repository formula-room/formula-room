type ErgastCircuit = {
  circuitId: string;
  circuitName: string;
  Location: {
    country: string;
    locality: string;
    lat?: string;
    long?: string;
  };
};

type ErgastConstructor = {
  constructorId: string;
  name: string;
  nationality: string;
};

type ErgastDriver = {
  driverId: string;
  code?: string;
  dateOfBirth?: string;
  givenName: string;
  familyName: string;
  nationality: string;
};

type ErgastRace = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: ErgastCircuit;
  FirstPractice?: ErgastSession;
  SecondPractice?: ErgastSession;
  ThirdPractice?: ErgastSession;
  Qualifying?: ErgastSession;
  Sprint?: ErgastSession;
  SprintQualifying?: ErgastSession;
  SprintShootout?: ErgastSession;
};

type ErgastSession = {
  date: string;
  time?: string;
};

type ErgastRaceResult = {
  position?: string;
  positionText: string;
  points: string;
  grid?: string;
  status: string;
  Driver: ErgastDriver;
  Constructor: ErgastConstructor;
};

type ErgastQualifyingResult = {
  position?: string;
  Q1?: string;
  Q2?: string;
  Q3?: string;
  Driver: ErgastDriver;
  Constructor: ErgastConstructor;
};

type ErgastSprintResult = {
  position?: string;
  positionText: string;
  points: string;
  grid?: string;
  laps?: string;
  status: string;
  Driver: ErgastDriver;
  Constructor: ErgastConstructor;
};

type ErgastRaceWithResults = ErgastRace & {
  Results: ErgastRaceResult[];
};

type ErgastRaceWithQualifying = ErgastRace & {
  QualifyingResults: ErgastQualifyingResult[];
};

type ErgastRaceWithSprint = ErgastRace & {
  SprintResults: ErgastSprintResult[];
};

type ErgastResponse<T> = {
  MRData?: {
    total?: string;
    RaceTable?: {
      Races?: T[];
    };
    StandingsTable?: {
      StandingsLists?: Array<{
        season: string;
        round: string;
        DriverStandings?: ErgastDriverStanding[];
        ConstructorStandings?: ErgastConstructorStanding[];
      }>;
    };
  };
};

type ErgastDriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: ErgastDriver;
  Constructors: ErgastConstructor[];
};

type ErgastConstructorStanding = {
  position: string;
  points: string;
  wins: string;
  Constructor: ErgastConstructor;
};

const DEFAULT_BASE_URL = "https://api.jolpi.ca/ergast/f1";
const MAX_RETRIES = 10;
const BASE_RETRY_DELAY_MS = 2_500;
const MIN_REQUEST_INTERVAL_MS = 350;
/** Jolpica returns at most this many result rows per request, whatever limit is asked for. */
const RESULTS_PAGE_SIZE = 100;
let lastRequestTimestamp = 0;

function getBaseUrl() {
  return (process.env.JOLPICA_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

function buildUrl(path: string, page?: { limit: number; offset: number }) {
  const url = new URL(`${getBaseUrl()}/${path.replace(/^\//, "")}`);
  url.searchParams.set("limit", String(page?.limit ?? 2000));
  if (page) {
    url.searchParams.set("offset", String(page.offset));
  }
  return url;
}

function sleep(ms: number) {
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

function getRetryDelayMs(response: Response, attempt: number) {
  const retryAfterHeader = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : Number.NaN;

  if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1_000;
  }

  return BASE_RETRY_DELAY_MS * (attempt + 1);
}

async function fetchErgastPayload<T>(path: string, page?: { limit: number; offset: number }) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    await throttleRequests();

    const response = await fetch(buildUrl(path, page), {
      headers: {
        accept: "application/json",
        "user-agent": "f1-dashboard-ingestion/1.0",
      },
      next: { revalidate: 0 },
    });

    if (response.ok) {
      return (await response.json()) as ErgastResponse<T>;
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

    throw new Error(`Jolpica request failed for ${path}: ${response.status}`);
  }

  return null;
}

async function fetchErgast<T>(path: string) {
  const payload = await fetchErgastPayload<T>(path);
  return payload?.MRData?.RaceTable?.Races ?? [];
}

async function fetchErgastStandings<T>(path: string, key: "DriverStandings" | "ConstructorStandings") {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    await throttleRequests();

    const response = await fetch(buildUrl(path), {
      headers: {
        accept: "application/json",
        "user-agent": "f1-dashboard-ingestion/1.0",
      },
      next: { revalidate: 0 },
    });

    if (response.ok) {
      const payload = (await response.json()) as ErgastResponse<never>;
      const standingsList = payload.MRData?.StandingsTable?.StandingsLists?.[0];
      return (standingsList?.[key] as T[] | undefined) ?? [];
    }

    if (response.status === 404) {
      return [];
    }

    const shouldRetry =
      response.status === 429 || (response.status >= 500 && response.status < 600);

    if (shouldRetry && attempt < MAX_RETRIES) {
      await sleep(getRetryDelayMs(response, attempt));
      continue;
    }

    throw new Error(`Jolpica request failed for ${path}: ${response.status}`);
  }

  return [];
}

export async function fetchSeasonSchedule(seasonYear: number) {
  return fetchErgast<ErgastRace>(`${seasonYear}.json`);
}

export async function fetchRaceResults(seasonYear: number, round: number) {
  return fetchErgast<ErgastRaceWithResults>(`${seasonYear}/${round}/results.json`);
}

/**
 * Laps completed per driver for one race, for use while rendering a page: one
 * request with a short timeout and no retries, so a slow API can't hold the page up.
 */
export async function fetchRaceLaps(seasonYear: number, round: number) {
  const response = await fetch(buildUrl(`${seasonYear}/${round}/results.json`), {
    headers: { accept: "application/json", "user-agent": "f1-dashboard/1.0" },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(3_000),
  });

  if (!response.ok) {
    throw new Error(`Jolpica laps request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ErgastResponse<{
    Results?: Array<{ laps?: string; Driver: { driverId: string } }>;
  }>;
  const results = payload.MRData?.RaceTable?.Races?.[0]?.Results ?? [];

  return new Map(results.flatMap((row) => (row.laps ? [[row.Driver.driverId, row.laps] as const] : [])));
}

export async function fetchQualifyingResults(seasonYear: number, round: number) {
  return fetchErgast<ErgastRaceWithQualifying>(`${seasonYear}/${round}/qualifying.json`);
}

export async function fetchSprintResults(seasonYear: number, round: number) {
  return fetchErgast<ErgastRaceWithSprint>(`${seasonYear}/${round}/sprint.json`);
}

/**
 * Every sprint result in a season. Pages are cut by result row, so one sprint can
 * span two pages and its rows are merged back together. Throws rather than return a partial season.
 */
export async function fetchSeasonSprintResults(seasonYear: number) {
  const path = `${seasonYear}/sprint.json`;
  const racesByRound = new Map<string, ErgastRaceWithSprint>();
  let offset = 0;
  let total = 0;

  do {
    const payload = await fetchErgastPayload<ErgastRaceWithSprint>(path, { limit: RESULTS_PAGE_SIZE, offset });
    const races = payload?.MRData?.RaceTable?.Races ?? [];
    let pageRows = 0;

    for (const race of races) {
      const existing = racesByRound.get(race.round);
      if (existing) {
        existing.SprintResults.push(...race.SprintResults);
      } else {
        racesByRound.set(race.round, { ...race, SprintResults: [...race.SprintResults] });
      }
      pageRows += race.SprintResults.length;
    }

    total = Number(payload?.MRData?.total ?? 0);
    if (pageRows === 0) {
      break;
    }
    offset += pageRows;
  } while (offset < total);

  if (offset < total) {
    throw new Error(`Jolpica returned ${offset} of ${total} sprint results for ${seasonYear}.`);
  }

  return Array.from(racesByRound.values());
}

export async function fetchDriverStandings(seasonYear: number) {
  return fetchErgastStandings<ErgastDriverStanding>(`${seasonYear}/driverStandings.json`, "DriverStandings");
}

export async function fetchConstructorStandings(seasonYear: number) {
  return fetchErgastStandings<ErgastConstructorStanding>(`${seasonYear}/constructorStandings.json`, "ConstructorStandings");
}

export type {
  ErgastCircuit,
  ErgastConstructorStanding,
  ErgastConstructor,
  ErgastDriver,
  ErgastDriverStanding,
  ErgastQualifyingResult,
  ErgastRace,
  ErgastRaceResult,
  ErgastRaceWithSprint,
  ErgastSprintResult,
};
