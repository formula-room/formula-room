import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getNewsPageData } from "@/lib/server/page-data/news";

export async function GET() {
  try {
    const data = await getNewsPageData();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
