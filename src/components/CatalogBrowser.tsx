"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, LayoutGrid, List, ChevronDown } from "lucide-react";
import {
  Product,
  CatalogInfo,
  lowestPrice,
  generaWithCounts,
  DEFAULT_CATALOG,
} from "@/lib/catalog";
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

const CATALOG_KEY = "tc_catalog";

export default function CatalogBrowser({
  products,
  catalogs,
}: {
  products: Product[];
  catalogs: CatalogInfo[];
}) {
  const [catalog, setCatalog] = useState<string>(DEFAULT_CATALOG);
  const [query, setQuery] = useState("");
  const [genus, setGenus] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<View>("grid");

  // Restore the last-used price list after mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CATALOG_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && catalogs.some((c) => c.id === saved)) setCatalog(saved);
    } catch {
      /* ignore */
    }
  }, [catalogs]);

  function switchCatalog(id: string) {
    setCatalog(id);
    setGenus(null);
    setQuery("");
    try {
      localStorage.setItem(CATALOG_KEY, id);
    } catch {
      /* ignore */
    }
  }

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

  return (
    <div>
      {/* Price-list switcher */}
      <div className="mb-6">
        <div className="inline-flex rounded-full border border-line bg-card p-1">
          {catalogs.map((c) => {
            const on = c.id === catalog;
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
