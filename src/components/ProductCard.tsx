import Image from "next/image";
import Link from "next/link";
import { Product, lowestPrice, formatUSD } from "@/lib/catalog";

export default function ProductCard({ product }: { product: Product }) {
  const from = lowestPrice(product);
  return (
    <Link
      href={`/plant/${product.code}`}
      className="group block rounded-xl border border-line bg-card overflow-hidden transition-colors hover:border-accent"
    >
      <div className="relative aspect-[3/4] bg-accent-soft overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-accent/40 text-4xl font-mono">
            {product.genus.charAt(0)}
          </div>
        )}
        {product.note && (
          <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium text-accent border border-line">
            {product.note}
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug">{product.name}</h3>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted">{product.code}</span>
          {from !== null && (
            <span className="text-sm">
              <span className="text-muted text-xs">from </span>
              <span className="font-semibold text-accent">{formatUSD(from)}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
