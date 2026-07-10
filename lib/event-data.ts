export type EventStatus = "Upcoming" | "This Weekend" | "Completed";

export type EventSession = {
  day: string;
  session: string;
  localTime: string;
  yourTime: string;
  key: string;
};

export type ResultRow = {
  position: string;
  entry: string;
  team: string;
  value: string;
};

export type ResultTab = {
  key: string;
  label: string;
  rows: ResultRow[];
};

export type CircuitFact = {
  label: string;
  value: string;
};

export type EventWeekend = {
  slug: string;
  grandPrix: string;
  flag: string;
  circuit: string;
  country: string;
  city: string;
  round: string;
  dateRange: string;
  status: EventStatus;
  nextSession: string;
  schedule: EventSession[];
  results: ResultTab[];
  facts: CircuitFact[];
  records: CircuitFact[];
};

export const eventWeekends: EventWeekend[] = [
  {
    slug: "bahrain-grand-prix",
    grandPrix: "Bahrain Grand Prix",
    flag: "🇧🇭",
    circuit: "Bahrain International Circuit",
    country: "Bahrain",
    city: "Sakhir",
    round: "01",
    dateRange: "28 Feb - 02 Mar 2026",
    status: "Completed",
    nextSession: "Weekend complete",
    schedule: [
      { key: "fp1", day: "Fri", session: "Practice 1", localTime: "14:30", yourTime: "15:30" },
      { key: "fp2", day: "Fri", session: "Practice 2", localTime: "18:00", yourTime: "19:00" },
      { key: "fp3", day: "Sat", session: "Practice 3", localTime: "15:30", yourTime: "16:30" },
      { key: "quali", day: "Sat", session: "Qualifying", localTime: "19:00", yourTime: "20:00" },
      { key: "race", day: "Sun", session: "Race", localTime: "18:00", yourTime: "19:00" },
    ],
    results: [
      {
        key: "practice",
        label: "Practice",
        rows: [
          { position: "P1", entry: "Max Verstappen", team: "Red Bull Racing", value: "1:30.881" },
          { position: "P2", entry: "Charles Leclerc", team: "Ferrari", value: "+0.112" },
          { position: "P3", entry: "Lando Norris", team: "McLaren", value: "+0.244" },
        ],
      },
      {
        key: "qualifying",
        label: "Qualifying",
        rows: [
          { position: "P1", entry: "Max Verstappen", team: "Red Bull Racing", value: "1:29.401" },
          { position: "P2", entry: "Charles Leclerc", team: "Ferrari", value: "+0.086" },
          { position: "P3", entry: "George Russell", team: "Mercedes", value: "+0.191" },
        ],
      },
      {
        key: "race",
        label: "Race",
        rows: [
          { position: "P1", entry: "Max Verstappen", team: "Red Bull Racing", value: "25 pts" },
          { position: "P2", entry: "Charles Leclerc", team: "Ferrari", value: "18 pts" },
          { position: "P3", entry: "Lando Norris", team: "McLaren", value: "15 pts" },
        ],
      },
    ],
    facts: [
      { label: "Lap Length", value: "5.412 km" },
      { label: "Corners", value: "15" },
      { label: "Race Distance", value: "57 laps" },
      { label: "DRS Zones", value: "3" },
    ],
    records: [
      { label: "Lap Record", value: "1:31.447" },
      { label: "First Grand Prix", value: "2004" },
      { label: "Pole Benchmark", value: "1:29.179" },
      { label: "Pit Lane Loss", value: "22.5s" },
    ],
  },
  {
    slug: "saudi-arabian-grand-prix",
    grandPrix: "Saudi Arabian Grand Prix",
    flag: "🇸🇦",
    circuit: "Jeddah Corniche Circuit",
    country: "Saudi Arabia",
    city: "Jeddah",
    round: "02",
    dateRange: "07 - 09 Mar 2026",
    status: "Completed",
    nextSession: "Weekend complete",
    schedule: [
      { key: "fp1", day: "Fri", session: "Practice 1", localTime: "16:30", yourTime: "17:30" },
      { key: "fp2", day: "Fri", session: "Practice 2", localTime: "20:00", yourTime: "21:00" },
      { key: "fp3", day: "Sat", session: "Practice 3", localTime: "16:30", yourTime: "17:30" },
      { key: "quali", day: "Sat", session: "Qualifying", localTime: "20:00", yourTime: "21:00" },
      { key: "race", day: "Sun", session: "Race", localTime: "20:00", yourTime: "21:00" },
    ],
    results: [
      {
        key: "practice",
        label: "Practice",
        rows: [
          { position: "P1", entry: "Charles Leclerc", team: "Ferrari", value: "1:29.942" },
          { position: "P2", entry: "Max Verstappen", team: "Red Bull Racing", value: "+0.054" },
          { position: "P3", entry: "Lando Norris", team: "McLaren", value: "+0.196" },
        ],
      },
      {
        key: "qualifying",
        label: "Qualifying",
        rows: [
          { position: "P1", entry: "Charles Leclerc", team: "Ferrari", value: "1:28.987" },
          { position: "P2", entry: "Max Verstappen", team: "Red Bull Racing", value: "+0.071" },
          { position: "P3", entry: "George Russell", team: "Mercedes", value: "+0.229" },
        ],
      },
      {
        key: "race",
        label: "Race",
        rows: [
          { position: "P1", entry: "Max Verstappen", team: "Red Bull Racing", value: "25 pts" },
          { position: "P2", entry: "Charles Leclerc", team: "Ferrari", value: "18 pts" },
          { position: "P3", entry: "Lando Norris", team: "McLaren", value: "15 pts" },
        ],
      },
    ],
    facts: [
      { label: "Lap Length", value: "6.174 km" },
      { label: "Corners", value: "27" },
      { label: "Race Distance", value: "50 laps" },
      { label: "DRS Zones", value: "3" },
    ],
    records: [
      { label: "Lap Record", value: "1:30.734" },
      { label: "First Grand Prix", value: "2021" },
      { label: "Average Speed", value: "252 km/h" },
      { label: "Pit Lane Loss", value: "18.9s" },
    ],
  },
  {
    slug: "australian-grand-prix",
    grandPrix: "Australian Grand Prix",
    flag: "🇦🇺",
    circuit: "Albert Park Circuit",
    country: "Australia",
    city: "Melbourne",
    round: "03",
    dateRange: "14 - 16 Mar 2026",
    status: "This Weekend",
    nextSession: "Practice 1 · Fri 11:30 local",
    schedule: [
      { key: "fp1", day: "Fri", session: "Practice 1", localTime: "11:30", yourTime: "04:30" },
      { key: "fp2", day: "Fri", session: "Practice 2", localTime: "15:00", yourTime: "08:00" },
      { key: "fp3", day: "Sat", session: "Practice 3", localTime: "11:30", yourTime: "04:30" },
      { key: "quali", day: "Sat", session: "Qualifying", localTime: "15:00", yourTime: "08:00" },
      { key: "race", day: "Sun", session: "Race", localTime: "14:00", yourTime: "07:00" },
    ],
    results: [
      {
        key: "practice",
        label: "Practice",
        rows: [
          { position: "P1", entry: "TBD", team: "Session pending", value: "--" },
          { position: "P2", entry: "TBD", team: "Session pending", value: "--" },
          { position: "P3", entry: "TBD", team: "Session pending", value: "--" },
        ],
      },
      {
        key: "qualifying",
        label: "Qualifying",
        rows: [
          { position: "P1", entry: "TBD", team: "Session pending", value: "--" },
          { position: "P2", entry: "TBD", team: "Session pending", value: "--" },
          { position: "P3", entry: "TBD", team: "Session pending", value: "--" },
        ],
      },
      {
        key: "race",
        label: "Race",
        rows: [
          { position: "P1", entry: "TBD", team: "Race pending", value: "--" },
          { position: "P2", entry: "TBD", team: "Race pending", value: "--" },
          { position: "P3", entry: "TBD", team: "Race pending", value: "--" },
        ],
      },
    ],
    facts: [
      { label: "Lap Length", value: "5.278 km" },
      { label: "Corners", value: "14" },
      { label: "Race Distance", value: "58 laps" },
      { label: "DRS Zones", value: "4" },
    ],
    records: [
      { label: "Lap Record", value: "1:19.813" },
      { label: "First Grand Prix", value: "1996" },
      { label: "Pole Benchmark", value: "1:15.915" },
      { label: "Pit Lane Loss", value: "21.4s" },
    ],
  },
  {
    slug: "japanese-grand-prix",
    grandPrix: "Japanese Grand Prix",
    flag: "🇯🇵",
    circuit: "Suzuka Circuit",
    country: "Japan",
    city: "Suzuka",
    round: "04",
    dateRange: "28 - 30 Mar 2026",
    status: "Upcoming",
    nextSession: "Practice 1 · Fri 11:30 local",
    schedule: [
      { key: "fp1", day: "Fri", session: "Practice 1", localTime: "11:30", yourTime: "06:30" },
      { key: "fp2", day: "Fri", session: "Practice 2", localTime: "15:00", yourTime: "10:00" },
      { key: "fp3", day: "Sat", session: "Practice 3", localTime: "11:30", yourTime: "06:30" },
      { key: "quali", day: "Sat", session: "Qualifying", localTime: "15:00", yourTime: "10:00" },
      { key: "race", day: "Sun", session: "Race", localTime: "14:00", yourTime: "09:00" },
    ],
    results: [
      {
        key: "practice",
        label: "Practice",
        rows: [
          { position: "P1", entry: "TBD", team: "Session pending", value: "--" },
          { position: "P2", entry: "TBD", team: "Session pending", value: "--" },
          { position: "P3", entry: "TBD", team: "Session pending", value: "--" },
        ],
      },
      {
        key: "qualifying",
        label: "Qualifying",
        rows: [
          { position: "P1", entry: "TBD", team: "Session pending", value: "--" },
          { position: "P2", entry: "TBD", team: "Session pending", value: "--" },
          { position: "P3", entry: "TBD", team: "Session pending", value: "--" },
        ],
      },
      {
        key: "race",
        label: "Race",
        rows: [
          { position: "P1", entry: "TBD", team: "Race pending", value: "--" },
          { position: "P2", entry: "TBD", team: "Race pending", value: "--" },
          { position: "P3", entry: "TBD", team: "Race pending", value: "--" },
        ],
      },
    ],
    facts: [
      { label: "Lap Length", value: "5.807 km" },
      { label: "Corners", value: "18" },
      { label: "Race Distance", value: "53 laps" },
      { label: "DRS Zones", value: "1" },
    ],
    records: [
      { label: "Lap Record", value: "1:30.983" },
      { label: "First Grand Prix", value: "1987" },
      { label: "Sector One Focus", value: "High-speed change of direction" },
      { label: "Pit Lane Loss", value: "20.1s" },
    ],
  },
];

export function getEventWeekend(slug: string): EventWeekend {
  return eventWeekends.find((event) => event.slug === slug) ?? eventWeekends[2];
}
