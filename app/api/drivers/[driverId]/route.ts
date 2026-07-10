import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api-response";
import { getDriverProfileFoundation } from "@/lib/server/queries/profiles";

type RouteProps = {
  params: Promise<{ driverId: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  try {
    const { driverId } = await params;
    const profile = await getDriverProfileFoundation(driverId);

    if (!profile) {
      return NextResponse.json({ ok: false, error: "Driver not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}
