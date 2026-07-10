import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getGrandPrixOptions } from "@/lib/server/page-data/grand-prix";

export async function GET() {
  try {
    const options = await getGrandPrixOptions();
    return NextResponse.json({ ok: true, data: options });
  } catch (error) {
    return handleApiError(error);
  }
}
