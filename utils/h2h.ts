export function getPanelTitle(tab: string, type: string): [string, string] {
  const panelTitles: Record<string, [string, string]> = {
    Overview: ["Overview", `Head-to-head record, followed by every ${type.toLowerCase()} meeting.`],
    Race: ["Race", "Finishing positions at every race both drivers took part in."],
    Qualifying: ["Qualifying", "Qualifying positions at every event both drivers took part in."],
    Sprint: ["Sprint", "Sprint results where available."],
    "By Season": ["By Season", "Head-to-head record, points, wins and podiums for each season."],
  };

  return panelTitles[tab] ?? panelTitles.Overview;
}
