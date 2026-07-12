import { Product, TIERS, formatUSD } from "@/lib/catalog";

export default function PriceTable({ product }: { product: Product }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left text-muted">
          <th className="py-2 pr-4 font-medium">Quantity</th>
          <th className="py-2 font-medium text-right">Unit price</th>
        </tr>
      </thead>
      <tbody>
        {TIERS.map((tier) => {
          const price = product.prices[tier];
          return (
            <tr key={tier} className="border-t border-line">
              <td className="py-2 pr-4 font-mono text-xs">{tier} pcs</td>
              <td className="py-2 text-right">
                {price !== undefined ? (
                  <span className="font-semibold">{formatUSD(price)}</span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
