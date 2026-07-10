export type StandingsSeason = "2026" | "2025" | "2024";

export type DriverStanding = {
  position: string;
  slug: string;
  flag: string;
  driver: string;
  team: string;
  teamColor: string;
  points: string;
  wins: string;
  podiums: string;
};

export type TeamStanding = {
  position: string;
  slug: string;
  team: string;
  teamColor: string;
  points: string;
  wins: string;
  podiums: string;
};

export const standingsSeasons: StandingsSeason[] = ["2026", "2025", "2024"];

export const driverStandings: DriverStanding[] = [
  { position: "1", slug: "max-verstappen", flag: "🇳🇱", driver: "Max Verstappen", team: "Red Bull Racing", teamColor: "#3671c6", points: "51", wins: "2", podiums: "2" },
  { position: "2", slug: "charles-leclerc", flag: "🇲🇨", driver: "Charles Leclerc", team: "Ferrari", teamColor: "#dc0000", points: "44", wins: "0", podiums: "2" },
  { position: "3", slug: "lando-norris", flag: "🇬🇧", driver: "Lando Norris", team: "McLaren", teamColor: "#ff8700", points: "39", wins: "0", podiums: "2" },
  { position: "4", slug: "george-russell", flag: "🇬🇧", driver: "George Russell", team: "Mercedes", teamColor: "#27f4d2", points: "30", wins: "0", podiums: "1" },
  { position: "5", slug: "oscar-piastri", flag: "🇦🇺", driver: "Oscar Piastri", team: "McLaren", teamColor: "#ff8700", points: "26", wins: "0", podiums: "1" },
  { position: "6", slug: "carlos-sainz", flag: "🇪🇸", driver: "Carlos Sainz", team: "Ferrari", teamColor: "#dc0000", points: "22", wins: "0", podiums: "0" },
];

export const teamStandings: TeamStanding[] = [
  { position: "1", slug: "red-bull-racing", team: "Red Bull Racing", teamColor: "#3671c6", points: "78", wins: "2", podiums: "3" },
  { position: "2", slug: "ferrari", team: "Ferrari", teamColor: "#dc0000", points: "66", wins: "0", podiums: "3" },
  { position: "3", slug: "mclaren", team: "McLaren", teamColor: "#ff8700", points: "65", wins: "0", podiums: "3" },
  { position: "4", slug: "mercedes", team: "Mercedes", teamColor: "#27f4d2", points: "42", wins: "0", podiums: "1" },
  { position: "5", slug: "aston-martin", team: "Aston Martin", teamColor: "#229971", points: "16", wins: "0", podiums: "0" },
  { position: "6", slug: "williams", team: "Williams", teamColor: "#64c4ff", points: "8", wins: "0", podiums: "0" },
];
