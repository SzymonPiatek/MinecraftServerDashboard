import { cn } from "@/lib/cn";
import type { ActionFeedback } from "./use-action";

export function FeedbackLine({ feedback }: { feedback: ActionFeedback | null }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn("font-semibold empty:hidden", feedback?.tone === "error" && "text-accent-3")}
    >
      {feedback?.text}
    </p>
  );
}
