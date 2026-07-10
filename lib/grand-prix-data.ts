export type GrandPrixScope = "All-Time" | "Season";
export type GrandPrixSortMetric = "Wins" | "Podiums" | "Poles" | "Starts";

export type GrandPrixSummary = {
  label: string;
  name: string;
  flag: string;
  teamOrValue: string;
  stat: string;
};

export type DriverLeader = {
  slug: string;
  flag: string;
  name: string;
  wins: number;
  podiums: number;
  poles: number;
  starts: number;
};

export type TeamLeader = {
  slug: string;
  name: string;
  wins: number;
  podiums: number;
  poles: number;
  starts: number;
};

export type RaceHistoryRow = {
  year: string;
  winner: string;
  team: string;
  poleSitter: string;
  fastestLap: string;
  circuit: string;
};

export type GrandPrixScopeData = {
  description: string;
  summaryCards: GrandPrixSummary[];
  driverLeaders: DriverLeader[];
  teamLeaders: TeamLeader[];
  history: RaceHistoryRow[];
};

export type GrandPrixRecord = {
  slug: string;
  name: string;
  flag: string;
  location: string;
  firstHeld: string;
  currentCircuitId?: string;
  currentCircuit: string;
  latestWinner: string;
  latestWinnerTeam: string;
  scopes: Record<GrandPrixScope, GrandPrixScopeData>;
};
