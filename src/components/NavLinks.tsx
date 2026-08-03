"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const chipBase = "text-xs transition-colors";
const chipActive = "text-gwcc-gold font-medium";
const chipInactive = "text-muted-foreground hover:text-gwcc-gold";

const drawerLinkBase = "block w-full px-4 py-3 rounded-md text-base transition-colors";
const drawerLinkActive = "bg-gwcc-gold text-gwcc-dark font-medium";
const drawerLinkInactive =
  "text-muted-foreground hover:bg-gwcc-gold/10 hover:text-gwcc-gold";

export function NavLinks() {
  const pathname = usePathname();

  const isComp = pathname === "/comp";
  const isGallery = pathname.startsWith("/gallery");
  const isEboard = pathname === "/eboard";
  const isMembership = pathname === "/membership";
  const isContact = pathname === "/contact";

  return (
    <>
      <nav className="hidden md:flex items-center gap-4">
        <Link href="/comp" className={`${chipBase} ${isComp ? chipActive : chipInactive}`}>
          Competitive Team
        </Link>
        <Link href="/eboard" className={`${chipBase} ${isEboard ? chipActive : chipInactive}`}>
          Leadership
        </Link>
        <Link href="/gallery" className={`${chipBase} ${isGallery ? chipActive : chipInactive}`}>
          Gallery
        </Link>
        <Link
          href="/membership"
          className={`${chipBase} ${isMembership ? chipActive : chipInactive}`}
        >
          Membership
        </Link>
        <Link href="/contact" className={`${chipBase} ${isContact ? chipActive : chipInactive}`}>
          Get Involved
        </Link>
      </nav>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger
            aria-label="Open navigation menu"
            className="flex items-center justify-center w-[22px] h-[22px] rounded-sm border border-border text-muted-foreground hover:text-gwcc-gold hover:border-gwcc-gold/70 transition-colors"
          >
            <Menu className="w-3 h-3" />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              <SheetClose
                render={
                  <Link
                    href="/comp"
                    className={`${drawerLinkBase} ${isComp ? drawerLinkActive : drawerLinkInactive}`}
                  />
                }
              >
                Competitive Team
              </SheetClose>
              <SheetClose
                render={
                  <Link
                    href="/eboard"
                    className={`${drawerLinkBase} ${isEboard ? drawerLinkActive : drawerLinkInactive}`}
                  />
                }
              >
                Leadership
              </SheetClose>
              <SheetClose
                render={
                  <Link
                    href="/gallery"
                    className={`${drawerLinkBase} ${isGallery ? drawerLinkActive : drawerLinkInactive}`}
                  />
                }
              >
                Gallery
              </SheetClose>
              <SheetClose
                render={
                  <Link
                    href="/membership"
                    className={`${drawerLinkBase} ${isMembership ? drawerLinkActive : drawerLinkInactive}`}
                  />
                }
              >
                Membership
              </SheetClose>
              <SheetClose
                render={
                  <Link
                    href="/contact"
                    className={`${drawerLinkBase} ${isContact ? drawerLinkActive : drawerLinkInactive}`}
                  />
                }
              >
                Get Involved
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
