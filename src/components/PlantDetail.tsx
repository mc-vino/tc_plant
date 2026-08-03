import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Product, lowestPrice, highestPrice, formatUSD } from "@/lib/catalog";
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
          // No frame or mat: object-contain scales the photo down to fit and it
          // sits straight on the surface behind it. The box is capped on phones
          // so the name and price stay above the fold.
          <div className="relative h-[34vh] w-full md:h-auto md:aspect-[4/5]">
            <Image
              src={asset(product.image!)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 460px"
              className="object-contain"
            />
          </div>
        )}

        {/* min-w-0 lets the price table's own overflow-x-auto work instead of
            stretching the column past the viewport. */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent-strong">
              {product.genus}
            </span>
            <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
              {variantBadge}
            </span>
          </div>

          <h1
            id={headingId}
            className="mt-4 display text-3xl md:text-4xl leading-[1.06] tracking-tight"
          >
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-sm text-faint">{product.code}</p>

          {low !== null && (
            <p className="mt-5 display text-2xl text-accent-strong">
              {high !== null && high !== low
                ? `${formatUSD(low)} - ${formatUSD(high)}`
                : formatUSD(low)}
              <span className="font-sans text-sm text-faint"> / шт.</span>
            </p>
          )}

          <a
            href={googleImagesUrl(product.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="press mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <ImageIcon size={13} /> Найти фото
          </a>

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
        </div>
      </div>

      {/* Full width so every quantity tier fits without sideways scrolling. */}
      <div className="mt-6 rounded-card border border-line bg-card p-4 sm:p-5">
        <VariantTable product={product} />
      </div>

      <MarketPanel product={product} />
    </>
  );
}
