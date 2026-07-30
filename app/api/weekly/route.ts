import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getWeeklyStatus,
  completeWeeklyGoal,
  dismissPrompt,
  isPromptDismissed,
} from "@/lib/completions";
import { getWeekStart, getPromptsForDate } from "@/lib/challenge";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Date required" }, { status: 400 });
  }

  const weekStart = getWeekStart(date);
  const weekly = getWeeklyStatus(date);
  const prompts = getPromptsForDate(date).filter((p) => {
    const done = weekly.goals[p.id]?.completed;
    const dismissed = isPromptDismissed(weekStart, p.id);
    return !done && !dismissed;
  });

  return NextResponse.json({ weekly, prompts });
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { week_start, goal_id, completed, action, prompt_id } = body;

    if (action === "dismiss" && week_start && prompt_id) {
      dismissPrompt(week_start, prompt_id);
      return NextResponse.json({ ok: true });
    }

    if (!week_start || !goal_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const weekly = completeWeeklyGoal(week_start, goal_id, !!completed);
    return NextResponse.json(weekly);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
