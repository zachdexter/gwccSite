import { auth } from "@/auth";
import { db } from "@/lib/db";
import { weekRequirements } from "@/lib/db/schema";
import {
  ALLOWED_WEEKLY_REQUIRED,
  DEFAULT_WEEKLY_REQUIRED,
  getWeekBounds,
  toClubDateString,
} from "@/lib/semester";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Sets how many sessions are required for one week of a semester. Setting a week back to
// the default with no reason removes its override row.
export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { semesterId, weekStart, required, reason } = await req.json();
  if (!semesterId || !weekStart) {
    return NextResponse.json({ error: "semesterId and weekStart required" }, { status: 400 });
  }
  if (!(ALLOWED_WEEKLY_REQUIRED as readonly number[]).includes(required)) {
    return NextResponse.json({ error: "required must be 0, 1, or 2" }, { status: 400 });
  }
  const start = new Date(weekStart);
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: "Invalid weekStart" }, { status: 400 });
  }

  // Normalize to the week's Sunday so the key is stable regardless of what the client sent.
  const weekKey = toClubDateString(getWeekBounds(start).weekStart);
  const trimmedReason = typeof reason === "string" && reason.trim() ? reason.trim() : null;

  try {
    if (required === DEFAULT_WEEKLY_REQUIRED && !trimmedReason) {
      await db
        .delete(weekRequirements)
        .where(
          and(eq(weekRequirements.semesterId, semesterId), eq(weekRequirements.weekStart, weekKey))
        );
    } else {
      await db
        .insert(weekRequirements)
        .values({ semesterId, weekStart: weekKey, required, reason: trimmedReason })
        .onConflictDoUpdate({
          target: [weekRequirements.semesterId, weekRequirements.weekStart],
          set: { required, reason: trimmedReason, updatedAt: new Date() },
        });
    }
    return NextResponse.json({ required, reason: trimmedReason });
  } catch (err) {
    console.error("[attendance/requirements:PUT]", err);
    return NextResponse.json({ error: "Failed to update week requirement." }, { status: 500 });
  }
}
