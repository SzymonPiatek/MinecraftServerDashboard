import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/cn";
import { cardVariants } from "./ui/card";
import { Container, Section, SectionHead } from "./ui/section";

export function FaqSection() {
  return (
    <Section id="faq">
      <Container className="grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-16">
        <SectionHead
          className="mb-0 md:sticky md:top-16"
          title="Najczęstsze pytania"
          description={
            <>
              Nie znalazłeś odpowiedzi? <a href="#kontakt">Napisz do admina</a> przez formularz.
            </>
          }
        />

        <div className="grid gap-4">
          {siteConfig.faq.map((item) => (
            <details
              key={item.question}
              name="faq"
              className={cn(
                cardVariants({ tone: "paper" }),
                "group transition-colors duration-160 ease-snap open:bg-paper-2",
              )}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span
                  className="relative size-8 flex-none rounded-full border-2 border-ink bg-accent transition-transform duration-240 ease-spring group-open:rotate-45 before:absolute before:top-1/2 before:left-1/2 before:h-0.5 before:w-[0.8rem] before:-translate-1/2 before:bg-ink after:absolute after:top-1/2 after:left-1/2 after:h-0.5 after:w-[0.8rem] after:-translate-1/2 after:rotate-90 after:bg-ink"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-160 px-6 pb-6 text-ink-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
