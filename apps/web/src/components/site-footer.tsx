import { siteConfig } from "@/lib/site-config";
import { Container } from "./ui/section";

export function SiteFooter() {
  return (
    <footer className="bg-ink py-16 text-paper">
      <Container className="grid gap-10">
        <p className="text-[clamp(2rem,10vw,6rem)] leading-[0.95] font-bold tracking-[-0.04em] text-accent">
          {siteConfig.name}
        </p>
        <p className="text-sm opacity-70">
          Serwer niezwiązany z Mojang Studios ani Microsoft. Minecraft jest znakiem towarowym Mojang AB.
        </p>
      </Container>
    </footer>
  );
}
