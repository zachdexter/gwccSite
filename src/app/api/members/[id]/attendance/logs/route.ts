import { auth } from "@/auth";
import { db } from "@/lib/db";
import { attendanceLogs, semesters } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const memberId = parseInt(id);
  if (isNaN(memberId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const { date } = await req.json();
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const allSemesters = await db.select().from(semesters);
  const semester = allSemesters.find((s) => s.startDate <= date && s.endDate >= date);
  if (!semester)
    return NextResponse.json({ error: "No semester covers this date" }, { status: 400 });

  const loggedAt = new Date(`${date}T19:00:00.000Z`);
  const [log] = await db
    .insert(attendanceLogs)
    .values({ memberId, semesterId: semester.id, loggedAt, loggedBy: "president" })
    .returning();

  return NextResponse.json(log, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const memberId = parseInt(id);

  const { logId } = await req.json();
  if (!logId) return NextResponse.json({ error: "logId required" }, { status: 400 });

  const [log] = await db
    .select()
    .from(attendanceLogs)
    .where(eq(attendanceLogs.id, logId));

  if (!log || log.memberId !== memberId)
    return NextResponse.json({ error: "Log not found for this member" }, { status: 400 });

  await db.delete(attendanceLogs).where(eq(attendanceLogs.id, logId));
  return NextResponse.json({ ok: true });
}
