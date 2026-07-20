"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Search, LayoutGrid, List, ChevronDown } from "lucide-react";
import { Product, CatalogInfo, lowestPrice, generaWithCounts } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { varieties } from "@/lib/i18n";
import ProductCard from "./ProductCard";
import ProductTable from "./ProductTable";

type SortKey = "name" | "price-asc" | "price-desc";
type View = "grid" | "table";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "name", label: "По названию (A-Z)" },
  { key: "price-asc", label: "Цена: по возрастанию" },
  { key: "price-desc", label: "Цена: по убыванию" },
];

const STORE_KEY = "tc_browse_v1";
// Runs before paint on the client; falls back to a no-op-ish effect during SSR.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface Persisted {
  view: View;
  sort: SortKey;
  genus: string | null;
  query: string;
  scroll: number;
}

export default function CatalogBrowser({
  products,
  catalogs,
}: {
  products: Product[];
  catalogs: CatalogInfo[];
}) {
  const { activeCatalog: catalog, setActiveCatalog, countFor } = useCart();
  const [query, setQuery] = useState("");
  const [genus, setGenus] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<View>("grid");

  const readyRef = useRef(false);
  // Scroll+view to restore when returning from a product page.
  const targetRef = useRef<{ scroll: number; view: View } | null>(null);

  function switchCatalog(id: string) {
    setActiveCatalog(id);
    setGenus(null);
    setQuery("");
  }

  // Restore the last browse state (view, sort, filters) before the first paint.
  useIsoLayoutEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Partial<Persisted>;
        if (s.view === "grid" || s.view === "table") setView(s.view);
        if (s.sort === "name" || s.sort === "price-asc" || s.sort === "price-desc") setSort(s.sort);
        if (typeof s.query === "string") setQuery(s.query);
        if (s.genus === null || typeof s.genus === "string") setGenus(s.genus ?? null);
        if (typeof s.scroll === "number") {
          targetRef.current = { scroll: s.scroll, view: s.view === "table" ? "table" : "grid" };
        }
      }
    } catch {
      /* ignore */
    }
    readyRef.current = true;
  }, []);

  // Persist browse state whenever it changes (once restore has run).
  useEffect(() => {
    if (!readyRef.current) return;
    try {
      const payload: Persisted = { view, sort, genus, query, scroll: window.scrollY };
      sessionStorage.setItem(STORE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [view, sort, genus, query]);

  // Keep the saved scroll position fresh while browsing.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (!readyRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        try {
          const raw = sessionStorage.getItem(STORE_KEY);
          const s = raw ? (JSON.parse(raw) as Persisted) : ({} as Persisted);
          s.scroll = window.scrollY;
          sessionStorage.setItem(STORE_KEY, JSON.stringify(s));
        } catch {
          /* ignore */
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const active = catalogs.find((c) => c.id === catalog) ?? catalogs[0];
  const genera = useMemo(() => generaWithCounts(catalog), [catalog]);
  const inCatalog = useMemo(() => products.filter((p) => p.catalog === catalog), [products, catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = inCatalog.filter((p) => {
      if (genus && p.genus !== genus) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    });
    const priceOf = (p: Product) => lowestPrice(p) ?? Infinity;
    return [...list].sort((a, b) => {
      if (sort === "price-asc") return priceOf(a) - priceOf(b);
      if (sort === "price-desc") return priceOf(b) - priceOf(a);
      return a.name.localeCompare(b.name);
    });
  }, [inCatalog, query, genus, sort]);

  // Once the restored view is on screen with its content, jump back to where we were.
  useIsoLayoutEffect(() => {
    const t = targetRef.current;
    if (!t || view !== t.view) return;
    window.scrollTo(0, t.scroll);
    requestAnimationFrame(() => window.scrollTo(0, t.scroll));
    targetRef.current = null;
  }, [view, filtered.length]);

  return (
    <div>
      {/* Price-list switcher */}
      <div className="mb-6">
        <div className="inline-flex rounded-full border border-line bg-card p-1">
          {catalogs.map((c) => {
            const on = c.id === catalog;
            const inCart = countFor(c.id);
            return (
              <button
                key={c.id}
                onClick={() => switchCatalog(c.id)}
                aria-pressed={on}
                className={`press relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  on ? "text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="catalogToggle"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">
                  {c.label}
                  <span className={`ml-1.5 ${on ? "opacity-70" : "opacity-55"}`}>{c.count}</span>
                </span>
                {inCart > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 z-20 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                      on ? "bg-white text-accent-strong" : "bg-accent text-white"
                    }`}
                    aria-label={`${inCart} в корзине`}
                  >
                    {inCart > 99 ? "99+" : inCart}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {active?.description && (
          <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">{active.description}</p>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative lg:max-w-sm lg:flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или артикулу…"
            className="w-full rounded-full border border-line bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors hover:border-accent/50 focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort varieties"
              className="appearance-none rounded-full border border-line bg-card py-2.5 pl-4 pr-9 text-sm outline-none transition-colors hover:border-accent/50 focus:border-accent cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-faint"
            />
          </div>

          <div className="flex rounded-full border border-line bg-card p-0.5">
            {(
              [
                { v: "grid" as View, label: "Плиткой", Icon: LayoutGrid },
                { v: "table" as View, label: "Таблицей", Icon: List },
              ]
            ).map(({ v, label, Icon }) => {
              const on = view === v;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-label={label}
                  aria-pressed={on}
                  className={`press relative flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    on ? "" : "text-faint hover:text-foreground"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="viewToggle"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                    />
                  )}
                  <Icon size={17} className={`relative z-10 ${on ? "text-white" : ""}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Genus filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={genus === null} onClick={() => setGenus(null)}>
          Все <span className="opacity-55">{inCatalog.length}</span>
        </Chip>
        {genera.map(({ genus: g, count }) => (
          <Chip key={g} active={genus === g} onClick={() => setGenus(g)}>
            {g} <span className="opacity-55">{count}</span>
          </Chip>
        ))}
      </div>

      <p className="mt-5 mb-4 font-mono text-xs text-faint">
        {varieties(filtered.length)}
        {genus ? ` · ${genus}` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-line py-20 text-center">
          <p className="display text-xl text-muted">Ничего не найдено.</p>
          <button
            onClick={() => {
              setQuery("");
              setGenus(null);
            }}
            className="press mt-3 text-sm text-accent transition-colors hover:text-accent-strong"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.code} product={p} />
          ))}
        </div>
      ) : (
        <ProductTable products={filtered} />
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`press rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-accent bg-accent text-paper"
          : "border-line bg-card text-muted hover:border-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
