/**
 * IANA time zone of each circuit, keyed by the stable Ergast/Jolpica circuitId.
 * Used to work out when a race week starts (Monday 00:00 at the circuit) and to
 * show event dates as the circuit sees them.
 *
 * A circuit missing from this list falls back to an approximate fixed offset
 * from its longitude (see getCircuitTimeZone), so a new venue still works; add
 * it here for exact daylight-saving handling.
 */
export const CIRCUIT_TIME_ZONES: Record<string, string> = {
  albert_park: "Australia/Melbourne",
  americas: "America/Chicago",
  bahrain: "Asia/Bahrain",
  baku: "Asia/Baku",
  catalunya: "Europe/Madrid",
  hungaroring: "Europe/Budapest",
  imola: "Europe/Rome",
  interlagos: "America/Sao_Paulo",
  jeddah: "Asia/Riyadh",
  losail: "Asia/Qatar",
  madring: "Europe/Madrid",
  marina_bay: "Asia/Singapore",
  miami: "America/New_York",
  monaco: "Europe/Monaco",
  monza: "Europe/Rome",
  red_bull_ring: "Europe/Vienna",
  ricard: "Europe/Paris",
  rodriguez: "America/Mexico_City",
  shanghai: "Asia/Shanghai",
  silverstone: "Europe/London",
  spa: "Europe/Brussels",
  suzuka: "Asia/Tokyo",
  vegas: "America/Los_Angeles",
  villeneuve: "America/Toronto",
  yas_marina: "Asia/Dubai",
  zandvoort: "Europe/Amsterdam",
};

/** Exact zone when known, otherwise a whole-hour offset derived from longitude. */
export function getCircuitTimeZone(circuitId: string, lng?: number | null): string {
  const known = CIRCUIT_TIME_ZONES[circuitId];
  if (known) {
    return known;
  }

  if (typeof lng === "number" && Number.isFinite(lng)) {
    const hours = Math.max(-12, Math.min(14, Math.round(lng / 15)));
    // Etc/GMT zones use inverted signs: Etc/GMT-4 is UTC+4.
    return hours === 0 ? "UTC" : `Etc/GMT${hours > 0 ? "-" : "+"}${Math.abs(hours)}`;
  }

  return "UTC";
}
