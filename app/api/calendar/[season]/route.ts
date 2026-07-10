import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getCalendarPageData } from "@/lib/server/page-data/calendar";

type RouteProps = {
  params: Promise<{ season: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  try {
    const { season } = await params;
    const seasonYear = Number.parseInt(season, 10);

    if (Number.isNaN(seasonYear)) {
      return NextResponse.json({ ok: false, error: "Invalid season." }, { status: 400 });
    }

    const calendar = await getCalendarPageData(seasonYear);
    return NextResponse.json({ ok: true, data: calendar });
  } catch (error) {
    return handleApiError(error);
  }
}
