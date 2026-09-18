"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/components/useConfirm";
import { ImageCropDialog } from "@/components/ImageCropDialog";
import { ReorderableList } from "@/components/ReorderableList";
import { PhotoReorderStrip } from "@/components/PhotoReorderStrip";
import { BioText } from "@/components/BioText";
import { toast } from "sonner";

type CompMemberPhoto = { id: number; secureUrl: string; cloudinaryId: string; displayOrder: number };

type CompMember = {
  id: number;
  name: string;
  year: string;
  bio: string | null;
  displayOrder: number;
  isActive: boolean;
  photos: CompMemberPhoto[];
};

type PendingPhoto =
  | { kind: "existing"; id: number; secureUrl: string; cloudinaryId: string }
  | { kind: "new"; tempId: string; file: File; previewUrl: string };

function keyOf(p: PendingPhoto): string {
  return p.kind === "existing" ? String(p.id) : p.tempId;
}

function previewOf(p: PendingPhoto): string {
  return p.kind === "existing" ? p.secureUrl : p.previewUrl;
}

const YEARS = ["Fr", "So", "Jr", "Sr", "Alumni"];

export default function CompAdminPage() {
  const [members, setMembers] = useState<CompMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<CompMember | null>(null);
  const [form, setForm] = useState({
    name: "", year: "Fr", bio: "",
  });
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  function boldSelection() {
    const el = bioRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;
    if (selectionStart === selectionEnd) return;
    const newValue =
      value.slice(0, selectionStart) +
      `**${value.slice(selectionStart, selectionEnd)}**` +
      value.slice(selectionEnd);
    setForm((f) => ({ ...f, bio: newValue }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart + 2, selectionEnd + 2);
    });
  }

  useEffect(() => {
    async function fetchMembers() {
      const res = await fetch("/api/comp");
      if (res.ok) setMembers(await res.json());
      setLoading(false);
    }
    fetchMembers();
  }, []);

  function resetForm() {
    setForm({ name: "", year: "Fr", bio: "" });
    for (const p of photos) if (p.kind === "new") URL.revokeObjectURL(p.previewUrl);
    setPhotos([]);
    setCropSource(null);
    setEditing(null);
    setShowAdd(false);
  }

  function onCropped(file: File) {
    setPhotos((prev) => [
      ...prev,
      { kind: "new", tempId: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) },
    ]);
  }

  function removePhoto(key: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => keyOf(p) === key);
      if (target?.kind === "new") URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => keyOf(p) !== key);
    });
  }

  async function uploadPhoto(file: File): Promise<{ secureUrl: string; cloudinaryId: string } | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/comp/photo", { method: "POST", body: formData });
    if (!res.ok) {
      toast.error("Failed to upload a photo");
      return null;
    }
    return res.json();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let memberId: number;
      let baseMember: Omit<CompMember, "photos">;

      if (editing) {
        const res = await fetch("/api/comp", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        if (!res.ok) {
          toast.error("Failed to update member");
          return;
        }
        baseMember = await res.json();
        memberId = editing.id;
      } else {
        const res = await fetch("/api/comp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, displayOrder: members.length }),
        });
        if (!res.ok) {
          toast.error("Failed to add member");
          return;
        }
        baseMember = await res.json();
        memberId = baseMember.id;
      }

      const uploaded = await Promise.all(
        photos.map(async (p) => {
          if (p.kind === "existing") return { id: p.id, cloudinaryId: p.cloudinaryId, secureUrl: p.secureUrl };
          const result = await uploadPhoto(p.file);
          return result ? { cloudinaryId: result.cloudinaryId, secureUrl: result.secureUrl } : null;
        })
      );
      const validPhotos = uploaded.filter((p): p is NonNullable<typeof p> => p !== null);
      if (validPhotos.length !== photos.length) {
        toast.error("Some photos failed to upload and were skipped");
      }

      const photosRes = await fetch("/api/comp/photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, photos: validPhotos }),
      });
      const finalPhotos: CompMemberPhoto[] = photosRes.ok ? (await photosRes.json()).photos : [];

      const finalMember: CompMember = { ...baseMember, photos: finalPhotos };

      if (editing) {
        setMembers((prev) => prev.map((m) => (m.id === memberId ? finalMember : m)));
        toast.success("Updated");
      } else {
        setMembers((prev) => [...prev, finalMember]);
        toast.success(`Added ${finalMember.name}`);
      }

      resetForm();
    } finally {
      setSaving(false);
    }
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
    setForm({ name: m.name, year: m.year, bio: m.bio ?? "" });
    setPhotos(m.photos.map((p) => ({ kind: "existing", id: p.id, secureUrl: p.secureUrl, cloudinaryId: p.cloudinaryId })));
    setShowAdd(true);
  }

  async function handleReorder(newOrder: CompMember[]) {
    const changed = newOrder
      .map((m, i) => ({ id: m.id, displayOrder: i, prev: m.displayOrder }))
      .filter((m) => m.displayOrder !== m.prev);

    setMembers(newOrder.map((m, i) => ({ ...m, displayOrder: i })));

    await Promise.all(
      changed.map(({ id, displayOrder }) =>
        fetch("/api/comp", {
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
            <div className="flex items-center gap-1 pb-1">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={boldSelection}
                title="Bold the selected words"
                className="font-bold"
              >
                B
              </Button>
              <span className="text-muted-foreground text-[11px]">
                Select text and click B to bold just those words. Enter makes a new line.
              </span>
            </div>
            <Textarea
              ref={bioRef}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="bg-muted border-border text-foreground"
            />
            {form.bio && (
              <BioText text={form.bio} className="text-muted-foreground text-sm leading-relaxed pt-2" />
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Photos</Label>
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
            {photos.length > 0 && (
              <PhotoReorderStrip
                items={photos.map((p) => ({ key: keyOf(p), previewUrl: previewOf(p) }))}
                onReorder={(newOrder) => {
                  setPhotos(newOrder.map((item) => photos.find((p) => keyOf(p) === item.key)!));
                }}
                renderItem={(item) => (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(item.key);
                      }}
                      aria-label="Remove photo"
                      className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none"
                    >
                      ×
                    </button>
                  </div>
                )}
              />
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="justify-start font-normal text-foreground"
            >
              + Add Photo
            </Button>
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
          <div className="text-center py-12 text-muted-foreground">No comp team members yet.</div>
        ) : (
          <ReorderableList
            items={members}
            onReorder={handleReorder}
            renderItem={(m) => (
              <div className="flex items-center gap-4 bg-card border border-border rounded-lg px-4 py-3">
                {m.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photos[0].secureUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
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
            )}
          />
        )}
      </div>
    </div>
  );
}
