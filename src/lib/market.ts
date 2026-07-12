import { Product, lowestPrice, highestPrice } from "@/lib/catalog";

/**
 * MODEL, NOT MARKET DATA.
 *
 * There is no reliable feed of RF/RB retail prices for 120 specific TC cultivars,
 * so every value below is ESTIMATED from the supplier's wholesale prices plus a
 * small set of documented assumptions. Tune the constants here to match real
 * experience on Avito / Kufar / grower channels. All money is in RUB (₽).
 */
export const MARKET_CONFIG = {
  /** USD -> RUB. ~77 in July 2026 (Bank of Russia). */
  usdToRub: 77,

  /** Rarity buckets, split on the small-quantity ("scarcity") USD unit price. */
  rarityThresholds: [2, 8, 20, 50] as const, // -> 5 levels
  rarityLabels: ["Обычное", "Нечастое", "Редкое", "Очень редкое", "Коллекционное"] as const,

  /** Retail "детка" (established baby) vs small-qty wholesale, plus a floor per rarity. */
  retailMultiplier: 2.5,
  babyFloorRub: [500, 900, 1800, 4000, 9000] as const,

  /** Months for a TC plantlet to reach a propagation-capable mother, ideal conditions. */
  monthsByGenus: {
    Alocasia: 10,
    Homalomena: 12,
    Philodendron: 14,
    Monstera: 16,
    Anthurium: 18,
    Epipremnum: 12,
    Rhaphidophora: 12,
    Spathiphyllum: 12,
    Musa: 8,
  } as Record<string, number>,
  monthsDefault: 14,
  monthsRarityFactor: [0.9, 1.0, 1.1, 1.25, 1.4] as const,

  /** Annual decline of the retail price as a variety gets mass-propagated. */
  depreciationByRarity: [0.05, 0.1, 0.18, 0.28, 0.4] as const,
};

export interface MarketEstimate {
  rarityLevel: number; // 0..4
  rarity: string;
  cloneCostRub: number; // bulk TC clone cost
  babyPriceRub: number; // established baby, now
  monthsToMother: number;
  depreciationPerYear: number; // 0..1
  babyPriceAtPropagationRub: number; // baby price when the mother is ready to propagate
  cloneToBabyCoef: number; // cloneCost / babyPrice
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function marketFor(p: Product): MarketEstimate {
  const c = MARKET_CONFIG;
  const value = highestPrice(p) ?? 0; // scarcity proxy (small-qty USD price)
  const clone = lowestPrice(p) ?? value; // bulk clone cost (USD)

  const level = c.rarityThresholds.filter((t) => value >= t).length; // 0..4

  const babyPriceRub = Math.max(
    c.babyFloorRub[level],
    roundTo(value * c.usdToRub * c.retailMultiplier, 50),
  );

  const monthsToMother = Math.round(
    (c.monthsByGenus[p.genus] ?? c.monthsDefault) * c.monthsRarityFactor[level],
  );

  const depreciationPerYear = c.depreciationByRarity[level];
  const babyPriceAtPropagationRub = roundTo(
    babyPriceRub * Math.pow(1 - depreciationPerYear, monthsToMother / 12),
    50,
  );

  const cloneCostRub = Math.round(clone * c.usdToRub);
  const cloneToBabyCoef = babyPriceRub > 0 ? cloneCostRub / babyPriceRub : 0;

  return {
    rarityLevel: level,
    rarity: c.rarityLabels[level],
    cloneCostRub,
    babyPriceRub,
    monthsToMother,
    depreciationPerYear,
    babyPriceAtPropagationRub,
    cloneToBabyCoef,
  };
}

export function formatRub(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Restrained chip styling that scales with rarity, within the green palette. */
export function rarityChipClass(level: number): string {
  switch (level) {
    case 4:
      return "bg-accent text-paper";
    case 3:
      return "bg-accent-soft text-accent-strong ring-1 ring-accent/40";
    case 2:
      return "bg-accent-soft text-accent-strong";
    case 1:
      return "bg-paper text-muted ring-1 ring-line";
    default:
      return "bg-paper text-faint ring-1 ring-line";
  }
}
