import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getEventPageData } from "@/lib/server/page-data/event";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season");
    const round = searchParams.get("round");
    const seasonYear = season ? Number.parseInt(season, 10) : undefined;
    const roundNumber = round ? Number.parseInt(round, 10) : undefined;

    if (
      (season !== null && (seasonYear === undefined || Number.isNaN(seasonYear))) ||
      (round !== null && (roundNumber === undefined || Number.isNaN(roundNumber)))
    ) {
      return NextResponse.json({ ok: false, error: "Invalid season or round." }, { status: 400 });
    }

    const data = await getEventPageData({
      slug,
      seasonYear,
      round: roundNumber,
    });

    if (!data) {
      return NextResponse.json({ ok: false, error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
