import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { calculateStreaks } from "@/lib/streaks";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = request.nextUrl.searchParams.get("today") ?? undefined;
  const streaks = calculateStreaks(today ?? undefined);
  return NextResponse.json(streaks);
}
