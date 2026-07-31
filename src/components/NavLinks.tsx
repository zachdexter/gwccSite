"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

const chipBase = "px-4 py-1.5 rounded-full text-sm transition-colors";
const chipActive = "bg-gwcc-gold text-gwcc-dark font-medium";
const chipInactive =
  "border border-border text-muted-foreground hover:bg-gwcc-gold hover:text-gwcc-dark hover:border-gwcc-gold";

export function NavLinks() {
  const pathname = usePathname();

  const isComp = pathname === "/comp";
  const isGallery = pathname.startsWith("/gallery");
  const isEboard = pathname === "/eboard";

  return (
    <nav className="flex items-center gap-2">
      <Link href="/comp" className={`${chipBase} ${isComp ? chipActive : chipInactive}`}>
        Comp Team
      </Link>
      <Link href="/eboard" className={`${chipBase} ${isEboard ? chipActive : chipInactive}`}>
        Eboard
      </Link>
      <Link href="/gallery" className={`${chipBase} ${isGallery ? chipActive : chipInactive}`}>
        Gallery
      </Link>
      <a
        href={siteConfig.socials.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className={`${chipBase} ${chipInactive}`}
      >
        Instagram
      </a>
    </nav>
  );
}
