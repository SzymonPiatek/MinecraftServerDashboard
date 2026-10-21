import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the custom theme tokens from globals.css, otherwise e.g. `text-display`
// would be mistaken for a text colour and dropped when merged with `text-ink`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display"],
      radius: ["input", "card", "pill"],
      shadow: ["card", "card-lift"],
      ease: ["spring", "snap"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
