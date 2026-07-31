export const WEEKDAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

export function sortPracticeTimes<T extends { day: string; startTime: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const dayDiff = WEEKDAYS.indexOf(a.day as (typeof WEEKDAYS)[number]) -
      WEEKDAYS.indexOf(b.day as (typeof WEEKDAYS)[number]);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });
}
