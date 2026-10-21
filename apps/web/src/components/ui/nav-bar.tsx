import Image from "next/image";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Floating pill pinned to the top of the viewport; shared by the public site and the admin panel. */
export function FloatingNav({ className, children, ...props }: ComponentProps<"nav">) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-10 flex justify-center px-(--page-gutter)">
      <nav
        className={cn(
          "pointer-events-auto flex max-w-full items-center justify-between gap-6 rounded-pill border-[1.5px] border-ink bg-[color-mix(in_oklch,var(--color-paper)_88%,transparent)] py-2 pr-2 pl-4 shadow-[0_3px_0_var(--color-ink)] backdrop-blur-md max-sm:p-1",
          className,
        )}
        {...props}
      >
        {children}
      </nav>
    </header>
  );
}

export function NavBrand({ className, children, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "inline-flex items-center gap-2 font-bold tracking-tight whitespace-nowrap text-ink no-underline max-sm:hidden",
        className,
      )}
      {...props}
    >
      <Image src="/favicon.ico" alt="" width={24} height={24} unoptimized />
      {children}
    </a>
  );
}

export function NavList({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={cn("m-0 flex list-none items-center gap-1 p-0", className)} {...props} />;
}
