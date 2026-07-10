import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getGrandPrixPageData } from "@/lib/server/page-data/grand-prix";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season");

    const data = await getGrandPrixPageData(
      slug,
      season && !Number.isNaN(Number.parseInt(season, 10)) ? Number.parseInt(season, 10) : undefined,
    );

    if (!data) {
      return NextResponse.json({ ok: false, error: "Grand Prix not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
