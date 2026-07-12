import { Product } from "@/lib/catalog";
import { marketFor, formatRub, rarityChipClass } from "@/lib/market";

function Cell({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="p-4">
      <dt className="text-xs uppercase tracking-[0.1em] text-faint">{label}</dt>
      <dd className="mt-1.5 font-serif text-xl text-foreground">{value}</dd>
      {hint && <dd className="mt-0.5 text-[11px] text-faint leading-snug">{hint}</dd>}
    </div>
  );
}

export default function MarketPanel({ product }: { product: Product }) {
  const m = marketFor(product);

  return (
    <section className="mt-14 border-t border-line pt-10">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-serif text-2xl">Оценка для рынка РФ / РБ</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${rarityChipClass(m.rarityLevel)}`}
        >
          {m.rarity}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 lg:grid-cols-3 rounded-card border border-line bg-card divide-x divide-y divide-line overflow-hidden [&>div]:border-line">
        <Cell
          label="Рост до маточника"
          value={`${m.monthsToMother} мес.`}
          hint="До размера, годного к размножению, при идеальных условиях"
        />
        <Cell
          label="Обесценивание"
          value={`${Math.round(m.depreciationPerYear * 100)}% / год`}
          hint="Падение розничной цены по мере тиражирования"
        />
        <Cell
          label="Опт. цена клона"
          value={formatRub(m.cloneCostRub)}
          hint="Себестоимость клона из прайса (в пересчёте на ₽)"
        />
      </dl>

      <p className="mt-4 text-xs text-faint leading-relaxed max-w-3xl">
        Оценка по модели, не биржевые данные. Редкость, срок роста и обесценивание рассчитаны от
        оптовых цен прайса и допущений (курс {77} ₽/$, скорость роста и обесценивания по родам и
        редкости). Параметры настраиваются в <code className="font-mono">src/lib/market.ts</code>.
      </p>
    </section>
  );
}
