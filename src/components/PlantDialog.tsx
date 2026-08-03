"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
import { getProduct } from "@/lib/catalog";
import { usePlantModal } from "@/lib/plantModal";
import PlantDetail from "./PlantDetail";

/** Drag distance that dismisses the sheet. */
const CLOSE_AT = 110;

export default function PlantDialog() {
  const { code, close } = usePlantModal();
  const panelRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
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

  // Reset scroll and focus each time it opens.
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;
    el.scrollTop = 0;
    el.focus({ preventScroll: true });
  }, [open, code]);

  // Swipe down to dismiss, from anywhere on the sheet. The drag only engages
  // when the content is already scrolled to the top, so a downward swipe over
  // scrolled content still scrolls it. Listeners are native (not React's) so
  // touchmove can be non-passive and cancel the browser's own scrolling.
  useEffect(() => {
    if (!open) return;
    const el = sheetRef.current;
    if (!el) return;

    let startY = 0;
    let active = false;
    let fromTop = false;
    let offset = 0;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      fromTop = (panelRef.current?.scrollTop ?? 0) <= 0;
      active = false;
      offset = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !fromTop) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        if (!active) {
          active = true;
          setDragging(true);
        }
        // Resist a little so the sheet feels attached to the finger.
        offset = dy < 0 ? 0 : dy * 0.9;
        setDrag(offset);
        if (e.cancelable) e.preventDefault();
      } else if (active) {
        offset = 0;
        setDrag(0);
      }
    };

    const onEnd = () => {
      if (!active) return;
      active = false;
      setDragging(false);
      // Always land back at 0 so the next open starts undragged.
      if (offset > CLOSE_AT) close();
      setDrag(0);
      offset = 0;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [open, close]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        onClick={close}
        aria-hidden
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-[fadeIn_200ms_ease-out]"
        style={drag > 0 ? { opacity: Math.max(0, 1 - drag / 320) } : undefined}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plant-dialog-title"
        className="plant-dialog relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[22px] bg-background shadow-[var(--shadow-lg)] sm:max-h-[88vh] sm:max-w-4xl sm:rounded-[22px]"
        style={
          drag > 0 || dragging
            ? {
                transform: `translateY(${drag}px)`,
                transition: dragging ? "none" : "transform 300ms var(--ease-drawer)",
                animation: "none",
              }
            : undefined
        }
      >
        {/* Grab handle: hints that the sheet can be pulled down. */}
        <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
          <span className="h-1 w-9 rounded-full bg-line" />
        </div>

        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:h-14 sm:px-5">
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
