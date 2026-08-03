import Link from "next/link";
import { siteConfig } from "@/config/site";
import { PageTransition } from "@/components/PageTransition";
import { NavLinks } from "@/components/NavLinks";

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-3.5 py-3 flex items-center justify-between border-b border-border">
          <Link href="/" className="text-gwcc-gold font-bold tracking-widest text-[8px] uppercase">
            GWCC
          </Link>
          <NavLinks />
        </header>

        <main className="flex-1 px-6 py-16 max-w-3xl mx-auto w-full">
          <section className="mb-20 text-center">
            <h1 className="font-heading text-4xl md:text-6xl leading-tight text-foreground mb-6">
              Interested in joining GWCC?
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Anyone is welcome to join and climb with us at any of our{" "}
              <Link href="/#practice-times" className="text-gwcc-gold hover:underline">
                practice times
              </Link>{" "}
              at Movement Crystal City! If you&apos;re interested in learning more about our subsidized membership,{" "}
              <Link href="/membership" className="text-gwcc-gold hover:underline">
                click here
              </Link>
              . Be sure to follow our{" "}
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gwcc-gold hover:underline"
              >
                Instagram
              </a>{" "}
              or join our{" "}
              <a
                href={siteConfig.emailListUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gwcc-gold hover:underline"
              >
                email list
              </a>{" "}
              as those are the best methods to stay up to date with what we&apos;re up to and
              find out about events!
            </p>
          </section>

          <section className="border-t border-border pt-10 text-center">
            <div className="font-heading text-gwcc-gold/70 text-sm uppercase tracking-[0.25em] mb-3">
              Partnerships &amp; Inquiries
            </div>
            <p className="text-muted-foreground mb-2">
              Brands, sponsors, and other organizations can reach us directly at
            </p>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="text-gwcc-gold text-lg font-medium hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
          </section>
        </main>
      </div>
    </PageTransition>
  );
}
