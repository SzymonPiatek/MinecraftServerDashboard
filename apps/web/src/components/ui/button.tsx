import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  [
    "inline-flex",
    "min-w-0",
    "items-center",
    "justify-center",
    "whitespace-nowrap",
    "text-ink",
    "no-underline",
    "transition-[transform,box-shadow,background-color]",
    "duration-160",
    "ease-snap",
  ],
  {
    variants: {
      variant: {
        primary: [
          "rounded-input",
          "border-2",
          "border-ink",
          "bg-accent",
          "font-bold",
          "shadow-[0_5px_0_var(--color-ink)]",
          "group-hover/btn:group-enabled/btn:-translate-y-0.5",
          "group-hover/btn:group-enabled/btn:shadow-[0_7px_0_var(--color-ink)]",
          "group-active/btn:group-enabled/btn:translate-y-[3px]",
          "group-active/btn:group-enabled/btn:shadow-[0_2px_0_var(--color-ink)]",
        ],
        secondary: [
          "rounded-input",
          "border-2",
          "border-ink",
          "bg-paper",
          "font-bold",
          "shadow-[0_5px_0_var(--color-ink)]",
          "group-hover/btn:group-enabled/btn:-translate-y-0.5",
          "group-hover/btn:group-enabled/btn:shadow-[0_7px_0_var(--color-ink)]",
          "group-active/btn:group-enabled/btn:translate-y-[3px]",
          "group-active/btn:group-enabled/btn:shadow-[0_2px_0_var(--color-ink)]",
        ],
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
        "group/btn inline-flex max-w-full cursor-pointer disabled:cursor-progress disabled:opacity-70",
        variant === "ghost" ? "rounded-pill" : "rounded-input",
      )}
      {...props}
    >
      <span className={cn(buttonVariants({ variant, size }), className)}>{children}</span>
    </button>
  );
}
