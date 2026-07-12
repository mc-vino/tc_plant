import Image from "next/image";
import { products, generaWithCounts, lowestPrice, formatUSD } from "@/lib/catalog";
import { varieties } from "@/lib/i18n";
import { supplier } from "@/data/supplier";
import CatalogBrowser from "@/components/CatalogBrowser";
import Reveal from "@/components/Reveal";

const HERO_CODES = ["AL050", "AL062", "AL061"];

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
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 pt-14 pb-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              {supplier.location} · Питомник
            </p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight pb-1">
              Живой каталог растений{" "}
              <span className="italic text-accent-strong">из культуры ткани</span>.
            </h1>
            <p className="mt-5 max-w-xl text-muted leading-relaxed">
              {varieties(products.length)}, размноженных питомником {supplier.name} в Ханое.
              Оптовые цены по объёмным тирам, в {supplier.currency}, {supplier.incoterm}.
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              <Stat value={String(products.length)} label="Сортов" />
              <Stat value={String(genera.length)} label="Родов" />
              <Stat value={`${formatUSD(globalMin)}`} label="От, за штуку" />
            </dl>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              {heroImages[0] && (
                <div className="relative row-span-2 aspect-[3/4] overflow-hidden rounded-card border border-line">
                  <Image
                    src={heroImages[0].image!}
                    alt={heroImages[0].name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 320px"
                    priority
                    className="object-cover"
                  />
                </div>
              )}
              {heroImages.slice(1, 3).map((p) => (
                <div
                  key={p.code}
                  className="relative aspect-square overflow-hidden rounded-card border border-line"
                >
                  <Image
                    src={p.image!}
                    alt={p.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 220px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Catalogue */}
      <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-10">
        <CatalogBrowser products={products} genera={genera} />
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-serif text-3xl leading-none text-accent-strong">{value}</dd>
      <dd className="mt-1 text-xs uppercase tracking-[0.12em] text-faint">{label}</dd>
    </div>
  );
}
