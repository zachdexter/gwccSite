import Link from "next/link";
import { db } from "@/lib/db";
import { faqQuestions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageTransition } from "@/components/PageTransition";
import { SiteHeader } from "@/components/SiteHeader";
import { FaqHeaderIcons, FaqDecorFill } from "@/components/FaqDecorIcons";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const questions = await db
    .select()
    .from(faqQuestions)
    .where(eq(faqQuestions.isActive, true))
    .orderBy(faqQuestions.displayOrder);

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background flex flex-col">
        <FaqDecorFill />
        <SiteHeader />

        <main className="flex-1 px-6 py-16 max-w-3xl mx-auto w-full">
          <div id="decor-header-zone" className="relative py-20 mb-12 text-center">
            <FaqHeaderIcons />
            <div id="decor-title-block" className="inline-block">
              <div className="font-heading text-gwcc-gold/70 text-sm uppercase tracking-[0.25em] mb-3">
                Got Questions?
              </div>
              <h1 className="font-heading text-5xl leading-tight text-foreground">
                Frequently Asked Questions
              </h1>
            </div>
          </div>

          <div id="decor-content-end">
            {questions.length === 0 ? (
              <div className="text-muted-foreground text-center py-20">No questions listed yet.</div>
            ) : (
              <Accordion className="space-y-3">
                {questions.map((q) => (
                  <AccordionItem
                    key={q.id}
                    value={String(q.id)}
                    className="border border-border rounded-lg px-4 bg-card/40"
                  >
                    <AccordionTrigger className="font-heading text-lg text-foreground hover:text-gwcc-gold">
                      {q.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{q.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            <div className="text-center text-muted-foreground text-sm mt-12">
              Still have a question?{" "}
              <Link href="/contact" className="text-gwcc-gold hover:underline">
                Get in touch
              </Link>{" "}
              and we&apos;ll get back to you.
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
