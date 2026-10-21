import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { inputVariants } from "./input";

export type TextareaProps = ComponentProps<"textarea"> & VariantProps<typeof inputVariants>;

export function Textarea({ size, state, className, ...props }: TextareaProps) {
  return <textarea className={cn(inputVariants({ size, state }), "resize-y", className)} {...props} />;
}
