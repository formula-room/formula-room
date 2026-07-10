import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getHomePageData } from "@/lib/server/page-data/home";

export async function GET() {
  try {
    const data = await getHomePageData();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
