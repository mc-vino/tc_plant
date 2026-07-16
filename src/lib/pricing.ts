import { Tier, TIERS } from "@/lib/catalog";

/** Minimum quantity that unlocks each tier. */
export const TIER_MIN: Record<Tier, number> = {
  "1-4": 1,
  "5-9": 5,
  "10-19": 10,
};

/** Which price tier applies to a given ordered quantity. */
export function tierForQty(qty: number): Tier {
  if (qty >= TIER_MIN["10-19"]) return "10-19";
  if (qty >= TIER_MIN["5-9"]) return "5-9";
  return "1-4";
}

/**
 * Unit price for the given quantity, honouring quantity-tier pricing.
 * Falls back to the nearest available tier when the exact one has no price.
 */
export function unitPriceForQty(
  prices: Partial<Record<Tier, number>>,
  qty: number,
): number | null {
  const ti = TIERS.indexOf(tierForQty(qty));
  const order: Tier[] = [];
  for (let k = ti; k >= 0; k--) order.push(TIERS[k]);
  for (let k = ti + 1; k < TIERS.length; k++) order.push(TIERS[k]);
  for (const t of order) if (prices[t] !== undefined) return prices[t]!;
  return null;
}

/** The next quantity threshold and its unit price, if a cheaper tier exists ahead. */
export function nextTier(
  prices: Partial<Record<Tier, number>>,
  qty: number,
): { at: number; price: number } | null {
  const current = tierForQty(qty);
  const ci = TIERS.indexOf(current);
  for (let k = ci + 1; k < TIERS.length; k++) {
    const t = TIERS[k];
    const p = prices[t];
    const cur = unitPriceForQty(prices, qty);
    if (p !== undefined && cur !== null && p < cur) return { at: TIER_MIN[t], price: p };
  }
  return null;
}
