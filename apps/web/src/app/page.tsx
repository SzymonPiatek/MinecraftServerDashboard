import { FaqSection } from "@/components/faq-section";
import { Hero } from "@/components/hero";
import { JoinSection } from "@/components/join-section";
import { ServerDataProvider } from "@/components/server-data";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { StatusSection } from "@/components/status-section";

export default function HomePage() {
  return (
    <ServerDataProvider>
      <SiteNav />
      <main>
        <Hero />
        <StatusSection />
        <JoinSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </ServerDataProvider>
  );
}
