"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
const DUPLICATE_SCORE_THRESHOLD = 0.3;

export default function AttendancePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState<Member | null>(null);
  const [pendingNewName, setPendingNewName] = useState("");
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [newMemberNameInput, setNewMemberNameInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [membersRes, attendanceRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/attendance"),
      ]);

      if (!membersRes.ok || !attendanceRes.ok) throw new Error("Failed to load");

      const membersData: Member[] = await membersRes.json();
      setMembers(membersData.filter((m) => m.isActive));

      const attendanceData = await attendanceRes.json();
      setLogs(attendanceData.logs ?? []);
      setLoadError(false);
    } catch {
      setLoadError(true);
      toast.error("Couldn't load check-in data — check your connection", {
        duration: Infinity,
        action: { label: "Retry", onClick: () => fetchData() },
      });
    } finally {
      setLoading(false);
    }
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

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  function getThisWeekCount(memberId: number) {
    return logs.filter((l) => {
      const t = new Date(l.loggedAt);
      return l.memberId === memberId && t >= weekStart && t <= weekEnd;
    }).length;
  }

  const todayCount = logs.filter((l) => {
    const t = new Date(l.loggedAt);
    return t >= todayStart && t <= todayEnd;
  }).length;

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

  function refocusSearch() {
    inputRef.current?.focus();
  }

  async function logAttendance(member: Member) {
    if (isOnCooldown(member.id)) return;

    const optimisticLog: AttendanceLog = {
      id: Date.now(),
      memberId: member.id,
      loggedAt: new Date().toISOString(),
    };
    setLogs((prev) => [...prev, optimisticLog]);
    refocusSearch();

    let res: Response;
    try {
      res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });
    } catch {
      setLogs((prev) => prev.filter((l) => l.id !== optimisticLog.id));
      toast.error(`${member.name}'s check-in didn't save — retry?`, {
        action: { label: "Retry", onClick: () => logAttendance(member) },
      });
      return;
    }

    if (!res.ok) {
      setLogs((prev) => prev.filter((l) => l.id !== optimisticLog.id));
      if (res.status === 409) {
        toast.warning(`${member.name} was already checked in recently`);
      } else if (res.status === 400) {
        const data = await res.json().catch(() => null);
        toast.error(
          data?.error === "No active semester"
            ? "No active semester — set one in Semesters"
            : "Failed to log attendance"
        );
      } else {
        toast.error(`${member.name}'s check-in didn't save — retry?`, {
          action: { label: "Retry", onClick: () => logAttendance(member) },
        });
      }
      return;
    }

    const realLog: AttendanceLog = await res.json();
    setLogs((prev) => [...prev.filter((l) => l.id !== optimisticLog.id), realLog]);
  }

  async function undoAttendance(member: Member) {
    refocusSearch();
    try {
      const res = await fetch("/api/attendance", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });

      if (!res.ok) {
        toast.error("Cannot undo — log is too old");
        return;
      }
    } catch {
      toast.error("Undo didn't go through — retry?", {
        action: { label: "Retry", onClick: () => undoAttendance(member) },
      });
      return;
    }

    const recentLog = getRecentLog(member.id);
    if (recentLog) {
      setLogs((prev) => prev.filter((l) => l.id !== recentLog.id));
    }
  }

  async function createMember(name: string) {
    setCreatingMember(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create member");
      const member: Member = await res.json();
      setMembers((prev) => [...prev, member].sort((a, b) => a.name.localeCompare(b.name)));
      setQuery("");
      setConfirmDuplicate(null);
      setPendingNewName("");
      setAddMemberDialogOpen(false);
      setNewMemberNameInput("");
      refocusSearch();
      await logAttendance(member);
    } catch {
      toast.error(`Couldn't add ${name} — retry?`, {
        action: { label: "Retry", onClick: () => createMember(name) },
      });
    } finally {
      setCreatingMember(false);
    }
  }

  const searchFuse = useMemo(
    () => new Fuse(members, { keys: ["name"], threshold: 0.4 }),
    [members]
  );

  const duplicateFuse = useMemo(
    () => new Fuse(members, { keys: ["name"], threshold: 0.6, includeScore: true }),
    [members]
  );

  const trimmedQuery = query.trim();
  const filtered = trimmedQuery
    ? searchFuse.search(trimmedQuery).map((r) => r.item)
    : members;

  function attemptAddMember(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const [closest] = duplicateFuse.search(trimmed);
    if (closest && (closest.score ?? 1) < DUPLICATE_SCORE_THRESHOLD) {
      setPendingNewName(trimmed);
      setConfirmDuplicate(closest.item);
      setAddMemberDialogOpen(false);
    } else {
      createMember(trimmed);
    }
  }

  function handleBottomAddClick() {
    if (trimmedQuery) {
      attemptAddMember(trimmedQuery);
    } else {
      setNewMemberNameInput("");
      setAddMemberDialogOpen(true);
    }
  }

  if (loading) {
    return <div className="text-muted-foreground text-center py-20">Loading…</div>;
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-4.5rem)]">
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">Check-in</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Tap a member to log attendance</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1.5 rounded-full bg-gwcc-gold/15 text-gwcc-gold whitespace-nowrap">
          {todayCount} today
        </span>
      </div>

      <Input
        ref={inputRef}
        placeholder="Search by name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="bg-card border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-gwcc-gold text-base h-12 mt-3 shrink-0"
      />

      {loadError && (
        <p className="text-xs text-destructive mt-2 shrink-0">
          Showing possibly stale data — connection issue.
        </p>
      )}

      <div className="flex-1 overflow-y-auto mt-3 space-y-2 pb-2">
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No members found.</p>
        )}
        {filtered.map((member) => {
          const count = getThisWeekCount(member.id);
          const cooldown = isOnCooldown(member.id);
          const recentLog = getRecentLog(member.id);
          return (
            <button
              key={member.id}
              type="button"
              disabled={cooldown && !recentLog}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => logAttendance(member)}
              className={`w-full flex items-center justify-between bg-card border border-border rounded-lg px-4 py-5 transition-all text-left ${
                cooldown && !recentLog
                  ? ""
                  : "hover:border-gwcc-gold/40 hover:bg-muted active:scale-[0.99] cursor-pointer"
              }`}
            >
              <div>
                <span className="text-foreground font-medium text-base">{member.name}</span>
                {member.isSubsidized && (
                  <span className="ml-2 text-xs text-gwcc-gold/70">subsidized</span>
                )}
              </div>
              {recentLog ? (
                <span
                  role="button"
                  tabIndex={0}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    undoAttendance(member);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      undoAttendance(member);
                    }
                  }}
                  className="text-sm font-medium px-4 py-2 rounded-full bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 transition-colors"
                >
                  Undo
                </span>
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
            </button>
          );
        })}

        <Button
          type="button"
          variant="outline"
          disabled={creatingMember}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleBottomAddClick}
          className="w-full border-gwcc-gold/40 text-gwcc-gold hover:bg-gwcc-gold/10 h-12"
        >
          {trimmedQuery
            ? `Can't find "${trimmedQuery}"? Add as new member`
            : "Can't find someone? Add a new member"}
        </Button>
      </div>

      <Dialog
        open={!!confirmDuplicate}
        onOpenChange={(open) => !open && setConfirmDuplicate(null)}
      >
        <DialogContent className="bg-popover border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">Did you mean an existing member?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            &ldquo;{pendingNewName}&rdquo; looks similar to{" "}
            <span className="text-foreground font-medium">{confirmDuplicate?.name}</span>, who&apos;s
            already on the roster.
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              onClick={() => {
                if (confirmDuplicate) {
                  logAttendance(confirmDuplicate);
                  setConfirmDuplicate(null);
                  setPendingNewName("");
                  setQuery("");
                  refocusSearch();
                }
              }}
              className="w-full"
            >
              That&apos;s them, check in
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={creatingMember}
              onClick={() => createMember(pendingNewName)}
              className="w-full"
            >
              No, add as new member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="bg-popover border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">Add a new member</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Full name"
            value={newMemberNameInput}
            onChange={(e) => setNewMemberNameInput(e.target.value)}
            autoFocus
            className="bg-card border-border text-foreground text-base h-12"
            onKeyDown={(e) => {
              if (e.key === "Enter") attemptAddMember(newMemberNameInput);
            }}
          />
          <DialogFooter>
            <Button
              type="button"
              disabled={!newMemberNameInput.trim() || creatingMember}
              onClick={() => attemptAddMember(newMemberNameInput)}
              className="w-full"
            >
              Add member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
