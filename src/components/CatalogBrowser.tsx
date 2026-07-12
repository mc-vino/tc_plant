"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { MagnifyingGlass, SquaresFour, Rows, CaretDown } from "@phosphor-icons/react";
import { Product, lowestPrice } from "@/lib/catalog";
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

export default function CatalogBrowser({
  products,
  genera,
}: {
  products: Product[];
  genera: { genus: string; count: number }[];
}) {
  const [query, setQuery] = useState("");
  const [genus, setGenus] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<View>("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
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
  }, [products, query, genus, sort]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative lg:max-w-sm lg:flex-1">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или артикулу…"
            className="w-full rounded-full border border-line bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort varieties"
              className="appearance-none rounded-full border border-line bg-card py-2.5 pl-4 pr-9 text-sm outline-none transition-colors focus:border-accent cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <CaretDown
              size={14}
              weight="bold"
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-faint"
            />
          </div>

          <div className="flex rounded-full border border-line bg-card p-0.5">
            {(
              [
                { v: "grid" as View, label: "Плиткой", Icon: SquaresFour },
                { v: "table" as View, label: "Таблицей", Icon: Rows },
              ]
            ).map(({ v, label, Icon }) => {
              const active = view === v;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-label={label}
                  aria-pressed={active}
                  className="press relative flex h-8 w-8 items-center justify-center rounded-full"
                >
                  {active && (
                    <motion.span
                      layoutId="viewToggle"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                    />
                  )}
                  <Icon
                    size={18}
                    weight={active ? "fill" : "regular"}
                    className={`relative z-10 transition-colors ${active ? "text-paper" : "text-faint"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Genus filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={genus === null} onClick={() => setGenus(null)}>
          Все <span className="opacity-55">{products.length}</span>
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
          <p className="font-serif text-xl text-muted">Ничего не найдено.</p>
          <button
            onClick={() => {
              setQuery("");
              setGenus(null);
            }}
            className="mt-3 text-sm text-accent hover:text-accent-strong"
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
