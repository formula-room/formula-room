/**
 * Homepage hero photographs, one per Grand Prix.
 *
 * HOW TO ADD OR REPLACE A PHOTO
 * 1. Optimise your photo (real photographs only, landscape, ideally 2560 x 1440 or larger):
 *      node scripts/optimize-grand-prix-image.mjs "path/to/photo.jpg" vegas
 *    This writes public/images/grand-prix/vegas.webp.
 * 2. Add (or edit) one line below, keyed by the circuit ID used in the calendar
 *    (the same ID as in /circuit/<id> URLs, e.g. "vegas", "losail", "yas_marina").
 *
 * The photo then appears automatically from Monday 00:00 (circuit time) of that
 * Grand Prix's race week. No component changes are needed.
 *
 * Keys:
 *  - "<circuitId>"               used every season at that circuit
 *  - "<season>:<circuitId>"      optional override for one season, e.g. "2027:vegas"
 *
 * Fields:
 *  - tone: "bright" for daylight photos (stronger left shade), "dark" for night photos (lighter shade)
 *  - position / mobilePosition: CSS object-position to control cropping (default "50% 50%")
 */

export type GrandPrixHeroImage = {
  src: string;
  alt: string;
  tone?: "bright" | "dark";
  position?: string;
  mobilePosition?: string;
};

export const GRAND_PRIX_HERO_IMAGES: Record<string, GrandPrixHeroImage> = {
  vegas: {
    src: "/images/grand-prix/vegas-fireworks.webp",
    alt: "Fireworks over the Las Vegas Strip circuit, the Bellagio, Caesars Palace and the Paris Las Vegas Eiffel Tower",
    tone: "bright",
    position: "50% 40%",
    mobilePosition: "86% 50%",
  },
};

/** Shown when the current race week has no photo yet. */
export const FALLBACK_HERO_IMAGE: GrandPrixHeroImage = {
  src: "/images/grand-prix/fallback.webp",
  alt: "Mercedes and Ferrari Formula 1 cars racing side by side",
  tone: "bright",
  position: "50% 62%",
  mobilePosition: "38% 60%",
};

export function resolveGrandPrixHeroImage(circuitId: string | null | undefined, seasonYear?: number | null) {
  if (!circuitId) {
    return null;
  }
  return (seasonYear ? GRAND_PRIX_HERO_IMAGES[`${seasonYear}:${circuitId}`] : undefined) ?? GRAND_PRIX_HERO_IMAGES[circuitId] ?? null;
}
