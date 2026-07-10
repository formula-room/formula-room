import { slugifyF1Segment } from "@/lib/f1/presentation";

export function getDriverHref(slug: string) {
  return slug ? `/driver/${slug}` : null;
}

export function getDriverHrefByName(name: string) {
  return name ? getDriverHref(slugifyF1Segment(name)) : null;
}

export function getTeamHref(slug: string) {
  return slug ? `/team/${slug}` : null;
}

export function getTeamHrefByName(name: string) {
  return name ? getTeamHref(slugifyF1Segment(name)) : null;
}

export function getCircuitHref(slug: string) {
  return slug ? `/circuit/${slug}` : null;
}

export function getCircuitHrefByName(name: string) {
  return getCircuitHref(slugifyF1Segment(name));
}

export function getEventHrefBySlug(slug: string) {
  return slug ? `/event/${slug}` : null;
}

export function getEventHrefByGrandPrix(grandPrix: string) {
  return grandPrix ? `/event/${slugifyF1Segment(grandPrix)}` : null;
}

export function getTeamHrefForDriverSlug(driverSlug: string) {
  return driverSlug ? "/standings" : null;
}
