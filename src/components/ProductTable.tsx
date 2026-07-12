import Image from "next/image";
import Link from "next/link";
import { Product, TIERS, lowestPrice, formatUSD } from "@/lib/catalog";
import { noteRu } from "@/lib/i18n";
import { marketFor, formatRub, rarityChipClass } from "@/lib/market";

export default function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-card">
      <table className="w-full min-w-[1000px] text-sm border-collapse">
        <thead>
          <tr className="text-left text-faint bg-paper">
            <th className="py-3 pl-4 pr-3 font-medium text-xs">Сорт</th>
            <th className="py-3 px-3 font-medium text-xs">Артикул</th>
            {TIERS.map((t) => (
              <th key={t} className="py-3 px-3 font-medium text-xs text-right font-mono whitespace-nowrap">
                {t}
              </th>
            ))}
            <th className="py-3 px-3 font-medium text-xs text-right">Опт от</th>
            <th className="py-3 px-3 font-medium text-xs">Редкость</th>
            <th className="py-3 pl-3 pr-4 font-medium text-xs text-right whitespace-nowrap">Детка, ₽</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const from = lowestPrice(p);
            const m = marketFor(p);
            return (
              <tr
                key={p.code}
                className="border-t border-line hover:bg-accent-soft/50 transition-colors"
              >
                <td className="py-2.5 pl-4 pr-3">
                  <Link href={`/plant/${p.code}`} className="flex items-center gap-3 group">
                    <span className="relative h-11 w-9 shrink-0 overflow-hidden rounded bg-accent-soft">
                      {p.image ? (
                        <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center font-serif italic text-accent/30">
                          {p.genus.charAt(0)}
                        </span>
                      )}
                    </span>
                    <span>
                      <span className="block font-serif text-[15px] leading-tight group-hover:text-accent transition-colors">
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
                  {from !== null ? formatUSD(from) : "-"}
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${rarityChipClass(m.rarityLevel)}`}
                  >
                    {m.rarity}
                  </span>
                </td>
                <td className="py-2.5 pl-3 pr-4 text-right font-mono text-sm font-medium text-accent-strong whitespace-nowrap">
                  {formatRub(m.babyPriceRub)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
