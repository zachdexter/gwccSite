import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { galleryPhotos, practiceTimes } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { sortPracticeTimes } from "@/lib/practiceTimes";
import { siteConfig } from "@/config/site";
import { PageTransition } from "@/components/PageTransition";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PracticeSchedule } from "@/components/PracticeSchedule";
import { NavLinks } from "@/components/NavLinks";

export const dynamic = "force-dynamic";

function formatTime(value: string) {
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${period}`;
}

export default async function HomePage() {
  const photos = await db
    .select()
    .from(galleryPhotos)
    .where(eq(galleryPhotos.showInHero, true))
    .orderBy(asc(galleryPhotos.heroDisplayOrder), asc(galleryPhotos.uploadedAt));

  const schedule = sortPracticeTimes(await db.select().from(practiceTimes));

  const practiceScheduleItems = schedule.map((t) => ({
    day: t.day,
    time: `${formatTime(t.startTime)} – ${formatTime(t.endTime)}`,
  }));

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Nav */}
        <header className="px-6 py-5 flex items-center justify-between border-b border-border">
          <Link
            href="/"
            aria-label="GWCC home"
            className="flex items-center justify-center w-9 h-9 rounded-md border border-dashed border-gwcc-gold/40 text-gwcc-gold/60 text-[10px] uppercase tracking-tight hover:border-gwcc-gold/70 hover:text-gwcc-gold transition-colors"
          >
            logo
          </Link>
          <NavLinks />
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
            <div className="text-muted-foreground text-[11px] uppercase tracking-[0.25em]">
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
                className="px-6 py-3 border border-border text-foreground/80 rounded-md hover:border-foreground/40 hover:text-foreground transition-colors"
              >
                Meet the Comp Team
              </Link>
            </div>
          </div>
        </section>

        {/* Practice times */}
        {practiceScheduleItems.length > 0 && (
          <section className="border-t border-border px-6 py-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-heading text-gwcc-gold text-sm uppercase tracking-widest mb-6 text-center">
                Practice Schedule
              </h2>
              <PracticeSchedule times={practiceScheduleItems} />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-border px-6 py-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {siteConfig.name}</span>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Eboard Login
          </Link>
        </footer>
      </div>
    </PageTransition>
  );
}
