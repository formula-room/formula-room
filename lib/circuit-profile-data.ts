export type CircuitRecordRow = {
  record: string;
  holder: string;
  value: string;
  year?: string;
};

export type CircuitHistoryRow = {
  year: string;
  grandPrix: string;
  winner: string;
  team: string;
  poleSitter: string;
  fastestLap: string;
};

export type CircuitSimpleRow = {
  year: string;
  entry: string;
  teamOrContext: string;
  note: string;
};

export type CircuitProfileRecord = {
  slug: string;
  circuitId?: string;
  name: string;
  location: string;
  activeGrandPrix: string;
  sinceYear: string;
  supportingInfo: string;
  outlineAsset: string;
  overviewStats: { label: string; value: string }[];
  secondaryStats: { label: string; value: string }[];
  facts: { label: string; value: string }[];
  latestEventSummary: { label: string; value: string }[];
  records: CircuitRecordRow[];
  raceHistory: CircuitHistoryRow[];
  winners: CircuitSimpleRow[];
  poleSitters: CircuitSimpleRow[];
  fastestLaps: CircuitSimpleRow[];
};
