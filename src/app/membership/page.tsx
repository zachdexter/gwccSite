import Link from "next/link";
import { siteConfig } from "@/config/site";
import { PageTransition } from "@/components/PageTransition";
import { SiteHeader } from "@/components/SiteHeader";

export default function MembershipPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />

        <main className="flex-1 px-6 py-16 max-w-3xl mx-auto w-full">
          <section className="text-center">
            <h1 className="font-heading text-4xl md:text-6xl leading-tight text-foreground mb-6">
              Subsidized Membership
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-4">
              We&apos;re excited to be able to offer a subsidized membership to 30-40 members
              each year! Come to orientation days at the beginning of the school year to be
              considered — if you missed them or couldn&apos;t make it, no worries, just join our{" "}
              <a
                href={siteConfig.waitlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gwcc-gold hover:underline"
              >
                waitlist
              </a>{" "}
              and we&apos;ll reach out. To keep your subsidy, we ask that you make it to two
              sessions a week; if that&apos;s tough on a regular basis, we may pass the spot
              along to someone who can use it more.
            </p>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Got questions? We&apos;d love to hear from you —{" "}
              <Link href="/contact" className="text-gwcc-gold hover:underline">
                reach out here
              </Link>
              .
            </p>
          </section>
        </main>
      </div>
    </PageTransition>
  );
}
