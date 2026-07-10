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
let lastRequestTimestamp = 0;

function getBaseUrl() {
  return (process.env.JOLPICA_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

function buildUrl(path: string) {
  const url = new URL(`${getBaseUrl()}/${path.replace(/^\//, "")}`);
  url.searchParams.set("limit", "2000");
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

async function fetchErgast<T>(path: string) {
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
      const payload = (await response.json()) as ErgastResponse<T>;
      return payload.MRData?.RaceTable?.Races ?? [];
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

export async function fetchQualifyingResults(seasonYear: number, round: number) {
  return fetchErgast<ErgastRaceWithQualifying>(`${seasonYear}/${round}/qualifying.json`);
}

export async function fetchSprintResults(seasonYear: number, round: number) {
  return fetchErgast<ErgastRaceWithSprint>(`${seasonYear}/${round}/sprint.json`);
}

export async function fetchSeasonSprintResults(seasonYear: number) {
  return fetchErgast<ErgastRaceWithSprint>(`${seasonYear}/sprint.json`);
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
