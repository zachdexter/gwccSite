import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gwcc-dark flex flex-col">
      {/* Nav */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/8">
        <Link href="/" className="text-gwcc-gold font-bold tracking-widest text-sm uppercase">
          GWCC
        </Link>
        <nav className="flex items-center gap-6 text-sm text-gwcc-light/60">
          <Link href="/comp" className="hover:text-gwcc-light transition-colors">Comp Team</Link>
          <Link href="/gallery" className="hover:text-gwcc-light transition-colors">Gallery</Link>
          <a href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gwcc-light transition-colors">
            Instagram
          </a>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <div className="max-w-2xl space-y-6">
          <div className="text-gwcc-gold/70 text-xs uppercase tracking-[0.25em] font-semibold">
            George Washington University
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gwcc-light leading-tight">
            Climbing Club
          </h1>
          <p className="text-gwcc-light/55 text-lg leading-relaxed max-w-lg mx-auto">
            {siteConfig.description} Whether you&apos;re pulling your first route or training for nationals, you belong here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <a
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gwcc-gold text-gwcc-dark font-semibold rounded-md hover:bg-gwcc-gold/90 transition-colors"
            >
              Follow on Instagram
            </a>
            <Link
              href="/comp"
              className="px-6 py-3 border border-white/15 text-gwcc-light/70 rounded-md hover:border-white/30 hover:text-gwcc-light transition-colors"
            >
              Meet the Comp Team
            </Link>
          </div>
        </div>
      </main>

      {/* Practice times */}
      <section className="border-t border-white/8 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-gwcc-gold text-xs uppercase tracking-widest font-semibold mb-6 text-center">
            Practice Schedule
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {siteConfig.practiceTimes.map((p) => (
              <div key={p.day} className="bg-gwcc-navy/60 border border-white/8 rounded-lg px-5 py-4">
                <div className="text-gwcc-light font-semibold">{p.day}</div>
                <div className="text-gwcc-light/50 text-sm mt-1">{p.time}</div>
                <div className="text-gwcc-light/35 text-xs mt-1">{p.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 px-6 py-5 flex items-center justify-between text-xs text-gwcc-light/25">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <Link href="/login" className="hover:text-gwcc-light/50 transition-colors">
          Eboard Login
        </Link>
      </footer>
    </div>
  );
}
