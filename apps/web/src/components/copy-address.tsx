"use client";

import { Button } from "./ui/button";
import { useToast } from "./ui/toast";

export function CopyAddress({ address }: { address: string }) {
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      toast("Adres serwera skopiowany do schowka!");
    } catch {
      // Clipboard unavailable (e.g. insecure context); the address stays visible to copy by hand.
      toast("Nie udało się skopiować. Zaznacz adres ręcznie.");
    }
  }

  return (
    <Button size="lg" className="max-w-full" aria-label={`Skopiuj adres serwera ${address}`} onClick={copy}>
      <span className="truncate">{address}</span>
    </Button>
  );
}
