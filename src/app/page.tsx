import Link from "next/link";
import { products, catalogs, lowestPrice, formatMoney, DEFAULT_CATALOG } from "@/lib/catalog";
import { varieties } from "@/lib/i18n";
import { supplier } from "@/data/supplier";
import BotanicalBackdrop from "@/components/BotanicalBackdrop";
import CatalogBrowser from "@/components/CatalogBrowser";
import Reveal from "@/components/Reveal";

export default function Home() {
  const generaCount = new Set(products.map((p) => p.genus)).size;
  // Only the default list: the others are quoted in another currency.
  const defaultList = products.filter((p) => p.catalog === DEFAULT_CATALOG);
  const defaultCurrency = catalogs.find((c) => c.id === DEFAULT_CATALOG)?.currency ?? "USD";
  const globalMin = Math.min(
    ...defaultList.map((p) => lowestPrice(p) ?? Infinity).filter((n) => Number.isFinite(n)),
  );

  return (
    <div>
      {/* Hero: content centred over a blurred botanical layer. */}
      <section className="relative isolate flex min-h-[84vh] items-center justify-center overflow-hidden px-5 py-24 sm:px-8">
        <BotanicalBackdrop />
        <Reveal className="mx-auto w-full max-w-3xl text-center">
          {/* The eyebrow names the origin only while the nursery's own list is
              published; otherwise it names the list that actually is. */}
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
            {catalogs.some((c) => c.currency === "USD") ? supplier.location : catalogs[0].label}
          </p>
          <h1 className="display-hero mt-5 text-[clamp(2.75rem,7vw,6rem)]">
            Живой каталог растений из культуры ткани
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-[1.5] text-muted text-pretty">
            {varieties(products.length)} в действующем прайсе &laquo;{catalogs[0].label}&raquo;.
            Цена за штуку в рублях; обозначения вариегатности A, B, C и Mixed указаны в названии.
          </p>

          <div className="mt-9 flex justify-center">
            <Link
              href="#catalogue"
              className="press inline-flex h-11 items-center rounded-full bg-deep-forest px-7 text-sm text-parchment transition-colors hover:bg-headline"
            >
              Смотреть каталог
            </Link>
          </div>

          <dl className="mt-14 flex flex-wrap justify-center gap-x-14 gap-y-6">
            <Stat value={String(products.length)} label="Сортов" />
            <Stat value={String(generaCount)} label="Родов" />
            <Stat value={formatMoney(globalMin, defaultCurrency)} label="От, за штуку" />
          </dl>
        </Reveal>
      </section>

      {/* Catalogue */}
      <section className="relative isolate overflow-hidden scroll-mt-20" id="catalogue">
        <BotanicalBackdrop variant="soft" />
        <div className="mx-auto max-w-[1440px] px-5 pt-10 pb-8 sm:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
            <h2 className="serif text-[2rem] leading-none">Каталог</h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              {catalogs[0].label} · прайс от {catalogs[0].quotationDate}
            </p>
          </div>
          <CatalogBrowser products={products} catalogs={catalogs} />
        </div>
      </section>
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
