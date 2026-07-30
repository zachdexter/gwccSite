"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type PasswordFormProps = {
  title: string;
  role: "president" | "eboard";
  requireCurrent?: boolean;
};

function PasswordForm({ title, role, requireCurrent }: PasswordFormProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) { toast.error("Passwords don't match"); return; }
    if (next.length < 8) { toast.error("Password must be at least 8 characters"); return; }

    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, currentPassword: current, newPassword: next }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success(`${title} updated`);
      setCurrent(""); setNext(""); setConfirm("");
    } else {
      toast.error(data.error ?? "Failed to update password");
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <h2 className="text-card-foreground font-semibold">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {requireCurrent && (
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Current Password</Label>
            <Input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              className="bg-muted border-border text-foreground"
            />
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">New Password</Label>
          <Input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={8}
            className="bg-muted border-border text-foreground"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Confirm New Password</Label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="bg-muted border-border text-foreground"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
        >
          {loading ? "Saving…" : "Update Password"}
        </Button>
      </form>
    </div>
  );
}

export default function SettingsForm() {
  return (
    <div className="space-y-4">
      <PasswordForm title="President Password" role="president" requireCurrent />
      <PasswordForm title="Eboard Password" role="eboard" />
    </div>
  );
}
