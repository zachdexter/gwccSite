import type { Semester, SubsidyChange } from "./db/schema";

export function getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}

export function getSemesterWeeks(
  semester: Semester
): { weekStart: Date; weekEnd: Date }[] {
  const start = new Date(semester.startDate);
  const end = new Date(semester.endDate);
  const weeks: { weekStart: Date; weekEnd: Date }[] = [];

  const { weekStart: firstSunday } = getWeekBounds(start);
  let current = new Date(firstSunday);

  while (current <= end) {
    const { weekStart, weekEnd } = getWeekBounds(current);
    weeks.push({ weekStart, weekEnd });
    current = new Date(weekStart);
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

export function isWeekClosed(weekEnd: Date): boolean {
  return weekEnd < new Date();
}

export function isDateWithinSemester(
  semester: Pick<Semester, "startDate" | "endDate">,
  date: Date = new Date()
): boolean {
  const start = new Date(semester.startDate);
  const end = new Date(semester.endDate);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
}

export function getEffectiveSubsidyStatus(
  changes: Pick<SubsidyChange, "isSubsidized" | "changedAt">[],
  asOf: Date
): boolean {
  const applicable = changes
    .filter((c) => new Date(c.changedAt) <= asOf)
    .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
  return applicable[0]?.isSubsidized ?? false;
}

export function getAttendanceStatus(
  count: number,
  weekEnd: Date
): "green" | "yellow" | "red" {
  if (count >= 2) return "green";
  if (count === 1 && !isWeekClosed(weekEnd)) return "yellow";
  return "red";
}
