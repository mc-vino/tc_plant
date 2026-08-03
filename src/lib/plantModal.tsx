"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface PlantModalValue {
  /** Product code currently shown in the dialog, or null when closed. */
  code: string | null;
  open: (code: string) => void;
  close: () => void;
}

const Ctx = createContext<PlantModalValue | null>(null);

export function PlantModalProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState<string | null>(null);

  const open = useCallback((next: string) => {
    setCode(next);
    // Push a history entry so the device back gesture closes the dialog
    // instead of leaving the catalogue. The URL stays as it is.
    try {
      history.pushState({ tcPlantModal: next }, "");
    } catch {
      /* ignore */
    }
  }, []);

  const close = useCallback(() => {
    setCode((cur) => {
      if (cur !== null) {
        try {
          // Undo our own entry only when it is the one on top.
          if (history.state?.tcPlantModal) history.back();
        } catch {
          /* ignore */
        }
      }
      return null;
    });
  }, []);

  // Back/forward navigation closes the dialog.
  useEffect(() => {
    const onPop = () => setCode(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const value = useMemo<PlantModalValue>(() => ({ code, open, close }), [code, open, close]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlantModal(): PlantModalValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlantModal must be used within PlantModalProvider");
  return ctx;
}

/**
 * True when a click on a link should be handled in-page rather than by the
 * browser: plain left click only. Modifier clicks, middle click and the
 * context menu keep their native "open in new tab/window" behaviour.
 */
export function isPlainLeftClick(e: React.MouseEvent): boolean {
  return (
    e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented
  );
}
