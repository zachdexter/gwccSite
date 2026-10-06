"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getSemesterWeeks, getAttendanceStatus, getWeekRequirement } from "@/lib/semester";
import { useAdminRole } from "@/components/AdminRoleContext";
import { useConfirm } from "@/components/useConfirm";
import type { Semester } from "@/lib/db/schema";

type Member = {
  id: number;
  name: string;
  email: string | null;
  isSubsidized: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
};

type WeekRequirementRow = {
  semesterId: number;
  weekStart: string;
  required: number;
  reason: string | null;
};

type SemesterWithCount = Semester & { attendanceCount: number };

type AttendanceLog = {
  id: number;
  memberId: number;
  semesterId: number;
  loggedAt: string;
  loggedBy: string;
};

function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const semesterId = searchParams.get("semesterId");
  const backHref = semesterId ? `/admin/members?semesterId=${semesterId}` : "/admin/members";
  const backLabel = "← Members";
  const [member, setMember] = useState<Member | null>(null);
  const [semesters, setSemesters] = useState<SemesterWithCount[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [requirements, setRequirements] = useState<WeekRequirementRow[]>([]);
  const role = useAdminRole();
  const [loading, setLoading] = useState(true);
  const [addDate, setAddDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    async function load() {
      const dataRes = await fetch(`/api/members/${id}/attendance`);
      if (dataRes.ok) {
        const data = await dataRes.json();
        setMember(data.member);
        setSemesters(data.semesters);
        setLogs(data.logs);
        setRequirements(data.requirements ?? []);
        setName(data.member.name);
        setNotes(data.member.notes ?? "");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Name can't be empty");
      return;
    }
    setSavingDetails(true);
    const res = await fetch("/api/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(id), name: trimmedName, notes }),
    });
    setSavingDetails(false);
    if (res.ok) {
      const updated: Member = await res.json();
      setMember(updated);
      setName(updated.name);
      toast.success("Saved");
    } else {
      toast.error("Failed to save");
    }
  }

  async function toggleSubsidized() {
    if (!member) return;
    setUpdatingStatus(true);
    const res = await fetch("/api/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, isSubsidized: !member.isSubsidized }),
    });
    setUpdatingStatus(false);
    if (res.ok) {
      const updated: Member = await res.json();
      setMember(updated);
      toast.success(updated.isSubsidized ? "Subsidy added" : "Subsidy removed");
    } else {
      toast.error("Failed to update subsidy status");
    }
  }

  async function removeMember() {
    if (!member) return;
    if (!(await confirm(`Remove ${member.name} from the active roster?`))) return;
    setUpdatingStatus(true);
    const res = await fetch("/api/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id }),
    });
    setUpdatingStatus(false);
    if (res.ok) {
      toast.success(`Removed ${member.name}`);
      router.push(backHref);
    } else {
      toast.error("Failed to remove member");
    }
  }

  async function addLog(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/members/${id}/attendance/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: addDate }),
    });
    setSaving(false);
    if (res.ok) {
      const log: AttendanceLog = await res.json();
      setLogs((prev) => [log, ...prev]);
      setSemesters((prev) =>
        prev.map((s) =>
          s.id === log.semesterId ? { ...s, attendanceCount: s.attendanceCount + 1 } : s
        )
      );
      toast.success("Log added");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to add log");
    }
  }

  async function removeLog(log: AttendanceLog) {
    setLogs((prev) => prev.filter((l) => l.id !== log.id));
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === log.semesterId
          ? { ...s, attendanceCount: Math.max(0, s.attendanceCount - 1) }
          : s
      )
    );
    const res = await fetch(`/api/members/${id}/attendance/logs`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logId: log.id }),
    });
    if (res.ok) {
      toast.success("Log removed");
    } else {
      setLogs((prev) =>
        [log, ...prev].sort(
          (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
        )
      );
      setSemesters((prev) =>
        prev.map((s) =>
          s.id === log.semesterId ? { ...s, attendanceCount: s.attendanceCount + 1 } : s
        )
      );
      toast.error("Failed to remove log");
    }
  }

  const activeSemester = semesters.find((s) => s.isActive);
  const activeLogs = activeSemester
    ? logs.filter((l) => l.semesterId === activeSemester.id)
    : [];
  const weeks = activeSemester ? getSemesterWeeks(activeSemester) : [];
  const activeRequirements = activeSemester
    ? requirements.filter((r) => r.semesterId === activeSemester.id)
    : [];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-muted-foreground">
        Member not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {ConfirmDialog}
      <Link
        href={backHref}
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        {backLabel}
      </Link>

      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-foreground">{member.name}</h1>
          {member.isSubsidized && (
            <Badge className="bg-gwcc-gold/15 text-gwcc-gold border-gwcc-gold/30 border text-xs">
              subsidized
            </Badge>
          )}
          {!member.isActive && (
            <Badge className="bg-red-500/15 text-red-400 border-red-400/30 border text-xs">
              inactive
            </Badge>
          )}
        </div>
        {member.email && (
          <p className="text-muted-foreground text-sm">{member.email}</p>
        )}
        <p className="text-muted-foreground text-xs">
          Joined{" "}
          {new Date(member.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {role != null && (
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          <form onSubmit={saveDetails} className="p-4 space-y-3">
            <h2 className="text-card-foreground font-semibold text-sm">Details</h2>
            <div className="space-y-1">
              <label htmlFor="member-name" className="text-muted-foreground text-xs">
                Name
              </label>
              <Input
                id="member-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-muted border-border text-foreground text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="member-notes" className="text-muted-foreground text-xs">
                Notes
              </label>
              <textarea
                id="member-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything worth remembering about this member…"
                className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={savingDetails}
              className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold h-8 text-xs px-3"
            >
              {savingDetails ? "Saving…" : "Save"}
            </Button>
          </form>
          <div className="p-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={toggleSubsidized}
              disabled={updatingStatus}
              className="h-8 text-xs"
            >
              {member.isSubsidized ? "Remove subsidy" : "Add subsidy"}
            </Button>
            {member.isActive && (
              <Button
                type="button"
                variant="destructive"
                onClick={removeMember}
                disabled={updatingStatus}
                className="h-8 text-xs"
              >
                Remove from roster
              </Button>
            )}
          </div>
        </div>
      )}

      {activeSemester ? (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-card-foreground font-semibold text-sm">
              {activeSemester.name}
            </h2>
            <span className="text-muted-foreground text-xs">
              {activeSemester.attendanceCount} sessions
            </span>
          </div>
          <div className="space-y-1.5">
            {weeks.map(({ weekStart, weekEnd }, i) => {
              const count = activeLogs.filter(
                (l) =>
                  new Date(l.loggedAt) >= weekStart &&
                  new Date(l.loggedAt) <= weekEnd
              ).length;
              const { required, reason } = getWeekRequirement(activeRequirements, weekStart);
              const status = getAttendanceStatus(count, weekEnd, required);
              const color =
                status === "green"
                  ? "text-emerald-400"
                  : status === "yellow"
                  ? "text-yellow-400"
                  : status === "excused"
                  ? "text-muted-foreground"
                  : "text-red-400/60";
              const label =
                weekStart.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }) +
                "–" +
                weekEnd.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className={`text-xs ${color}`}>●</span>
                  <span className="text-muted-foreground text-xs w-28">{label}</span>
                  <span className={`text-xs ${color}`}>
                    {required === 0 ? `${count} · no requirement` : `${count}/${required}`}
                  </span>
                  {reason && <span className="text-muted-foreground text-xs truncate">{reason}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-4 text-muted-foreground text-sm">
          No active semester.
        </div>
      )}

      {semesters.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border">
            <h2 className="text-foreground font-semibold text-sm">
              Attendance by Semester
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2 text-muted-foreground text-xs font-normal">
                  Semester
                </th>
                <th className="text-right px-4 py-2 text-muted-foreground text-xs font-normal">
                  Sessions
                </th>
                <th className="text-right px-4 py-2 text-muted-foreground text-xs font-normal hidden sm:table-cell">
                  Date Range
                </th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-foreground text-sm">
                    <div className="flex items-center gap-2">
                      {s.name}
                      {s.isActive && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-400/30 border text-xs">
                          active
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-sm text-right">
                    {s.attendanceCount}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs text-right hidden sm:table-cell">
                    {new Date(s.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    –
                    {new Date(s.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <h2 className="text-foreground font-semibold text-sm">All Logs</h2>
          <span className="text-muted-foreground text-xs">{logs.length} total</span>
        </div>

        {role != null && (
          <form
            onSubmit={addLog}
            className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted"
          >
            <Input
              type="date"
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              className="bg-card border-border text-foreground text-sm h-8 w-40"
            />
            <Button
              type="submit"
              disabled={saving}
              className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold h-8 text-xs px-3"
            >
              {saving ? "Adding…" : "+ Add Log"}
            </Button>
          </form>
        )}

        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No attendance logs.
          </div>
        ) : (
          logs.map((log) => {
            const d = new Date(log.loggedAt);
            return (
              <div
                key={log.id}
                className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-4">
                  <span className="text-foreground text-sm">
                    {d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {d.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-muted-foreground text-xs">{log.loggedBy}</span>
                </div>
                {role != null && (
                  <button
                    onClick={() => removeLog(log)}
                    className="text-muted-foreground hover:text-red-400 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <MemberDetailPage />
    </Suspense>
  );
}
