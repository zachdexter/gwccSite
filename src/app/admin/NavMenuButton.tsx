"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AdminToolGrid from "@/components/AdminToolGrid";

export default function NavMenuButton() {
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="bg-popover border-border">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <AdminToolGrid onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
