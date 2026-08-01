import { auth } from "@/auth";
import { db } from "@/lib/db";
import { attendanceLogs } from "@/lib/db/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId, semesterId, weekStart } = await req.json();
  if (!memberId || !semesterId || !weekStart) {
    return NextResponse.json({ error: "memberId, semesterId, weekStart required" }, { status: 400 });
  }

  const loggedAt = new Date(weekStart);
  loggedAt.setDate(loggedAt.getDate() + 3);
  loggedAt.setHours(19, 0, 0, 0);

  const [log] = await db
    .insert(attendanceLogs)
    .values({ memberId, semesterId, loggedAt, loggedBy: session.user.role })
    .returning();

  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId, semesterId, weekStart, weekEnd } = await req.json();
  if (!memberId || !semesterId || !weekStart || !weekEnd) {
    return NextResponse.json({ error: "memberId, semesterId, weekStart, weekEnd required" }, { status: 400 });
  }

  const [mostRecent] = await db
    .select()
    .from(attendanceLogs)
    .where(
      and(
        eq(attendanceLogs.memberId, memberId),
        eq(attendanceLogs.semesterId, semesterId),
        gte(attendanceLogs.loggedAt, new Date(weekStart)),
        lte(attendanceLogs.loggedAt, new Date(weekEnd))
      )
    )
    .orderBy(desc(attendanceLogs.loggedAt))
    .limit(1);

  if (!mostRecent) {
    return NextResponse.json({ error: "No log to remove for this week" }, { status: 400 });
  }

  await db.delete(attendanceLogs).where(eq(attendanceLogs.id, mostRecent.id));
  return NextResponse.json({ ok: true });
}
