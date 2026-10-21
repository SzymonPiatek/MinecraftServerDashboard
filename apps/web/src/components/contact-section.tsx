import { ContactForm } from "./contact-form";

export function ContactSection() {
  return (
    <section id="kontakt" className="section">
      <div className="container">
        <div className="section-head">
          <h2>Napisz do admina</h2>
          <p>
            Chcesz się dopisać do whitelisty, masz pytanie albo pomysł? Wyślij wiadomość, odpiszę na podany
            e-mail.
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
