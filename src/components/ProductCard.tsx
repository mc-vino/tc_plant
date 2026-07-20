import Image from "next/image";
import Link from "next/link";
import { Product, lowestPrice, formatUSD } from "@/lib/catalog";
import { asset } from "@/lib/asset";
import { marketFor, rarityChipClass } from "@/lib/market";

export default function ProductCard({ product }: { product: Product }) {
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
    <Link
      href={`/plant/${product.code}`}
      className="card-hover group flex flex-col rounded-card bg-card overflow-hidden ring-1 ring-line/70 shadow-[var(--shadow-sm)] hover:ring-accent/40"
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
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[10px] uppercase tracking-[0.14em] text-faint">{product.genus}</p>
        <h3 className="mt-1 display text-[17px] leading-tight text-foreground">{product.name}</h3>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <span className="leading-tight">
            <span className="block font-mono text-[11px] text-faint">{product.code}</span>
            {meta && <span className="text-[11px] text-faint">{meta}</span>}
          </span>
          {from !== null && (
            <span className="text-right leading-none">
              <span className="block text-[10px] text-faint">от</span>
              <span className="font-mono text-sm font-medium text-accent-strong">
                {formatUSD(from)}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
