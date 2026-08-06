import { auth } from "@/auth";
import { db } from "@/lib/db";
import { attendanceLogs, members, semesters, subsidyChanges } from "@/lib/db/schema";
import { getEffectiveSubsidyStatus, getSemesterWeeks } from "@/lib/semester";
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

    const [allMembers, logs, allSubsidyChanges] = await Promise.all([
      db.select().from(members).where(eq(members.isActive, true)).orderBy(members.name),
      db.select().from(attendanceLogs).where(eq(attendanceLogs.semesterId, semesterId)),
      db.select().from(subsidyChanges),
    ]);

    const weeks = getSemesterWeeks(semester);
    const semesterStart = new Date(semester.startDate);

    const memberResults = allMembers.map((member) => {
      const memberLogs = logs.filter((l) => l.memberId === member.id);
      const weeklyCounts = weeks.map(
        ({ weekStart, weekEnd }) =>
          memberLogs.filter((l) => l.loggedAt >= weekStart && l.loggedAt <= weekEnd).length
      );
      const memberChanges = allSubsidyChanges.filter((c) => c.memberId === member.id);

      return {
        id: member.id,
        name: member.name,
        isSubsidized: getEffectiveSubsidyStatus(memberChanges, semesterStart),
        weeklyCounts,
      };
    });

    return NextResponse.json({
      semester: {
        id: semester.id,
        name: semester.name,
        startDate: semester.startDate,
        endDate: semester.endDate,
      },
      weeks,
      members: memberResults,
    });
  } catch (err) {
    console.error("[attendance/matrix:GET]", err);
    return NextResponse.json({ error: "Failed to load attendance matrix." }, { status: 500 });
  }
}
