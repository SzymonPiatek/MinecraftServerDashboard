"use client";

import { useServerData } from "./server-data";
import styles from "./status-section.module.css";

const AVATAR_TINTS = ["--color-accent", "--color-mint", "--color-accent-2", "--color-accent-3"];

function tintFor(name: string): string {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

export function StatusSection() {
  const { status, players, unreachable } = useServerData();
  const loading = !status && !unreachable;

  return (
    <section id="status" className="section">
      <div className="container">
        <div className="section-head">
          <h2>Status na żywo</h2>
          <p>Dane odświeżają się same co kilkanaście sekund.</p>
        </div>

        <div className={styles.grid}>
          <article className={styles.card}>
            <h3 className={styles.state} data-online={status?.online ?? false}>
              {loading
                ? "Sprawdzam…"
                : unreachable && !status
                  ? "Brak danych"
                  : status?.online
                    ? "Online"
                    : "Offline"}
            </h3>
            <dl className={styles.stats}>
              <div>
                <dt>Gracze</dt>
                <dd>{status?.online ? `${status.playersOnline}/${status.playersMax}` : "—"}</dd>
              </div>
              <div>
                <dt>Ping</dt>
                <dd>{status?.online && status.pingMs !== null ? `${Math.round(status.pingMs)} ms` : "—"}</dd>
              </div>
              <div>
                <dt>Wersja</dt>
                <dd>{status?.version ?? "—"}</dd>
              </div>
            </dl>
            <p className={styles.motd}>{status?.motd || "Brak opisu serwera."}</p>
            {unreachable && (
              <p className={styles.warning} role="alert">
                Nie udało się odświeżyć danych. Spróbuję ponownie za chwilę.
              </p>
            )}
          </article>

          <article className={styles.card}>
            <h3 className={styles.subtitle}>Kto gra teraz</h3>
            {players && players.players.length > 0 ? (
              <ul className={styles.players}>
                {players.players.map((name) => (
                  <li key={name} className={styles.player}>
                    <span
                      className={styles.avatar}
                      style={{ background: `var(${tintFor(name)})` }}
                      aria-hidden="true"
                    >
                      {name.charAt(0).toUpperCase()}
                    </span>
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>
                {status?.online ? "Nikogo nie ma. Bądź pierwszy!" : "Lista graczy jest teraz niedostępna."}
              </p>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
