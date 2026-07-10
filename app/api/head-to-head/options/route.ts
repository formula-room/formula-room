import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getHeadToHeadOptions } from "@/lib/server/page-data/head-to-head";

export async function GET() {
  try {
    const data = await getHeadToHeadOptions();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
