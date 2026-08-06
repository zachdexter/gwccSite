import { db } from "@/lib/db";
import { compMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageTransition } from "@/components/PageTransition";
import { CompTeamGrid } from "@/components/CompTeamGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { CompHeaderIcons, CompDecorFill } from "@/components/CompDecorIcons";

export const dynamic = "force-dynamic";

export default async function CompPage() {
  const members = await db
    .select()
    .from(compMembers)
    .where(eq(compMembers.isActive, true))
    .orderBy(compMembers.displayOrder, compMembers.name);

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background flex flex-col">
        <CompDecorFill />
        <SiteHeader />

        <main className="flex-1 px-6 py-16 max-w-5xl mx-auto w-full">
          <div id="decor-header-zone" className="relative py-20 mb-12">
            <CompHeaderIcons />
            <div id="decor-title-block" className="inline-block">
              <div className="font-heading text-gwcc-gold/70 text-sm uppercase tracking-[0.25em] mb-3">
                Competitive Team
              </div>
              <h1 className="font-heading text-5xl leading-tight text-foreground">Meet the Team</h1>
            </div>
          </div>

          <div id="decor-content-end">
            {members.length === 0 ? (
              <div className="text-muted-foreground text-center py-20">No comp team members listed yet.</div>
            ) : (
              <CompTeamGrid members={members} />
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
