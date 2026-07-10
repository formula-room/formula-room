export type StatisticsScope = "All-Time" | "Season";
export type StatisticsCategory = {
  title: string;
  items: { label: string; href: string }[];
};

export const statisticsScopes: StatisticsScope[] = ["All-Time", "Season"];

export const statisticsCategories: StatisticsCategory[] = [
  {
    title: "Championships",
    items: [
      { label: "By number", href: "/statistics/championships" },
      { label: "Driver standings", href: "/standings" },
      { label: "Constructor standings", href: "/standings" },
    ],
  },
  {
    title: "Wins",
    items: [
      { label: "By number", href: "/statistics/wins" },
      { label: "Grand Prix win leaders", href: "/grand-prix" },
      { label: "Results archive", href: "/results" },
    ],
  },
  {
    title: "Podiums",
    items: [
      { label: "By number", href: "/statistics/podiums" },
      { label: "Result archive", href: "/results" },
      { label: "Driver standings", href: "/standings" },
    ],
  },
  {
    title: "Pole Positions",
    items: [
      { label: "By number", href: "/statistics/pole-positions" },
      { label: "Qualifying archive", href: "/results" },
      { label: "Circuit benchmark view", href: "/circuit/albert-park" },
    ],
  },
  {
    title: "Points",
    items: [
      { label: "By number", href: "/statistics/points" },
      { label: "Championship table", href: "/standings" },
      { label: "Points by event", href: "/results" },
    ],
  },
  {
    title: "Laps Led",
    items: [
      { label: "Foundation detail", href: "/statistics/laps-led" },
      { label: "Grand Prix leaders", href: "/grand-prix" },
      { label: "Weekend race context", href: "/event/australian-grand-prix" },
    ],
  },
  {
    title: "DNF / Reliability",
    items: [
      { label: "By number", href: "/statistics/dnf-reliability" },
      { label: "Session archive", href: "/results" },
      { label: "Head-to-head attrition", href: "/head-to-head" },
    ],
  },
  {
    title: "Sprint",
    items: [
      { label: "Foundation detail", href: "/statistics/sprint" },
      { label: "Sprint sessions", href: "/results" },
      { label: "Sprint comparisons", href: "/head-to-head" },
    ],
  },
  {
    title: "Special Achievements",
    items: [
      { label: "Foundation detail", href: "/statistics/special-achievements" },
      { label: "Driver milestones", href: "/driver/max-verstappen" },
    ],
  },
  {
    title: "Grand Prix",
    items: [{ label: "Stats by Grand Prix", href: "/grand-prix" }],
  },
  {
    title: "Circuits",
    items: [
      { label: "Albert Park profile", href: "/circuit/albert-park" },
      { label: "Suzuka profile", href: "/circuit/suzuka" },
    ],
  },
  {
    title: "Head-to-Head",
    items: [
      { label: "Driver vs Driver", href: "/head-to-head" },
      { label: "Related driver profile", href: "/driver/charles-leclerc" },
    ],
  },
];
