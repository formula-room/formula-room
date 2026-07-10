import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getHeadToHeadPageData } from "@/lib/server/page-data/head-to-head";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const driverA = searchParams.get("driverA");
    const driverB = searchParams.get("driverB");

    if (!driverA || !driverB) {
      return NextResponse.json(
        { ok: false, error: "driverA and driverB are required." },
        { status: 400 },
      );
    }

    const scope = (searchParams.get("scope") ?? "All-Time") as "All-Time" | "Season" | "Season Range";
    const season = searchParams.get("season") ?? undefined;
    const seasonFrom = searchParams.get("seasonFrom") ?? undefined;
    const seasonTo = searchParams.get("seasonTo") ?? undefined;
    const mode = (searchParams.get("mode") ?? "All meetings") as "All meetings" | "Teammates only";
    const dnfMode = (searchParams.get("dnfMode") ?? "Include DNFs") as "Include DNFs" | "Exclude DNFs";

    const data = await getHeadToHeadPageData({
      driverA,
      driverB,
      scope,
      season,
      seasonFrom,
      seasonTo,
      mode,
      dnfMode,
    });

    if (!data) {
      return NextResponse.json({ ok: false, error: "Head-to-head comparison not available." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
