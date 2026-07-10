import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getStatisticsDetailPageData, type StatisticsDetailSlug } from "@/lib/server/page-data/statistics";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

const supportedSlugs = new Set<StatisticsDetailSlug>([
  "championships",
  "wins",
  "podiums",
  "pole-positions",
  "points",
  "dnf-reliability",
  "laps-led",
  "sprint",
  "special-achievements",
]);

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    if (!supportedSlugs.has(slug as StatisticsDetailSlug)) {
      return NextResponse.json({ ok: false, error: "Statistic not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") === "Season" ? "Season" : "All-Time";
    const season = searchParams.get("season") ?? undefined;

    const data = await getStatisticsDetailPageData(slug as StatisticsDetailSlug, scope, season);

    if (!data) {
      return NextResponse.json({ ok: false, error: "Statistic not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
