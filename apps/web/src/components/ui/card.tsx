import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

/** Minecraft popup panel: a 7×7 sprite scaled 2× and sliced with `border-image`. The tone fills the inside. */
export const cardVariants = cva(
  [
    "rounded-none",
    "border-6",
    "border-solid",
    "bg-clip-padding",
    "[image-rendering:pixelated]",
    "[border-image:url(/popup/background.png)_3/1/0_stretch]",
  ],
  {
    variants: {
      tone: {
        paper: "bg-[#c6c6c6]",
        muted: "bg-[#c6c6c6]",
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
        true: [
          "transition-[transform,box-shadow]",
          "duration-240",
          "ease-spring",
          "group-hover/card:-translate-y-1",
          "group-hover/card:shadow-card-lift",
        ],
        false: "",
      },
    },
    defaultVariants: { tone: "paper", padding: "none", elevated: false, interactive: false },
  },
);

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
  children,
  ...props
}: CardProps<T>) {
  const Component: ElementType = as ?? "div";
  const surface = cn(cardVariants({ tone, padding, elevated, interactive }), className);

  if (!interactive) {
    return (
      <Component className={surface} {...props}>
        {children}
      </Component>
    );
  }
  return (
    <Component className="group/card" {...props}>
      <div className={cn(surface, "h-full")}>{children}</div>
    </Component>
  );
}
