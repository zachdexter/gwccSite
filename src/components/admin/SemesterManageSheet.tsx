"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/components/useConfirm";
import { useAdminRole } from "@/components/AdminRoleContext";
import type { Semester } from "./SemesterPicker";

export function SemesterManageSheet({
  open,
  onOpenChange,
  semesters,
  selectedId,
  onSelect,
  onCreated,
  onActivated,
  onDeactivated,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesters: Semester[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreated: (s: Semester) => void;
  onActivated: (id: number) => void;
  onDeactivated: (id: number) => void;
  onDeleted: (id: number) => void;
}) {
  const role = useAdminRole();
  const { confirm, ConfirmDialog } = useConfirm();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function addSemester(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/semesters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, startDate, endDate }),
    });
    setSaving(false);
    if (res.ok) {
      const s = await res.json();
      onCreated(s);
      setName("");
      setStartDate("");
      setEndDate("");
      setShowAdd(false);
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
      onActivated(id);
      toast.success("Semester activated");
    }
  }

  async function deactivate(id: number) {
    const res = await fetch("/api/semesters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: false }),
    });
    if (res.ok) {
      onDeactivated(id);
      toast.success("Semester deactivated");
    }
  }

  async function deleteSemester(id: number, semName: string) {
    if (
      !(await confirm(
        `Delete ${semName}? This is irreversible — it will permanently remove all attendance data for this semester.`
      ))
    )
      return;
    const res = await fetch("/api/semesters", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      onDeleted(id);
      toast.success(`Deleted ${semName}`);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm">
        {ConfirmDialog}
        <SheetHeader>
          <SheetTitle>Manage Semesters</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {showAdd ? (
            <form onSubmit={addSemester} className="bg-muted border border-border rounded-lg p-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Name (e.g. Fall 2025)</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-card border-border text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Start</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="bg-card border-border text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">End</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="bg-card border-border text-foreground"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} size="sm" className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">
                  {saving ? "Creating…" : "Create"}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdd(false)} className="text-muted-foreground">
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              onClick={() => setShowAdd(true)}
              variant="outline"
              className="w-full border-gwcc-gold/40 text-gwcc-gold hover:bg-gwcc-gold/10"
            >
              + New Semester
            </Button>
          )}

          <div className="space-y-2">
            {semesters.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No semesters yet.</p>
            ) : (
              [...semesters].reverse().map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onSelect(s.id);
                    onOpenChange(false);
                  }}
                  className={`w-full text-left border rounded-lg px-3 py-2.5 space-y-1.5 transition-colors ${
                    s.id === selectedId
                      ? "border-gwcc-gold/50 bg-gwcc-gold/5"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-medium">{s.name}</span>
                    {s.isActive && (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {s.startDate} → {s.endDate}
                  </div>
                  <div className="flex items-center gap-3 pt-0.5">
                    {!s.isActive ? (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          activate(s.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            activate(s.id);
                          }
                        }}
                        className="text-xs text-gwcc-gold/70 hover:text-gwcc-gold transition-colors"
                      >
                        Activate
                      </span>
                    ) : (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          deactivate(s.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            deactivate(s.id);
                          }
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Deactivate
                      </span>
                    )}
                    {!s.isActive && role === "president" && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSemester(s.id, s.name);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            deleteSemester(s.id, s.name);
                          }
                        }}
                        className="text-xs text-destructive/80 hover:text-destructive transition-colors"
                      >
                        Delete
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <SheetFooter />
      </SheetContent>
    </Sheet>
  );
}
