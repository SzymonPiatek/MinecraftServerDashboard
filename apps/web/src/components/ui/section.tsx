import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-[min(100%-2*var(--page-gutter),var(--page-max))]", className)} {...props} />
  );
}

export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("scroll-mt-16 py-24", className)} {...props} />;
}

interface SectionHeadProps extends Omit<ComponentProps<"div">, "title"> {
  title: ReactNode;
  description?: ReactNode;
}

export function SectionHead({ title, description, className, ...props }: SectionHeadProps) {
  return (
    <div className={cn("mb-10 grid max-w-160 gap-2", className)} {...props}>
      <h2 className="text-3xl">{title}</h2>
      {description && <p className="text-lg text-ink-muted">{description}</p>}
    </div>
  );
}
