import { db } from "@/lib/db";
import { eboardMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageTransition } from "@/components/PageTransition";
import { EboardGrid } from "@/components/EboardGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { EboardHeaderIcons, EboardSideFrame } from "@/components/EboardDecorIcons";

export const dynamic = "force-dynamic";

export default async function EboardPage() {
  const members = await db
    .select()
    .from(eboardMembers)
    .where(eq(eboardMembers.isActive, true))
    .orderBy(eboardMembers.displayOrder, eboardMembers.name);

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background flex flex-col">
        <EboardSideFrame />
        <SiteHeader />

        <main className="flex-1 px-6 py-16 max-w-5xl mx-auto w-full">
          <div id="decor-header-zone" className="relative mb-12">
            <EboardHeaderIcons />
            <div className="font-heading text-gwcc-gold/70 text-sm uppercase tracking-[0.25em] mb-3">
              Leadership
            </div>
            <h1 className="font-heading text-5xl md:text-6xl leading-tight text-foreground">Meet the Leadership Team</h1>
          </div>

          <div id="decor-content-end">
            {members.length === 0 ? (
              <div className="text-muted-foreground text-center py-20">No eboard members listed yet.</div>
            ) : (
              <EboardGrid members={members} />
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
