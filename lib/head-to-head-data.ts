export type ComparisonScope = "All-Time" | "Season" | "Season Range";
export type ComparisonType = "Race" | "Qualifying" | "Sprint" | "Sprint Qualifying";
export type ComparisonMode = "All meetings" | "Teammates only";
export type DnfMode = "Include DNFs" | "Exclude DNFs";
export type ComparisonTab = "Overview" | "Race" | "Qualifying" | "Sprint" | "By Season";

export type DriverProfile = {
  slug: string;
  name: string;
  shortName: string;
  flag: string;
  accent: string;
};

export type DriverMeetingResult = {
  driverSlug: string;
  team: string;
  position: number;
  label: string;
  points: number;
  dnf: boolean;
};

export type HeadToHeadMeeting = {
  season: string;
  round: string;
  grandPrix: string;
  type: ComparisonType;
  notes: string;
  results: DriverMeetingResult[];
};

export const comparisonScopes: ComparisonScope[] = ["All-Time", "Season", "Season Range"];
export const comparisonTypes: ComparisonType[] = ["Race", "Qualifying", "Sprint", "Sprint Qualifying"];
export const comparisonModes: ComparisonMode[] = ["All meetings", "Teammates only"];
export const dnfModes: DnfMode[] = ["Include DNFs", "Exclude DNFs"];
export const comparisonTabs: ComparisonTab[] = ["Overview", "Race", "Qualifying", "Sprint", "By Season"];
