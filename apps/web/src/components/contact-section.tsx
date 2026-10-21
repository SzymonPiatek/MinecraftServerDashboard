import { ContactForm } from "./contact-form";
import { Container, Section, SectionHead } from "./ui/section";

export function ContactSection() {
  return (
    <Section id="kontakt">
      <Container>
        <SectionHead
          title="Napisz do admina"
          description="Chcesz się dopisać do whitelisty, masz pytanie albo pomysł? Wyślij wiadomość, odpiszę na podany e-mail."
        />
        <ContactForm />
      </Container>
    </Section>
  );
}
