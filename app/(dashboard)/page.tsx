import { HomePageView } from "@/components/home/home-page";
import { getHomeHeroBackground } from "@/lib/server/page-data/home-hero";

// The hero photo follows the race calendar, so pick it per request rather than at build time.
export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ previewAt?: string | string[] }>;
};

/**
 * Development only: /?previewAt=2026-11-16T08:00:00Z previews the hero photo chosen at that moment
 * (e.g. to check a new Grand Prix photo before its race week starts). Ignored in production.
 */
function readPreviewTime(value: string | string[] | undefined) {
  if (process.env.NODE_ENV === "production" || typeof value !== "string") {
    return undefined;
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : time;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { previewAt } = await searchParams;
  const heroBackground = await getHomeHeroBackground(readPreviewTime(previewAt));
  return <HomePageView heroBackground={heroBackground} />;
}
