"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const TOAST_MS = 2400;

interface Toast {
  id: number;
  text: string;
}

const ToastContext = createContext<(text: string) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((text: string) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), text });
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext value={show}>
      {children}
      {/* The live region stays mounted so screen readers announce the text when it appears. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-(--page-gutter)"
      >
        {toast && (
          <p
            key={toast.id}
            className="animate-toast-in border-2 border-[#2b0a5e] bg-[#100010]/95 px-4 py-2 font-pixel text-xl text-white [image-rendering:pixelated] [text-shadow:2px_2px_0_#3f3f3f]"
          >
            {toast.text}
          </p>
        )}
      </div>
    </ToastContext>
  );
}

export const useToast = () => useContext(ToastContext);
