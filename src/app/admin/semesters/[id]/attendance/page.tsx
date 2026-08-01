"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAttendanceStatus } from "@/lib/semester";

type MatrixMember = {
  id: number;
  name: string;
  isSubsidized: boolean;
  weeklyCounts: number[];
};

type MatrixData = {
  semester: { id: number; name: string; startDate: string; endDate: string };
  weeks: { weekStart: string; weekEnd: string }[];
  members: MatrixMember[];
};

function weekLabel(weekStart: string, weekEnd: string) {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)}–${fmt(end)}`;
}

const statusColor: Record<string, string> = {
  green: "text-emerald-400",
  yellow: "text-yellow-400",
  red: "text-red-400/60",
};

export default function AttendanceMatrixPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/attendance/matrix?semesterId=${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  function setCount(memberId: number, weekIndex: number, count: number) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                weeklyCounts: m.weeklyCounts.map((c, i) => (i === weekIndex ? count : c)),
              }
            : m
        ),
      };
    });
  }

  async function adjustCell(member: MatrixMember, weekIndex: number, delta: 1 | -1) {
    if (!data) return;
    const key = `${member.id}-${weekIndex}`;
    if (pending === key) return;
    setPending(key);

    const week = data.weeks[weekIndex];
    const currentCount = member.weeklyCounts[weekIndex];

    if (delta === -1 && currentCount <= 0) {
      setPending(null);
      return;
    }

    const res = await fetch("/api/attendance/cell", {
      method: delta === 1 ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: member.id,
        semesterId: data.semester.id,
        weekStart: week.weekStart,
        weekEnd: week.weekEnd,
      }),
    });

    if (res.ok) {
      setCount(member.id, weekIndex, currentCount + delta);
    } else {
      const err = await res.json().catch(() => null);
      toast.error(err?.error ?? "Failed to update attendance");
    }

    setPending(null);
  }

  if (loading) {
    return <div className="text-muted-foreground text-center py-20">Loading…</div>;
  }

  if (!data) {
    return <div className="text-muted-foreground text-center py-20">Semester not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link
        href="/admin/semesters"
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        ← Semesters
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground">{data.semester.name} — Attendance</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {data.members.length} active members · {data.weeks.length} weeks tracked · click +/− to amend
        </p>
      </div>

      <div className="rounded-lg border border-border overflow-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-card border-b border-r border-border text-left px-4 py-2 text-muted-foreground text-xs font-normal whitespace-nowrap">
                Member
              </th>
              {data.weeks.map((w, i) => (
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
            {data.members.length === 0 ? (
              <tr>
                <td colSpan={data.weeks.length + 1} className="text-center text-muted-foreground text-sm py-8">
                  No active members.
                </td>
              </tr>
            ) : (
              data.members.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="sticky left-0 bg-card border-r border-border px-4 py-2 whitespace-nowrap">
                    <Link
                      href={`/admin/members/${m.id}`}
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
                    const status = getAttendanceStatus(count, new Date(data.weeks[i].weekEnd));
                    const key = `${m.id}-${i}`;
                    const busy = pending === key;
                    return (
                      <td key={i} className="px-2 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => adjustCell(m, i, -1)}
                            disabled={busy || count <= 0}
                            className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-red-400 disabled:opacity-20 disabled:hover:text-muted-foreground transition-colors text-xs leading-none"
                            aria-label={`Remove a check-in for ${m.name}`}
                          >
                            −
                          </button>
                          <span className={`text-xs w-4 ${statusColor[status]}`}>{count}</span>
                          <button
                            onClick={() => adjustCell(m, i, 1)}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
