"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAttendanceStatus } from "@/lib/semester";

export type MatrixMember = {
  id: number;
  name: string;
  isSubsidized: boolean;
  weeklyCounts: number[];
};

export type MatrixWeek = { weekStart: string; weekEnd: string };

const statusColor: Record<string, string> = {
  green: "text-emerald-400",
  yellow: "text-yellow-400",
  red: "text-red-400/60",
};

function weekLabel(weekStart: string, weekEnd: string) {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)}–${fmt(end)}`;
}

export function AttendanceMatrix({
  members,
  weeks,
  semesterId,
  pending,
  onAdjust,
}: {
  members: MatrixMember[];
  weeks: MatrixWeek[];
  semesterId: number;
  pending: string | null;
  onAdjust: (member: MatrixMember, weekIndex: number, delta: 1 | -1) => void;
}) {
  if (members.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-12">No active members.</div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-auto">
      <table className="text-sm border-collapse w-full">
        <thead>
          <tr>
            <th className="sticky left-0 bg-card border-b border-r border-border text-left px-4 py-2 text-muted-foreground text-xs font-normal whitespace-nowrap">
              Member
            </th>
            {weeks.map((w, i) => (
              <th
                key={i}
                className="border-b border-border px-3 py-2 text-muted-foreground text-xs font-normal whitespace-nowrap text-center"
              >
                {weekLabel(w.weekStart, w.weekEnd)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-border last:border-0">
              <td className="sticky left-0 bg-card border-r border-border px-4 py-2 whitespace-nowrap">
                <Link
                  href={`/admin/members/${m.id}?semesterId=${semesterId}`}
                  className="text-foreground hover:text-gwcc-gold transition-colors flex items-center gap-2"
                >
                  {m.name}
                  {m.isSubsidized && (
                    <Badge className="bg-gwcc-gold/15 text-gwcc-gold border-gwcc-gold/30 border text-xs">
                      subsidized
                    </Badge>
                  )}
                </Link>
              </td>
              {m.weeklyCounts.map((count, i) => {
                const status = getAttendanceStatus(count, new Date(weeks[i].weekEnd));
                const key = `${m.id}-${i}`;
                const busy = pending === key;
                return (
                  <td key={i} className="px-2 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onAdjust(m, i, -1)}
                        disabled={busy || count <= 0}
                        className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-red-400 disabled:opacity-20 disabled:hover:text-muted-foreground transition-colors text-xs leading-none"
                        aria-label={`Remove a check-in for ${m.name}`}
                      >
                        −
                      </button>
                      <span className={`text-xs w-4 ${statusColor[status]}`}>{count}</span>
                      <button
                        onClick={() => onAdjust(m, i, 1)}
                        disabled={busy}
                        className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-gwcc-gold disabled:opacity-20 transition-colors text-xs leading-none"
                        aria-label={`Add a check-in for ${m.name}`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
