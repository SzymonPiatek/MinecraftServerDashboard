import { siteConfig } from "@/lib/site-config";
import { Card } from "./ui/card";
import { Container, Section, SectionHead } from "./ui/section";

const TONES = ["accent", "cyan", "mint"] as const;

export function JoinSection() {
  return (
    <Section id="join">
      <Container>
        <SectionHead title="Jak dołączyć" description="Trzy kroki i jesteś w środku." />

        <ol className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
          {siteConfig.steps.map((step, index) => (
            <Card
              as="li"
              key={step.title}
              tone={TONES[index % TONES.length]}
              padding="lg"
              elevated
              interactive
              className="grid content-start gap-4"
            >
              <span className="grid size-12 place-items-center rounded-input border-2 border-ink bg-paper font-mono text-lg font-medium">
                {index + 1}
              </span>
              <h3 className="text-2xl">{step.title}</h3>
              <p>{step.text}</p>
            </Card>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
