"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Member = {
  id: number;
  name: string;
  isSubsidized: boolean;
  isActive: boolean;
};

type AttendanceLog = {
  id: number;
  memberId: number;
  loggedAt: string;
};

export default function AttendancePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingUndo, setPendingUndo] = useState<Record<number, ReturnType<typeof setTimeout>>>({});

  const fetchData = useCallback(async () => {
    const [membersRes, attendanceRes] = await Promise.all([
      fetch("/api/members"),
      fetch("/api/attendance"),
    ]);

    if (membersRes.ok) {
      const data: Member[] = await membersRes.json();
      setMembers(data.filter((m) => m.isActive));
    }

    if (attendanceRes.ok) {
      const data = await attendanceRes.json();
      setLogs(data.logs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  function getThisWeekCount(memberId: number) {
    return logs.filter((l) => {
      const t = new Date(l.loggedAt);
      return l.memberId === memberId && t >= weekStart && t <= weekEnd;
    }).length;
  }

  function getRecentLog(memberId: number) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    return logs
      .filter((l) => l.memberId === memberId && new Date(l.loggedAt) > fiveMinAgo)
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())[0];
  }

  function isOnCooldown(memberId: number) {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    return logs.some((l) => l.memberId === memberId && new Date(l.loggedAt) > thirtyMinAgo);
  }

  async function logAttendance(member: Member) {
    const optimisticLog: AttendanceLog = {
      id: Date.now(),
      memberId: member.id,
      loggedAt: new Date().toISOString(),
    };
    setLogs((prev) => [...prev, optimisticLog]);

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: member.id }),
    });

    if (!res.ok) {
      setLogs((prev) => prev.filter((l) => l.id !== optimisticLog.id));
      if (res.status === 409) {
        toast.error(`${member.name} was already checked in recently`);
      } else if (res.status === 400) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error === "No active semester" ? "No active semester — set one in Semesters" : "Failed to log attendance");
      } else {
        toast.error("Failed to log attendance");
      }
      return;
    }

    const realLog: AttendanceLog = await res.json();
    setLogs((prev) => [...prev.filter((l) => l.id !== optimisticLog.id), realLog]);

    toast.success(`Logged for ${member.name}`, {
      action: {
        label: "Undo",
        onClick: () => undoAttendance(member),
      },
    });
  }

  async function undoAttendance(member: Member) {
    const res = await fetch("/api/attendance", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: member.id }),
    });

    if (!res.ok) {
      toast.error("Cannot undo — log is too old");
      return;
    }

    const recentLog = getRecentLog(member.id);
    if (recentLog) {
      setLogs((prev) => prev.filter((l) => l.id !== recentLog.id));
    }

    toast.success(`Undid log for ${member.name}`);
  }

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return <div className="text-muted-foreground text-center py-20">Loading…</div>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Check-in</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Tap a member to log attendance</p>
      </div>

      <Input
        placeholder="Search by name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="bg-card border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-gwcc-gold text-base h-12"
      />

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No members found.</p>
        )}
        {filtered.map((member) => {
          const count = getThisWeekCount(member.id);
          const cooldown = isOnCooldown(member.id);
          return (
            <button
              key={member.id}
              onClick={() => logAttendance(member)}
              className="w-full flex items-center justify-between bg-card border border-border rounded-lg px-4 py-4 hover:border-gwcc-gold/40 hover:bg-muted active:scale-[0.99] transition-all text-left"
            >
              <div>
                <span className="text-foreground font-medium">{member.name}</span>
                {member.isSubsidized && (
                  <span className="ml-2 text-xs text-gwcc-gold/70">subsidized</span>
                )}
              </div>
              {cooldown ? (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400">
                  recent
                </span>
              ) : (
                <span
                  className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                    count >= 2
                      ? "bg-emerald-500/15 text-emerald-400"
                      : count === 1
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}×
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
