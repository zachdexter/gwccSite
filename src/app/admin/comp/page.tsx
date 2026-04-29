"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type CompMember = {
  id: number;
  name: string;
  year: string;
  events: string[];
  bio: string | null;
  headshotUrl: string | null;
  displayOrder: number;
  isActive: boolean;
};

const YEARS = ["Fr", "So", "Jr", "Sr", "Alumni"];
const EVENT_OPTIONS = [
  "Lead", "Top Rope", "Boulder", "Speed", "Combined"
];

export default function CompAdminPage() {
  const [members, setMembers] = useState<CompMember[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<CompMember | null>(null);
  const [form, setForm] = useState({
    name: "", year: "Fr", events: [] as string[], bio: "", displayOrder: 0,
  });
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchMembers() {
    const res = await fetch("/api/comp");
    if (res.ok) setMembers(await res.json());
  }

  useEffect(() => { fetchMembers(); }, []);

  function resetForm() {
    setForm({ name: "", year: "Fr", events: [], bio: "", displayOrder: 0 });
    setHeadshotFile(null);
    setEditing(null);
    setShowAdd(false);
  }

  async function uploadHeadshot(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/gallery", { method: "POST", body: formData });
    const photo = await res.json();
    return photo.secureUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let headshotUrl = editing?.headshotUrl ?? null;
    if (headshotFile) {
      headshotUrl = await uploadHeadshot(headshotFile);
    }

    const payload = { ...form, headshotUrl };

    if (editing) {
      const res = await fetch("/api/comp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...payload }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMembers((prev) => prev.map((m) => (m.id === editing.id ? updated : m)));
        toast.success("Updated");
      }
    } else {
      const res = await fetch("/api/comp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const m = await res.json();
        setMembers((prev) => [...prev, m]);
        toast.success(`Added ${m.name}`);
      }
    }

    resetForm();
    setSaving(false);
  }

  async function deactivate(id: number, name: string) {
    if (!confirm(`Remove ${name} from comp team?`)) return;
    const res = await fetch("/api/comp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success(`Removed ${name}`);
    }
  }

  function startEdit(m: CompMember) {
    setEditing(m);
    setForm({ name: m.name, year: m.year, events: m.events, bio: m.bio ?? "", displayOrder: m.displayOrder });
    setShowAdd(true);
  }

  const toggleEvent = (ev: string) =>
    setForm((f) => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter((e) => e !== ev) : [...f.events, ev],
    }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gwcc-light">Comp Team</h1>
          <p className="text-gwcc-light/50 text-sm mt-0.5">{members.length} members</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
        >
          + Add Member
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={save} className="bg-gwcc-navy border border-white/10 rounded-lg p-4 space-y-4">
          <h2 className="text-gwcc-light font-semibold">{editing ? "Edit Member" : "New Member"}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-gwcc-light/70 text-xs">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-gwcc-dark border-white/10 text-gwcc-light" />
            </div>
            <div className="space-y-1">
              <Label className="text-gwcc-light/70 text-xs">Year</Label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-gwcc-dark border border-white/10 text-gwcc-light text-sm"
              >
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gwcc-light/70 text-xs">Events</Label>
            <div className="flex flex-wrap gap-2">
              {EVENT_OPTIONS.map((ev) => (
                <button
                  key={ev}
                  type="button"
                  onClick={() => toggleEvent(ev)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    form.events.includes(ev)
                      ? "bg-gwcc-gold/20 text-gwcc-gold border-gwcc-gold/40"
                      : "bg-white/5 text-gwcc-light/50 border-white/10 hover:border-white/20"
                  }`}
                >
                  {ev}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gwcc-light/70 text-xs">Bio</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-gwcc-dark border border-white/10 text-gwcc-light text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-gwcc-light/70 text-xs">Headshot (optional)</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setHeadshotFile(e.target.files?.[0] ?? null)}
                className="text-gwcc-light/60 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gwcc-light/70 text-xs">Display Order</Label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                className="bg-gwcc-dark border-white/10 text-gwcc-light"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Member"}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm} className="text-gwcc-light/60">Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-4 bg-gwcc-navy border border-white/10 rounded-lg px-4 py-3">
            {m.headshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.headshotUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gwcc-dark border border-white/10 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gwcc-light font-medium">{m.name}</span>
                <span className="text-gwcc-light/40 text-xs">{m.year}</span>
                {m.events.map((ev) => (
                  <span key={ev} className="text-xs text-gwcc-gold/70 bg-gwcc-gold/10 px-2 py-0.5 rounded-full">{ev}</span>
                ))}
              </div>
              {m.bio && <p className="text-gwcc-light/40 text-xs mt-0.5 truncate">{m.bio}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(m)} className="text-xs text-gwcc-light/40 hover:text-gwcc-gold transition-colors">Edit</button>
              <button onClick={() => deactivate(m.id, m.name)} className="text-xs text-gwcc-light/30 hover:text-red-400 transition-colors">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
