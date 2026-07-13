import { Product, TIERS, formatUSD } from "@/lib/catalog";
import { noteRu } from "@/lib/i18n";

export default function VariantTable({ product }: { product: Product }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm border-collapse">
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
          </tr>
        </thead>
        <tbody>
          {product.variants.map((v) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
