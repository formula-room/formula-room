import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getStandingsPageData } from "@/lib/server/page-data/standings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    const standings = await getStandingsPageData(seasonYear);
    return NextResponse.json(
      { ok: true, data: standings },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
