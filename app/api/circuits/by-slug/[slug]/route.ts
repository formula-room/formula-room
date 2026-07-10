import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getCircuitProfilePageDataBySlug } from "@/lib/server/page-data/circuit-profile";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const profile = await getCircuitProfilePageDataBySlug(slug);

    if (!profile) {
      return NextResponse.json({ ok: false, error: "Circuit not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}
