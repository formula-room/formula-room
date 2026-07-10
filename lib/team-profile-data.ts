export type TeamSeasonRow = {
  season: string;
  drivers: string;
  position: string;
  wins: number;
  podiums: number;
  poles: number;
  points: number;
  starts: number;
};

export type TeamDriverRow = {
  name: string;
  nationality: string;
  number?: string;
  era: string;
  highlight: string;
};

export type TeamGrandPrixRow = {
  grandPrix: string;
  starts: number;
  wins: number;
  podiums: number;
  bestFinish: string;
  points: number;
};

export type TeamQualifyingRow = {
  grandPrix: string;
  poles: number;
  frontRows: number;
  lockouts: number;
  bestGridAverage: string;
};

export type TeamRecordRow = {
  label: string;
  value: string;
  detail: string;
};

export type TeamProfileRecord = {
  slug: string;
  name: string;
  nationality: string;
  activeYears: string;
  firstSeason: string;
  eraLabel: string;
  statusLabel: string;
  accent: string;
  accentSoft: string;
  overviewStats: { label: string; value: string }[];
  secondaryStats: { label: string; value: string }[];
  summaryFacts: { label: string; value: string }[];
  milestones: { label: string; value: string }[];
  seasons: TeamSeasonRow[];
  drivers: TeamDriverRow[];
  grandPrixBreakdown: TeamGrandPrixRow[];
  qualifyingBreakdown: TeamQualifyingRow[];
  records: TeamRecordRow[];
};
