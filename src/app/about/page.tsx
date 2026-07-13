import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { supplier, terms } from "@/data/supplier";
import { products } from "@/lib/catalog";
import { varieties } from "@/lib/i18n";
import { asset } from "@/lib/asset";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Поставщик · Xanh Xanh Urban Forest",
  description:
    "О питомнике растений из культуры ткани Xanh Xanh Urban Forest (Ханой, Вьетнам) и оптовых условиях каталога.",
};

const ABOUT_CODES = ["AL062", "AL070"];

export default function AboutPage() {
  const gallery = ABOUT_CODES.map((c) => products.find((p) => p.code === c)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p?.image),
  );

  return (
    <div>
      {/* Intro */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 pt-14 pb-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Поставщик
            </p>
            <h1 className="mt-4 display text-5xl md:text-6xl leading-[1.03] tracking-tight">
              {supplier.name}
            </h1>
            <p className="mt-5 max-w-xl text-muted leading-relaxed">
              Питомник растений из культуры ткани в {supplier.location}. Размножает{" "}
              {varieties(products.length)} Alocasia, Philodendron, Monstera, Anthurium и других
              родов на оптовый экспорт. Каждое растение выращено из культуры, упаковано пакетами
              по десять штук, цена зависит от объёма.
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
        <h2 className="display text-3xl">Условия оптовых поставок</h2>
        <p className="mt-2 text-muted max-w-2xl">
          Из действующего прайса от {supplier.quotationDate}. Перед заказом уточните наличие у
          питомника.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {terms.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 0.08}>
              <div className="h-full rounded-card border border-line bg-card p-6">
                <h3 className="display text-xl text-accent-strong">{group.title}</h3>
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
        <div className="rounded-card border border-line bg-paper p-8 md:p-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="display text-3xl">Оформить заказ</h2>
            <p className="mt-2 text-muted max-w-lg">
              Свяжитесь с питомником напрямую по наличию, срокам и для получения проформы-инвойса.
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
      <span className="mt-0.5 text-accent">{icon}</span>
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
