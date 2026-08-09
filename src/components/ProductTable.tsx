"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, lowestPrice, highestPrice, formatMoney } from "@/lib/catalog";
import { asset } from "@/lib/asset";
import { marketFor, rarityChipClass, MarketEstimate } from "@/lib/market";
import { usePlantModal, isPlainLeftClick } from "@/lib/plantModal";
import AddToCartButton from "./AddToCartButton";
import PhotoButton from "./PhotoButton";

type SortKey = "name" | "variants" | "low" | "high" | "rarity";
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
  const { open } = usePlantModal();
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

  const MOBILE_SORTS: { key: SortKey; label: string }[] = [
    { key: "name", label: "Сорт" },
    { key: "low", label: "Цена от" },
    { key: "high", label: "До" },
    { key: "rarity", label: "Редкость" },
  ];

  return (
    <>
      {/* Phones: compact rows, so the price is visible without sideways scrolling. */}
      <div className="md:hidden">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-faint">Сортировка:</span>
          {MOBILE_SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              aria-pressed={sortKey === s.key}
              className={`press rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                sortKey === s.key
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-card text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              {s.label}
              {arrow(s.key)}
            </button>
          ))}
        </div>

        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-card">
          {sorted.map(({ p, low, high }) => (
            <li key={p.code} className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="flex shrink-0 items-center gap-1.5">
                <PhotoButton name={p.name} size="sm" elevated={false} />
                <AddToCartButton product={p} size="sm" elevated={false} />
              </div>
              <Link
                href={`/plant/${p.code}`}
                onClick={(e) => {
                  if (!isPlainLeftClick(e)) return;
                  e.preventDefault();
                  open(p.code);
                }}
                className="flex min-w-0 flex-1 items-center gap-2.5"
              >
                <span className="relative h-10 w-8 shrink-0 overflow-hidden rounded bg-accent-soft">
                  {p.image ? (
                    <Image src={asset(p.image)} alt="" fill sizes="32px" className="object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center display italic text-accent/30">
                      {p.genus.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block display text-[13.5px] leading-tight">{p.name}</span>
                  <span className="text-[9px] uppercase tracking-[0.12em] text-faint">
                    {p.genus}
                  </span>
                </span>
                <span className="shrink-0 text-right leading-tight">
                  <span className="block font-mono text-[13px] font-medium text-accent-strong">
                    {low !== null ? formatMoney(low, p.currency) : "-"}
                  </span>
                  {high !== null && high !== low && (
                    <span className="block font-mono text-[10px] text-faint">
                      до {formatMoney(high, p.currency)}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Tablet and up: the full table. */}
      <div className="hidden overflow-x-auto rounded-card border border-line bg-card md:block">
      <table className="w-full min-w-[720px] text-sm border-collapse">
        <thead>
          <tr className="text-left text-faint bg-paper">
            <th className="w-px py-3 pl-4 pr-2" />
            <Th onClick={() => toggle("name")} label={`Сорт${arrow("name")}`} className="pr-3" />
            <Th onClick={() => toggle("low")} label={`Цена от${arrow("low")}`} align="right" />
            <Th onClick={() => toggle("high")} label={`До${arrow("high")}`} align="right" />
            <Th onClick={() => toggle("variants")} label={`Вариантов${arrow("variants")}`} align="right" />
            <Th onClick={() => toggle("rarity")} label={`Редкость${arrow("rarity")}`} className="pr-4" />
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ p, m, low, high }) => (
            <tr key={p.code} className="border-t border-line hover:bg-accent-soft/50 transition-colors">
              <td className="py-2.5 pl-4 pr-2 align-middle">
                <div className="flex items-center gap-1.5">
                  <PhotoButton name={p.name} size="sm" elevated={false} />
                  <AddToCartButton product={p} size="sm" elevated={false} />
                </div>
              </td>
              <td className="py-2.5 pr-3">
                <Link
                  href={`/plant/${p.code}`}
                  onClick={(e) => {
                    if (!isPlainLeftClick(e)) return;
                    e.preventDefault();
                    open(p.code);
                  }}
                  className="flex items-center gap-3 group"
                >
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
              <td className="py-2.5 px-3 text-right font-mono text-sm font-medium text-accent-strong whitespace-nowrap">
                {low !== null ? formatMoney(low, p.currency) : "-"}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-xs text-muted whitespace-nowrap">
                {high !== null ? formatMoney(high, p.currency) : "-"}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-xs text-muted">{p.variants.length}</td>
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
    </>
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
