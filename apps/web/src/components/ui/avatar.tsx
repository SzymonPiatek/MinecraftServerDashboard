import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Minecraft slot: a 7×7 sprite scaled 2× and sliced with `border-image`. The tint fills the inside. */
export const avatarVariants = cva(
  [
    "grid",
    "size-8",
    "place-items-center",
    "rounded-none",
    "border-6",
    "border-solid",
    "bg-clip-padding",
    "font-pixel",
    "text-xl",
    "leading-none",
    "[image-rendering:pixelated]",
    "[border-image:url(/container/slot.png)_3/1/0_stretch]",
  ],
  {
    variants: {
      tint: {
        accent: "bg-accent",
        mint: "bg-mint",
        cyan: "bg-accent-2",
        coral: "bg-accent-3",
      },
    },
    defaultVariants: { tint: "accent" },
  },
);

export const AVATAR_TINTS = ["accent", "mint", "cyan", "coral"] as const;

type AvatarProps = ComponentProps<"span"> & VariantProps<typeof avatarVariants>;

export function Avatar({ tint, className, ...props }: AvatarProps) {
  return <span className={cn(avatarVariants({ tint }), className)} aria-hidden="true" {...props} />;
}
