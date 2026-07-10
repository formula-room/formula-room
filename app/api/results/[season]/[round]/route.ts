import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getResultsPageData } from "@/lib/server/page-data/results";

type RouteProps = {
  params: Promise<{ season: string; round: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  try {
    const { season, round } = await params;
    const seasonYear = Number.parseInt(season, 10);
    const roundNumber = Number.parseInt(round, 10);

    if (Number.isNaN(seasonYear) || Number.isNaN(roundNumber)) {
      return NextResponse.json({ ok: false, error: "Invalid season or round." }, { status: 400 });
    }

    const data = await getResultsPageData(seasonYear, roundNumber);

    if (!data) {
      return NextResponse.json({ ok: false, error: "Results not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
