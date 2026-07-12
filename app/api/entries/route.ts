import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getEntryByDate, upsertEntry } from "@/lib/entries";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Date required" }, { status: 400 });
  }

  const entry = getEntryByDate(date);
  return NextResponse.json({ entry });
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.date) {
      return NextResponse.json({ error: "Date required" }, { status: 400 });
    }
    upsertEntry(body);
    return NextResponse.json({ ok: true, date: body.date });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
