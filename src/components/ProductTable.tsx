"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, TIERS, highestPrice, formatUSD } from "@/lib/catalog";
import { noteRu } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { marketFor, rarityChipClass, MarketEstimate } from "@/lib/market";

type SortKey = "name" | "code" | "t0" | "t1" | "t2" | "t3" | "t4" | "clone" | "rarity";
type Dir = "asc" | "desc";

interface Row {
  p: Product;
  m: MarketEstimate;
}

const NUMERIC: Set<SortKey> = new Set(["t0", "t1", "t2", "t3", "t4", "clone", "rarity"]);

function sortValue(row: Row, key: SortKey): number | string | null {
  const { p, m } = row;
  switch (key) {
    case "name":
      return p.name;
    case "code":
      return p.code;
    case "t0":
    case "t1":
    case "t2":
    case "t3":
    case "t4":
      return p.prices[TIERS[Number(key[1])]] ?? null;
    // Clone-price ordering uses the HIGHEST tier price, so rows with empty
    // cheaper tiers are not treated as if they had the minimum price.
    case "clone":
      return highestPrice(p);
    case "rarity":
      return m.rarityLevel;
  }
}

export default function ProductTable({ products }: { products: Product[] }) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [dir, setDir] = useState<Dir>("asc");

  const rows = useMemo<Row[]>(() => products.map((p) => ({ p, m: marketFor(p) })), [products]);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const factor = dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      if (typeof va === "string" && typeof vb === "string") return va.localeCompare(vb) * factor;
      return ((va as number) - (vb as number)) * factor;
    });
  }, [rows, sortKey, dir]);

  function toggle(key: SortKey) {
    if (sortKey === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir(NUMERIC.has(key) ? "desc" : "asc");
    }
  }

  const arrow = (key: SortKey) => (sortKey === key ? (dir === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-card">
      <table className="w-full min-w-[960px] text-sm border-collapse">
        <thead>
          <tr className="text-left text-faint bg-paper">
            <Th onClick={() => toggle("name")} label={`Сорт${arrow("name")}`} className="pl-4 pr-3" />
            <Th onClick={() => toggle("code")} label={`Артикул${arrow("code")}`} />
            {TIERS.map((t, i) => (
              <Th
                key={t}
                onClick={() => toggle(`t${i}` as SortKey)}
                label={`${t}${arrow(`t${i}` as SortKey)}`}
                align="right"
                mono
              />
            ))}
            <Th onClick={() => toggle("clone")} label={`Клон, макс${arrow("clone")}`} align="right" />
            <Th onClick={() => toggle("rarity")} label={`Редкость${arrow("rarity")}`} className="pr-4" />
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ p, m }) => (
            <tr key={p.code} className="border-t border-line hover:bg-accent-soft/50 transition-colors">
              <td className="py-2.5 pl-4 pr-3">
                <Link href={`/plant/${p.code}`} className="flex items-center gap-3 group">
                  <span className="relative h-11 w-9 shrink-0 overflow-hidden rounded bg-accent-soft">
                    {p.image ? (
                      <Image src={asset(p.image)} alt="" fill sizes="36px" className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center display italic text-accent/30">
                        {p.genus.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span>
                    <span className="block display text-[15px] leading-tight group-hover:text-accent transition-colors">
                      {p.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.12em] text-faint">
                      {p.genus}
                      {p.note ? ` · ${noteRu(p.note)}` : ""}
                    </span>
                  </span>
                </Link>
              </td>
              <td className="py-2.5 px-3 font-mono text-[11px] text-muted">{p.code}</td>
              {TIERS.map((t) => (
                <td key={t} className="py-2.5 px-3 text-right font-mono text-xs text-muted whitespace-nowrap">
                  {p.prices[t] !== undefined ? formatUSD(p.prices[t]!) : <span className="text-line">-</span>}
                </td>
              ))}
              <td className="py-2.5 px-3 text-right font-mono text-xs text-muted whitespace-nowrap">
                {highestPrice(p) !== null ? formatUSD(highestPrice(p)!) : "-"}
              </td>
              <td className="py-2.5 px-3 pr-4">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${rarityChipClass(m.rarityLevel)}`}
                >
                  {m.rarity}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  label,
  onClick,
  align = "left",
  mono = false,
  className = "",
}: {
  label: string;
  onClick: () => void;
  align?: "left" | "right";
  mono?: boolean;
  className?: string;
}) {
  return (
    <th className={`py-3 px-3 font-medium text-xs ${className}`}>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-0.5 hover:text-foreground transition-colors whitespace-nowrap ${
          align === "right" ? "justify-end w-full" : ""
        } ${mono ? "font-mono" : ""}`}
      >
        {label}
      </button>
    </th>
  );
}
