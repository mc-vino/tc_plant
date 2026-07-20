"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { getVariant, formatUSD, catalogs } from "@/lib/catalog";
import { unitPriceForQty, tierLabelForQty, nextBreak } from "@/lib/pricing";
import { asset } from "@/lib/asset";
import { supplier } from "@/data/supplier";

interface Line {
  code: string;
  qty: number;
  name: string;
  description: string;
  productCode: string;
  image: string | null;
  breaks: import("@/lib/catalog").Variant["breaks"];
  unit: number | null;
  total: number;
}

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, clear, count, activeCatalog } = useCart();
  const catalogLabel = catalogs.find((c) => c.id === activeCatalog)?.label ?? "";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const lines = useMemo<Line[]>(() => {
    return items
      .map((l) => {
        const ref = getVariant(l.code);
        if (!ref) return null;
        const unit = unitPriceForQty(ref.variant.breaks, l.qty);
        return {
          code: l.code,
          qty: l.qty,
          name: ref.product.name,
          description: ref.variant.description,
          productCode: ref.product.code,
          image: ref.product.image,
          breaks: ref.variant.breaks,
          unit,
          total: unit !== null ? unit * l.qty : 0,
        };
      })
      .filter((x): x is Line => x !== null);
  }, [items]);

  const grandTotal = lines.reduce((s, l) => s + l.total, 0);

  const mailto = useMemo(() => {
    const body =
      lines
        .map(
          (l) =>
            `${l.name} (${l.description}): ${l.qty} шт. x ${l.unit !== null ? formatUSD(l.unit) : "-"} = ${formatUSD(l.total)} [${l.code}]`,
        )
        .join("\n") + `\n\nИтого: ${formatUSD(grandTotal)}`;
    const subject = catalogLabel ? `Заявка TC Plant · ${catalogLabel}` : "Заявка TC Plant";
    return `mailto:${supplier.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [lines, grandTotal, catalogLabel]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-[var(--shadow-lg)] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ transitionTimingFunction: "var(--ease-drawer)" }}
        role="dialog"
        aria-label="Корзина"
      >
        <header className="flex items-center justify-between border-b border-line px-5 h-14 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingCart size={18} className="text-accent shrink-0" />
            <span className="display text-lg">Корзина</span>
            {catalogLabel && (
              <span className="truncate rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent-strong">
                {catalogLabel}
              </span>
            )}
            {count > 0 && <span className="shrink-0 text-sm text-faint">{count} шт.</span>}
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
            className="press flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
          >
            <X size={18} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingCart size={32} className="text-faint" />
            <p className="text-muted">Корзина пуста</p>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="press text-sm text-accent transition-colors hover:text-accent-strong"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-line">
              {lines.map((l) => {
                const nt = nextBreak(l.breaks, l.qty);
                return (
                  <div key={l.code} className="flex gap-3 py-4 first:pt-0">
                    <Link
                      href={`/plant/${l.productCode}`}
                      onClick={() => setOpen(false)}
                      className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[10px] bg-accent-soft"
                    >
                      {l.image ? (
                        <Image src={asset(l.image)} alt="" fill sizes="56px" className="object-cover" />
                      ) : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="display text-sm leading-tight">{l.name}</p>
                      <p className="text-[11px] text-faint leading-snug">{l.description}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center rounded-full border border-line">
                          <button
                            onClick={() => setQty(l.code, l.qty - 1)}
                            aria-label="Меньше"
                            className="press flex h-7 w-7 items-center justify-center text-muted transition-colors hover:text-foreground"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center font-mono text-sm">{l.qty}</span>
                          <button
                            onClick={() => setQty(l.code, l.qty + 1)}
                            aria-label="Больше"
                            className="press flex h-7 w-7 items-center justify-center text-muted transition-colors hover:text-foreground"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right leading-tight">
                          <span className="block font-mono text-sm font-medium text-accent-strong">
                            {formatUSD(l.total)}
                          </span>
                          <span className="block text-[10px] text-faint">
                            {l.unit !== null ? `${formatUSD(l.unit)}/шт · тир ${tierLabelForQty(l.breaks, l.qty)}` : "нет цены"}
                          </span>
                        </div>
                      </div>
                      {nt && (
                        <p className="mt-1.5 text-[10px] text-accent">
                          от {nt.at} шт: {formatUSD(nt.price)}/шт
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => remove(l.code)}
                      aria-label="Удалить"
                      className="press h-7 w-7 shrink-0 self-start text-faint transition-colors hover:text-foreground"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>

            <footer className="border-t border-line px-5 py-4 shrink-0 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">Итого</span>
                <span className="display text-2xl text-accent-strong">{formatUSD(grandTotal)}</span>
              </div>
              <a
                href={mailto}
                className="press flex h-11 items-center justify-center rounded-full bg-accent text-white text-sm font-medium transition-colors hover:bg-accent-strong"
              >
                Оформить заявку
              </a>
              <button
                onClick={clear}
                className="press w-full text-center text-xs text-faint transition-colors hover:text-foreground"
              >
                Очистить корзину
              </button>
              <p className="text-[10px] text-faint leading-snug">
                Цена за штуку зависит от количества и пересчитывается автоматически. Итог
                отправляется поставщику письмом.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
