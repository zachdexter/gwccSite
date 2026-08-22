"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWeekBounds } from "@/lib/semester";
import { MemberGrid, type GridMember } from "@/components/admin/MemberGrid";
import { AttendanceMatrix, type MatrixMember, type MatrixWeek } from "@/components/admin/AttendanceMatrix";
import { SemesterPicker, type Semester } from "@/components/admin/SemesterPicker";
import { SemesterManageSheet } from "@/components/admin/SemesterManageSheet";
import { AddMemberDialog, type NewMember } from "@/components/admin/AddMemberDialog";
import { MemberActionsDialog } from "@/components/admin/MemberActionsDialog";

type MatrixData = {
  semester: { id: number; name: string; startDate: string; endDate: string };
  weeks: MatrixWeek[];
  members: MatrixMember[];
};

function MembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySemesterId = searchParams.get("semesterId");

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semestersLoaded, setSemestersLoaded] = useState(false);
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "matrix">("grid");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [actionsMember, setActionsMember] = useState<GridMember | null>(null);

  const selectedSemesterId = querySemesterId ? Number(querySemesterId) : null;

  const setSelectedSemesterId = useCallback(
    (id: number) => {
      router.replace(`/admin/members?semesterId=${id}`);
    },
    [router]
  );

  // Load semesters once, then default to the active one if no semester is selected yet.
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/semesters");
      if (res.ok) {
        const data: Semester[] = await res.json();
        setSemesters(data);
        if (!querySemesterId) {
          const active = data.find((s) => s.isActive) ?? data[data.length - 1];
          if (active) setSelectedSemesterId(active.id);
        }
      }
      setSemestersLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch the combined roster + attendance matrix whenever the selected semester changes.
  useEffect(() => {
    if (!selectedSemesterId) return;
    async function load() {
      setMatrixLoading(true);
      const res = await fetch(`/api/attendance/matrix?semesterId=${selectedSemesterId}`);
      setMatrixData(res.ok ? await res.json() : null);
      setMatrixLoading(false);
    }
    load();
  }, [selectedSemesterId]);

  function setCount(memberId: number, weekIndex: number, count: number) {
    setMatrixData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map((m) =>
          m.id === memberId
            ? { ...m, weeklyCounts: m.weeklyCounts.map((c, i) => (i === weekIndex ? count : c)) }
            : m
        ),
      };
    });
  }

  async function adjustCell(member: MatrixMember, weekIndex: number, delta: 1 | -1) {
    if (!matrixData) return;
    const key = `${member.id}-${weekIndex}`;
    if (pending === key) return;
    setPending(key);

    const week = matrixData.weeks[weekIndex];
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
        semesterId: matrixData.semester.id,
        weekStart: week.weekStart,
        weekEnd: week.weekEnd,
      }),
    });

    if (res.ok) {
      setCount(member.id, weekIndex, currentCount + delta);
    }

    setPending(null);
  }

  function handleMemberAdded(m: NewMember) {
    setMatrixData((prev) => {
      if (!prev) return prev;
      const newMatrixMember: MatrixMember = {
        id: m.id,
        name: m.name,
        isSubsidized: m.isSubsidized,
        weeklyCounts: prev.weeks.map(() => 0),
      };
      return {
        ...prev,
        members: [...prev.members, newMatrixMember].sort((a, b) => a.name.localeCompare(b.name)),
      };
    });
  }

  function handleSubsidyToggled(memberId: number) {
    setMatrixData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.map((m) =>
          m.id === memberId ? { ...m, isSubsidized: !m.isSubsidized } : m
        ),
      };
    });
  }

  function handleMemberRemoved(memberId: number) {
    setMatrixData((prev) => {
      if (!prev) return prev;
      return { ...prev, members: prev.members.filter((m) => m.id !== memberId) };
    });
  }

  const { weekStart: currentWeekStart, weekEnd: currentWeekEnd } = useMemo(
    () => getWeekBounds(new Date()),
    []
  );

  const currentWeekIndex = useMemo(() => {
    if (!matrixData) return -1;
    return matrixData.weeks.findIndex(
      (w) => new Date(w.weekStart).getTime() === currentWeekStart.getTime()
    );
  }, [matrixData, currentWeekStart]);

  const gridMembers: GridMember[] = useMemo(() => {
    if (!matrixData) return [];
    return matrixData.members.map((m) => ({
      id: m.id,
      name: m.name,
      isSubsidized: m.isSubsidized,
      currentWeekCount: currentWeekIndex >= 0 ? m.weeklyCounts[currentWeekIndex] : 0,
    }));
  }, [matrixData, currentWeekIndex]);

  const searchFuse = useMemo(
    () => new Fuse(gridMembers, { keys: ["name"], threshold: 0.4 }),
    [gridMembers]
  );
  const trimmedQuery = query.trim();
  const filteredGridMembers = trimmedQuery
    ? searchFuse.search(trimmedQuery).map((r) => r.item)
    : gridMembers;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {matrixData ? `${matrixData.members.length} active · ${matrixData.semester.name}` : "Roster & attendance"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SemesterPicker
            semesters={semesters}
            selectedId={selectedSemesterId}
            onOpen={() => setManageOpen(true)}
          />
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
          >
            + Add Member
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === "grid" ? "bg-gwcc-gold text-gwcc-dark font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("matrix")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === "matrix" ? "bg-gwcc-gold text-gwcc-dark font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Matrix
          </button>
        </div>
        {viewMode === "grid" && (
          <Input
            placeholder="Search members…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground/60 max-w-xs"
          />
        )}
      </div>

      {!semestersLoaded || matrixLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : !selectedSemesterId ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No semesters yet. Click the semester button above to create one.
        </div>
      ) : !matrixData ? (
        <div className="text-center py-16 text-muted-foreground">Semester not found.</div>
      ) : viewMode === "grid" ? (
        <MemberGrid
          members={filteredGridMembers}
          weekEnd={currentWeekEnd}
          semesterId={selectedSemesterId}
          onManage={setActionsMember}
        />
      ) : (
        <AttendanceMatrix
          members={matrixData.members}
          weeks={matrixData.weeks}
          semesterId={matrixData.semester.id}
          pending={pending}
          onAdjust={adjustCell}
        />
      )}

      <SemesterManageSheet
        open={manageOpen}
        onOpenChange={setManageOpen}
        semesters={semesters}
        selectedId={selectedSemesterId}
        onSelect={setSelectedSemesterId}
        onCreated={(s) => {
          setSemesters((prev) => [...prev, s]);
          setSelectedSemesterId(s.id);
        }}
        onActivated={(id) => {
          setSemesters((prev) => prev.map((s) => ({ ...s, isActive: s.id === id })));
        }}
        onDeactivated={(id) => {
          setSemesters((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: false } : s)));
        }}
        onDeleted={(id) => {
          setSemesters((prev) => prev.filter((s) => s.id !== id));
          if (selectedSemesterId === id) {
            const remaining = semesters.filter((s) => s.id !== id);
            const next = remaining.find((s) => s.isActive) ?? remaining[remaining.length - 1];
            if (next) setSelectedSemesterId(next.id);
          }
        }}
      />

      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} onAdded={handleMemberAdded} />

      <MemberActionsDialog
        member={actionsMember}
        onOpenChange={(open) => !open && setActionsMember(null)}
        onSubsidyToggled={handleSubsidyToggled}
        onRemoved={handleMemberRemoved}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <MembersPage />
    </Suspense>
  );
}
