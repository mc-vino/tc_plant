import { products, generaWithCounts, meta } from "@/lib/catalog";
import CatalogBrowser from "@/components/CatalogBrowser";

export default function Home() {
  const genera = generaWithCounts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <section className="mb-10 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          Tissue-culture plant catalogue
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          {meta.count} varieties from {meta.supplier} — Alocasia, Philodendron,
          Monstera, Anthurium and more. Wholesale pricing in {meta.currency} by
          quantity tier, {meta.incoterm}.
        </p>
      </section>

      <CatalogBrowser products={products} genera={genera} />
    </div>
  );
}
