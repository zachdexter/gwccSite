"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/useConfirm";
import type { GridMember } from "./MemberGrid";

export function MemberActionsDialog({
  member,
  onOpenChange,
  onSubsidyToggled,
  onRemoved,
}: {
  member: (GridMember & { name: string }) | null;
  onOpenChange: (open: boolean) => void;
  onSubsidyToggled: (memberId: number) => void;
  onRemoved: (memberId: number) => void;
}) {
  const { confirm, ConfirmDialog } = useConfirm();

  async function toggleSubsidized() {
    if (!member) return;
    const res = await fetch("/api/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, isSubsidized: !member.isSubsidized }),
    });
    if (res.ok) {
      onSubsidyToggled(member.id);
      onOpenChange(false);
    } else {
      toast.error("Failed to update subsidy status");
    }
  }

  async function remove() {
    if (!member) return;
    if (!(await confirm(`Remove ${member.name} from the active roster?`))) return;
    const res = await fetch("/api/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id }),
    });
    if (res.ok) {
      onRemoved(member.id);
      onOpenChange(false);
      toast.success(`Removed ${member.name}`);
    } else {
      toast.error("Failed to remove member");
    }
  }

  return (
    <>
      {ConfirmDialog}
      <Dialog open={!!member} onOpenChange={onOpenChange}>
        <DialogContent className="bg-popover border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">{member?.name}</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" variant="outline" onClick={toggleSubsidized} className="w-full">
              {member?.isSubsidized ? "Remove subsidy" : "Add subsidy"}
            </Button>
            <Button type="button" variant="destructive" onClick={remove} className="w-full">
              Remove from roster
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
