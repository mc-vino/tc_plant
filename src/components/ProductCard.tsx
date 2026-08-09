"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, lowestPrice, formatMoney } from "@/lib/catalog";
import { asset } from "@/lib/asset";
import { marketFor, rarityChipClass } from "@/lib/market";
import { usePlantModal, isPlainLeftClick } from "@/lib/plantModal";
import AddToCartButton from "./AddToCartButton";
import PhotoButton from "./PhotoButton";

export default function ProductCard({ product }: { product: Product }) {
  const { open } = usePlantModal();
  const from = lowestPrice(product);
  const market = marketFor(product);
  const moq = product.variants.length === 1 ? product.variants[0].moq : null;
  const meta =
    product.variants.length > 1
      ? `${product.variants.length} вар.`
      : moq
        ? `MOQ ${moq}`
        : null;

  return (
    // h-full + flex column: the card fills the grid row, so the action row
    // always sits on the card's bottom edge instead of drifting with the
    // length of the name.
    <div className="card-hover group flex h-full flex-col overflow-hidden rounded-card bg-card ring-1 ring-line/70 shadow-[var(--shadow-sm)] hover:ring-accent/40">
      <Link
        href={`/plant/${product.code}`}
        onClick={(e) => {
          // Plain click opens the dialog; modifier/middle clicks and the
          // context menu keep the native "open in new tab" behaviour.
          if (!isPlainLeftClick(e)) return;
          e.preventDefault();
          open(product.code);
        }}
        className="flex flex-1 flex-col"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-accent-soft">
          {product.image ? (
            <Image
              src={asset(product.image)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
              className="card-media object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center display italic text-5xl text-accent/25">
              {product.genus.charAt(0)}
            </div>
          )}
          <span
            className={`absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${rarityChipClass(market.rarityLevel)}`}
          >
            {market.rarity}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-3.5 pt-3.5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-faint">{product.genus}</p>
          <h3 className="mt-1 display text-[17px] leading-tight text-foreground">{product.name}</h3>
          {from !== null && (
            <span className="mt-auto flex items-baseline gap-1 pt-3 leading-none">
              <span className="text-[10px] text-faint">от</span>
              <span className="font-mono text-base font-medium text-accent-strong">
                {formatMoney(from, product.currency)}
              </span>
            </span>
          )}
        </div>
      </Link>

      {/* Actions live outside the link (valid markup) and in normal flow, so
          they never cover the card's tap area. */}
      <div className="flex items-center justify-between gap-2 px-3.5 pb-3 pt-2">
        <span className="min-w-0 truncate font-mono text-[11px] text-faint">
          {product.article ?? product.code}
          {meta ? ` · ${meta}` : ""}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <PhotoButton name={product.name} size="sm" elevated={false} />
          <AddToCartButton product={product} size="sm" elevated={false} />
        </div>
      </div>
    </div>
  );
}
