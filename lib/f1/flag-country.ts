const countryAliases: Record<string, string> = {
  AU: "Australia",
  Australia: "Australia",
  AUT: "Austria",
  Austria: "Austria",
  AZE: "Azerbaijan",
  Azerbaijan: "Azerbaijan",
  Bahrain: "Bahrain",
  BEL: "Belgium",
  Belgium: "Belgium",
  BRA: "Brazil",
  Brazil: "Brazil",
  CAN: "Canada",
  Canada: "Canada",
  CHN: "China",
  China: "China",
  ENG: "United Kingdom",
  England: "United Kingdom",
  FRA: "France",
  France: "France",
  GER: "Germany",
  Germany: "Germany",
  GBR: "United Kingdom",
  "Great Britain": "United Kingdom",
  Britain: "United Kingdom",
  HUN: "Hungary",
  Hungary: "Hungary",
  INA: "Indonesia",
  Indonesia: "Indonesia",
  IRL: "Ireland",
  Ireland: "Ireland",
  ITA: "Italy",
  Italy: "Italy",
  JPN: "Japan",
  Japan: "Japan",
  MEX: "Mexico",
  Mexico: "Mexico",
  MON: "Monaco",
  Monaco: "Monaco",
  NED: "Netherlands",
  Netherlands: "Netherlands",
  NIR: "United Kingdom",
  "Northern Ireland": "United Kingdom",
  POR: "Portugal",
  PRT: "Portugal",
  Portugal: "Portugal",
  QAT: "Qatar",
  Qatar: "Qatar",
  RUS: "Russia",
  Russia: "Russia",
  KSA: "Saudi Arabia",
  SAU: "Saudi Arabia",
  "Saudi Arabia": "Saudi Arabia",
  SCO: "United Kingdom",
  Scotland: "United Kingdom",
  SGP: "Singapore",
  Singapore: "Singapore",
  ESP: "Spain",
  Spain: "Spain",
  UAE: "United Arab Emirates",
  "United Arab Emirates": "United Arab Emirates",
  "Abu Dhabi": "United Arab Emirates",
  UK: "United Kingdom",
  "United Kingdom": "United Kingdom",
  USA: "United States",
  US: "United States",
  "United States": "United States",
  "United States of America": "United States",
  TUR: "Turkey",
  Turkey: "Turkey",
  VIE: "Vietnam",
  Vietnam: "Vietnam",
  WAL: "United Kingdom",
  Wales: "United Kingdom",
};

const raceFlagOverrides: Record<string, string> = {
  "Abu Dhabi Grand Prix": "United Arab Emirates",
  "British Grand Prix": "United Kingdom",
  "Las Vegas Grand Prix": "United States",
  "Mexico City Grand Prix": "Mexico",
  "Miami Grand Prix": "United States",
  "Saudi Arabian Grand Prix": "Saudi Arabia",
  "United States Grand Prix": "United States",
};

export function normalizeCountryFlagKey(country: string) {
  const normalizedCountry = country.trim();

  if (!normalizedCountry) {
    return "";
  }

  return countryAliases[normalizedCountry] ?? countryAliases[normalizedCountry.toUpperCase()] ?? normalizedCountry;
}

export function resolveRaceFlagCountry(raceName: string, country: string) {
  const normalizedRaceName = raceName.trim();
  return raceFlagOverrides[normalizedRaceName] ?? normalizeCountryFlagKey(country);
}
