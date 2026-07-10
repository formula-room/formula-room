import { NextResponse } from "next/server";

export function handleApiError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unexpected server error.";

  const status = message.includes("DATABASE_URL") ? 503 : 500;

  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status },
  );
}
