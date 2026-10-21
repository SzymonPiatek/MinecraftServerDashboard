import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const cubeVariants = cva("[transform-box:fill-box]", {
  variants: {
    tint: {
      mint: "[--base:var(--color-mint)]",
      pear: "[--base:var(--color-accent)]",
      coral: "[--base:var(--color-accent-3)]",
      cyan: "[--base:var(--color-accent-2)]",
    },
    float: {
      slow: "animate-float-slow",
      mid: "animate-float-mid",
      fast: "animate-float-fast",
    },
  },
});

const faceClass = "stroke-ink stroke-3 [stroke-linejoin:round] [vector-effect:non-scaling-stroke]";

interface CubeProps extends Required<VariantProps<typeof cubeVariants>> {
  x: number;
  y: number;
  size: number;
}

function Cube({ tint, float, x, y, size }: CubeProps) {
  const scale = size / 100;
  const pixel =
    "fill-[color-mix(in_oklch,var(--base)_75%,white)] opacity-80 [transform:skewY(26deg)_translateY(-12px)]";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className={cubeVariants({ tint, float })}>
      <polygon className={cn(faceClass, "fill-(--base)")} points="50,0 100,25 50,50 0,25" />
      <polygon
        className={cn(faceClass, "fill-[color-mix(in_oklch,var(--base)_82%,black)]")}
        points="0,25 50,50 50,115 0,90"
      />
      <polygon
        className={cn(faceClass, "fill-[color-mix(in_oklch,var(--base)_66%,black)]")}
        points="100,25 50,50 50,115 100,90"
      />
      <rect className={pixel} x="38" y="18" width="12" height="12" />
      <rect className={pixel} x="58" y="26" width="10" height="10" />
      <rect className={pixel} x="22" y="62" width="10" height="10" />
    </g>
  );
}

export function BlockArt() {
  return (
    <svg
      className="h-auto w-full max-w-md overflow-visible"
      viewBox="0 0 400 420"
      role="img"
      aria-label="Ilustracja: stos kolorowych bloków"
    >
      <Cube tint="mint" float="slow" x={100} y={190} size={200} />
      <Cube tint="pear" float="mid" x={10} y={60} size={110} />
      <Cube tint="cyan" float="fast" x={290} y={20} size={90} />
      <Cube tint="coral" float="mid" x={300} y={290} size={80} />
    </svg>
  );
}
