"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { getVariant, catalogs, DEFAULT_CATALOG } from "@/lib/catalog";

export interface CartLine {
  code: string; // variant code
  qty: number;
}

type Carts = Record<string, CartLine[]>; // keyed by catalog id

interface CartContextValue {
  /** Active catalog (drives the visible cart and the price-list switcher). */
  activeCatalog: string;
  setActiveCatalog: (id: string) => void;
  /** Lines of the active cart. */
  items: CartLine[];
  /** Total quantity in the active cart. */
  count: number;
  itemsFor: (catalogId: string) => CartLine[];
  countFor: (catalogId: string) => number;
  /** Add/update route to the cart of the item's own catalog. */
  add: (code: string, qty?: number) => void;
  setQty: (code: string, qty: number) => void;
  remove: (code: string) => void;
  /** Clears the active cart only. */
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CARTS_KEY = "tc_carts";
const CATALOG_KEY = "tc_catalog";
const LEGACY_KEY = "tc_cart";

const KNOWN = new Set(catalogs.map((c) => c.id));

/** Catalog a variant code belongs to (falls back to the default list). */
function catalogOf(code: string): string {
  return getVariant(code)?.product.catalog ?? DEFAULT_CATALOG;
}

/** Minimum order quantity for a variant (price-list MOQ, else 1). */
function minQtyOf(code: string): number {
  return getVariant(code)?.variant.moq ?? 1;
}

function sanitize(raw: unknown): Carts {
  const out: Carts = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [cat, lines] of Object.entries(raw as Record<string, unknown>)) {
    if (!KNOWN.has(cat) || !Array.isArray(lines)) continue;
    out[cat] = lines
      .filter(
        (l): l is CartLine =>
          Boolean(l) && typeof (l as CartLine).code === "string" && (l as CartLine).qty > 0,
      )
      // Enforce MOQ on anything restored/migrated so quantities stay valid.
      .map((l) => ({ code: l.code, qty: Math.max(l.qty, minQtyOf(l.code)) }));
  }
  return out;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [carts, setCarts] = useState<Carts>({});
  const [activeCatalog, setActiveCatalogState] = useState<string>(DEFAULT_CATALOG);
  const [open, setOpen] = useState(false);

  // Load persisted carts + active catalog once (migrating the old single cart).
  useEffect(() => {
    try {
      const rawCarts = localStorage.getItem(CARTS_KEY);
      if (rawCarts) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCarts(sanitize(JSON.parse(rawCarts)));
      } else {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          const arr = JSON.parse(legacy) as CartLine[];
          if (Array.isArray(arr)) {
            const map: Carts = {};
            for (const l of arr) {
              if (!l || typeof l.code !== "string" || !(l.qty > 0)) continue;
              const cat = catalogOf(l.code);
              (map[cat] ??= []).push({ code: l.code, qty: l.qty });
            }
             
            setCarts(map);
          }
          localStorage.removeItem(LEGACY_KEY);
        }
      }
      const cat = localStorage.getItem(CATALOG_KEY);
       
      if (cat && KNOWN.has(cat)) setActiveCatalogState(cat);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CARTS_KEY, JSON.stringify(carts));
    } catch {
      /* ignore */
    }
  }, [carts]);

  const setActiveCatalog = useCallback((id: string) => {
    setActiveCatalogState(id);
    try {
      localStorage.setItem(CATALOG_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const add = useCallback(
    (code: string, qty = 1) => {
      const cat = catalogOf(code);
      const moq = minQtyOf(code);
      setCarts((prev) => {
        const list = prev[cat] ?? [];
        const found = list.find((l) => l.code === code);
        const next = found
          ? list.map((l) => (l.code === code ? { ...l, qty: l.qty + qty } : l))
          : [...list, { code, qty: Math.max(qty, moq) }]; // new line starts at MOQ
        return { ...prev, [cat]: next };
      });
      setActiveCatalog(cat);
    },
    [setActiveCatalog],
  );

  const setQty = useCallback((code: string, qty: number) => {
    const cat = catalogOf(code);
    const moq = minQtyOf(code);
    setCarts((prev) => {
      const list = prev[cat] ?? [];
      // Below MOQ is not a valid order, so stepping under it removes the line.
      const next =
        qty < moq
          ? list.filter((l) => l.code !== code)
          : list.map((l) => (l.code === code ? { ...l, qty } : l));
      return { ...prev, [cat]: next };
    });
  }, []);

  const remove = useCallback((code: string) => {
    const cat = catalogOf(code);
    setCarts((prev) => ({ ...prev, [cat]: (prev[cat] ?? []).filter((l) => l.code !== code) }));
  }, []);

  const clear = useCallback(() => {
    setCarts((prev) => ({ ...prev, [activeCatalog]: [] }));
  }, [activeCatalog]);

  const itemsFor = useCallback((catalogId: string) => carts[catalogId] ?? [], [carts]);
  const countFor = useCallback(
    (catalogId: string) => (carts[catalogId] ?? []).reduce((s, l) => s + l.qty, 0),
    [carts],
  );

  const items = useMemo(() => carts[activeCatalog] ?? [], [carts, activeCatalog]);
  const count = useMemo(() => items.reduce((s, l) => s + l.qty, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      activeCatalog,
      setActiveCatalog,
      items,
      count,
      itemsFor,
      countFor,
      add,
      setQty,
      remove,
      clear,
      open,
      setOpen,
    }),
    [activeCatalog, setActiveCatalog, items, count, itemsFor, countFor, add, setQty, remove, clear, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
