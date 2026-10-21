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
  /** Keeps the title and description on one line, shrinking them to the available width instead of wrapping. */
  nowrap?: boolean;
}

export function SectionHead({ title, description, nowrap, className, ...props }: SectionHeadProps) {
  return (
    <div className={cn("mb-10 grid max-w-160 gap-2", nowrap && "@container", className)} {...props}>
      <h2 className={cn("text-3xl", nowrap && "text-[min(2.75rem,9cqw)] whitespace-nowrap")}>{title}</h2>
      {description && (
        <p
          className={cn(
            "text-lg text-paper/85 [&_a]:text-accent",
            nowrap && "text-[min(1.25rem,4.4cqw)] whitespace-nowrap",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
