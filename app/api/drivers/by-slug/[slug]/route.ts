import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getDriverProfilePageDataBySlug } from "@/lib/server/page-data/driver-profile";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const profile = await getDriverProfilePageDataBySlug(slug);

    if (!profile) {
      return NextResponse.json({ ok: false, error: "Driver not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}
