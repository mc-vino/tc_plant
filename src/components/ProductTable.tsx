"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, lowestPrice, highestPrice, formatUSD } from "@/lib/catalog";
import { asset } from "@/lib/asset";
import { marketFor, rarityChipClass, MarketEstimate } from "@/lib/market";

type SortKey = "name" | "code" | "variants" | "low" | "high" | "rarity";
type Dir = "asc" | "desc";

interface Row {
  p: Product;
  m: MarketEstimate;
  low: number | null;
  high: number | null;
}

const NUMERIC: Set<SortKey> = new Set(["variants", "low", "high", "rarity"]);

function sortValue(row: Row, key: SortKey): number | string | null {
  switch (key) {
    case "name":
      return row.p.name;
    case "code":
      return row.p.code;
    case "variants":
      return row.p.variants.length;
    case "low":
      return row.low;
    case "high":
      return row.high;
    case "rarity":
      return row.m.rarityLevel;
  }
}

export default function ProductTable({ products }: { products: Product[] }) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [dir, setDir] = useState<Dir>("asc");

  const rows = useMemo<Row[]>(
    () => products.map((p) => ({ p, m: marketFor(p), low: lowestPrice(p), high: highestPrice(p) })),
    [products],
  );

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
    if (sortKey === key) setDir((dd) => (dd === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir(NUMERIC.has(key) ? "desc" : "asc");
    }
  }

  const arrow = (key: SortKey) => (sortKey === key ? (dir === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-card">
      <table className="w-full min-w-[720px] text-sm border-collapse">
        <thead>
          <tr className="text-left text-faint bg-paper">
            <Th onClick={() => toggle("name")} label={`Сорт${arrow("name")}`} className="pl-4 pr-3" />
            <Th onClick={() => toggle("code")} label={`Артикул${arrow("code")}`} />
            <Th onClick={() => toggle("variants")} label={`Вариантов${arrow("variants")}`} align="right" />
            <Th onClick={() => toggle("low")} label={`От${arrow("low")}`} align="right" />
            <Th onClick={() => toggle("high")} label={`До${arrow("high")}`} align="right" />
            <Th onClick={() => toggle("rarity")} label={`Редкость${arrow("rarity")}`} className="pr-4" />
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ p, m, low, high }) => (
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
                    <span className="text-[10px] uppercase tracking-[0.12em] text-faint">{p.genus}</span>
                  </span>
                </Link>
              </td>
              <td className="py-2.5 px-3 font-mono text-[11px] text-muted">{p.code}</td>
              <td className="py-2.5 px-3 text-right font-mono text-xs text-muted">{p.variants.length}</td>
              <td className="py-2.5 px-3 text-right font-mono text-sm font-medium text-accent-strong whitespace-nowrap">
                {low !== null ? formatUSD(low) : "-"}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-xs text-muted whitespace-nowrap">
                {high !== null ? formatUSD(high) : "-"}
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
  className = "",
}: {
  label: string;
  onClick: () => void;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th className={`py-3 px-3 font-medium text-xs ${className}`}>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-0.5 hover:text-foreground transition-colors whitespace-nowrap ${
          align === "right" ? "justify-end w-full" : ""
        }`}
      >
        {label}
      </button>
    </th>
  );
}
