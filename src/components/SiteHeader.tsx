import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";

export function SiteHeader() {
  return (
    <header className="px-3.5 py-3 flex items-center justify-between border-b border-border">
      <Link href="/" className="text-gwcc-gold font-bold tracking-widest text-[8px] uppercase">
        GWCC
      </Link>
      <NavLinks />
    </header>
  );
}
