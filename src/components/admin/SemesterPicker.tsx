"use client";

import { ChevronDown } from "lucide-react";

export type Semester = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export function SemesterPicker({
  semesters,
  selectedId,
  onOpen,
}: {
  semesters: Semester[];
  selectedId: number | null;
  onOpen: () => void;
}) {
  const selected = semesters.find((s) => s.id === selectedId);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-2 h-9 px-3 rounded-md bg-card border border-border text-foreground text-sm hover:border-gwcc-gold/40 transition-colors"
    >
      <span className="truncate max-w-[10rem]">{selected ? selected.name : "No semesters"}</span>
      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}
