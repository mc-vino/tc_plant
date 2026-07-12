import Image from "next/image";
import Link from "next/link";
import { Product, lowestPrice, formatUSD } from "@/lib/catalog";
import { noteRu } from "@/lib/i18n";
import { marketFor, rarityChipClass } from "@/lib/market";

export default function ProductCard({ product }: { product: Product }) {
  const from = lowestPrice(product);
  const market = marketFor(product);
  return (
    <Link
      href={`/plant/${product.code}`}
      className="card-hover group flex flex-col rounded-card border border-line bg-card overflow-hidden hover:border-accent"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-accent-soft">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
            className="card-media object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-serif italic text-5xl text-accent/25">
            {product.genus.charAt(0)}
          </div>
        )}
        {product.note && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-paper/90 px-2.5 py-0.5 text-[10px] font-medium text-accent-strong ring-1 ring-line">
            {noteRu(product.note)}
          </span>
        )}
        <span
          className={`absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${rarityChipClass(market.rarityLevel)}`}
        >
          {market.rarity}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-[10px] uppercase tracking-[0.14em] text-faint">
          {product.genus}
        </p>
        <h3 className="mt-1 font-serif text-[17px] leading-tight text-foreground">
          {product.name}
        </h3>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <span className="font-mono text-[11px] text-faint">{product.code}</span>
          {from !== null && (
            <span className="text-right leading-none">
              <span className="block text-[10px] text-faint">опт от</span>
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
