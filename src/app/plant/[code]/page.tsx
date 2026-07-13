import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import {
  products,
  getProduct,
  relatedByGenus,
  lowestPrice,
  highestPrice,
  formatUSD,
} from "@/lib/catalog";
import { supplier } from "@/data/supplier";
import { asset } from "@/lib/asset";
import VariantTable from "@/components/VariantTable";
import ProductCard from "@/components/ProductCard";
import MarketPanel from "@/components/MarketPanel";
import Reveal from "@/components/Reveal";

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
  if (!product) return { title: "Не найдено" };
  return {
    title: `${product.name} (${product.code}) · Каталог TC Plant`,
    description: `${product.name}. Оптовое растение из культуры ткани (${product.genus}), цены по объёмным тирам в USD.`,
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
  const related = relatedByGenus(product);

  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-8">
      <Link
        href="/"
        className="press inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={15} /> Каталог
      </Link>

      <div className="grid gap-8 md:grid-cols-[1fr_1fr] lg:grid-cols-[1.05fr_1fr] md:gap-12">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-card border border-line bg-accent-soft">
          {product.image ? (
            <Image
              src={asset(product.image)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center display italic text-8xl text-accent/25">
              {product.genus.charAt(0)}
            </div>
          )}
        </Reveal>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent-strong">
              {product.genus}
            </span>
            <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
              {product.variants.length} вариантов
            </span>
          </div>

          <h1 className="mt-4 display text-4xl md:text-5xl leading-[1.05] tracking-tight">
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-sm text-faint">{product.code}</p>

          {low !== null && (
            <p className="mt-6 display text-2xl text-accent-strong">
              {high !== null && high !== low
                ? `${formatUSD(low)} - ${formatUSD(high)}`
                : formatUSD(low)}
              <span className="font-sans text-sm text-faint"> / шт.</span>
            </p>
          )}

          <div className="mt-6 rounded-card border border-line bg-card p-5">
            <VariantTable product={product} />
          </div>

          <p className="mt-5 text-sm text-muted leading-relaxed">
            Цена за штуку по количеству; варианты (размер, форма) в таблице выше. Валюта:{" "}
            {supplier.currency}, {supplier.incoterm}. Депозиты, сроки и оплата указаны в{" "}
            <Link href="/about" className="text-accent transition-colors hover:text-accent-strong underline underline-offset-2">
              условиях поставщика
            </Link>
            .
          </p>
        </div>
      </div>

      <MarketPanel product={product} />

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="display text-2xl">Ещё {product.genus}</h2>
            <Link href="/" className="text-sm text-accent transition-colors hover:text-accent-strong">
              Все сорта
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
