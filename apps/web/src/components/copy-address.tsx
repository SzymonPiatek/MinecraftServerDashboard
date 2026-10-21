"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      // Clipboard unavailable (e.g. insecure context); the address stays visible to copy by hand.
    }
  }

  return (
    <div className="relative inline-block max-w-full">
      <Button
        variant="secondary"
        size="flush"
        className="max-w-full items-stretch font-normal"
        onClick={copy}
      >
        <code className="min-w-0 truncate px-6 py-4 font-mono text-lg">{address}</code>
        <span className="flex items-center rounded-r-lg border-l-2 border-ink bg-accent px-6 font-bold whitespace-nowrap">
          {copied ? "Skopiowano!" : "Kopiuj IP"}
        </span>
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Adres skopiowany do schowka" : ""}
      </span>
    </div>
  );
}
