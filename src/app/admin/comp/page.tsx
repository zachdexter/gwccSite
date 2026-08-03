"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/components/useConfirm";
import { toast } from "sonner";

type CompMember = {
  id: number;
  name: string;
  year: string;
  bio: string | null;
  headshotUrl: string | null;
  displayOrder: number;
  isActive: boolean;
};

const YEARS = ["Fr", "So", "Jr", "Sr", "Alumni"];

export default function CompAdminPage() {
  const [members, setMembers] = useState<CompMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<CompMember | null>(null);
  const [form, setForm] = useState({
    name: "", year: "Fr", bio: "", displayOrder: 0,
  });
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  async function fetchMembers() {
    const res = await fetch("/api/comp");
    if (res.ok) setMembers(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchMembers(); }, []);

  function resetForm() {
    setForm({ name: "", year: "Fr", bio: "", displayOrder: 0 });
    setHeadshotFile(null);
    setEditing(null);
    setShowAdd(false);
  }

  async function uploadHeadshot(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/comp/headshot", { method: "POST", body: formData });
    if (!res.ok) {
      toast.error("Failed to upload headshot");
      return null;
    }
    const { secureUrl } = await res.json();
    return secureUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    let headshotUrl = editing?.headshotUrl ?? null;
    if (headshotFile) {
      const uploaded = await uploadHeadshot(headshotFile);
      if (uploaded) headshotUrl = uploaded;
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
    if (!(await confirm(`Remove ${name} from comp team?`))) return;
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
    setForm({ name: m.name, year: m.year, bio: m.bio ?? "", displayOrder: m.displayOrder });
    setShowAdd(true);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {ConfirmDialog}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Comp Team</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{members.length} members</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
        >
          + Add Member
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={save} className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h2 className="text-card-foreground font-semibold">{editing ? "Edit Member" : "New Member"}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-muted border-border text-foreground" />
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Year</Label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-muted border border-border text-foreground text-sm"
              >
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Bio</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Headshot (optional)</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setHeadshotFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="w-full justify-start font-normal text-foreground"
              >
                {headshotFile ? headshotFile.name : "Choose file…"}
              </Button>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Display Order</Label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                className="bg-muted border-border text-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Member"}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm} className="text-muted-foreground">Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No comp team members yet.</div>
        ) : (
          members.map((m) => (
            <div key={m.id} className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-3">
              {m.headshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.headshotUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted border border-border flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-card-foreground font-medium">{m.name}</span>
                  <span className="text-muted-foreground text-xs">{m.year}</span>
                </div>
                {m.bio && <p className="text-muted-foreground text-xs mt-0.5 truncate">{m.bio}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(m)} className="text-xs text-muted-foreground hover:text-gwcc-gold transition-colors">Edit</button>
                <Button variant="destructive" size="xs" onClick={() => deactivate(m.id, m.name)}>Remove</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
