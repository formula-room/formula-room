import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getSeasonsList } from "@/lib/server/queries/seasons";

export async function GET() {
  try {
    const seasons = await getSeasonsList();
    return NextResponse.json({ ok: true, data: seasons });
  } catch (error) {
    return handleApiError(error);
  }
}
