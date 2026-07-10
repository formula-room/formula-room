import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getEventPageData } from "@/lib/server/page-data/event";

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

    const event = await getEventPageData({
      slug: "",
      seasonYear,
      round: roundNumber,
    });

    if (!event) {
      return NextResponse.json({ ok: false, error: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: event });
  } catch (error) {
    return handleApiError(error);
  }
}
