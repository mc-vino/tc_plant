import retailData from "@/data/catalog.json";
import variegatedData from "@/data/variegated.json";

/** A quantity break: unit price that applies once the ordered quantity reaches minQty. */
export interface PriceBreak {
  minQty: number;
  price: number;
  label: string; // column header, e.g. "1-4" or "20+"
}

export interface Variant {
  code: string;
  description: string;
  note: string | null;
  moq: number | null;
  breaks: PriceBreak[]; // ascending by minQty
}

export interface Product {
  code: string; // globally unique across catalogs
  catalog: string; // catalog id this product belongs to
  name: string;
  genus: string;
  image: string | null;
  variants: Variant[];
}

export interface CatalogInfo {
  id: string;
  label: string;
  description: string;
  priceType: string;
  currency: string;
  incoterm: string;
  count: number;
  quotationDate?: string;
}

// ---- Raw JSON shapes -------------------------------------------------------

interface RawRetailVariant {
  code: string;
  description: string;
  note: string | null;
  prices: Record<string, number>;
}
interface RawRetailProduct {
  code: string;
  name: string;
  genus: string;
  image: string | null;
  variants: RawRetailVariant[];
}
interface RawRetailMeta {
  supplier: string;
  currency: string;
  incoterm: string;
  quotationDate: string;
  priceType: string;
  tiers: string[];
  count: number;
}
interface RawVarProduct {
  code: string;
  name: string;
  genus: string;
  image: string | null;
  moq: number | null;
  retail: number;
  wholesaleQty: number | null;
  wholesalePrice: number | null;
}
interface RawVarMeta {
  id: string;
  label: string;
  description: string;
  currency: string;
  incoterm: string;
  priceType: string;
  count: number;
}

// ---- Normalisation ---------------------------------------------------------

const RETAIL_TIER_MIN: Record<string, number> = { "1-4": 1, "5-9": 5, "10-19": 10 };

const retailRaw = retailData as unknown as { meta: RawRetailMeta; products: RawRetailProduct[] };
const varRaw = variegatedData as unknown as { meta: RawVarMeta; products: RawVarProduct[] };

const RETAIL_ID = "retail";

function normalizeRetail(p: RawRetailProduct): Product {
  return {
    code: p.code,
    catalog: RETAIL_ID,
    name: p.name,
    genus: p.genus,
    image: p.image,
    variants: p.variants.map((v) => ({
      code: v.code,
      description: v.description,
      note: v.note,
      moq: null,
      breaks: Object.entries(v.prices)
        .map(([label, price]) => ({ label, price, minQty: RETAIL_TIER_MIN[label] ?? 1 }))
        .sort((a, b) => a.minQty - b.minQty),
    })),
  };
}

function normalizeVariegated(p: RawVarProduct): Product {
  const breaks: PriceBreak[] = [{ minQty: 1, price: p.retail, label: "1+" }];
  if (p.wholesalePrice !== null && p.wholesaleQty !== null) {
    breaks.push({ minQty: p.wholesaleQty, price: p.wholesalePrice, label: `${p.wholesaleQty}+` });
  }
  breaks.sort((a, b) => a.minQty - b.minQty);
  return {
    code: p.code,
    catalog: varRaw.meta.id,
    name: p.name,
    genus: p.genus,
    image: p.image,
    variants: [
      {
        code: p.code,
        description: p.name,
        note: null,
        moq: p.moq,
        breaks,
      },
    ],
  };
}

const retailProducts = retailRaw.products.map(normalizeRetail);
const variegatedProducts = varRaw.products.map(normalizeVariegated);

export const products: Product[] = [...retailProducts, ...variegatedProducts];

export const catalogs: CatalogInfo[] = [
  {
    id: RETAIL_ID,
    label: "Основной прайс",
    description: "Розничный прайс питомника: Alocasia, Philodendron, Monstera, Anthurium и другие. Цены по объёмным тирам.",
    priceType: retailRaw.meta.priceType,
    currency: retailRaw.meta.currency,
    incoterm: retailRaw.meta.incoterm,
    count: retailProducts.length,
    quotationDate: retailRaw.meta.quotationDate,
  },
  {
    id: varRaw.meta.id,
    label: varRaw.meta.label,
    description: varRaw.meta.description,
    priceType: varRaw.meta.priceType,
    currency: varRaw.meta.currency,
    incoterm: varRaw.meta.incoterm,
    count: variegatedProducts.length,
  },
];

export const DEFAULT_CATALOG = RETAIL_ID;

export function getCatalog(id: string): CatalogInfo | undefined {
  return catalogs.find((c) => c.id === id);
}

export function productsIn(catalogId: string): Product[] {
  return products.filter((p) => p.catalog === catalogId);
}

// ---- Pricing helpers -------------------------------------------------------

function allPrices(p: Product): number[] {
  return p.variants.flatMap((v) => v.breaks.map((b) => b.price));
}

/** Lowest unit price across every variant and quantity break. */
export function lowestPrice(p: Product): number | null {
  const vals = allPrices(p);
  return vals.length ? Math.min(...vals) : null;
}

/** Highest unit price across every variant and quantity break. */
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

/** Genera in a catalog, sorted by product count (descending), then name. */
export function generaWithCounts(catalogId: string): { genus: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.catalog !== catalogId) continue;
    counts.set(p.genus, (counts.get(p.genus) ?? 0) + 1);
  }
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

/** Look up a variant (and its product) by variant code. */
export function getVariant(code: string): VariantRef | undefined {
  return variantIndex.get(code);
}

/** Other varieties in the same catalog and genus, excluding the given product. */
export function relatedByGenus(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.catalog === product.catalog && p.genus === product.genus && p.code !== product.code)
    .slice(0, limit);
}

/** The variant with the lowest available unit price (matches the "от" figure). */
export function cheapestVariant(p: Product): Variant | null {
  let best: Variant | null = null;
  let bestPrice = Infinity;
  for (const v of p.variants) {
    if (!v.breaks.length) continue;
    const m = Math.min(...v.breaks.map((b) => b.price));
    if (m < bestPrice) {
      bestPrice = m;
      best = v;
    }
  }
  return best;
}

/** Ordered union of break labels across a product's variants (for table columns). */
export function breakColumns(product: Product): PriceBreak[] {
  const seen = new Map<string, PriceBreak>();
  for (const v of product.variants) {
    for (const b of v.breaks) if (!seen.has(b.label)) seen.set(b.label, b);
  }
  return [...seen.values()].sort((a, b) => a.minQty - b.minQty);
}
