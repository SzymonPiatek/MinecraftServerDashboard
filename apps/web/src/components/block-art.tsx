import styles from "./block-art.module.css";

type Tint = "mint" | "pear" | "coral" | "cyan";

interface CubeProps {
  tint: Tint;
  x: number;
  y: number;
  size: number;
  className?: string;
}

/** Isometric cube; `x`/`y`/`size` position it inside the parent SVG viewBox. */
function Cube({ tint, x, y, size, className }: CubeProps) {
  const scale = size / 100;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className={`${styles[tint]} ${className ?? ""}`}>
      <polygon className={styles.top} points="50,0 100,25 50,50 0,25" />
      <polygon className={styles.left} points="0,25 50,50 50,115 0,90" />
      <polygon className={styles.right} points="100,25 50,50 50,115 100,90" />
      <rect className={styles.pixel} x="38" y="18" width="12" height="12" />
      <rect className={styles.pixel} x="58" y="26" width="10" height="10" />
      <rect className={styles.pixel} x="22" y="62" width="10" height="10" />
    </g>
  );
}

export function BlockArt() {
  return (
    <svg
      className={styles.art}
      viewBox="0 0 400 420"
      role="img"
      aria-label="Ilustracja: stos kolorowych bloków"
    >
      <Cube tint="mint" x={100} y={190} size={200} className={styles.floatSlow} />
      <Cube tint="pear" x={10} y={60} size={110} className={styles.floatMid} />
      <Cube tint="cyan" x={290} y={20} size={90} className={styles.floatFast} />
      <Cube tint="coral" x={300} y={290} size={80} className={styles.floatMid} />
    </svg>
  );
}
