import { siteConfig } from "@/lib/site-config";
import styles from "./faq-section.module.css";

export function FaqSection() {
  return (
    <section id="faq" className="section">
      <div className="container">
        <div className={styles.layout}>
          <div className="section-head">
            <h2>Najczęstsze pytania</h2>
            <p>Nie znalazłeś odpowiedzi? Napisz do admina.</p>
          </div>

          <div className={styles.list}>
            {siteConfig.faq.map((item) => (
              <details key={item.question} name="faq" className={styles.item}>
                <summary className={styles.question}>
                  <span>{item.question}</span>
                  <span className={styles.icon} aria-hidden="true" />
                </summary>
                <p className={styles.answer}>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
