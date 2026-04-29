import Link from "next/link";
import { db } from "@/lib/db";
import { compMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function CompPage() {
  const members = await db
    .select()
    .from(compMembers)
    .where(eq(compMembers.isActive, true))
    .orderBy(compMembers.displayOrder, compMembers.name);

  return (
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((m) => (
              <div key={m.id} className="bg-gwcc-navy/60 border border-white/10 rounded-xl overflow-hidden">
                {m.headshotUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.headshotUrl}
                    alt={m.name}
                    className="w-full aspect-square object-cover object-top"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gwcc-navy/80 flex items-center justify-center">
                    <span className="text-gwcc-light/20 text-4xl font-bold">
                      {m.name[0]}
                    </span>
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-gwcc-light font-semibold">{m.name}</h2>
                    <span className="text-gwcc-light/40 text-xs">{m.year}</span>
                  </div>
                  {m.events.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.events.map((ev) => (
                        <span
                          key={ev}
                          className="text-xs text-gwcc-gold/80 bg-gwcc-gold/10 border border-gwcc-gold/20 px-2 py-0.5 rounded-full"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  )}
                  {m.bio && <p className="text-gwcc-light/50 text-sm leading-relaxed">{m.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/8 px-6 py-5 flex items-center justify-between text-xs text-gwcc-light/25">
        <Link href="/" className="hover:text-gwcc-light/50 transition-colors">← Home</Link>
        <Link href="/login" className="hover:text-gwcc-light/50 transition-colors">Eboard Login</Link>
      </footer>
    </div>
  );
}
