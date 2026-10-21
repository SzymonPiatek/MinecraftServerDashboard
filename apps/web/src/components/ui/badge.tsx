import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-pill border-[1.5px] border-ink py-1 pr-4 font-semibold",
  {
    variants: {
      tone: {
        muted: "bg-paper-2",
        paper: "bg-paper",
      },
      leading: {
        dot: "pl-2 text-sm",
        avatar: "pl-1",
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
