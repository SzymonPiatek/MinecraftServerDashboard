import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const MC_BUTTON = [
  "rounded-none",
  "border-3",
  "border-solid",
  "bg-transparent",
  "font-pixel",
  "font-normal",
  "text-white",
  "[font-size:1.6em]",
  "[text-shadow:2px_2px_0_#3f3f3f]",
  "[image-rendering:pixelated]",
  "[border-image:url(/widget/button.png)_1_fill/1/0_stretch]",
  "group-hover/btn:group-enabled/btn:text-[#ffffa0]",
  "group-hover/btn:group-enabled/btn:[border-image-source:url(/widget/button_highlighted.png)]",
  "group-disabled/btn:text-[#a0a0a0]",
  "group-disabled/btn:[border-image-source:url(/widget/button_disabled.png)]",
];

export const buttonVariants = cva(
  [
    "inline-flex",
    "min-w-0",
    "items-center",
    "justify-center",
    "whitespace-nowrap",
    "text-ink",
    "no-underline",
    "transition-[background-color]",
    "duration-160",
    "ease-snap",
  ],
  {
    variants: {
      variant: {
        primary: MC_BUTTON,
        secondary: MC_BUTTON,
        ghost: "rounded-pill font-medium hover:bg-accent",
      },
      size: {
        flush: "p-0",
        sm: "px-4 py-1 text-sm",
        md: "px-6 py-4",
        lg: "px-8 py-5 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ variant, size, className, type = "button", children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "group/btn inline-flex max-w-full cursor-pointer disabled:cursor-progress",
        variant === "ghost" ? "rounded-pill disabled:opacity-70" : "rounded-none",
      )}
      {...props}
    >
      <span className={cn(buttonVariants({ variant, size }), className)}>{children}</span>
    </button>
  );
}
