"use client";

import { useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { Product, Variant, formatMoney, breakColumns } from "@/lib/catalog";
import { noteRu } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

/** Add / stepper control for one specific variant. */
function VariantCart({ code, catalog }: { code: string; catalog: string }) {
  const { itemsFor, add, setQty } = useCart();
  const qty = itemsFor(catalog).find((l) => l.code === code)?.qty ?? 0;

  if (qty === 0) {
    return (
      <button
        onClick={() => add(code)}
        className="press inline-flex h-8 items-center gap-1 rounded-full bg-deep-forest px-3.5 text-xs text-parchment transition-colors hover:bg-headline"
      >
        <Plus size={14} /> В корзину
      </button>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-foreground/40">
      <button
        onClick={() => setQty(code, qty - 1)}
        aria-label="Меньше"
        className="press flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:text-accent"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-6 text-center font-mono text-sm text-headline tabular-nums">
        {qty}
      </span>
      <button
        onClick={() => setQty(code, qty + 1)}
        aria-label="Больше"
        className="press flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:text-accent"
      >
        <Plus size={14} />
      </button>
    </span>
  );
}

function VariantMeta({ v }: { v: Variant }) {
  return (
    <span className="font-mono text-[10px] text-faint">
      {v.article ?? v.code}
      {v.moq ? ` · MOQ ${v.moq}` : ""}
      {v.note ? ` · ${noteRu(v.note)}` : ""}
    </span>
  );
}

export default function VariantTable({ product }: { product: Product }) {
  const { setActiveCatalog } = useCart();
  const columns = breakColumns(product);

  // Viewing a product makes its price list the active cart in the header.
  useEffect(() => {
    setActiveCatalog(product.catalog);
  }, [product.catalog, setActiveCatalog]);

  return (
    <>
      {/* Narrow screens: stacked blocks, so prices wrap instead of scrolling sideways. */}
      <div className="divide-y divide-line sm:hidden">
        {product.variants.map((v) => (
          <div key={v.code} className="py-3 first:pt-0 last:pb-0">
            <span className="block text-sm text-foreground leading-snug">
              {v.description || v.code}
            </span>
            <VariantMeta v={v} />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {v.breaks.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-baseline gap-1 rounded-[4px] border border-line bg-paper px-2 py-1"
                >
                  <span className="text-[10px] text-faint">{b.label} шт.</span>
                  <span className="font-mono text-xs text-foreground">{formatMoney(b.price, product.currency)}</span>
                </span>
              ))}
            </div>
            <div className="mt-2.5">
              <VariantCart code={v.code} catalog={product.catalog} />
            </div>
          </div>
        ))}
      </div>

      {/* Wide screens: full table, sized to fit its container (no min-width). */}
      <table className="hidden w-full text-sm border-collapse sm:table">
        <thead>
          <tr className="text-left text-faint">
            <th className="pb-2 pr-4 font-medium text-xs uppercase tracking-[0.1em]">Вариант</th>
            {columns.map((c) => (
              <th
                key={c.label}
                className="pb-2 px-2 font-medium text-xs uppercase tracking-[0.08em] text-right font-mono whitespace-nowrap"
              >
                {c.label} шт.
              </th>
            ))}
            <th className="pb-2 pl-2" />
          </tr>
        </thead>
        <tbody>
          {product.variants.map((v) => {
            const priceByLabel = new Map(v.breaks.map((b) => [b.label, b.price]));
            return (
              <tr key={v.code} className="border-t border-line align-top">
                <td className="py-3 pr-4">
                  <span className="block text-foreground leading-snug">
                    {v.description || v.code}
                  </span>
                  <VariantMeta v={v} />
                </td>
                {columns.map((c) => (
                  <td
                    key={c.label}
                    className="py-3 px-2 text-right font-mono text-xs whitespace-nowrap"
                  >
                    {priceByLabel.has(c.label) ? (
                      <span className="text-foreground">{formatMoney(priceByLabel.get(c.label)!, product.currency)}</span>
                    ) : (
                      <span className="text-line">-</span>
                    )}
                  </td>
                ))}
                <td className="py-3 pl-2 text-right">
                  <VariantCart code={v.code} catalog={product.catalog} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
