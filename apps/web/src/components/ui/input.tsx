import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Minecraft text field: a 3×3 sprite (1px border, black fill) scaled 3× and sliced with `border-image`. */
export const inputVariants = cva(
  [
    "w-full",
    "rounded-none",
    "border-3",
    "border-solid",
    "bg-transparent",
    "font-pixel",
    "font-normal",
    "text-white",
    "placeholder:text-[#707070]",
    "disabled:opacity-60",
    "[image-rendering:pixelated]",
    "[border-image:url(/widget/text_field.png)_1_fill/1/0_stretch]",
    "focus:[border-image-source:url(/widget/text_field_highlighted.png)]",
    // The white highlighted border is the focus indicator, so the global outline would double it.
    "focus-visible:outline-none",
  ],
  {
    variants: {
      size: {
        md: "p-2 text-[1.4rem]",
        lg: "p-2.5 text-[1.75rem]",
      },
      state: {
        default: "",
        invalid: [
          "[border-image-source:url(/widget/text_field_invalid.png)]",
          "focus:[border-image-source:url(/widget/text_field_invalid.png)]",
        ],
      },
    },
    defaultVariants: { size: "md", state: "default" },
  },
);

export type InputProps = Omit<ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>;

export function Input({ size, state, className, ...props }: InputProps) {
  return <input className={cn(inputVariants({ size, state }), className)} {...props} />;
}
