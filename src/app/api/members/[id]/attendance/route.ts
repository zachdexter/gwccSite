import { auth } from "@/auth";
import { db } from "@/lib/db";
import { members, semesters, attendanceLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const memberId = parseInt(id);
  if (isNaN(memberId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const [member] = await db.select().from(members).where(eq(members.id, memberId));
    if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [allSemesters, logs] = await Promise.all([
      db.select().from(semesters).orderBy(desc(semesters.createdAt)),
      db
        .select()
        .from(attendanceLogs)
        .where(eq(attendanceLogs.memberId, memberId))
        .orderBy(desc(attendanceLogs.loggedAt)),
    ]);

    const countMap = new Map<number, number>();
    for (const log of logs) {
      countMap.set(log.semesterId, (countMap.get(log.semesterId) ?? 0) + 1);
    }

    const semestersWithCount = allSemesters.map((s) => ({
      ...s,
      attendanceCount: countMap.get(s.id) ?? 0,
    }));

    return NextResponse.json({ member, semesters: semestersWithCount, logs });
  } catch (err) {
    console.error("[members/attendance:GET]", err);
    return NextResponse.json({ error: "Failed to load attendance." }, { status: 500 });
  }
}
