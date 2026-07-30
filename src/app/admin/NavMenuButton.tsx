"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminToolGrid from "@/components/AdminToolGrid";

export default function NavMenuButton({ role }: { role?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-gwcc-light/60 hover:text-gwcc-light hover:bg-white/10 gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-4 h-4" />
        Menu
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-popover border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">Navigation</DialogTitle>
          </DialogHeader>
          <AdminToolGrid role={role} onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
