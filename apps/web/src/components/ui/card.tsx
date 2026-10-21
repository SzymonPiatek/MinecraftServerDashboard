import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

export const cardVariants = cva("rounded-card border-2 border-ink", {
  variants: {
    tone: {
      paper: "bg-paper",
      muted: "bg-paper-2",
      accent: "bg-accent",
      cyan: "bg-[color-mix(in_oklch,var(--color-accent-2)_55%,white)]",
      mint: "bg-mint",
    },
    padding: {
      none: "",
      lg: "p-6 md:p-10",
    },
    elevated: {
      true: "shadow-card",
      false: "",
    },
    interactive: {
      true: "transition-[transform,box-shadow] duration-240 ease-spring hover:-translate-y-1 hover:shadow-card-lift",
      false: "",
    },
  },
  defaultVariants: { tone: "paper", padding: "none", elevated: false, interactive: false },
});

type CardProps<T extends ElementType> = VariantProps<typeof cardVariants> & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as" | keyof VariantProps<typeof cardVariants>>;

export function Card<T extends ElementType = "div">({
  as,
  tone,
  padding,
  elevated,
  interactive,
  className,
  ...props
}: CardProps<T>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component className={cn(cardVariants({ tone, padding, elevated, interactive }), className)} {...props} />
  );
}
