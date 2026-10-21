import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const inputVariants = cva("w-full rounded-input border-2 bg-paper font-normal text-ink", {
  variants: {
    size: {
      md: "p-4",
      lg: "p-5 text-lg",
    },
    state: {
      default: "border-ink",
      invalid: "border-accent-3",
    },
  },
  defaultVariants: { size: "md", state: "default" },
});

export type InputProps = Omit<ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>;

export function Input({ size, state, className, ...props }: InputProps) {
  return <input className={cn(inputVariants({ size, state }), className)} {...props} />;
}
