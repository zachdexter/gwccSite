import { auth } from "@/auth";
import { db } from "@/lib/db";
import { attendanceLogs, semesters, weekRequirements } from "@/lib/db/schema";
import { checkInUnlessRecentQuery, CHECK_IN_COOLDOWN_HOURS } from "@/lib/db/attendance";
import { getWeekBounds, getWeekRequirement } from "@/lib/semester";
import { eq, and, desc, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const activeSemester = await db
      .select()
      .from(semesters)
      .where(eq(semesters.isActive, true))
      .limit(1);

    if (!activeSemester[0]) {
      return NextResponse.json({ error: "No active semester" }, { status: 404 });
    }

    // The check-in page polls this, so only send what it uses: this week's logs (counts,
    // "today", undo) plus anything inside the cooldown window that started last week.
    const now = new Date();
    const { weekStart } = getWeekBounds(now);
    const cooldownStart = new Date(now.getTime() - CHECK_IN_COOLDOWN_HOURS * 60 * 60 * 1000);
    const since = cooldownStart < weekStart ? cooldownStart : weekStart;

    const [logs, overrides] = await Promise.all([
      db
        .select()
        .from(attendanceLogs)
        .where(
          and(
            eq(attendanceLogs.semesterId, activeSemester[0].id),
            gte(attendanceLogs.loggedAt, since)
          )
        ),
      db
        .select()
        .from(weekRequirements)
        .where(eq(weekRequirements.semesterId, activeSemester[0].id)),
    ]);

    const { required: currentWeekRequired } = getWeekRequirement(
      overrides,
      weekStart
    );

    return NextResponse.json({ semester: activeSemester[0], logs, currentWeekRequired });
  } catch (err) {
    console.error("[attendance:GET]", err);
    return NextResponse.json({ error: "Failed to load attendance." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const memberId = Number(body.memberId);
  if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

  try {
    const activeSemester = await db
      .select()
      .from(semesters)
      .where(eq(semesters.isActive, true))
      .limit(1);

    if (!activeSemester[0]) {
      return NextResponse.json({ error: "No active semester" }, { status: 400 });
    }

    const inserted = await db.execute(
      checkInUnlessRecentQuery({
        memberId,
        semesterId: activeSemester[0].id,
        loggedBy: session.user.role,
      })
    );
    const insertedId = (inserted.rows[0] as { id: number } | undefined)?.id;
    if (insertedId === undefined) {
      return NextResponse.json({ error: "cooldown" }, { status: 409 });
    }

    // Re-read through Drizzle so loggedAt is mapped to a proper UTC Date like everywhere else.
    const [log] = await db
      .select()
      .from(attendanceLogs)
      .where(eq(attendanceLogs.id, insertedId));

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    console.error("[attendance:POST]", err);
    return NextResponse.json({ error: "Failed to log attendance." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId } = await req.json();

  try {
    const activeSemester = await db
      .select()
      .from(semesters)
      .where(eq(semesters.isActive, true))
      .limit(1);

    if (!activeSemester[0]) {
      return NextResponse.json({ error: "No active semester" }, { status: 400 });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const recent = await db
      .select()
      .from(attendanceLogs)
      .where(
        and(
          eq(attendanceLogs.memberId, memberId),
          eq(attendanceLogs.semesterId, activeSemester[0].id)
        )
      )
      .orderBy(desc(attendanceLogs.loggedAt))
      .limit(1);

    if (!recent[0] || recent[0].loggedAt < fiveMinutesAgo) {
      return NextResponse.json({ error: "No recent log to undo" }, { status: 400 });
    }

    await db.delete(attendanceLogs).where(eq(attendanceLogs.id, recent[0].id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[attendance:DELETE]", err);
    return NextResponse.json({ error: "Failed to undo attendance." }, { status: 500 });
  }
}
