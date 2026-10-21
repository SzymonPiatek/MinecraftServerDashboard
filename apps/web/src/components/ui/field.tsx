import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps extends ComponentProps<"label"> {
  label: ReactNode;
}

/** Label wrapping a control, so no `htmlFor`/`id` pairing is needed. */
export function Field({ label, className, children, ...props }: FieldProps) {
  return (
    <label className={cn("grid gap-2 font-semibold", className)} {...props}>
      <span>{label}</span>
      {children}
    </label>
  );
}
