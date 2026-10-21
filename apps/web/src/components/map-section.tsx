import { siteConfig } from "@/lib/site-config";
import { Card } from "./ui/card";
import { Container, Section, SectionHead } from "./ui/section";

/** Live world map (Dynmap/BlueMap) embedded from `siteConfig.mapUrl`; renders nothing until the URL is set. */
export function MapSection() {
  const { mapUrl } = siteConfig;
  if (!mapUrl) return null;

  return (
    <Section id="mapa">
      <Container>
        <SectionHead
          title="Mapa świata"
          description={
            <>
              Zobacz, co zbudowaliśmy.{" "}
              <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                Otwórz w nowej karcie
              </a>
              .
            </>
          }
        />
        <Card tone="muted" padding="none" elevated>
          <iframe
            src={mapUrl}
            title="Mapa świata serwera"
            loading="lazy"
            referrerPolicy="no-referrer"
            allow="fullscreen"
            className="block h-[70vh] min-h-96 w-full border-0 bg-paper"
          />
        </Card>
      </Container>
    </Section>
  );
}
