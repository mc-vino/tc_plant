import Image from "next/image";
import { products, catalogs, lowestPrice, formatMoney, DEFAULT_CATALOG } from "@/lib/catalog";
import { varieties } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { supplier } from "@/data/supplier";
import CatalogBrowser from "@/components/CatalogBrowser";
import Reveal from "@/components/Reveal";

const HERO_CODES = ["AL050", "AL062", "AL061", "AL070"];

export default function Home() {
  const generaCount = new Set(products.map((p) => p.genus)).size;
  // Only the default list: the others are quoted in another currency.
  const defaultList = products.filter((p) => p.catalog === DEFAULT_CATALOG);
  const defaultCurrency = catalogs.find((c) => c.id === DEFAULT_CATALOG)?.currency ?? "USD";
  const globalMin = Math.min(
    ...defaultList.map((p) => lowestPrice(p) ?? Infinity).filter((n) => Number.isFinite(n)),
  );
  const heroImages = HERO_CODES.map((c) => products.find((p) => p.code === c)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p?.image),
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 pt-16 pb-16 sm:pt-24 sm:pb-24 grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              {supplier.location}
            </p>
            <h1 className="display-hero mt-4 text-[clamp(2.75rem,6vw,6rem)]">
              Живой каталог растений из культуры ткани
            </h1>
            <p className="mt-6 max-w-lg text-[16px] leading-[1.5] text-muted text-pretty">
              {varieties(products.length)} в {catalogs.length} прайсах. Основной и вариегатный от
              питомника {supplier.name} в Ханое, в {supplier.currency}, {supplier.incoterm}. Прайс
              клонов в рублях. Цена за штуку зависит от количества.
            </p>
            <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-5">
              <Stat value={String(products.length)} label="Сортов" />
              <Stat value={String(generaCount)} label="Родов" />
              <Stat value={formatMoney(globalMin, defaultCurrency)} label="От, за штуку" />
            </dl>
          </Reveal>

          {/* Bento image cluster */}
          <Reveal delay={0.08}>
            <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-3 sm:gap-4">
              {heroImages[0] && (
                <BentoImage product={heroImages[0]} className="row-span-2 aspect-[3/4]" priority />
              )}
              {heroImages[1] && <BentoImage product={heroImages[1]} className="aspect-square" />}
              {heroImages[2] && <BentoImage product={heroImages[2]} className="aspect-square" />}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Catalogue */}
      <section className="mx-auto max-w-[1440px] px-5 sm:px-8 pt-4 pb-8 scroll-mt-20" id="catalogue">
        <CatalogBrowser products={products} catalogs={catalogs} />
      </section>
    </div>
  );
}

function BentoImage({
  product,
  className,
  priority,
}: {
  product: { image: string | null; name: string };
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[12px] bg-accent-soft ${className ?? ""}`}
    >
      <Image
        src={asset(product.image!)}
        alt={product.name}
        fill
        sizes="(max-width: 1024px) 50vw, 320px"
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="serif text-[2rem] leading-none">{value}</dd>
      <dd className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted">{label}</dd>
    </div>
  );
}
