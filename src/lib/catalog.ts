import catalogData from "@/data/catalog.json";

export const TIERS = ["1-4", "5-9", "10-19"] as const;
export type Tier = (typeof TIERS)[number];

export interface Variant {
  code: string;
  description: string;
  note: string | null;
  prices: Partial<Record<Tier, number>>;
}

export interface Product {
  code: string; // base code, e.g. MT001
  name: string;
  genus: string;
  image: string | null;
  variants: Variant[];
}

export interface CatalogMeta {
  supplier: string;
  currency: string;
  incoterm: string;
  quotationDate: string;
  priceType: string;
  tiers: string[];
  count: number;
}

const data = catalogData as unknown as { meta: CatalogMeta; products: Product[] };

export const meta: CatalogMeta = data.meta;
export const products: Product[] = data.products;

function allPrices(p: Product): number[] {
  return p.variants.flatMap((v) => Object.values(v.prices));
}

/** Lowest unit price across every variant and quantity tier. */
export function lowestPrice(p: Product): number | null {
  const vals = allPrices(p);
  return vals.length ? Math.min(...vals) : null;
}

/** Highest unit price across every variant and quantity tier. */
export function highestPrice(p: Product): number | null {
  const vals = allPrices(p);
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

export interface VariantRef {
  product: Product;
  variant: Variant;
}

const variantIndex = new Map<string, VariantRef>();
for (const product of products) {
  for (const variant of product.variants) variantIndex.set(variant.code, { product, variant });
}

/** Look up a variant (and its product) by variant code, e.g. "MT001S01". */
export function getVariant(code: string): VariantRef | undefined {
  return variantIndex.get(code);
}

/** Other varieties in the same genus, excluding the given product. */
export function relatedByGenus(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.genus === product.genus && p.code !== product.code)
    .slice(0, limit);
}
