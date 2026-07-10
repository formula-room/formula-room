type TeamTheme = {
  displayName?: string;
  teamColor: string;
  accent: string;
  accentSoft: string;
  eraLabel: string;
  statusLabel: string;
  firstSeason?: string;
  activeYears?: string;
};

const TEAM_THEMES: Record<string, TeamTheme> = {
  red_bull: {
    displayName: "Red Bull Racing",
    teamColor: "#3671c6",
    accent: "#2446ff",
    accentSoft: "#e1e7ff",
    eraLabel: "Ground-Effect Benchmark Era",
    statusLabel: "Current front-runner",
    firstSeason: "2005",
    activeYears: "2005-Present",
  },
  ferrari: {
    teamColor: "#dc0000",
    accent: "#ff4b36",
    accentSoft: "#ffe2dd",
    eraLabel: "Heritage Factory Era",
    statusLabel: "Historic works team",
    firstSeason: "1950",
    activeYears: "1950-Present",
  },
  mercedes: {
    teamColor: "#27f4d2",
    accent: "#27f4d2",
    accentSoft: "#ddfffb",
    eraLabel: "Hybrid-Era Benchmark",
    statusLabel: "Front-running reference",
    firstSeason: "1954",
    activeYears: "1954-1955, 2010-Present",
  },
  mclaren: {
    teamColor: "#ff8700",
    accent: "#ff8700",
    accentSoft: "#ffedd9",
    eraLabel: "Modern Revival Era",
    statusLabel: "Current contender",
    firstSeason: "1966",
    activeYears: "1966-Present",
  },
  alpine: {
    displayName: "Alpine",
    teamColor: "#2293d1",
    accent: "#2293d1",
    accentSoft: "#d9f0ff",
    eraLabel: "Modern Works Project",
    statusLabel: "Current works team",
    firstSeason: "2021",
    activeYears: "2021-Present",
  },
  renault: {
    displayName: "Renault",
    teamColor: "#fff500",
    accent: "#d1c400",
    accentSoft: "#fff9cf",
    eraLabel: "Works Return Era",
    statusLabel: "Historic works team",
    firstSeason: "1977",
    activeYears: "1977-1985, 2002-2011, 2016-2020",
  },
  aston_martin: {
    displayName: "Aston Martin",
    teamColor: "#229971",
    accent: "#229971",
    accentSoft: "#ddf7ee",
    eraLabel: "Modern Factory Return",
    statusLabel: "Upper-midfield challenger",
    firstSeason: "2021",
    activeYears: "2021-Present",
  },
  racing_point: {
    displayName: "Racing Point",
    teamColor: "#f596c8",
    accent: "#f596c8",
    accentSoft: "#ffe3f3",
    eraLabel: "Pink Mercedes Era",
    statusLabel: "Historic renamed team",
    firstSeason: "2019",
    activeYears: "2019-2020",
  },
  alphatauri: {
    displayName: "AlphaTauri",
    teamColor: "#4e7c9b",
    accent: "#4e7c9b",
    accentSoft: "#e1edf5",
    eraLabel: "Faenza Rebrand Era",
    statusLabel: "Current midfield team",
    firstSeason: "2020",
    activeYears: "2020-2023",
  },
  rb: {
    displayName: "RB",
    teamColor: "#6692ff",
    accent: "#6692ff",
    accentSoft: "#e4ecff",
    eraLabel: "Faenza Rebrand Era",
    statusLabel: "Current midfield team",
    firstSeason: "2024",
    activeYears: "2024-Present",
  },
  alpha: {
    displayName: "Alfa Romeo",
    teamColor: "#900000",
    accent: "#900000",
    accentSoft: "#f5dede",
    eraLabel: "Sauber Partnership Era",
    statusLabel: "Historic renamed team",
    firstSeason: "2019",
    activeYears: "2019-2023",
  },
  sauber: {
    displayName: "Sauber",
    teamColor: "#52e252",
    accent: "#2aaa2a",
    accentSoft: "#e1f9e1",
    eraLabel: "Audi Transition Era",
    statusLabel: "Current independent entry",
    firstSeason: "1993",
    activeYears: "1993-Present",
  },
  haas: {
    displayName: "Haas F1 Team",
    teamColor: "#b6babd",
    accent: "#90969a",
    accentSoft: "#eff2f4",
    eraLabel: "Modern American Entry",
    statusLabel: "Current midfield team",
    firstSeason: "2016",
    activeYears: "2016-Present",
  },
  williams: {
    displayName: "Williams",
    teamColor: "#64c4ff",
    accent: "#64c4ff",
    accentSoft: "#e0f4ff",
    eraLabel: "Historic Independent Legacy",
    statusLabel: "Rebuild phase",
    firstSeason: "1978",
    activeYears: "1978-Present",
  },
};

const DRIVER_NUMBERS: Record<string, string> = {
  max_verstappen: "1",
  sergio_perez: "11",
  charles_leclerc: "16",
  carlos_sainz: "55",
  lewis_hamilton: "44",
  george_russell: "63",
  lando_norris: "4",
  oscar_piastri: "81",
  fernando_alonso: "14",
  lance_stroll: "18",
  pierre_gasly: "10",
  esteban_ocon: "31",
  alex_albon: "23",
  logan_sargeant: "2",
  yuki_tsunoda: "22",
  daniel_ricciardo: "3",
  liam_lawson: "30",
  valtteri_bottas: "77",
  zhou_guanyu: "24",
  kevin_magnussen: "20",
  nico_hulkenberg: "27",
  ollie_bearman: "87",
};

const FLAG_BY_NATIONALITY: Record<string, string> = {
  australia: "🇦🇺",
  austrian: "🇦🇹",
  belgian: "🇧🇪",
  brazilian: "🇧🇷",
  canadian: "🇨🇦",
  chinese: "🇨🇳",
  danish: "🇩🇰",
  dutch: "🇳🇱",
  finnish: "🇫🇮",
  french: "🇫🇷",
  german: "🇩🇪",
  italian: "🇮🇹",
  japanese: "🇯🇵",
  mexican: "🇲🇽",
  monegasque: "🇲🇨",
  monacan: "🇲🇨",
  monaco: "🇲🇨",
  new_zealand: "🇳🇿",
  netherlands: "🇳🇱",
  polish: "🇵🇱",
  spanish: "🇪🇸",
  thai: "🇹🇭",
  austria: "🇦🇹",
  brazil: "🇧🇷",
  canada: "🇨🇦",
  china: "🇨🇳",
  france: "🇫🇷",
  germany: "🇩🇪",
  hungary: "🇭🇺",
  italy: "🇮🇹",
  japan: "🇯🇵",
  mexico: "🇲🇽",
  qatar: "🇶🇦",
  saudi_arabia: "🇸🇦",
  singapore: "🇸🇬",
  spain: "🇪🇸",
  united_arab_emirates: "🇦🇪",
  british: "🇬🇧",
  "united kingdom": "🇬🇧",
  american: "🇺🇸",
  united_states: "🇺🇸",
};

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function slugifyF1Segment(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDriverRouteSlug(driverId: string, fullName: string) {
  return slugifyF1Segment(fullName || driverId.replace(/_/g, " "));
}

export function getConstructorRouteSlug(constructorId: string, name: string) {
  return slugifyF1Segment(name || constructorId.replace(/_/g, " "));
}

export function getCircuitRouteSlug(circuitId: string, name: string) {
  return slugifyF1Segment(circuitId ? circuitId.replace(/_/g, " ") : name);
}

export function getDriverNumber(driverId: string) {
  return DRIVER_NUMBERS[driverId] ?? "--";
}

export function getFlagEmoji(nationality: string) {
  return FLAG_BY_NATIONALITY[normalizeToken(nationality)] ?? "🏁";
}

export function getConstructorTheme(constructorId: string, name: string) {
  const theme = TEAM_THEMES[constructorId] ?? TEAM_THEMES[normalizeToken(name)];

  return {
    displayName: theme?.displayName ?? name,
    teamColor: theme?.teamColor ?? "#ff6a3d",
    accent: theme?.accent ?? "#ff6a3d",
    accentSoft: theme?.accentSoft ?? "#ffe6de",
    eraLabel: theme?.eraLabel ?? "Modern Formula 1 Era",
    statusLabel: theme?.statusLabel ?? "Active constructor",
    firstSeason: theme?.firstSeason,
    activeYears: theme?.activeYears,
  };
}

export function formatPoints(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/g, "").replace(/\.$/g, "");
}

export function formatOrdinal(value: number) {
  const remainder10 = value % 10;
  const remainder100 = value % 100;

  if (remainder10 === 1 && remainder100 !== 11) {
    return `${value}st`;
  }

  if (remainder10 === 2 && remainder100 !== 12) {
    return `${value}nd`;
  }

  if (remainder10 === 3 && remainder100 !== 13) {
    return `${value}rd`;
  }

  return `${value}th`;
}

export function isDnfStatus(status: string) {
  const normalized = status.toLowerCase();
  return !(
    normalized === "finished" ||
    normalized.startsWith("+") ||
    normalized.includes("lap")
  );
}
