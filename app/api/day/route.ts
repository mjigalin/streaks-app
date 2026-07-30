import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getDayCompletions,
  toggleHabit,
  setHabitWeight,
  getWeightAverage,
  calculateStreak,
} from "@/lib/completions";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Date required" }, { status: 400 });
  }

  const day = getDayCompletions(date);
  const streak = calculateStreak(date);
  const weightAverage = getWeightAverage(date);

  return NextResponse.json({ ...day, streak, weightAverage });
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, habit_id, action, value } = body;

    if (!date || !habit_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (action === "set_weight") {
      const day = setHabitWeight(date, habit_id, value ?? null);
      const streak = calculateStreak(date);
      const weightAverage = getWeightAverage(date);
      return NextResponse.json({ ...day, streak, weightAverage });
    }

    const day = toggleHabit(date, habit_id, value);
    const streak = calculateStreak(date);
    const weightAverage = getWeightAverage(date);
    return NextResponse.json({ ...day, streak, weightAverage });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
