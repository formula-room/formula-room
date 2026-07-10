export type ResultsSeason = "2026" | "2025" | "2024";
export type ResultsSessionType = "Race" | "Qualifying" | "Sprint" | "Practice";

export type ResultsSummaryCard = {
  label: string;
  driver: string;
  flag: string;
  team: string;
  value: string;
};

export type ResultsRow = {
  position: string;
  driver: string;
  flag: string;
  team: string;
  teamColor: string;
  laps?: string;
  timeOrGap: string;
  points?: string;
  status: string;
};

export type ResultsSession = {
  type: ResultsSessionType;
  date: string;
  summaryCards: ResultsSummaryCard[];
  rows: ResultsRow[];
};

export type ResultsEvent = {
  slug: string;
  grandPrix: string;
  circuit: string;
  dateRange: string;
  season: ResultsSeason;
  sessions: ResultsSession[];
};

export const resultsSeasons: ResultsSeason[] = ["2026", "2025", "2024"];

export const resultsEvents: ResultsEvent[] = [
  {
    slug: "bahrain-grand-prix",
    grandPrix: "Bahrain Grand Prix",
    circuit: "Bahrain International Circuit",
    dateRange: "28 Feb - 02 Mar 2026",
    season: "2026",
    sessions: [
      {
        type: "Race",
        date: "02 Mar 2026",
        summaryCards: [
          { label: "Winner", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", value: "1:31:44.742" },
          { label: "Pole Position", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", value: "1:29.401" },
          { label: "Fastest Lap", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", value: "1:31.447" },
          { label: "Podium", driver: "Verstappen / Leclerc / Norris", flag: "🏁", team: "Top 3 Finishers", value: "25 / 18 / 15" },
        ],
        rows: [
          { position: "1", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", teamColor: "#3671c6", laps: "57", timeOrGap: "1:31:44.742", points: "25", status: "Finished" },
          { position: "2", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", teamColor: "#dc0000", laps: "57", timeOrGap: "+3.882", points: "18", status: "Finished" },
          { position: "3", driver: "Lando Norris", flag: "🇬🇧", team: "McLaren", teamColor: "#ff8700", laps: "57", timeOrGap: "+8.190", points: "15", status: "Finished" },
          { position: "4", driver: "George Russell", flag: "🇬🇧", team: "Mercedes", teamColor: "#27f4d2", laps: "57", timeOrGap: "+11.024", points: "12", status: "Finished" },
          { position: "5", driver: "Lewis Hamilton", flag: "🇬🇧", team: "Mercedes", teamColor: "#27f4d2", laps: "57", timeOrGap: "+17.402", points: "10", status: "Finished" },
        ],
      },
      {
        type: "Qualifying",
        date: "01 Mar 2026",
        summaryCards: [
          { label: "Pole Position", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", value: "1:29.401" },
          { label: "Front Row", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", value: "+0.086" },
          { label: "Top 3", driver: "George Russell", flag: "🇬🇧", team: "Mercedes", value: "+0.191" },
          { label: "Session Gap", driver: "P1 to P10", flag: "⏱️", team: "Qualifying Spread", value: "0.691s" },
        ],
        rows: [
          { position: "1", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", teamColor: "#3671c6", timeOrGap: "1:29.401", status: "Q3" },
          { position: "2", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", teamColor: "#dc0000", timeOrGap: "+0.086", status: "Q3" },
          { position: "3", driver: "George Russell", flag: "🇬🇧", team: "Mercedes", teamColor: "#27f4d2", timeOrGap: "+0.191", status: "Q3" },
          { position: "4", driver: "Lando Norris", flag: "🇬🇧", team: "McLaren", teamColor: "#ff8700", timeOrGap: "+0.244", status: "Q3" },
          { position: "5", driver: "Carlos Sainz", flag: "🇪🇸", team: "Ferrari", teamColor: "#dc0000", timeOrGap: "+0.332", status: "Q3" },
        ],
      },
      {
        type: "Practice",
        date: "28 Feb 2026",
        summaryCards: [
          { label: "Fastest Driver", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", value: "1:30.881" },
          { label: "Best Long Run", driver: "Lando Norris", flag: "🇬🇧", team: "McLaren", value: "1:35.4 avg" },
          { label: "Top Ferrari", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", value: "+0.112" },
          { label: "Track Evolution", driver: "Late Push", flag: "📈", team: "Session Trend", value: "-0.8s" },
        ],
        rows: [
          { position: "1", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", teamColor: "#3671c6", laps: "24", timeOrGap: "1:30.881", status: "Complete" },
          { position: "2", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", teamColor: "#dc0000", laps: "26", timeOrGap: "+0.112", status: "Complete" },
          { position: "3", driver: "Lando Norris", flag: "🇬🇧", team: "McLaren", teamColor: "#ff8700", laps: "25", timeOrGap: "+0.244", status: "Complete" },
          { position: "4", driver: "George Russell", flag: "🇬🇧", team: "Mercedes", teamColor: "#27f4d2", laps: "23", timeOrGap: "+0.351", status: "Complete" },
          { position: "5", driver: "Carlos Sainz", flag: "🇪🇸", team: "Ferrari", teamColor: "#dc0000", laps: "24", timeOrGap: "+0.409", status: "Complete" },
        ],
      },
    ],
  },
  {
    slug: "chinese-grand-prix",
    grandPrix: "Chinese Grand Prix",
    circuit: "Shanghai International Circuit",
    dateRange: "11 - 13 Apr 2026",
    season: "2026",
    sessions: [
      {
        type: "Sprint",
        date: "12 Apr 2026",
        summaryCards: [
          { label: "Sprint Winner", driver: "Lando Norris", flag: "🇬🇧", team: "McLaren", value: "19 laps" },
          { label: "Sprint Pole", driver: "Oscar Piastri", flag: "🇦🇺", team: "McLaren", value: "1:31.020" },
          { label: "Fastest Lap", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", value: "1:35.108" },
          { label: "Podium", driver: "Norris / Verstappen / Leclerc", flag: "🏁", team: "Top 3 Finishers", value: "8 / 7 / 6" },
        ],
        rows: [
          { position: "1", driver: "Lando Norris", flag: "🇬🇧", team: "McLaren", teamColor: "#ff8700", laps: "19", timeOrGap: "30:41.882", points: "8", status: "Finished" },
          { position: "2", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", teamColor: "#3671c6", laps: "19", timeOrGap: "+1.332", points: "7", status: "Finished" },
          { position: "3", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", teamColor: "#dc0000", laps: "19", timeOrGap: "+2.018", points: "6", status: "Finished" },
          { position: "4", driver: "Oscar Piastri", flag: "🇦🇺", team: "McLaren", teamColor: "#ff8700", laps: "19", timeOrGap: "+4.291", points: "5", status: "Finished" },
          { position: "5", driver: "George Russell", flag: "🇬🇧", team: "Mercedes", teamColor: "#27f4d2", laps: "19", timeOrGap: "+6.140", points: "4", status: "Finished" },
        ],
      },
      {
        type: "Race",
        date: "13 Apr 2026",
        summaryCards: [
          { label: "Winner", driver: "Oscar Piastri", flag: "🇦🇺", team: "McLaren", value: "56 laps" },
          { label: "Pole Position", driver: "Oscar Piastri", flag: "🇦🇺", team: "McLaren", value: "1:30.844" },
          { label: "Fastest Lap", driver: "George Russell", flag: "🇬🇧", team: "Mercedes", value: "1:35.912" },
          { label: "Podium", driver: "Piastri / Norris / Verstappen", flag: "🏁", team: "Top 3 Finishers", value: "25 / 18 / 15" },
        ],
        rows: [
          { position: "1", driver: "Oscar Piastri", flag: "🇦🇺", team: "McLaren", teamColor: "#ff8700", laps: "56", timeOrGap: "1:37:16.229", points: "25", status: "Finished" },
          { position: "2", driver: "Lando Norris", flag: "🇬🇧", team: "McLaren", teamColor: "#ff8700", laps: "56", timeOrGap: "+2.904", points: "18", status: "Finished" },
          { position: "3", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", teamColor: "#3671c6", laps: "56", timeOrGap: "+5.117", points: "15", status: "Finished" },
          { position: "4", driver: "George Russell", flag: "🇬🇧", team: "Mercedes", teamColor: "#27f4d2", laps: "56", timeOrGap: "+10.661", points: "12", status: "Finished" },
          { position: "5", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", teamColor: "#dc0000", laps: "56", timeOrGap: "+13.226", points: "10", status: "Finished" },
        ],
      },
      {
        type: "Qualifying",
        date: "12 Apr 2026",
        summaryCards: [
          { label: "Pole Position", driver: "Oscar Piastri", flag: "🇦🇺", team: "McLaren", value: "1:30.844" },
          { label: "Front Row", driver: "Lando Norris", flag: "🇬🇧", team: "McLaren", value: "+0.042" },
          { label: "Top Ferrari", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", value: "+0.184" },
          { label: "Q3 Margin", driver: "P1 to P10", flag: "⏱️", team: "Qualifying Spread", value: "0.622s" },
        ],
        rows: [
          { position: "1", driver: "Oscar Piastri", flag: "🇦🇺", team: "McLaren", teamColor: "#ff8700", timeOrGap: "1:30.844", status: "Q3" },
          { position: "2", driver: "Lando Norris", flag: "🇬🇧", team: "McLaren", teamColor: "#ff8700", timeOrGap: "+0.042", status: "Q3" },
          { position: "3", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", teamColor: "#dc0000", timeOrGap: "+0.184", status: "Q3" },
          { position: "4", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", teamColor: "#3671c6", timeOrGap: "+0.221", status: "Q3" },
          { position: "5", driver: "George Russell", flag: "🇬🇧", team: "Mercedes", teamColor: "#27f4d2", timeOrGap: "+0.338", status: "Q3" },
        ],
      },
      {
        type: "Practice",
        date: "11 Apr 2026",
        summaryCards: [
          { label: "Fastest Driver", driver: "Oscar Piastri", flag: "🇦🇺", team: "McLaren", value: "1:31.887" },
          { label: "Best Long Run", driver: "George Russell", flag: "🇬🇧", team: "Mercedes", value: "1:36.2 avg" },
          { label: "Top Ferrari", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", value: "+0.104" },
          { label: "Track Evolution", driver: "Late Session", flag: "📈", team: "Session Trend", value: "-1.1s" },
        ],
        rows: [
          { position: "1", driver: "Oscar Piastri", flag: "🇦🇺", team: "McLaren", teamColor: "#ff8700", laps: "27", timeOrGap: "1:31.887", status: "Complete" },
          { position: "2", driver: "Charles Leclerc", flag: "🇲🇨", team: "Ferrari", teamColor: "#dc0000", laps: "25", timeOrGap: "+0.104", status: "Complete" },
          { position: "3", driver: "George Russell", flag: "🇬🇧", team: "Mercedes", teamColor: "#27f4d2", laps: "26", timeOrGap: "+0.187", status: "Complete" },
          { position: "4", driver: "Max Verstappen", flag: "🇳🇱", team: "Red Bull Racing", teamColor: "#3671c6", laps: "24", timeOrGap: "+0.231", status: "Complete" },
          { position: "5", driver: "Lando Norris", flag: "🇬🇧", team: "McLaren", teamColor: "#ff8700", laps: "24", timeOrGap: "+0.319", status: "Complete" },
        ],
      },
    ],
  },
];
