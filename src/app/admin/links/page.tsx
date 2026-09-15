"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type ExternalLink = {
  id: number;
  key: string | null;
  label: string;
  url: string;
  description: string | null;
  isActive: boolean;
};

export default function LinksAdminPage() {
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ExternalLink | null>(null);
  const [form, setForm] = useState({ label: "", url: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchLinks() {
      const res = await fetch("/api/links");
      if (res.ok) setLinks(await res.json());
      setLoading(false);
    }
    fetchLinks();
  }, []);

  function startEdit(link: ExternalLink) {
    setEditing(link);
    setForm({ label: link.label, url: link.url, description: link.description ?? "" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);

    const res = await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, ...form }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLinks((prev) => prev.map((l) => (l.id === editing.id ? updated : l)));
      toast.success("Link updated");
      setEditing(null);
    } else {
      const { error } = await res.json();
      toast.error(error ?? "Failed to update link");
    }

    setSaving(false);
  }

  async function toggleActive(link: ExternalLink) {
    const res = await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: link.id, isActive: !link.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLinks((prev) => prev.map((l) => (l.id === link.id ? updated : l)));
    } else {
      toast.error("Failed to update link");
    }
  }

  const sortedLinks = [...links].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Links</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {links.length} links — edit a URL below to update it everywhere it&apos;s used on the site.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium text-card-foreground">{link.label}</TableCell>
                  <TableCell>
                    {link.key ? <Badge variant="outline">{link.key}</Badge> : <Badge variant="secondary">Custom</Badge>}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-gwcc-gold hover:underline"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={link.isActive ? "default" : "outline"}
                      size="xs"
                      onClick={() => toggleActive(link)}
                      className={link.isActive ? "bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90" : "text-muted-foreground"}
                    >
                      {link.isActive ? "Active" : "Inactive"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => startEdit(link)}
                      className="text-xs text-muted-foreground hover:text-gwcc-gold transition-colors"
                    >
                      Edit
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Link
              {editing?.key && (
                <Badge variant="outline" className="ml-2 align-middle">
                  {editing.key}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1">
              <Label>Label *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>URL *</Label>
              <Input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Internal note, not shown publicly"
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
