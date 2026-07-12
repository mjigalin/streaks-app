import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getEntryByDate } from "@/lib/entries";

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entry = getEntryByDate(params.date);
  return NextResponse.json({ entry });
}
