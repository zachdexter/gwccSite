import type { Semester, SubsidyChange } from "./db/schema";

// Weeks are Sunday–Saturday in the club's local time. All week math is pinned to this
// zone so the server (UTC on Vercel) and the browser agree on where a week starts.
const CLUB_TIME_ZONE = "America/New_York";

const zoneFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CLUB_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});

// Wall-clock fields of `date` as seen in the club's time zone (month is 1-based).
function zonedParts(date: Date) {
  const parts: Record<string, number> = {};
  for (const p of zoneFormatter.formatToParts(date)) {
    if (p.type !== "literal") parts[p.type] = Number(p.value);
  }
  return parts as { year: number; month: number; day: number; hour: number; minute: number; second: number };
}

// Milliseconds the club's time zone is ahead of UTC at the given instant.
function zoneOffset(date: Date): number {
  const p = zonedParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - (date.getTime() - date.getUTCMilliseconds());
}

// The instant at which the club's wall clock reads the given time. Day may overflow
// (e.g. day 0 or 32) — Date.UTC normalizes it.
function zonedTime(
  year: number,
  monthIndex: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0
): Date {
  const guess = Date.UTC(year, monthIndex, day, hour, minute, second, ms);
  const offset = zoneOffset(new Date(guess));
  let result = guess - offset;
  // Re-check in case the guess and the result straddle a DST change.
  const corrected = zoneOffset(new Date(result));
  if (corrected !== offset) result = guess - corrected;
  return new Date(result);
}

// Semester dates are calendar dates ("YYYY-MM-DD"); read them as days in the club's zone.
function parseClubDate(value: string | Date): { year: number; month: number; day: number } {
  if (typeof value === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (m) return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  }
  return zonedParts(new Date(value));
}

function getWeekBoundsForDay(year: number, month: number, day: number) {
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = Sunday
  const weekStart = zonedTime(year, month - 1, day - dayOfWeek);
  const weekEnd = zonedTime(year, month - 1, day - dayOfWeek + 6, 23, 59, 59, 999);
  return { weekStart, weekEnd };
}

export function getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
  const { year, month, day } = zonedParts(date);
  return getWeekBoundsForDay(year, month, day);
}

export function getSemesterWeeks(
  semester: Pick<Semester, "startDate" | "endDate">
): { weekStart: Date; weekEnd: Date }[] {
  const start = parseClubDate(semester.startDate);
  const end = parseClubDate(semester.endDate);
  const semesterEnd = zonedTime(end.year, end.month - 1, end.day, 23, 59, 59, 999);
  const weeks: { weekStart: Date; weekEnd: Date }[] = [];

  let current = getWeekBoundsForDay(start.year, start.month, start.day);
  while (current.weekStart <= semesterEnd) {
    weeks.push(current);
    // The instant after Saturday 23:59:59.999 is the next Sunday 00:00 — DST-safe.
    current = getWeekBounds(new Date(current.weekEnd.getTime() + 1));
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
  const s = parseClubDate(semester.startDate);
  const e = parseClubDate(semester.endDate);
  const start = zonedTime(s.year, s.month - 1, s.day);
  const end = zonedTime(e.year, e.month - 1, e.day, 23, 59, 59, 999);
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

export const DEFAULT_WEEKLY_REQUIRED = 2;
export const ALLOWED_WEEKLY_REQUIRED = [0, 1, 2] as const;

// "YYYY-MM-DD" for the club-timezone calendar day containing `date`. Used as the key for
// a week's requirement row (the week's Sunday).
export function toClubDateString(date: Date): string {
  const { year, month, day } = zonedParts(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

export type WeekRequirementInfo = { required: number; reason: string | null };

// The requirement for the week starting at `weekStart`, falling back to the default when
// the week has no override row.
export function getWeekRequirement(
  overrides: { weekStart: string; required: number; reason: string | null }[],
  weekStart: Date | string
): WeekRequirementInfo {
  const key = toClubDateString(new Date(weekStart));
  const match = overrides.find((o) => o.weekStart === key);
  return match
    ? { required: match.required, reason: match.reason }
    : { required: DEFAULT_WEEKLY_REQUIRED, reason: null };
}

export type AttendanceStatus = "green" | "yellow" | "red" | "excused";

export function getAttendanceStatus(
  count: number,
  weekEnd: Date,
  required: number = DEFAULT_WEEKLY_REQUIRED
): AttendanceStatus {
  if (required <= 0) return "excused";
  if (count >= required) return "green";
  if (count > 0 && !isWeekClosed(weekEnd)) return "yellow";
  return "red";
}
