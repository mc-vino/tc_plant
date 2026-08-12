import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { supplier, terms, cloneTerms } from "@/data/supplier";
import { products, catalogs } from "@/lib/catalog";
import { asset } from "@/lib/asset";
import BotanicalBackdrop from "@/components/BotanicalBackdrop";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Поставщик · Xanh Xanh Urban Forest",
  description:
    "О питомнике растений из культуры ткани Xanh Xanh Urban Forest (Ханой, Вьетнам) и оптовых условиях каталога.",
};

export default function AboutPage() {
  // The nursery quotes in dollars, EXW. While its lists are not published the
  // page must describe the list that is, otherwise it states terms that do not
  // apply to anything on sale.
  const list = catalogs[0];
  const nurseryListed = catalogs.some((c) => c.currency === "USD");
  const shownTerms = nurseryListed ? terms : cloneTerms;

  // Two portraits from the published list, so the page follows the catalogue.
  const withPhoto = products.filter((p) => p.image);
  const gallery = [withPhoto[0], withPhoto[Math.floor(withPhoto.length / 2)]].filter(
    (p): p is NonNullable<typeof p> => Boolean(p?.image),
  );

  return (
    <div>
      {/* Intro */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <BotanicalBackdrop />
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 pt-14 pb-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              Поставщик
            </p>
            <h1 className="serif mt-4 text-5xl leading-[1.03] md:text-6xl">
              {supplier.name}
            </h1>
            <p className="mt-5 max-w-xl text-muted leading-relaxed">
              Питомник растений из культуры ткани в {supplier.location}. Размножает Alocasia,
              Philodendron, Monstera, Anthurium и другие роды на оптовый экспорт. Каждое растение
              выращено из культуры и упаковано пакетами по десять штук.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-3">
              {gallery.map((p) => (
                <Link
                  key={p.code}
                  href={`/plant/${p.code}`}
                  className="relative aspect-[4/5] overflow-hidden rounded-card border border-line group"
                >
                  <Image
                    src={asset(p.image!)}
                    alt={p.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Terms */}
      <section className="mx-auto max-w-[1400px] px-5 sm:px-8 py-14">
        <h2 className="serif text-3xl">
          {nurseryListed ? "Условия оптовых поставок" : "Условия действующего прайса"}
        </h2>
        <p className="mt-2 text-muted max-w-2xl">
          Прайс &laquo;{list.label}&raquo; от {list.quotationDate ?? supplier.quotationDate}.
          {nurseryListed
            ? " Перед заказом уточните наличие у питомника."
            : " Перед заказом уточните наличие у организатора закупки."}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {shownTerms.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 0.08}>
              <div className="h-full rounded-card border border-line bg-card p-8 md:p-10">
                <h3 className="serif text-2xl">{group.title}</h3>
                <dl className="mt-4 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.label}>
                      <dt className="text-xs uppercase tracking-[0.12em] text-faint">
                        {item.label}
                      </dt>
                      <dd className="mt-1 text-sm text-foreground leading-relaxed">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-[1400px] px-5 sm:px-8 pb-16">
        <div className="relative isolate overflow-hidden rounded-card border border-line bg-paper p-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <BotanicalBackdrop variant="soft" />
          <div>
            <h2 className="serif text-3xl">
              {nurseryListed ? "Оформить заказ" : "Связаться с питомником"}
            </h2>
            <p className="mt-2 text-muted max-w-lg">
              {nurseryListed
                ? "Свяжитесь с питомником напрямую по наличию, срокам и для получения проформы-инвойса."
                : "Контакты питомника для вопросов по сортам и поставкам. Заказ по действующему прайсу оформляется у организатора закупки."}
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            <ContactRow icon={<MapPin size={18} />} text={supplier.address} />
            <ContactRow
              icon={<Phone size={18} />}
              text={supplier.phone}
              href={`tel:${supplier.phone.replace(/\s/g, "")}`}
            />
            <ContactRow
              icon={<Mail size={18} />}
              text={supplier.email}
              href={`mailto:${supplier.email}`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactRow({
  icon,
  text,
  href,
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
}) {
  const body = (
    <span className="flex items-start gap-3">
      <span className="mt-0.5 text-muted">{icon}</span>
      <span className="text-foreground">{text}</span>
    </span>
  );
  return href ? (
    <a href={href} className="hover:text-accent transition-colors">
      {body}
    </a>
  ) : (
    body
  );
}
