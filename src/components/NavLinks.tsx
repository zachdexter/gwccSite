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
import { MenuDecorIcons } from "@/components/MenuDecorIcons";

const chipBase = "text-xs transition-colors";
const chipActive = "text-gwcc-gold font-medium";
const chipInactive = "text-muted-foreground hover:text-gwcc-gold";

const drawerLinkBase =
  "block w-full px-4 py-3 rounded-md font-oswald text-2xl tracking-wide underline decoration-1 decoration-current/30 underline-offset-8 transition-colors";
const drawerLinkActive = "bg-gwcc-gold text-gwcc-dark font-medium";
const drawerLinkInactive =
  "text-muted-foreground hover:bg-gwcc-gold/10 hover:text-gwcc-gold";

const drawerLinks = [
  { href: "/comp", label: "Competitive Team" },
  { href: "/eboard", label: "Eboard" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Get Involved" },
];

export function NavLinks() {
  const pathname = usePathname();

  const isComp = pathname === "/comp";
  const isGallery = pathname.startsWith("/gallery");
  const isEboard = pathname === "/eboard";
  const isFaq = pathname === "/faq";
  const isContact = pathname === "/contact";
  const activeByHref: Record<string, boolean> = {
    "/comp": isComp,
    "/eboard": isEboard,
    "/gallery": isGallery,
    "/faq": isFaq,
    "/contact": isContact,
  };

  return (
    <>
      <nav className="hidden md:flex items-center gap-4">
        <Link href="/comp" className={`${chipBase} ${isComp ? chipActive : chipInactive}`}>
          Competitive Team
        </Link>
        <Link href="/eboard" className={`${chipBase} ${isEboard ? chipActive : chipInactive}`}>
          Eboard
        </Link>
        <Link href="/gallery" className={`${chipBase} ${isGallery ? chipActive : chipInactive}`}>
          Gallery
        </Link>
        <Link href="/faq" className={`${chipBase} ${isFaq ? chipActive : chipInactive}`}>
          FAQ
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
          <SheetContent
            side="right"
            className="bg-gwcc-dark data-[side=right]:w-4/5 data-[side=right]:sm:max-w-sm"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <MenuDecorIcons />
            <nav className="flex flex-col gap-1 px-4 pt-10">
              {drawerLinks.map(({ href, label }) => (
                <SheetClose
                  key={href}
                  render={
                    <Link
                      href={href}
                      className={`${drawerLinkBase} ${
                        activeByHref[href] ? drawerLinkActive : drawerLinkInactive
                      }`}
                    />
                  }
                >
                  {label}
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
