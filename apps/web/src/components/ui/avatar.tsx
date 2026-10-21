import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const avatarVariants = cva(
  "grid size-8 place-items-center rounded-lg border-[1.5px] border-ink text-sm font-bold",
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
