"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Product, cheapestVariant } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

/**
 * Quick add-to-cart for a catalogue product. Adds the cheapest variant (the one
 * behind the "от" price) and flashes a confirmation without opening the drawer,
 * so several items can be added while browsing.
 */
export default function AddToCartButton({
  product,
  variant = "icon",
  className = "",
}: {
  product: Product;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const v = cheapestVariant(product);
  if (!v) return null;

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(v!.code);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1200);
  }

  if (variant === "full") {
    return (
      <button
        onClick={onClick}
        aria-label="Добавить в корзину"
        className={`press inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors ${
          added
            ? "bg-accent-soft text-accent-strong"
            : "bg-accent text-white hover:bg-accent-strong"
        } ${className}`}
      >
        {added ? (
          <>
            <Check size={14} /> Добавлено
          </>
        ) : (
          <>
            <ShoppingCart size={14} /> В корзину
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label="Добавить в корзину"
      className={`press flex h-9 w-9 items-center justify-center rounded-full shadow-[var(--shadow-md)] transition-colors ${
        added ? "bg-accent-soft text-accent-strong" : "bg-accent text-white hover:bg-accent-strong"
      } ${className}`}
    >
      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
    </button>
  );
}
