import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "../ui/card";

interface PanelProps extends Omit<ComponentProps<"section">, "title"> {
  title: ReactNode;
  actions?: ReactNode;
}

export function Panel({ title, actions, className, children, ...props }: PanelProps) {
  return (
    <Card
      as="section"
      padding="none"
      elevated
      className={cn("grid content-start gap-4 p-6", className)}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg">{title}</h2>
        {actions}
      </div>
      {children}
    </Card>
  );
}
