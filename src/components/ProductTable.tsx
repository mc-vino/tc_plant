import Image from "next/image";
import Link from "next/link";
import { Product, TIERS, lowestPrice, formatUSD } from "@/lib/catalog";

export default function ProductTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-card">
      <table className="w-full min-w-[820px] text-sm border-collapse">
        <thead>
          <tr className="text-left text-faint bg-paper">
            <th className="py-3 pl-4 pr-3 font-medium text-xs">Variety</th>
            <th className="py-3 px-3 font-medium text-xs">Code</th>
            {TIERS.map((t) => (
              <th key={t} className="py-3 px-3 font-medium text-xs text-right font-mono whitespace-nowrap">
                {t}
              </th>
            ))}
            <th className="py-3 pl-3 pr-4 font-medium text-xs text-right">From</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const from = lowestPrice(p);
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
                        {p.note ? ` · ${p.note}` : ""}
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
                <td className="py-2.5 pl-3 pr-4 text-right font-mono text-sm font-medium text-accent-strong whitespace-nowrap">
                  {from !== null ? formatUSD(from) : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
