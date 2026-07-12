import catalogData from "@/data/catalog.json";

export const TIERS = ["05-09", "10-19", "20-49", "50-99", "100-299"] as const;
export type Tier = (typeof TIERS)[number];

export interface Product {
  code: string;
  name: string;
  genus: string;
  note: string | null;
  prices: Partial<Record<Tier, number>>;
  image: string | null;
}

export interface CatalogMeta {
  supplier: string;
  currency: string;
  incoterm: string;
  quotation_date: string;
  tiers: string[];
  count: number;
}

const data = catalogData as unknown as { meta: CatalogMeta; products: Product[] };

export const meta: CatalogMeta = data.meta;
export const products: Product[] = data.products;

/** Lowest available unit price across all quantity tiers. */
export function lowestPrice(p: Product): number | null {
  const vals = Object.values(p.prices);
  return vals.length ? Math.min(...vals) : null;
}

/** Highest available unit price (smallest-quantity tier). */
export function highestPrice(p: Product): number | null {
  const vals = Object.values(p.prices);
  return vals.length ? Math.max(...vals) : null;
}

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

/** Genera sorted by product count (descending), then name. */
export function generaWithCounts(): { genus: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.genus, (counts.get(p.genus) ?? 0) + 1);
  return [...counts.entries()]
    .map(([genus, count]) => ({ genus, count }))
    .sort((a, b) => b.count - a.count || a.genus.localeCompare(b.genus));
}

export function getProduct(code: string): Product | undefined {
  return products.find((p) => p.code === code);
}
