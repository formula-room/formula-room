export const nextRace = {
  round: "03",
  title: "Australian Grand Prix",
  subtitle: "Albert Park Circuit, Melbourne",
  date: "16 MAR 2026",
  countdown: "02d 14h 26m",
  status: "Race Week",
  sessions: [
    { name: "Practice 1", label: "Fri", time: "11:30" },
    { name: "Practice 2", label: "Fri", time: "15:00" },
    { name: "Practice 3", label: "Sat", time: "11:30" },
    { name: "Qualifying", label: "Sat", time: "15:00" },
    { name: "Race", label: "Sun", time: "14:00" },
  ],
  insights: [
    { label: "Track Temp", value: "29 C" },
    { label: "Rain Risk", value: "18%" },
    { label: "Pit Loss", value: "21.4s" },
    { label: "DRS Zones", value: "4" },
  ],
};

export const lastRace = {
  round: "02",
  title: "Saudi Arabian Grand Prix",
  subtitle: "Jeddah Corniche Circuit",
  date: "09 MAR 2026",
  winner: "Max Verstappen",
  team: "Red Bull Racing",
  margin: "+3.284s",
  podium: [
    { position: "P1", driver: "Max Verstappen", team: "Red Bull Racing", points: "25 pts" },
    { position: "P2", driver: "Charles Leclerc", team: "Ferrari", points: "18 pts" },
    { position: "P3", driver: "Lando Norris", team: "McLaren", points: "15 pts" },
  ],
  facts: [
    { label: "Fastest Lap", value: "1:31.204" },
    { label: "Safety Cars", value: "0" },
    { label: "Lead Changes", value: "2" },
    { label: "Pit Stops", value: "24" },
  ],
};

export const driverStandingsTopThree = [
  { position: "01", name: "Max Verstappen", team: "Red Bull Racing", points: 51, delta: "+7" },
  { position: "02", name: "Charles Leclerc", team: "Ferrari", points: 44, delta: "0" },
  { position: "03", name: "Lando Norris", team: "McLaren", points: 39, delta: "-5" },
];

export const teamStandingsTopThree = [
  { position: "01", name: "Red Bull Racing", points: 78, trend: "2 wins" },
  { position: "02", name: "Ferrari", points: 66, trend: "Consistent podiums" },
  { position: "03", name: "McLaren", points: 65, trend: "Strong quali pace" },
];
