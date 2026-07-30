import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { galleryPhotos } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { siteConfig } from "@/config/site";
import { PageTransition } from "@/components/PageTransition";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PracticeSchedule } from "@/components/PracticeSchedule";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const photos = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.showInHero, true))
    .orderBy(asc(galleryPhotos.heroDisplayOrder), asc(galleryPhotos.uploadedAt));

  return (
    <PageTransition>
      <div className="min-h-screen bg-gwcc-dark flex flex-col">
        {/* Nav */}
        <header className="px-6 py-5 flex items-center justify-between border-b border-white/8">
          <Link
            href="/"
            aria-label="GWCC home"
            className="flex items-center justify-center w-9 h-9 rounded-md border border-dashed border-gwcc-gold/40 text-gwcc-gold/60 text-[10px] uppercase tracking-tight hover:border-gwcc-gold/70 hover:text-gwcc-gold transition-colors"
          >
            logo
          </Link>
          <nav className="flex items-center gap-6 text-sm text-gwcc-light/60">
            <Link href="/comp" className="hover:text-gwcc-light transition-colors">Comp Team</Link>
            <Link href="/gallery" className="hover:text-gwcc-light transition-colors">Gallery</Link>
            <a href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gwcc-light transition-colors">
              Instagram
            </a>
          </nav>
        </header>

        {/* Hero with carousel background */}
        <section className="relative flex flex-col items-center justify-center px-6 text-center min-h-[82vh]">
          <HeroCarousel photos={photos} />

          <div className="relative z-10 max-w-3xl space-y-4">
            <Image
              src="/gwccgraffiticolor.PNG"
              alt="GWCC logo"
              width={480}
              height={345}
              priority
              className="w-[22rem] md:w-[30rem] h-auto mx-auto"
            />
            <div className="text-gwcc-light/40 text-[11px] uppercase tracking-[0.25em]">
              George Washington University Climbing Club
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
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
                className="px-6 py-3 border border-white/20 text-gwcc-light/80 rounded-md hover:border-white/40 hover:text-gwcc-light transition-colors"
              >
                Meet the Comp Team
              </Link>
            </div>
          </div>
        </section>

        {/* Practice times */}
        <section className="border-t border-white/8 px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-gwcc-gold text-xs uppercase tracking-widest font-semibold mb-6 text-center">
              Practice Schedule
            </h2>
            <PracticeSchedule times={siteConfig.practiceTimes} />
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
    </PageTransition>
  );
}
