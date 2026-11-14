/**
 * Race-week helpers (no server or React dependencies, so they are easy to test).
 *
 * A race week starts at Monday 00:00 in the circuit's own time zone, in the week
 * that contains the race (by the circuit's local date). The homepage shows the
 * photograph of the most recent race whose week has started, so:
 *  - consecutive weekends: the photo switches on the Monday after a race;
 *  - a free weekend in between: the previous race's photo stays until the next
 *    race week begins.
 */

export type RaceWeekCandidate = {
  seasonYear: number;
  round: number;
  circuitId: string;
  /** Race start as an ISO UTC instant. */
  raceStartUtc: string;
  /** IANA time zone of the circuit. */
  timeZone: string;
};

type LocalDateParts = { year: number; month: number; day: number; weekday: number };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLocalParts(instant: number, timeZone: string): LocalDateParts & { hour: number; minute: number; second: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "0";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: WEEKDAYS.indexOf(get("weekday")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

/** Offset of `timeZone` from UTC at `instant`, in milliseconds. */
function getOffsetMs(instant: number, timeZone: string) {
  const local = getLocalParts(instant, timeZone);
  const asUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** UTC instant of 00:00 on the given local calendar day in `timeZone`. */
export function localMidnightToUtc(year: number, month: number, day: number, timeZone: string) {
  const wallClock = Date.UTC(year, month - 1, day);
  let instant = wallClock - getOffsetMs(wallClock, timeZone);
  // Re-check once in case a daylight-saving change sits between the guess and the answer.
  const corrected = wallClock - getOffsetMs(instant, timeZone);
  if (corrected !== instant) {
    instant = corrected;
  }
  return instant;
}

/** Calendar date (in the circuit's zone) of an instant. */
export function getLocalDate(instantUtc: string | number, timeZone: string): LocalDateParts {
  const instant = typeof instantUtc === "number" ? instantUtc : Date.parse(instantUtc);
  const { year, month, day, weekday } = getLocalParts(instant, timeZone);
  return { year, month, day, weekday };
}

/** Monday 00:00 (circuit time) of the race's week, as a UTC timestamp. */
export function getRaceWeekStartUtc(raceStartUtc: string, timeZone: string) {
  const local = getLocalDate(raceStartUtc, timeZone);
  const daysSinceMonday = (local.weekday + 6) % 7;
  const monday = new Date(Date.UTC(local.year, local.month - 1, local.day - daysSinceMonday));
  return localMidnightToUtc(monday.getUTCFullYear(), monday.getUTCMonth() + 1, monday.getUTCDate(), timeZone);
}

/** The race whose photograph belongs on the homepage at `now`, or null before any race week. */
export function selectRaceWeekRace<T extends RaceWeekCandidate>(races: T[], now: number = Date.now()): T | null {
  let selected: T | null = null;
  let selectedStart = -Infinity;

  for (const race of races) {
    if (Number.isNaN(Date.parse(race.raceStartUtc))) {
      continue;
    }
    const weekStart = getRaceWeekStartUtc(race.raceStartUtc, race.timeZone);
    if (weekStart <= now && weekStart >= selectedStart) {
      selected = race;
      selectedStart = weekStart;
    }
  }

  return selected;
}
