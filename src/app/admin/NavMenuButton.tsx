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
        className="text-gwcc-light/60 hover:text-gwcc-light gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-4 h-4" />
        Menu
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gwcc-dark border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gwcc-light">Navigation</DialogTitle>
          </DialogHeader>
          <AdminToolGrid role={role} onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
