export function getInitials(name?: string): string {
  if (!name) {
    return "-";
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 3).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1].slice(0, 2)}`.toUpperCase();
}

export function getBarWidth(value: number, valueA: number, valueB: number): string {
  const total = valueA + valueB;
  if (total === 0) {
    return "50%";
  }

  return `${(value / total) * 100}%`;
}

export function getPanelTitle(
  tab: string,
  type: string,
  scope: string,
  mode: string,
): [string, string] {
  const panelTitles: Record<string, [string, string]> = {
    Overview: ["Overview Comparison", `Primary focus: ${type}. Scope: ${scope}. Mode: ${mode}.`],
    Race: ["Race Comparison", "Head-to-head race finishing positions and points."],
    Qualifying: ["Qualifying Comparison", "Grid position and time deltas between drivers."],
    Sprint: ["Sprint Comparison", "Sprint session head-to-head results where available."],
    "By Season": ["By Season Breakdown", "Annual win/loss record and points tally per season."],
  };

  return panelTitles[tab] ?? panelTitles.Overview;
}
