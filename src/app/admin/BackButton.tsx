"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const pathname = usePathname();
  if (pathname === "/admin") return null;

  return (
    <Link
      href="/admin"
      className="flex items-center gap-1.5 text-gwcc-light/60 hover:text-gwcc-light transition-colors text-sm"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Link>
  );
}
