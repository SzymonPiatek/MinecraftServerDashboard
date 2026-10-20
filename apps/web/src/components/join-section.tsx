import { siteConfig } from "@/lib/site-config";
import styles from "./join-section.module.css";

const TINTS = ["pear", "cyan", "mint"] as const;

export function JoinSection() {
  return (
    <section id="join" className="section">
      <div className="container">
        <div className="section-head">
          <h2>Jak dołączyć</h2>
          <p>Trzy kroki i jesteś w środku.</p>
        </div>

        <ol className={styles.steps}>
          {siteConfig.steps.map((step, index) => (
            <li key={step.title} className={`${styles.step} ${styles[TINTS[index % TINTS.length]]}`}>
              <span className={styles.number}>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
