"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/components/useConfirm";
import { toast } from "sonner";

type Member = {
  id: number;
  name: string;
  email: string | null;
  isSubsidized: boolean;
  isActive: boolean;
};

type MissStat = {
  missedOneDayCount: number;
  missedBothDaysCount: number;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [missStats, setMissStats] = useState<Map<number, MissStat>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubsidized, setIsSubsidized] = useState(false);
  const [query, setQuery] = useState("");
  const { confirm, ConfirmDialog } = useConfirm();

  async function fetchMembers() {
    const res = await fetch("/api/members");
    if (res.ok) setMembers(await res.json());
    setLoading(false);
  }

  async function fetchMissStats() {
    const attRes = await fetch("/api/attendance");
    if (!attRes.ok) return;
    const { semester } = await attRes.json();
    if (!semester) return;
    const summaryRes = await fetch(`/api/attendance/summary?semesterId=${semester.id}`);
    if (!summaryRes.ok) return;
    const { members: summaryMembers } = await summaryRes.json();
    const map = new Map<number, MissStat>();
    for (const m of summaryMembers) map.set(m.id, { missedOneDayCount: m.missedOneDayCount, missedBothDaysCount: m.missedBothDaysCount });
    setMissStats(map);
  }

  useEffect(() => { fetchMembers(); fetchMissStats(); }, []);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, isSubsidized }),
    });

    if (res.ok) {
      const m = await res.json();
      setMembers((prev) => [...prev, m].sort((a, b) => a.name.localeCompare(b.name)));
      setName(""); setEmail(""); setIsSubsidized(false); setShowAdd(false);
      toast.success(`Added ${m.name}`);
    } else {
      toast.error("Failed to add member");
    }
  }

  async function toggleSubsidized(member: Member) {
    const res = await fetch("/api/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, isSubsidized: !member.isSubsidized }),
    });
    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, isSubsidized: !m.isSubsidized } : m))
      );
    }
  }

  async function deactivate(member: Member) {
    if (!(await confirm(`Remove ${member.name} from the active roster?`))) return;
    const res = await fetch("/api/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success(`Removed ${member.name}`);
    }
  }

  const activeMembers = useMemo(() => members.filter((m) => m.isActive), [members]);
  const searchFuse = useMemo(
    () => new Fuse(activeMembers, { keys: ["name"], threshold: 0.4 }),
    [activeMembers]
  );
  const trimmedQuery = query.trim();
  const active = trimmedQuery
    ? searchFuse.search(trimmedQuery).map((r) => r.item)
    : activeMembers;
  const subsidizedCount = members.filter((m) => m.isActive && m.isSubsidized).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {ConfirmDialog}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {members.filter((m) => m.isActive).length} active · {subsidizedCount} subsidized
          </p>
        </div>
        <Button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
        >
          + Add Member
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={addMember} className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h2 className="text-foreground font-semibold">New Member</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-muted border-border text-foreground"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="bg-muted border-border text-foreground"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSubsidized}
              onChange={(e) => setIsSubsidized(e.target.checked)}
              className="accent-gwcc-gold"
            />
            <span className="text-muted-foreground text-sm">Subsidized membership</span>
          </label>
          <div className="flex gap-2">
            <Button type="submit" className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">Add</Button>
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)} className="text-muted-foreground">
              Cancel
            </Button>
          </div>
        </form>
      )}

      <Input
        placeholder="Search members…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-card border-border text-foreground placeholder:text-muted-foreground/60"
      />

      <div className="rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : active.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No members found.</div>
        ) : (
          active.map((member) => {
            const stats = missStats.get(member.id);
            return (
              <div
                key={member.id}
                className="flex items-center justify-between px-4 py-3 border-b border-border hover:bg-muted/40 transition-colors"
              >
                <Link href={`/admin/members/${member.id}`} className="flex flex-col gap-0.5 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground text-sm font-medium">{member.name}</span>
                    {member.isSubsidized && (
                      <Badge className="bg-gwcc-gold/15 text-gwcc-gold border-gwcc-gold/30 border text-xs">
                        subsidized
                      </Badge>
                    )}
                    {member.email && (
                      <span className="text-muted-foreground text-xs hidden sm:block">{member.email}</span>
                    )}
                  </div>
                  {stats && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-yellow-400/70">
                        1-day miss: {stats.missedOneDayCount}
                      </span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-xs text-red-400/70">
                        Both days: {stats.missedBothDaysCount}
                      </span>
                    </div>
                  )}
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSubsidized(member)}
                    className="text-xs text-muted-foreground hover:text-gwcc-gold transition-colors"
                  >
                    {member.isSubsidized ? "Remove subsidy" : "Add subsidy"}
                  </button>
                  <Button
                    variant="destructive"
                    size="xs"
                    onClick={() => deactivate(member)}
                    className="ml-2"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
