import Image from "next/image";
import { products, generaWithCounts, lowestPrice, formatUSD } from "@/lib/catalog";
import { varieties } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import { supplier } from "@/data/supplier";
import CatalogBrowser from "@/components/CatalogBrowser";
import Reveal from "@/components/Reveal";

const HERO_CODES = ["AL050", "AL062", "AL061", "AL070"];

export default function Home() {
  const genera = generaWithCounts();
  const globalMin = Math.min(
    ...products.map((p) => lowestPrice(p) ?? Infinity).filter((n) => Number.isFinite(n)),
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
            <p className="text-[13px] font-medium text-accent">
              {supplier.location}
            </p>
            <h1 className="mt-3 display text-[clamp(2.75rem,6vw,5rem)] leading-[0.98]">
              Живой каталог растений{" "}
              <span className="text-accent">из культуры ткани</span>
            </h1>
            <p className="mt-6 max-w-lg text-[17px] text-muted leading-relaxed text-pretty">
              {varieties(products.length)}, размноженных питомником {supplier.name} в Ханое.
              Цена за штуку по количеству, в {supplier.currency}, {supplier.incoterm}.
            </p>
            <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-5">
              <Stat value={String(products.length)} label="Сортов" />
              <Stat value={String(genera.length)} label="Родов" />
              <Stat value={formatUSD(globalMin)} label="От, за штуку" />
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
        <CatalogBrowser products={products} genera={genera} />
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
      className={`relative overflow-hidden rounded-[24px] bg-accent-soft shadow-[var(--shadow-md)] ${className ?? ""}`}
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
      <dd className="display text-[2rem] leading-none text-foreground">{value}</dd>
      <dd className="mt-1.5 text-[13px] text-faint">{label}</dd>
    </div>
  );
}
