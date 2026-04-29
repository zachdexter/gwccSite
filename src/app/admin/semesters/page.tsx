"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Semester = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type MemberSummary = {
  id: number;
  name: string;
  missedOneDayCount: number;
  missedBothDaysCount: number;
};

type SemesterSummary = {
  totalWeeks: number;
  members: MemberSummary[];
};

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [summaryCache, setSummaryCache] = useState<Map<number, SemesterSummary | "loading">>(new Map());
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function fetchSemesters() {
    const res = await fetch("/api/semesters");
    if (res.ok) setSemesters(await res.json());
  }

  useEffect(() => { fetchSemesters(); }, []);

  async function addSemester(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/semesters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, startDate, endDate }),
    });
    if (res.ok) {
      const s = await res.json();
      setSemesters((prev) => [...prev, s]);
      setName(""); setStartDate(""); setEndDate(""); setShowAdd(false);
      toast.success(`Created ${s.name}`);
    } else {
      toast.error("Failed to create semester");
    }
  }

  async function activate(id: number) {
    const res = await fetch("/api/semesters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, activate: true }),
    });
    if (res.ok) {
      setSemesters((prev) => prev.map((s) => ({ ...s, isActive: s.id === id })));
      toast.success("Semester activated");
    }
  }

  async function toggleExpand(id: number) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (summaryCache.has(id)) return;
    setSummaryCache((prev) => new Map(prev).set(id, "loading"));
    const res = await fetch(`/api/attendance/summary?semesterId=${id}`);
    if (res.ok) {
      const data = await res.json();
      setSummaryCache((prev) => new Map(prev).set(id, { totalWeeks: data.totalWeeks, members: data.members }));
    } else {
      setSummaryCache((prev) => { const m = new Map(prev); m.delete(id); return m; });
    }
  }

  async function deleteSemester(id: number, semName: string) {
    if (!confirm(`Delete ${semName}? This will permanently remove all attendance data for this semester.`)) return;
    const res = await fetch("/api/semesters", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setSemesters((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Deleted ${semName}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gwcc-light">Semesters</h1>
          <p className="text-gwcc-light/50 text-sm mt-0.5">
            Set date ranges for attendance tracking
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
        >
          + New Semester
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={addSemester} className="bg-gwcc-navy border border-white/10 rounded-lg p-4 space-y-4">
          <h2 className="text-gwcc-light font-semibold">New Semester</h2>
          <div className="space-y-1">
            <Label className="text-gwcc-light/70 text-xs">Name (e.g. Fall 2025)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-gwcc-dark border-white/10 text-gwcc-light"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-gwcc-light/70 text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="bg-gwcc-dark border-white/10 text-gwcc-light"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gwcc-light/70 text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="bg-gwcc-dark border-white/10 text-gwcc-light"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">Create</Button>
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)} className="text-gwcc-light/60">
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-white/10 overflow-hidden">
        {semesters.length === 0 ? (
          <div className="text-center py-12 text-gwcc-light/40">No semesters yet.</div>
        ) : (
          [...semesters].reverse().map((semester) => {
            const isExpanded = expandedId === semester.id;
            const summary = summaryCache.get(semester.id);
            const sortedMembers = summary && summary !== "loading"
              ? [...summary.members].sort(
                  (a, b) =>
                    (b.missedOneDayCount + b.missedBothDaysCount) -
                    (a.missedOneDayCount + a.missedBothDaysCount)
                )
              : [];
            return (
              <div key={semester.id} className="border-b border-white/5">
                <div className="flex items-center justify-between px-4 py-4 hover:bg-white/2 transition-colors">
                  <button
                    onClick={() => toggleExpand(semester.id)}
                    className="flex-1 text-left space-y-0.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gwcc-light font-medium">{semester.name}</span>
                      {semester.isActive && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border text-xs">
                          Active
                        </Badge>
                      )}
                      <span className="text-gwcc-light/30 text-xs ml-1">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                    <div className="text-gwcc-light/40 text-xs">
                      {semester.startDate} → {semester.endDate}
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {!semester.isActive && (
                      <button
                        onClick={() => activate(semester.id)}
                        className="text-xs text-gwcc-gold/70 hover:text-gwcc-gold transition-colors"
                      >
                        Activate
                      </button>
                    )}
                    {!semester.isActive && (
                      <button
                        onClick={() => deleteSemester(semester.id, semester.name)}
                        className="text-xs text-gwcc-light/30 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    {summary === "loading" ? (
                      <div className="text-gwcc-light/40 text-sm py-2">Loading summary…</div>
                    ) : summary ? (
                      <div className="rounded-md border border-white/10 overflow-hidden">
                        <div className="px-3 py-2 bg-white/5 text-gwcc-light/50 text-xs flex gap-4">
                          <span>{summary.totalWeeks} weeks tracked</span>
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 text-gwcc-light/40 text-xs">
                              <th className="text-left px-3 py-2">Member</th>
                              <th className="text-center px-3 py-2">Missed 1 Day</th>
                              <th className="text-center px-3 py-2">Missed Both</th>
                              <th className="text-center px-3 py-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedMembers.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="text-center text-gwcc-light/30 text-xs py-4">
                                  No members found
                                </td>
                              </tr>
                            ) : (
                              sortedMembers.map((m) => {
                                const total = m.missedOneDayCount + m.missedBothDaysCount;
                                return (
                                  <tr key={m.id} className="border-b border-white/5 last:border-0">
                                    <td className="px-3 py-2 text-gwcc-light text-xs">
                                    <Link
                                      href={`/admin/members/${m.id}?from=semesters`}
                                      className="hover:text-gwcc-gold transition-colors"
                                    >
                                      {m.name}
                                    </Link>
                                  </td>
                                    <td className="px-3 py-2 text-center text-yellow-400/80 text-xs">
                                      {m.missedOneDayCount}
                                    </td>
                                    <td className="px-3 py-2 text-center text-red-400/80 text-xs">
                                      {m.missedBothDaysCount}
                                    </td>
                                    <td className="px-3 py-2 text-center text-gwcc-light/60 text-xs font-medium">
                                      {total}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-red-400/70 text-xs py-2">Failed to load summary.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
