import Image from "next/image";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";

export function SiteHeader() {
  return (
    <header className="px-3.5 py-3 flex items-center justify-between border-b border-border">
      <Link href="/" aria-label="GWCC home" className="flex items-center -my-3 group">
        <Image
          src="/gwccgraffiticolor.PNG"
          alt="GWCC"
          width={240}
          height={64}
          className="h-10 w-auto object-contain transition-transform duration-200 ease-out group-hover:scale-110"
          priority
        />
      </Link>
      <NavLinks />
    </header>
  );
}
