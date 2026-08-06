import { auth } from "@/auth";
import { db } from "@/lib/db";
import { attendanceLogs, members, semesters } from "@/lib/db/schema";
import { getSemesterWeeks, getWeekBounds } from "@/lib/semester";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const semesterId = Number(searchParams.get("semesterId"));
  if (!semesterId) return NextResponse.json({ error: "semesterId required" }, { status: 400 });

  try {
    const [semester] = await db
      .select()
      .from(semesters)
      .where(eq(semesters.id, semesterId))
      .limit(1);

    if (!semester) return NextResponse.json({ error: "Semester not found" }, { status: 404 });

    const allMembers = await db
      .select()
      .from(members)
      .where(eq(members.isActive, true))
      .orderBy(members.name);

    const logs = await db
      .select()
      .from(attendanceLogs)
      .where(eq(attendanceLogs.semesterId, semesterId));

    const allWeeks = getSemesterWeeks(semester);
    const now = new Date();
    const { weekStart: currentWeekStart } = getWeekBounds(now);
    // Only count weeks that have started
    const weeks = allWeeks.filter((w) => w.weekStart <= currentWeekStart);

    const result = allMembers.map((member) => {
      const memberLogs = logs.filter((l) => l.memberId === member.id);
      let missedOneDayCount = 0;
      let missedBothDaysCount = 0;

      for (const { weekStart, weekEnd } of weeks) {
        const count = memberLogs.filter(
          (l) => l.loggedAt >= weekStart && l.loggedAt <= weekEnd
        ).length;
        if (count === 0) missedBothDaysCount++;
        else if (count === 1) missedOneDayCount++;
      }

      return { id: member.id, name: member.name, missedOneDayCount, missedBothDaysCount };
    });

    return NextResponse.json({
      semester: { id: semester.id, name: semester.name, startDate: semester.startDate, endDate: semester.endDate },
      totalWeeks: weeks.length,
      members: result,
    });
  } catch (err) {
    console.error("[attendance/summary:GET]", err);
    return NextResponse.json({ error: "Failed to load attendance summary." }, { status: 500 });
  }
}
