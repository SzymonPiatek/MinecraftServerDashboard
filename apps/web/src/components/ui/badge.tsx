import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Minecraft slot holding a label: same sprite as `Avatar`, with a dark inventory-grey inside. */
export const badgeVariants = cva(
  [
    "inline-flex",
    "items-center",
    "gap-2",
    "rounded-none",
    "border-6",
    "border-solid",
    "bg-[#8b8b8b]",
    "bg-clip-padding",
    "px-2",
    "font-pixel",
    "text-xl",
    "leading-none",
    "text-white",
    "[text-shadow:2px_2px_0_#3f3f3f]",
    "[image-rendering:pixelated]",
    "[border-image:url(/container/slot.png)_3/1/0_stretch]",
  ],
  {
    variants: {
      tone: {
        muted: "",
        paper: "",
      },
      leading: {
        dot: "py-1.5",
        avatar: "py-0 pl-0",
      },
    },
    defaultVariants: { tone: "paper", leading: "dot" },
  },
);

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ tone, leading, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, leading }), className)} {...props} />;
}

const dotVariants = cva("size-[0.65rem] rounded-full", {
  variants: {
    state: {
      unknown: "bg-ink-muted",
      online: "animate-pulse-ring bg-online",
      offline: "bg-accent-3",
    },
  },
  defaultVariants: { state: "unknown" },
});

export function Dot({ state }: VariantProps<typeof dotVariants>) {
  return <span className={dotVariants({ state })} aria-hidden="true" />;
}
