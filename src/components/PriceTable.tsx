import { Product, TIERS, formatUSD } from "@/lib/catalog";

export default function PriceTable({ product }: { product: Product }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left text-faint">
          <th className="pb-2 pr-4 font-medium text-xs uppercase tracking-[0.1em]">Quantity</th>
          <th className="pb-2 font-medium text-xs uppercase tracking-[0.1em] text-right">
            Unit price
          </th>
        </tr>
      </thead>
      <tbody>
        {TIERS.map((tier) => {
          const price = product.prices[tier];
          const available = price !== undefined;
          return (
            <tr key={tier} className="border-t border-line">
              <td
                className={`py-2.5 pr-4 font-mono text-xs ${available ? "text-muted" : "text-faint"}`}
              >
                {tier} pcs
              </td>
              <td className="py-2.5 text-right">
                {available ? (
                  <span className="font-mono font-medium text-foreground">{formatUSD(price)}</span>
                ) : (
                  <span className="text-line">-</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
