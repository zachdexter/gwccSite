"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALLOWED_WEEKLY_REQUIRED } from "@/lib/semester";

const optionLabel: Record<number, string> = {
  2: "2 sessions",
  1: "1 session",
  0: "None",
};

type EditableWeek = { label: string; required: number; reason: string | null };

export function WeekRequirementDialog({
  week,
  onOpenChange,
  onSave,
}: {
  week: EditableWeek | null;
  onOpenChange: (open: boolean) => void;
  onSave: (required: number, reason: string) => Promise<boolean>;
}) {
  return (
    <Dialog open={!!week} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border sm:max-w-sm">
        {week && (
          // Keyed so the form's state resets to the selected week each time it opens.
          <WeekRequirementForm
            key={week.label}
            week={week}
            onSave={async (required, reason) => {
              const ok = await onSave(required, reason);
              if (ok) onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function WeekRequirementForm({
  week,
  onSave,
}: {
  week: EditableWeek;
  onSave: (required: number, reason: string) => Promise<void>;
}) {
  const [required, setRequired] = useState(week.required);
  const [reason, setReason] = useState(week.reason ?? "");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(required, reason);
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-popover-foreground">{week.label}</DialogTitle>
        <DialogDescription>Sessions each member needs this week.</DialogDescription>
      </DialogHeader>
      <div className="inline-flex w-full rounded-md border border-border overflow-hidden">
        {[...ALLOWED_WEEKLY_REQUIRED].reverse().map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRequired(n)}
            className={`flex-1 px-3 py-1.5 text-sm transition-colors ${
              required === n
                ? "bg-gwcc-gold text-gwcc-dark font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {optionLabel[n]}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        <label htmlFor="week-reason" className="text-muted-foreground text-xs">
          Reason (optional)
        </label>
        <Input
          id="week-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Fall break"
          className="bg-muted border-border text-foreground text-sm"
        />
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={saving}
          className="bg-gwcc-gold text-gwcc-dark hover:bg-gwcc-gold/90 font-semibold"
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
