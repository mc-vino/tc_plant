import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Product, lowestPrice, highestPrice, formatMoney, CLONES_USD_RATE } from "@/lib/catalog";
import { supplier } from "@/data/supplier";
import { asset } from "@/lib/asset";
import { plural } from "@/lib/i18n";
import { googleImagesUrl } from "@/lib/googleImages";
import VariantTable from "@/components/VariantTable";
import MarketPanel from "@/components/MarketPanel";

/**
 * Shared plant body used by both the product page and the dialog.
 * When the product has no photo the image column is dropped entirely
 * (no oversized placeholder) and the details span the full width.
 */
export default function PlantDetail({
  product,
  headingId,
}: {
  product: Product;
  headingId?: string;
}) {
  const low = lowestPrice(product);
  const high = highestPrice(product);
  const hasImage = Boolean(product.image);
  const variantBadge =
    product.variants.length > 1
      ? `${product.variants.length} ${plural(product.variants.length, ["вариант", "варианта", "вариантов"])}`
      : product.variants[0]?.moq
        ? `MOQ ${product.variants[0].moq}`
        : "1 вариант";

  return (
    <>
      <div className={hasImage ? "grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10" : ""}>
        {hasImage && (
          // Laid out at the photo's own aspect ratio, so there is no empty
          // letterbox around it. Softly rounded and feathered at the edge so it
          // melts into the surface instead of reading as a pasted rectangle.
          <div>
            <div
              className="photo-fit relative mx-auto w-full"
              style={{
                aspectRatio: `${product.imageW ?? 4} / ${product.imageH ?? 5}`,
                // Cap by height, letting the width follow the ratio, so the box is
                // exactly the photo and never taller than the viewport allows.
                // Some supplier photos are barely 200px wide, so also refuse to
                // blow one up much past its own resolution.
                maxWidth: product.imageW
                  ? `min(calc(var(--photo-max-h) * ${product.imageW} / ${product.imageH}), ${Math.round(product.imageW * 1.5)}px)`
                  : `calc(var(--photo-max-h) * 4 / 5)`,
              }}
            >
              <Image
                src={asset(product.image!)}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 88vw, 460px"
                className="photo-soft rounded-[12px] object-contain"
              />
            </div>
            {product.currency === "RUB" && (
              <p className="mt-2 text-center text-[11px] text-faint">
                Фото из прайса: пример сорта, а не снимок этого растения
              </p>
            )}
          </div>
        )}

        {/* min-w-0 lets the price table's own overflow-x-auto work instead of
            stretching the column past the viewport. */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-[4px] bg-paper px-3 py-1 text-xs text-muted">
              {product.genus}
            </span>
            <span className="rounded-[4px] border border-line px-3 py-1 text-xs text-muted">
              {variantBadge}
            </span>
          </div>

          <h1
            id={headingId}
            className="serif mt-4 text-3xl leading-[1.06] md:text-4xl"
          >
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-sm text-faint">{product.article ?? product.code}</p>

          {low !== null && (
            <p className="mt-5 font-mono text-2xl text-headline">
              {high !== null && high !== low
                ? `${formatMoney(low, product.currency)} - ${formatMoney(high, product.currency)}`
                : formatMoney(low, product.currency)}
              <span className="font-sans text-sm text-faint"> / шт.</span>
            </p>
          )}

          <a
            href={googleImagesUrl(product.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="press mt-3 inline-flex w-fit items-center gap-1.5 rounded-[4px] border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <ImageIcon size={13} /> Найти фото
          </a>

          {product.currency === "RUB" ? (
            <p className="mt-5 text-sm text-muted leading-relaxed">
              Цена за штуку в рублях, по ориентировочному курсу {CLONES_USD_RATE} ₽ за доллар.
              Обозначения вариегатности в названии: A grade сильная, B слабее, C ещё слабее, Mixed
              смешанная. Заказ оформляется у организатора закупки.
            </p>
          ) : (
            <p className="mt-5 text-sm text-muted leading-relaxed">
              Цена за штуку по количеству; варианты (размер, форма) в таблице ниже. Валюта:{" "}
              {supplier.currency}, {supplier.incoterm}. Депозиты, сроки и оплата указаны в{" "}
              <Link
                href="/about"
                className="text-accent transition-colors hover:text-accent-strong underline underline-offset-2"
              >
                условиях поставщика
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      {/* Full width so every quantity tier fits without sideways scrolling. */}
      <div className="mt-6 rounded-card border border-line bg-card p-5 sm:p-10">
        <VariantTable product={product} />
      </div>

      <MarketPanel product={product} />
    </>
  );
}
