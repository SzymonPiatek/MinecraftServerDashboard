import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Phones stack name, description and action; from sm the action sits beside the name with the description below;
 * from lg the three are real columns. Shared by the gamerule and server.properties lists.
 */
const COLUMNS =
  "grid gap-x-4 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[19rem_minmax(0,1fr)_minmax(15rem,22rem)]";

export function SettingsHeader({ names }: { names: [string, string, string] }) {
  return (
    <div className={cn(COLUMNS, "hidden border-b-2 border-ink py-2 font-bold lg:grid")}>
      <span>{names[0]}</span>
      <span>{names[1]}</span>
      <span className="justify-self-end">{names[2]}</span>
    </div>
  );
}

interface SettingRowProps {
  name: string;
  description: ReactNode;
  children: ReactNode;
}

export function SettingRow({ name, description, children }: SettingRowProps) {
  return (
    <li className={cn(COLUMNS, "items-center gap-y-2 border-b border-line py-3")}>
      <span className="min-w-0 font-mono text-sm font-bold break-words sm:col-start-1 sm:row-start-1">
        {name}
      </span>
      <span className="min-w-0 text-sm text-ink-muted sm:col-span-2 sm:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
        {description}
      </span>
      <div className="min-w-0 sm:col-start-2 sm:row-start-1 lg:col-start-3 lg:flex lg:justify-end">
        {children}
      </div>
    </li>
  );
}
