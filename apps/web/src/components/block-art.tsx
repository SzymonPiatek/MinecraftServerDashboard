import Image from "next/image";
import { cva } from "class-variance-authority";

const blockVariants = cva(
  ["absolute", "h-auto", "transition-[scale]", "duration-240", "ease-spring", "hover:scale-110"],
  {
    variants: {
      float: {
        slow: "animate-float-slow",
        mid: "animate-float-mid",
        fast: "animate-float-fast",
      },
    },
  },
);

/** Positions are percentages of the 400×420 art box, so the stack scales with its container. */
const BLOCKS = [
  { src: "/blocks/Crafting_Table.png", alt: "Crafting Table", float: "slow", left: 4, top: 40, size: 58 },
  { src: "/blocks/Furnace.png", alt: "Furnace", float: "mid", left: 58, top: 6, size: 38 },
  { src: "/blocks/Glowstone.png", alt: "Glowstone", float: "fast", left: 8, top: 4, size: 32 },
  { src: "/blocks/Diamond_Ore.png", alt: "Diamond Ore", float: "mid", left: 64, top: 54, size: 34 },
] as const;

export function BlockArt() {
  return (
    <div
      className="relative aspect-400/420 w-full max-w-xl"
      role="img"
      aria-label="Ilustracja: stos bloków z Minecrafta"
    >
      {BLOCKS.map(({ src, float, left, top, size }) => (
        <Image
          key={src}
          src={src}
          alt=""
          width={1024}
          height={1024}
          unoptimized
          className={blockVariants({ float })}
          style={{ left: `${left}%`, top: `${top}%`, width: `${size}%` }}
        />
      ))}
    </div>
  );
}
