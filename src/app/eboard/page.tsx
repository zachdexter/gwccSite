import Link from "next/link";
import { db } from "@/lib/db";
import { eboardMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageTransition } from "@/components/PageTransition";
import { EboardGrid } from "@/components/EboardGrid";
import { NavLinks } from "@/components/NavLinks";

export const dynamic = "force-dynamic";

export default async function EboardPage() {
  const members = await db
    .select()
    .from(eboardMembers)
    .where(eq(eboardMembers.isActive, true))
    .orderBy(eboardMembers.displayOrder, eboardMembers.name);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-3.5 py-3 flex items-center justify-between border-b border-border">
          <Link href="/" className="text-gwcc-gold font-bold tracking-widest text-[8px] uppercase">
            GWCC
          </Link>
          <NavLinks />
        </header>

        <main className="flex-1 px-6 py-16 max-w-5xl mx-auto w-full">
          <div className="mb-12">
            <div className="font-heading text-gwcc-gold/70 text-sm uppercase tracking-[0.25em] mb-3">
              Leadership
            </div>
            <h1 className="font-heading text-5xl md:text-6xl leading-tight text-foreground">Meet the Leadership Team</h1>
          </div>

          {members.length === 0 ? (
            <div className="text-muted-foreground text-center py-20">No eboard members listed yet.</div>
          ) : (
            <EboardGrid members={members} />
          )}
        </main>
      </div>
    </PageTransition>
  );
}
