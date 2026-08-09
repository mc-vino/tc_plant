"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
import { getProduct } from "@/lib/catalog";
import { usePlantModal } from "@/lib/plantModal";
import PlantDetail from "./PlantDetail";

/** Distance that dismisses on its own. */
const CLOSE_AT = 110;
/** A flick this fast dismisses regardless of distance (px per ms). */
const FLICK = 0.25;
/** Movement before the drag commits, so taps and scrolls are not stolen. */
const HYSTERESIS = 8;
const EXIT_MS = 260;
const RETURN_MS = 320;

export default function PlantDialog() {
  const { code, close } = usePlantModal();
  const panelRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef(false);
  const product = code ? getProduct(code) : undefined;
  const open = Boolean(product);

  /**
   * Animate the dialog out, then unmount. It leaves along the path it arrived
   * on: down on the phone sheet, a small scale-down on the centred desktop
   * dialog.
   */
  const dismiss = useCallback(() => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (leavingRef.current) return;
    leavingRef.current = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!sheet || reduced) {
      close();
      return;
    }

    const wide = window.matchMedia("(min-width: 640px)").matches;

    // Pin the value the element is showing right now and flush it, otherwise
    // dropping the entry animation and setting the target in the same frame
    // leaves the transition with no start value and it never runs.
    sheet.style.animation = "none";
    const shown = getComputedStyle(sheet).transform;
    sheet.style.transform = shown === "none" ? "translateY(0px)" : shown;
    sheet.style.opacity = "1";
    if (backdrop) {
      backdrop.style.animation = "none";
      backdrop.style.opacity = getComputedStyle(backdrop).opacity;
    }
    void sheet.offsetHeight;

    sheet.style.transition = `transform ${EXIT_MS}ms var(--ease-drawer), opacity ${EXIT_MS}ms ease-out`;
    sheet.style.transform = wide ? "scale(0.97)" : "translateY(100%)";
    if (wide) sheet.style.opacity = "0";
    if (backdrop) {
      backdrop.style.transition = `opacity ${EXIT_MS}ms ease-out`;
      backdrop.style.opacity = "0";
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      close();
    };
    // Not { once: true }: opacity ends alongside transform and would consume
    // the single shot, leaving the unmount to the fallback timer.
    sheet.addEventListener("transitionend", (e) => {
      if ((e as TransitionEvent).propertyName === "transform") finish();
    });
    // Safety net if the transition never reports back.
    window.setTimeout(finish, EXIT_MS + 120);
  }, [close]);

  useEffect(() => {
    if (open) leavingRef.current = false;
  }, [open, code]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

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

  // Swipe down to dismiss, from anywhere on the sheet.
  //
  // The sheet is moved by writing its transform straight to the node: routing
  // every touchmove through React state re-rendered the whole dialog once per
  // frame, which is what made the gesture stutter. The drag only engages when
  // the content is already at the top, so a downward swipe over scrolled
  // content still scrolls it.
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    let startY = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0; // px per ms, positive downwards
    let offset = 0;
    let active = false;
    let engaged = false;
    let fromTop = false;
    let touchId: number | null = null;
    let frame = 0;

    const paint = () => {
      frame = 0;
      sheet.style.transform = `translateY(${offset}px)`;
      const backdrop = backdropRef.current;
      if (backdrop) backdrop.style.opacity = String(Math.max(0, 1 - offset / 340));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const settle = () => {
      sheet.style.transition = `transform ${RETURN_MS}ms var(--ease-drawer)`;
      sheet.style.transform = "translateY(0px)";
      const backdrop = backdropRef.current;
      if (backdrop) {
        backdrop.style.transition = `opacity ${RETURN_MS}ms ease-out`;
        backdrop.style.opacity = "1";
      }
    };

    const onStart = (e: TouchEvent) => {
      // Ignore extra fingers once a drag is under way.
      if (active || e.touches.length !== 1) return;
      const t = e.touches[0];
      touchId = t.identifier;
      startY = lastY = t.clientY;
      lastT = e.timeStamp;
      velocity = 0;
      offset = 0;
      active = true;
      engaged = false;
      fromTop = (panelRef.current?.scrollTop ?? 0) <= 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!active || leavingRef.current) return;
      const t = Array.from(e.touches).find((x) => x.identifier === touchId);
      if (!t) return;

      const dy = t.clientY - startY;
      if (!engaged) {
        // Only take over for a downward pull that starts at the top.
        if (!fromTop || dy < HYSTERESIS) return;
        engaged = true;
        sheet.style.animation = "none";
        sheet.style.transition = "none";
        const backdrop = backdropRef.current;
        if (backdrop) {
          backdrop.style.animation = "none";
          backdrop.style.transition = "none";
        }
      }

      const dt = e.timeStamp - lastT;
      if (dt > 0) velocity = (t.clientY - lastY) / dt;
      lastY = t.clientY;
      lastT = e.timeStamp;

      // Past the top edge there is nothing more to show, so resist instead of
      // stopping dead.
      const raw = dy - HYSTERESIS;
      offset = raw >= 0 ? raw : raw / (1 - raw / 24);
      schedule();
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
      if (!active) return;
      active = false;
      touchId = null;
      if (!engaged) return;
      engaged = false;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      // A quick flick dismisses even from a short distance.
      if (offset > CLOSE_AT || velocity > FLICK) dismiss();
      else settle();
      offset = 0;
    };

    sheet.addEventListener("touchstart", onStart, { passive: true });
    sheet.addEventListener("touchmove", onMove, { passive: false });
    sheet.addEventListener("touchend", onEnd);
    sheet.addEventListener("touchcancel", onEnd);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      sheet.removeEventListener("touchstart", onStart);
      sheet.removeEventListener("touchmove", onMove);
      sheet.removeEventListener("touchend", onEnd);
      sheet.removeEventListener("touchcancel", onEnd);
    };
  }, [open, dismiss]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        ref={backdropRef}
        onClick={dismiss}
        aria-hidden
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-[fadeIn_200ms_ease-out]"
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plant-dialog-title"
        className="plant-dialog relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[12px] border border-line bg-background will-change-transform sm:max-h-[88vh] sm:max-w-4xl sm:rounded-[12px]"
      >
        {/* Grab handle: hints that the sheet can be pulled down. */}
        <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
          <span className="h-1 w-9 rounded-full bg-line" />
        </div>

        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line px-4 sm:h-14 sm:px-5">
          <span className="min-w-0 truncate font-mono text-xs text-faint">
            {product.article ?? product.code}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={`/plant/${product.code}`}
              onClick={close}
              className="press inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs text-muted transition-colors hover:text-accent"
            >
              Открыть страницу <ArrowUpRight size={14} />
            </Link>
            <button
              onClick={dismiss}
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
