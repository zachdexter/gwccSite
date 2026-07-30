import Link from "next/link";
import { db } from "@/lib/db";
import { compMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { siteConfig } from "@/config/site";
import { PageTransition } from "@/components/PageTransition";
import { CompTeamGrid } from "@/components/CompTeamGrid";

export const dynamic = "force-dynamic";

export default async function CompPage() {
  const members = await db
    .select()
    .from(compMembers)
    .where(eq(compMembers.isActive, true))
    .orderBy(compMembers.displayOrder, compMembers.name);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gwcc-dark flex flex-col">
        <header className="px-6 py-5 flex items-center justify-between border-b border-white/8">
          <Link href="/" className="text-gwcc-gold font-bold tracking-widest text-sm uppercase">
            GWCC
          </Link>
          <nav className="flex items-center gap-6 text-sm text-gwcc-light/60">
            <Link href="/comp" className="text-gwcc-light">Comp Team</Link>
            <Link href="/gallery" className="hover:text-gwcc-light transition-colors">Gallery</Link>
            <a href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gwcc-light transition-colors">
              Instagram
            </a>
          </nav>
        </header>

        <main className="flex-1 px-6 py-16 max-w-5xl mx-auto w-full">
          <div className="mb-12">
            <div className="text-gwcc-gold/70 text-xs uppercase tracking-[0.25em] font-semibold mb-3">
              Competitive Team
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gwcc-light">Meet the Team</h1>
            <p className="text-gwcc-light/50 mt-4 max-w-lg">
              Our comp team competes at regional and national USAC climbing competitions.
            </p>
          </div>

          {members.length === 0 ? (
            <div className="text-gwcc-light/40 text-center py-20">No comp team members listed yet.</div>
          ) : (
            <CompTeamGrid members={members} />
          )}
        </main>

        <footer className="border-t border-white/8 px-6 py-5 flex items-center justify-between text-xs text-gwcc-light/25">
          <Link href="/" className="hover:text-gwcc-light/50 transition-colors">← Home</Link>
          <Link href="/login" className="hover:text-gwcc-light/50 transition-colors">Eboard Login</Link>
        </footer>
      </div>
    </PageTransition>
  );
}
