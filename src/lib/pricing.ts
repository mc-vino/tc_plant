import { PriceBreak } from "@/lib/catalog";

/** The break that applies to the given quantity (highest minQty not exceeding qty). */
export function breakForQty(breaks: PriceBreak[], qty: number): PriceBreak | null {
  if (!breaks.length) return null;
  let chosen = breaks[0];
  for (const b of breaks) if (qty >= b.minQty) chosen = b;
  return chosen;
}

/** Unit price for the given quantity, honouring quantity-break pricing. */
export function unitPriceForQty(breaks: PriceBreak[], qty: number): number | null {
  return breakForQty(breaks, qty)?.price ?? null;
}

/** Label of the break that applies to the given quantity. */
export function tierLabelForQty(breaks: PriceBreak[], qty: number): string | null {
  return breakForQty(breaks, qty)?.label ?? null;
}

/** The next quantity threshold and its unit price, if a cheaper break lies ahead. */
export function nextBreak(
  breaks: PriceBreak[],
  qty: number,
): { at: number; price: number } | null {
  const current = unitPriceForQty(breaks, qty);
  if (current === null) return null;
  for (const b of breaks) {
    if (b.minQty > qty && b.price < current) return { at: b.minQty, price: b.price };
  }
  return null;
}
