"use client";

import { Plus, Minus } from "lucide-react";
import { Product, TIERS, formatUSD } from "@/lib/catalog";
import { noteRu } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

export default function VariantTable({ product }: { product: Product }) {
  const { items, add, setQty, setOpen } = useCart();
  const qtyOf = (code: string) => items.find((l) => l.code === code)?.qty ?? 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm border-collapse">
        <thead>
          <tr className="text-left text-faint">
            <th className="pb-2 pr-4 font-medium text-xs uppercase tracking-[0.1em]">Вариант</th>
            {TIERS.map((t) => (
              <th
                key={t}
                className="pb-2 px-2 font-medium text-xs uppercase tracking-[0.08em] text-right font-mono whitespace-nowrap"
              >
                {t} шт.
              </th>
            ))}
            <th className="pb-2 pl-2" />
          </tr>
        </thead>
        <tbody>
          {product.variants.map((v) => {
            const qty = qtyOf(v.code);
            return (
              <tr key={v.code} className="border-t border-line align-top">
                <td className="py-3 pr-4">
                  <span className="block text-foreground leading-snug">{v.description || v.code}</span>
                  <span className="font-mono text-[10px] text-faint">
                    {v.code}
                    {v.note ? ` · ${noteRu(v.note)}` : ""}
                  </span>
                </td>
                {TIERS.map((t) => (
                  <td key={t} className="py-3 px-2 text-right font-mono text-xs whitespace-nowrap">
                    {v.prices[t] !== undefined ? (
                      <span className="text-foreground">{formatUSD(v.prices[t]!)}</span>
                    ) : (
                      <span className="text-line">-</span>
                    )}
                  </td>
                ))}
                <td className="py-3 pl-2 text-right">
                  {qty === 0 ? (
                    <button
                      onClick={() => {
                        add(v.code);
                        setOpen(true);
                      }}
                      className="press inline-flex h-8 items-center gap-1 rounded-full bg-accent px-3 text-xs font-medium text-white transition-colors hover:bg-accent-strong"
                    >
                      <Plus size={14} /> В корзину
                    </button>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-line">
                      <button
                        onClick={() => setQty(v.code, qty - 1)}
                        aria-label="Меньше"
                        className="press flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-foreground"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center font-mono text-sm">{qty}</span>
                      <button
                        onClick={() => setQty(v.code, qty + 1)}
                        aria-label="Больше"
                        className="press flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-foreground"
                      >
                        <Plus size={14} />
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
