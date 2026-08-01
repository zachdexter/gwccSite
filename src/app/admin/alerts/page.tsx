"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Alert = {
  id: number;
  message: string;
  expiresAt: string;
};

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AlertsPage() {
  const [items, setItems] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return toDatetimeLocal(d);
  });
  const [saving, setSaving] = useState(false);

  async function fetchAlerts() {
    const res = await fetch("/api/alerts");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchAlerts(); }, []);

  function resetForm() {
    setMessage("");
    const d = new Date();
    d.setHours(d.getHours() + 1);
    setExpiresAt(toDatetimeLocal(d));
    setShowAdd(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, expiresAt: new Date(expiresAt).toISOString() }),
    });
    if (res.ok) {
      const created = await res.json();
      setItems((prev) => [...prev, created]);
      toast.success("Alert posted");
      resetForm();
    } else {
      toast.error("Failed to post alert");
    }

    setSaving(false);
  }

  async function remove(a: Alert) {
    if (!confirm("Remove this alert now?")) return;
    const res = await fetch("/api/alerts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== a.id));
      toast.success("Removed");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Alerts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Shown on the home page until they expire
          </p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
        >
          + New Alert
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={save} className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h2 className="text-card-foreground font-semibold">New Alert</h2>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Message</Label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm resize-none"
              placeholder="No practice this week due to..."
            />
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Disappears at</Label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-md bg-muted border border-border text-foreground text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">
              {saving ? "Posting…" : "Post Alert"}
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
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No active alerts.</div>
        ) : (
          items.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 gap-4"
            >
              <div className="min-w-0">
                <p className="text-foreground text-sm">{a.message}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Disappears {new Date(a.expiresAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => remove(a)} className="text-xs text-muted-foreground hover:text-red-400 transition-colors shrink-0">
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
