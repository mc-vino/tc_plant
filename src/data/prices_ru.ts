/**
 * Real RF/RB retail prices for a "детка" (rooted baby) of each variety,
 * researched from marketplaces (Avito, specialist shops). RUB.
 *
 * `rub` is a representative mid price for a small rooted baby. Where a range was
 * found, the midpoint is used. Varieties without a reliable listing are omitted
 * and fall back to the model estimate in src/lib/market.ts.
 *
 * Populated incrementally by the price-research pass.
 */
export interface RealPrice {
  rub: number;
  /** Short source label, e.g. "Avito" or a shop name. */
  source?: string;
}

export const REAL_BABY_PRICES: Record<string, RealPrice> = {
  AL015: { rub: 900, source: "Avito / магазины РФ" }, // Frydek (Frydex)
  AL018: { rub: 350, source: "Avito / Exotica" }, // Bambino
  AL021: { rub: 400, source: "Avito / Exotica" }, // Black Velvet
  MT005: { rub: 3000, source: "магазины РФ" }, // Thai Constellation
  MT026: { rub: 1500, source: "Avito / Passiflora" }, // Borsigiana Albo
  PD031: { rub: 900, source: "Exotica / Adenium" }, // Gloriosum
  PD047: { rub: 700, source: "Exotica" }, // Birkin
  PD085: { rub: 600, source: "Avito / магазины РФ" }, // Pink Princess
};
