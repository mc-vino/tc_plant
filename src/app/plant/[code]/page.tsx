import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products, getProduct, lowestPrice, highestPrice, formatUSD } from "@/lib/catalog";
import PriceTable from "@/components/PriceTable";

export function generateStaticParams() {
  return products.map((p) => ({ code: p.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const product = getProduct(code);
  if (!product) return { title: "Not found" };
  return {
    title: `${product.name} (${product.code}) — TC Plant Catalogue`,
    description: `${product.name} — wholesale tissue-culture plant, quantity-tier pricing in USD.`,
  };
}

export default async function PlantPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const product = getProduct(code);
  if (!product) notFound();

  const low = lowestPrice(product);
  const high = highestPrice(product);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent mb-6"
      >
        ← Back to catalogue
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-[3/4] rounded-2xl bg-accent-soft overflow-hidden border border-line">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-accent/40 text-7xl font-mono">
              {product.genus.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/?`}
              className="rounded-full bg-accent-soft text-accent px-2.5 py-0.5 text-xs"
            >
              {product.genus}
            </Link>
            {product.note && (
              <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                {product.note}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="mt-1 font-mono text-sm text-muted">{product.code}</p>

          {low !== null && (
            <p className="mt-4 text-lg">
              <span className="text-muted text-sm">
                {high !== null && high !== low ? "Price range " : "From "}
              </span>
              <span className="font-semibold text-accent">
                {high !== null && high !== low
                  ? `${formatUSD(low)} – ${formatUSD(high)}`
                  : formatUSD(low)}
              </span>
              <span className="text-muted text-sm"> / unit</span>
            </p>
          )}

          <div className="mt-6 rounded-xl border border-line bg-card p-4">
            <PriceTable product={product} />
          </div>

          <p className="mt-4 text-xs text-muted leading-relaxed">
            Prices are per unit (one TC plant), quoted in USD, EXW. Sold in bags
            of 10 pieces. Contact the supplier for current availability and lead
            times.
          </p>
        </div>
      </div>
    </div>
  );
}
