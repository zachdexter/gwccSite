"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/components/useConfirm";
import { toast } from "sonner";
import { WEEKDAYS } from "@/lib/practiceTimes";

type PracticeTime = {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  displayOrder: number;
};

function formatTime(value: string) {
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${period}`;
}

export default function PracticeTimesPage() {
  const [times, setTimes] = useState<PracticeTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<PracticeTime | null>(null);
  const [form, setForm] = useState({ day: "Monday", startTime: "19:00", endTime: "21:00" });
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  async function fetchTimes() {
    const res = await fetch("/api/practice-times");
    if (res.ok) setTimes(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchTimes(); }, []);

  function resetForm() {
    setForm({ day: "Monday", startTime: "19:00", endTime: "21:00" });
    setEditing(null);
    setShowAdd(false);
  }

  function startEdit(t: PracticeTime) {
    setEditing(t);
    setForm({ day: t.day, startTime: t.startTime, endTime: t.endTime });
    setShowAdd(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editing) {
      const res = await fetch("/api/practice-times", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTimes((prev) => prev.map((t) => (t.id === editing.id ? updated : t)));
        toast.success("Updated");
      } else {
        toast.error("Failed to update");
      }
    } else {
      const res = await fetch("/api/practice-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, displayOrder: times.length }),
      });
      if (res.ok) {
        const created = await res.json();
        setTimes((prev) => [...prev, created]);
        toast.success("Added");
      } else {
        toast.error("Failed to add");
      }
    }

    resetForm();
    setSaving(false);
  }

  async function remove(t: PracticeTime) {
    if (!(await confirm(`Remove ${t.day} practice?`))) return;
    const res = await fetch("/api/practice-times", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id }),
    });
    if (res.ok) {
      setTimes((prev) => prev.filter((x) => x.id !== t.id));
      toast.success("Removed");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {ConfirmDialog}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Practice Times</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Shown on the home page schedule
          </p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
        >
          + Add Time
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={save} className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h2 className="text-card-foreground font-semibold">{editing ? "Edit Practice Time" : "New Practice Time"}</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Day</Label>
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-muted border border-border text-foreground text-sm"
              >
                {WEEKDAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Start</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
                className="bg-muted border-border text-foreground"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">End</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
                className="bg-muted border-border text-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">
              {saving ? "Saving…" : editing ? "Save Changes" : "Add"}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm} className="text-muted-foreground">
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : times.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No practice times set.</div>
        ) : (
          times.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
            >
              <div>
                <span className="text-foreground font-medium">{t.day}</span>
                <span className="text-muted-foreground text-sm ml-3">
                  {formatTime(t.startTime)} – {formatTime(t.endTime)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => startEdit(t)} className="text-xs text-muted-foreground hover:text-gwcc-gold transition-colors">
                  Edit
                </button>
                <Button variant="destructive" size="xs" onClick={() => remove(t)}>
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
