import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { galleryPhotos, practiceTimes } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { sortPracticeTimes } from "@/lib/practiceTimes";
import { siteConfig } from "@/config/site";
import { PageTransition } from "@/components/PageTransition";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HeroContent } from "@/components/HeroContent";
import { ScrollIndicator } from "@/components/ScrollIndicator";
import { PracticeSchedule } from "@/components/PracticeSchedule";
import { NavLinks } from "@/components/NavLinks";
import { AlertBanner } from "@/components/AlertBanner";

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
      <div className="min-h-screen flex flex-col">
        <HeroCarousel photos={photos} />

        <div className="h-screen flex flex-col">
          {/* Nav */}
          <header className="relative z-20 bg-background px-3.5 py-3 flex items-center justify-between border-b border-border">
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

          {/* Hero content, scrolls/fades over the fixed carousel */}
          <section className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
            <AlertBanner />
            <HeroContent />
            <ScrollIndicator />
          </section>
        </div>

        {/* Practice times */}
        {practiceScheduleItems.length > 0 && (
          <section id="practice-times" className="relative px-6 py-12 scroll-mt-16">
            <div className="max-w-2xl mx-auto">
              <PracticeSchedule times={practiceScheduleItems} />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="relative bg-background/90 backdrop-blur-sm border-t border-border px-6 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {siteConfig.shortName} ·{" "}
            <Link href="/login" className="hover:text-foreground transition-colors">
              Login
            </Link>
          </span>
          <a
            href={siteConfig.socials.linktree}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Linktree
          </a>
        </footer>
      </div>
    </PageTransition>
  );
}
