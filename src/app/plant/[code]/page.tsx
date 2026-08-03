import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { products, getProduct, relatedByGenus } from "@/lib/catalog";
import PlantDetail from "@/components/PlantDetail";
import ProductCard from "@/components/ProductCard";
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

  const related = relatedByGenus(product);

  return (
    <div className="mx-auto max-w-[1100px] px-5 sm:px-8 py-8">
      <Link
        href="/"
        className="press inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft size={15} /> Каталог
      </Link>

      <Reveal>
        <PlantDetail product={product} />
      </Reveal>

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
