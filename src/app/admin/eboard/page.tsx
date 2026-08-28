"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/components/useConfirm";
import { ImageCropDialog } from "@/components/ImageCropDialog";
import { ReorderableList } from "@/components/ReorderableList";
import { toast } from "sonner";
import { cn, bioTextClass } from "@/lib/utils";

type BioFontSize = "sm" | "base" | "lg";

type EboardMember = {
  id: number;
  name: string;
  role: string;
  year: string;
  headshotUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  bio: string | null;
  bioFontSize: BioFontSize;
  bioBold: boolean;
  bioItalic: boolean;
};

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Alumni"];
const BIO_FONT_SIZES: { value: BioFontSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "base", label: "Medium" },
  { value: "lg", label: "Large" },
];

export default function EboardAdminPage() {
  const [members, setMembers] = useState<EboardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<EboardMember | null>(null);
  const [form, setForm] = useState({
    name: "", role: "", year: "Freshman",
    bio: "", bioFontSize: "base" as BioFontSize, bioBold: false, bioItalic: false,
  });
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    async function fetchMembers() {
      const res = await fetch("/api/eboard");
      if (res.ok) setMembers(await res.json());
      setLoading(false);
    }
    fetchMembers();
  }, []);

  function resetForm() {
    setForm({ name: "", role: "", year: "Freshman", bio: "", bioFontSize: "base", bioBold: false, bioItalic: false });
    setHeadshotFile(null);
    if (headshotPreview) URL.revokeObjectURL(headshotPreview);
    setHeadshotPreview(null);
    setCropSource(null);
    setEditing(null);
    setShowAdd(false);
  }

  function onCropped(file: File) {
    setHeadshotFile(file);
    if (headshotPreview) URL.revokeObjectURL(headshotPreview);
    setHeadshotPreview(URL.createObjectURL(file));
  }

  async function uploadHeadshot(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/eboard/headshot", { method: "POST", body: formData });
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

    const payload = editing ? { ...form, headshotUrl } : { ...form, headshotUrl, displayOrder: members.length };

    if (editing) {
      const res = await fetch("/api/eboard", {
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
      const res = await fetch("/api/eboard", {
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
    if (!(await confirm(`Remove ${name} from the eboard page?`))) return;
    const res = await fetch("/api/eboard", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success(`Removed ${name}`);
    }
  }

  function startEdit(m: EboardMember) {
    setEditing(m);
    setForm({
      name: m.name, role: m.role, year: m.year,
      bio: m.bio ?? "", bioFontSize: m.bioFontSize, bioBold: m.bioBold, bioItalic: m.bioItalic,
    });
    setShowAdd(true);
  }

  async function handleReorder(newOrder: EboardMember[]) {
    const changed = newOrder
      .map((m, i) => ({ id: m.id, displayOrder: i, prev: m.displayOrder }))
      .filter((m) => m.displayOrder !== m.prev);

    setMembers(newOrder.map((m, i) => ({ ...m, displayOrder: i })));

    await Promise.all(
      changed.map(({ id, displayOrder }) =>
        fetch("/api/eboard", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, displayOrder }),
        })
      )
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {ConfirmDialog}
      <ImageCropDialog
        file={cropSource}
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        onCropped={onCropped}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Eboard</h1>
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
              <Label className="text-muted-foreground text-xs">Role *</Label>
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
                placeholder="e.g. President"
                className="bg-muted border-border text-foreground"
              />
            </div>
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
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">About Me (optional)</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="A little bit about this member…"
              rows={3}
              className="bg-muted border-border text-foreground"
            />
            <div className="flex items-center gap-2 pt-1">
              <select
                value={form.bioFontSize}
                onChange={(e) => setForm({ ...form, bioFontSize: e.target.value as BioFontSize })}
                className="h-8 px-2 rounded-md bg-muted border border-border text-foreground text-xs"
              >
                {BIO_FONT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setForm({ ...form, bioBold: !form.bioBold })}
                className={cn("font-bold", form.bioBold && "bg-gwcc-gold text-gwcc-dark border-gwcc-gold")}
              >
                B
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setForm({ ...form, bioItalic: !form.bioItalic })}
                className={cn("italic", form.bioItalic && "bg-gwcc-gold text-gwcc-dark border-gwcc-gold")}
              >
                I
              </Button>
            </div>
            {form.bio && (
              <p className={cn("text-card-foreground pt-1", bioTextClass(form))}>{form.bio}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Headshot (optional)</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f) {
                  setCropSource(f);
                  setCropDialogOpen(true);
                }
                e.target.value = "";
              }}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              {headshotPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={headshotPreview} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="flex-1 justify-start font-normal text-foreground"
              >
                {headshotFile ? "Change photo…" : "Choose file…"}
              </Button>
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

      <div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No eboard members yet.</div>
        ) : (
          <ReorderableList
            items={members}
            onReorder={handleReorder}
            renderItem={(m) => (
              <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-3">
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
                  <p className="text-gwcc-gold text-xs mt-0.5">{m.role}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(m)} className="text-xs text-muted-foreground hover:text-gwcc-gold transition-colors">Edit</button>
                  <Button variant="destructive" size="xs" onClick={() => deactivate(m.id, m.name)}>Remove</Button>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
