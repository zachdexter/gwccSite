"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type NewMember = {
  id: number;
  name: string;
  email: string | null;
  isSubsidized: boolean;
  isActive: boolean;
};

export function AddMemberDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (member: NewMember) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubsidized, setIsSubsidized] = useState(false);
  const [saving, setSaving] = useState(false);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, isSubsidized }),
    });
    setSaving(false);
    if (res.ok) {
      const m = await res.json();
      onAdded(m);
      setName("");
      setEmail("");
      setIsSubsidized(false);
      onOpenChange(false);
      toast.success(`Added ${m.name}`);
    } else {
      toast.error("Failed to add member");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-popover-foreground">New Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={addMember} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="bg-muted border-border text-foreground"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="bg-muted border-border text-foreground"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSubsidized}
              onChange={(e) => setIsSubsidized(e.target.checked)}
              className="accent-gwcc-gold"
            />
            <span className="text-muted-foreground text-sm">Subsidized membership</span>
          </label>
          <DialogFooter>
            <Button type="submit" disabled={saving} className="w-full bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90">
              {saving ? "Adding…" : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
