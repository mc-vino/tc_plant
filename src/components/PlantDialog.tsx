"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
import { getProduct } from "@/lib/catalog";
import { usePlantModal } from "@/lib/plantModal";
import PlantDetail from "./PlantDetail";

export default function PlantDialog() {
  const { code, close } = usePlantModal();
  const panelRef = useRef<HTMLDivElement>(null);
  const product = code ? getProduct(code) : undefined;
  const open = Boolean(product);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Lock the page behind the dialog, compensating for the scrollbar so the
  // layout underneath does not shift on desktop.
  useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [open]);

  // Reset scroll and move focus into the panel each time it opens.
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;
    el.scrollTop = 0;
    el.focus({ preventScroll: true });
  }, [open, code]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        onClick={close}
        aria-hidden
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-[fadeIn_200ms_ease-out]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plant-dialog-title"
        className="plant-dialog relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[22px] bg-background shadow-[var(--shadow-lg)] sm:max-h-[88vh] sm:max-w-4xl sm:rounded-[22px]"
      >
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:px-5">
          <span className="min-w-0 truncate font-mono text-xs text-faint">{product.code}</span>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={`/plant/${product.code}`}
              onClick={close}
              className="press inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs text-muted transition-colors hover:text-accent"
            >
              Открыть страницу <ArrowUpRight size={14} />
            </Link>
            <button
              onClick={close}
              aria-label="Закрыть"
              className="press flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div
          ref={panelRef}
          tabIndex={-1}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 outline-none sm:px-6 sm:py-6"
        >
          <PlantDetail product={product} headingId="plant-dialog-title" />
        </div>
      </div>
    </div>
  );
}
