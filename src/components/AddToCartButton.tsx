"use client";

import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Product, cheapestVariant } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

type Size = "sm" | "md";

const BOX: Record<Size, string> = { sm: "h-8 w-8", md: "h-9 w-9" };
const STEP: Record<Size, string> = { sm: "h-8", md: "h-9" };
const ICON: Record<Size, number> = { sm: 14, md: 16 };

/**
 * Quick add-to-cart for a catalogue product, acting on the cheapest variant
 * (the one behind the "от" price). Once that variant is in the cart the button
 * turns into a compact quantity stepper.
 */
export default function AddToCartButton({
  product,
  size = "md",
  className = "",
}: {
  product: Product;
  size?: Size;
  className?: string;
}) {
  const { itemsFor, add, setQty } = useCart();
  const v = cheapestVariant(product);
  const qty = v ? (itemsFor(product.catalog).find((l) => l.code === v.code)?.qty ?? 0) : 0;
  if (!v) return null;

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (qty > 0) {
    return (
      <div
        onClick={stop}
        className={`flex items-center rounded-full border border-foreground/40 bg-card ${STEP[size]} ${className}`}
      >
        <button
          onClick={(e) => {
            stop(e);
            setQty(v.code, qty - 1);
          }}
          aria-label="Убрать одну штуку"
          className={`press flex ${BOX[size]} items-center justify-center rounded-full text-foreground transition-colors hover:text-accent`}
        >
          <Minus size={ICON[size]} />
        </button>
        <span className="min-w-5 text-center font-mono text-xs text-headline tabular-nums">
          {qty}
        </span>
        <button
          onClick={(e) => {
            stop(e);
            setQty(v.code, qty + 1);
          }}
          aria-label="Добавить одну штуку"
          className={`press flex ${BOX[size]} items-center justify-center rounded-full text-foreground transition-colors hover:text-accent`}
        >
          <Plus size={ICON[size]} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        stop(e);
        add(v.code);
      }}
      aria-label="Добавить в корзину"
      title="Добавить в корзину"
      className={`press flex ${BOX[size]} items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-accent ${className}`}
    >
      <ShoppingCart size={ICON[size]} />
    </button>
  );
}
