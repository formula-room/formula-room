import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getTeamProfilePageDataBySlug } from "@/lib/server/page-data/team-profile";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  try {
    const { slug } = await params;
    const profile = await getTeamProfilePageDataBySlug(slug);

    if (!profile) {
      return NextResponse.json({ ok: false, error: "Team not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}
