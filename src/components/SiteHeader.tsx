"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { catalogs } from "@/lib/catalog";
import CartButton from "@/components/CartButton";

/**
 * Sticky nav. It rides translucent over the page at rest and settles onto the
 * Deep Forest surface once the page scrolls, per the style reference.
 */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const list = catalogs[0];

  return (
    // .glass sets the background shorthand, so it only rides at rest; once the
    // page scrolls the bar becomes a solid Deep Forest surface.
    <header
      data-scrolled={scrolled || undefined}
      className={`sticky top-0 z-30 border-b transition-colors duration-300 ${
        scrolled
          ? "border-transparent bg-deep-forest text-parchment [--focus:#faf8f5]"
          : "glass border-line/60"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="press group flex items-center gap-2.5">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-[4px] text-sm font-normal transition-colors ${
              scrolled ? "bg-parchment text-deep-forest" : "bg-foreground text-background"
            }`}
          >
            x
          </span>
          <span className="display text-[17px] leading-none transition-colors group-hover:opacity-70">
            TC&nbsp;Plant
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-[13px] sm:gap-7">
          {/* The logo already leads home, so this link can go on tiny screens. */}
          <Link
            href="/"
            className={`hidden rounded-full px-3 py-1.5 transition-colors min-[380px]:inline ${
              scrolled ? "hover:bg-white/10" : "hover:bg-accent/10"
            }`}
          >
            Каталог
          </Link>
          <Link
            href="/about"
            className={`rounded-full px-3 py-1.5 transition-colors ${
              scrolled ? "hover:bg-white/10" : "hover:bg-accent/10"
            }`}
          >
            Поставщик
          </Link>
          <span
            className={`hidden font-mono text-[11px] sm:inline ${
              scrolled ? "text-fog" : "text-muted"
            }`}
          >
            {list.currency}
            {list.incoterm ? ` · ${list.incoterm.split(" ")[0]}` : ""}
          </span>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
