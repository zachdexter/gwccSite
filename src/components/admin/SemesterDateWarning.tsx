"use client";

import { isDateWithinSemester } from "@/lib/semester";

type Props = {
  semester: { name: string; startDate: string; endDate: string } | null;
};

export function SemesterDateWarning({ semester }: Props) {
  if (!semester || isDateWithinSemester(semester)) return null;

  const isBefore = new Date() < new Date(semester.startDate);

  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md border-2 border-red-500 bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-500 animate-pulse shrink-0"
    >
      <span className="text-lg leading-none">⚠️</span>
      <span>
        &quot;{semester.name}&quot; is active but today is {isBefore ? "before" : "after"} its date
        range ({semester.startDate} – {semester.endDate}). Activate the right semester or create a
        new one — check-ins logged now may not show up correctly.
      </span>
    </div>
  );
}
