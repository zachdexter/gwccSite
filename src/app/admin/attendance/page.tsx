"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";

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

const COOLDOWN_MS = 2 * 60 * 60 * 1000;
const UNDO_WINDOW_MS = 5 * 60 * 1000;

export default function AttendancePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showMessage(text: string) {
    setMessage(text);
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => setMessage(null), 4000);
  }

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
    const cutoff = new Date(Date.now() - UNDO_WINDOW_MS);
    return logs
      .filter((l) => l.memberId === memberId && new Date(l.loggedAt) > cutoff)
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())[0];
  }

  function isOnCooldown(memberId: number) {
    const cutoff = new Date(Date.now() - COOLDOWN_MS);
    return logs.some((l) => l.memberId === memberId && new Date(l.loggedAt) > cutoff);
  }

  async function logAttendance(member: Member) {
    if (isOnCooldown(member.id)) return;

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
        showMessage(`${member.name} was already checked in recently`);
      } else if (res.status === 400) {
        const data = await res.json().catch(() => null);
        showMessage(data?.error === "No active semester" ? "No active semester — set one in Semesters" : "Failed to log attendance");
      } else {
        showMessage("Failed to log attendance");
      }
      return;
    }

    const realLog: AttendanceLog = await res.json();
    setLogs((prev) => [...prev.filter((l) => l.id !== optimisticLog.id), realLog]);
  }

  async function undoAttendance(member: Member) {
    const res = await fetch("/api/attendance", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: member.id }),
    });

    if (!res.ok) {
      showMessage("Cannot undo — log is too old");
      return;
    }

    const recentLog = getRecentLog(member.id);
    if (recentLog) {
      setLogs((prev) => prev.filter((l) => l.id !== recentLog.id));
    }
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

      {message && (
        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
          {message}
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No members found.</p>
        )}
        {filtered.map((member) => {
          const count = getThisWeekCount(member.id);
          const cooldown = isOnCooldown(member.id);
          const recentLog = getRecentLog(member.id);
          return (
            <div
              key={member.id}
              role="button"
              tabIndex={cooldown ? -1 : 0}
              onClick={() => logAttendance(member)}
              onKeyDown={(e) => {
                if (!cooldown && (e.key === "Enter" || e.key === " ")) logAttendance(member);
              }}
              className={`w-full flex items-center justify-between bg-card border border-border rounded-lg px-4 py-4 transition-all text-left ${
                cooldown ? "" : "hover:border-gwcc-gold/40 hover:bg-muted active:scale-[0.99] cursor-pointer"
              }`}
            >
              <div>
                <span className="text-foreground font-medium">{member.name}</span>
                {member.isSubsidized && (
                  <span className="ml-2 text-xs text-gwcc-gold/70">subsidized</span>
                )}
              </div>
              {recentLog ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    undoAttendance(member);
                  }}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors"
                >
                  Undo
                </button>
              ) : cooldown ? (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  checked in
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
