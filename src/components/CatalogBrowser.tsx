"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/catalog";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
  genera: { genus: string; count: number }[];
}

export default function CatalogBrowser({ products, genera }: Props) {
  const [query, setQuery] = useState("");
  const [genus, setGenus] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (genus && p.genus !== genus) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      );
    });
  }, [products, query, genus]);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or code…"
          className="w-full rounded-lg border border-line bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <div className="flex flex-wrap gap-2">
          <Chip active={genus === null} onClick={() => setGenus(null)}>
            All <span className="opacity-60">{products.length}</span>
          </Chip>
          {genera.map(({ genus: g, count }) => (
            <Chip key={g} active={genus === g} onClick={() => setGenus(g)}>
              {g} <span className="opacity-60">{count}</span>
            </Chip>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted mb-4">
        {filtered.length} {filtered.length === 1 ? "variety" : "varieties"}
      </p>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted">No varieties match your search.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.code} product={p} />
          ))}
        </div>
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
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-accent bg-accent text-white dark:text-background"
          : "border-line bg-card text-foreground hover:border-accent"
      }`}
    >
      {children}
    </button>
  );
}
