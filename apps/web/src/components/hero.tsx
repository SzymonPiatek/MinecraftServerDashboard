import { siteConfig } from "@/lib/site-config";
import { BlockArt } from "./block-art";
import { CopyAddress } from "./copy-address";
import { Container } from "./ui/section";

export function Hero() {
  return (
    <section
      id="top"
      className="grid items-center bg-paper bg-[radial-gradient(circle_at_1px_1px,var(--color-line)_1px,transparent_0)] bg-size-[28px_28px] pt-30 pb-16 md:min-h-svh"
    >
      <Container className="grid items-center gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="grid justify-items-start gap-6">
          <h1 className="min-w-0 text-display">
            {siteConfig.name}.{" "}
            <span className="inline-block rounded-[0.15em] bg-accent px-[0.15em] box-decoration-clone">
              Zbuduj coś swojego.
            </span>
          </h1>
          <p className="max-w-136 text-lg text-ink-muted">{siteConfig.description}</p>
          <div className="flex max-w-full flex-wrap items-center gap-6 pb-1.25">
            <CopyAddress address={siteConfig.address} />
            <a className="font-semibold whitespace-nowrap" href="#join">
              Jak dołączyć →
            </a>
          </div>
        </div>
        <div className="order-first mx-auto flex max-w-72 justify-center md:order-none md:mx-0 md:max-w-none">
          <BlockArt />
        </div>
      </Container>
    </section>
  );
}
