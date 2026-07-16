"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label={`Корзина${count ? `, ${count} шт.` : ""}`}
      className="press relative flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
    >
      <ShoppingCart size={18} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
