import "server-only";

import { resolveRaceFlagCountry } from "@/lib/f1/flag-country";
import { getCalendarBySeason } from "@/lib/server/queries/calendar";
import { getSeasonsList } from "@/lib/server/queries/seasons";

export type CalendarStatus = "Cancelled" | "Completed" | "Upcoming" | "This Weekend";

export type CalendarEventView = {
  round: string;
  grandPrix: string;
  country: string;
  flagCountry: string;
  circuit: string;
  date: string;
  status: CalendarStatus;
  href?: string;
  highlight?: boolean;
};

type CalendarEventWithContext = CalendarEventView & {
  actualRound: number | null;
  sortDate: string;
};

type SyntheticCalendarEvent = {
  grandPrix: string;
  country: string;
  circuit: string;
  raceDate: string;
};

type MergedCalendarEvent = Omit<CalendarEventView, "round" | "date"> & {
  sortDate: string;
};

const cancelledSeasonEvents: Record<number, SyntheticCalendarEvent[]> = {
  2020: [
    {
      grandPrix: "Australian Grand Prix",
      country: "Australia",
      circuit: "Albert Park Grand Prix Circuit",
      raceDate: "2020-03-15",
    },
    {
      grandPrix: "Vietnam Grand Prix",
      country: "Vietnam",
      circuit: "Hanoi Street Circuit",
      raceDate: "2020-04-05",
    },
    {
      grandPrix: "Chinese Grand Prix",
      country: "China",
      circuit: "Shanghai International Circuit",
      raceDate: "2020-04-19",
    },
    {
      grandPrix: "Dutch Grand Prix",
      country: "Netherlands",
      circuit: "Circuit Zandvoort",
      raceDate: "2020-05-03",
    },
    {
      grandPrix: "Monaco Grand Prix",
      country: "Monaco",
      circuit: "Circuit de Monaco",
      raceDate: "2020-05-24",
    },
    {
      grandPrix: "Azerbaijan Grand Prix",
      country: "Azerbaijan",
      circuit: "Baku City Circuit",
      raceDate: "2020-06-07",
    },
    {
      grandPrix: "Canadian Grand Prix",
      country: "Canada",
      circuit: "Circuit Gilles Villeneuve",
      raceDate: "2020-06-14",
    },
    {
      grandPrix: "French Grand Prix",
      country: "France",
      circuit: "Circuit Paul Ricard",
      raceDate: "2020-06-28",
    },
    {
      grandPrix: "Singapore Grand Prix",
      country: "Singapore",
      circuit: "Marina Bay Street Circuit",
      raceDate: "2020-09-20",
    },
    {
      grandPrix: "Japanese Grand Prix",
      country: "Japan",
      circuit: "Suzuka Circuit",
      raceDate: "2020-10-11",
    },
    {
      grandPrix: "United States Grand Prix",
      country: "United States",
      circuit: "Circuit of The Americas",
      raceDate: "2020-10-25",
    },
    {
      grandPrix: "Mexico City Grand Prix",
      country: "Mexico",
      circuit: "Autodromo Hermanos Rodriguez",
      raceDate: "2020-11-01",
    },
    {
      grandPrix: "Brazilian Grand Prix",
      country: "Brazil",
      circuit: "Autodromo Jose Carlos Pace",
      raceDate: "2020-11-15",
    },
  ],
};

function getWeekendWindow(value: string) {
  const raceDate = new Date(`${value}T00:00:00Z`);
  const weekendStart = new Date(raceDate);
  weekendStart.setUTCDate(weekendStart.getUTCDate() - 2);

  return {
    weekendStart,
    raceDate,
  };
}

function formatDisplayDateRange(value: string) {
  const { weekendStart, raceDate } = getWeekendWindow(value);
  const dayFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    timeZone: "UTC",
  });
  const monthFormatter = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: "UTC",
  });

  const startDay = dayFormatter.format(weekendStart);
  const endDay = dayFormatter.format(raceDate);
  const endMonth = monthFormatter.format(raceDate);

  return `${startDay} - ${endDay} ${endMonth}`;
}

export function deriveRaceStatus(dateValue: string): CalendarStatus {
  const today = new Date();
  const { weekendStart, raceDate } = getWeekendWindow(dateValue);
  const weekendEnd = new Date(raceDate);
  weekendEnd.setUTCDate(weekendEnd.getUTCDate() + 1);

  if (today > weekendEnd) {
    return "Completed";
  }

  if (today >= weekendStart && today <= weekendEnd) {
    return "This Weekend";
  }

  return "Upcoming";
}

export async function getCalendarPageData(seasonYear: number) {
  const [seasons, races] = await Promise.all([
    getSeasonsList(),
    getCalendarBySeason(seasonYear),
  ]);

  const cancelledEvents: MergedCalendarEvent[] = (cancelledSeasonEvents[seasonYear] ?? []).map((event) => ({
    grandPrix: event.grandPrix,
    country: event.country,
    flagCountry: resolveRaceFlagCountry(event.grandPrix, event.country),
    circuit: event.circuit,
    sortDate: event.raceDate,
    status: "Cancelled",
  }));

  const liveEvents: MergedCalendarEvent[] = races.map((race) => {
    const status = deriveRaceStatus(race.date);

    return {
      grandPrix: race.name,
      country: race.country,
      flagCountry: resolveRaceFlagCountry(race.name, race.country),
      circuit: race.circuitName,
      sortDate: race.date,
      status,
      href: `/event/${race.slug}?season=${race.seasonYear}&round=${race.round}`,
      highlight: status === "This Weekend",
    };
  });

  const contextualEvents: CalendarEventWithContext[] = [...cancelledEvents, ...liveEvents]
    .sort((left, right) => left.sortDate.localeCompare(right.sortDate))
    .map((event, index) => ({
      round: String(index + 1).padStart(2, "0"),
      grandPrix: event.grandPrix,
      country: event.country,
      flagCountry: event.flagCountry,
      circuit: event.circuit,
      date: formatDisplayDateRange(event.sortDate),
      status: event.status,
      href: event.href,
      highlight: event.highlight,
      actualRound: event.href ? Number.parseInt(event.href.split("round=")[1] ?? "", 10) || null : null,
      sortDate: event.sortDate,
    }));

  const featuredEvent =
    contextualEvents.find((event) => event.status === "This Weekend" && event.actualRound !== null) ??
    [...contextualEvents]
      .reverse()
      .find((event) => event.status === "Completed" && event.actualRound !== null) ??
    contextualEvents.find((event) => event.status === "Upcoming" && event.actualRound !== null) ??
    contextualEvents.find((event) => event.actualRound !== null) ??
    null;

  return {
    seasons: seasons.map((item) => String(item.year)),
    selectedRound: featuredEvent?.actualRound ? String(featuredEvent.actualRound) : "",
    featuredEventHref: featuredEvent?.href ?? null,
    events: contextualEvents.map((event) => {
      const eventView: CalendarEventView = {
        round: event.round,
        grandPrix: event.grandPrix,
        country: event.country,
        flagCountry: event.flagCountry,
        circuit: event.circuit,
        date: event.date,
        status: event.status,
        href: event.href,
        highlight: event.highlight,
      };

      return eventView;
    }),
  };
}
