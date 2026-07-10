export type DriverSeasonRow = {
  season: string;
  team: string;
  position: string;
  wins: number;
  podiums: number;
  poles: number;
  points: number;
  starts: number;
};

export type GrandPrixBreakdownRow = {
  grandPrix: string;
  starts: number;
  wins: number;
  podiums: number;
  bestFinish: string;
  points: number;
};

export type QualifyingBreakdownRow = {
  grandPrix: string;
  poles: number;
  frontRows: number;
  q3s: number;
  bestGrid: string;
  averageGrid: string;
};

export type SprintBreakdownRow = {
  grandPrix: string;
  sprintWins: number;
  podiums: number;
  points: number;
  bestFinish: string;
};

export type RecordStreak = {
  label: string;
  value: string;
  detail: string;
};

export type ChampionshipChronologyRow = {
  season: string;
  result: string;
  detail: string;
};

export type DriverProfileRecord = {
  slug: string;
  name: string;
  flag: string;
  number: string;
  nationality: string;
  teamLabel: string;
  eraLabel: string;
  accent: string;
  accentSoft: string;
  overviewStats: { label: string; value: string }[];
  secondaryStats: { label: string; value: string }[];
  summaryFacts: { label: string; value: string }[];
  milestones: { label: string; value: string }[];
  seasons: DriverSeasonRow[];
  grandPrixBreakdown: GrandPrixBreakdownRow[];
  qualifyingBreakdown: QualifyingBreakdownRow[];
  sprintBreakdown: SprintBreakdownRow[];
  records: RecordStreak[];
  championshipChronology: ChampionshipChronologyRow[];
};
