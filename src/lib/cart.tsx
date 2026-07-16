"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export interface CartLine {
  code: string; // variant code
  qty: number;
}

interface CartContextValue {
  items: CartLine[];
  count: number;
  add: (code: string, qty?: number) => void;
  setQty: (code: string, qty: number) => void;
  remove: (code: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tc_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  // Load persisted cart once, after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(parsed.filter((l) => l && typeof l.code === "string" && l.qty > 0));
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((code: string, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((l) => l.code === code);
      if (found) return prev.map((l) => (l.code === code ? { ...l, qty: l.qty + qty } : l));
      return [...prev, { code, qty }];
    });
  }, []);

  const setQty = useCallback((code: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((l) => l.code !== code)
        : prev.map((l) => (l.code === code ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((code: string) => {
    setItems((prev) => prev.filter((l) => l.code !== code));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, l) => s + l.qty, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, count, add, setQty, remove, clear, open, setOpen }),
    [items, count, add, setQty, remove, clear, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
