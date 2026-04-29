import { auth } from "@/auth";
import { db } from "@/lib/db";
import { attendanceLogs, semesters } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activeSemester = await db
    .select()
    .from(semesters)
    .where(eq(semesters.isActive, true))
    .limit(1);

  if (!activeSemester[0]) {
    return NextResponse.json({ error: "No active semester" }, { status: 404 });
  }

  const logs = await db
    .select()
    .from(attendanceLogs)
    .where(eq(attendanceLogs.semesterId, activeSemester[0].id));

  return NextResponse.json({ semester: activeSemester[0], logs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId } = await req.json();
  if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

  const activeSemester = await db
    .select()
    .from(semesters)
    .where(eq(semesters.isActive, true))
    .limit(1);

  if (!activeSemester[0]) {
    return NextResponse.json({ error: "No active semester" }, { status: 400 });
  }

  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const recentCheck = await db
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

  if (recentCheck[0] && recentCheck[0].loggedAt > thirtyMinAgo) {
    return NextResponse.json({ error: "cooldown" }, { status: 409 });
  }

  const [log] = await db
    .insert(attendanceLogs)
    .values({
      memberId,
      semesterId: activeSemester[0].id,
      loggedBy: session.user.role,
    })
    .returning();

  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId } = await req.json();

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
}
