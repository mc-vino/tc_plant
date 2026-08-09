import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { supplier } from "@/data/supplier";
import { CartProvider } from "@/lib/cart";
import { PlantModalProvider } from "@/lib/plantModal";
import CartButton from "@/components/CartButton";
import CartDrawer from "@/components/CartDrawer";
import PlantDialog from "@/components/PlantDialog";

const sans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Каталог TC Plant · Xanh Xanh Urban Forest",
  description:
    "Оптовый каталог растений из культуры ткани: Alocasia, Philodendron, Monstera, Anthurium и другие. Цены по объёмным тирам в USD, EXW.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${sans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <CartProvider>
        <PlantModalProvider>
        <header className="glass sticky top-0 z-30 border-b border-line/60">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 h-14 flex items-center justify-between">
            <Link href="/" className="press flex items-center gap-2.5 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-foreground text-background text-sm font-normal">
                x
              </span>
              <span className="display text-[17px] leading-none transition-colors group-hover:text-accent">
                TC&nbsp;Plant
              </span>
            </Link>
            <nav className="flex items-center gap-3 sm:gap-7 text-[13px]">
              {/* The logo already leads home, so this link can go on tiny screens. */}
              <Link
                href="/"
                className="hidden rounded-full px-3 py-1.5 text-foreground transition-colors hover:bg-accent/10 min-[380px]:inline"
              >
                Каталог
              </Link>
              <Link
                href="/about"
                className="rounded-full px-3 py-1.5 text-foreground transition-colors hover:bg-accent/10"
              >
                Поставщик
              </Link>
              <span className="hidden font-mono text-[11px] text-muted sm:inline">
                {supplier.currency} · EXW
              </span>
              <CartButton />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Absolute Black terminal anchor at the foot of the page. */}
        <footer className="mt-24 bg-[#000000] text-[#faf8f5]">
          <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-12 text-sm sm:grid-cols-3 sm:px-8">
            <div>
              <p className="serif text-xl text-[#faf8f5]">{supplier.name}</p>
              <p className="mt-1 text-[#d1cfc7]">{supplier.tagline}</p>
            </div>
            <div className="text-[#d1cfc7]">
              <p>{supplier.location}</p>
              <a href={`mailto:${supplier.email}`} className="transition-colors hover:text-[#faf8f5]">
                {supplier.email}
              </a>
            </div>
            <div className="font-mono text-xs text-[#7c7464] sm:self-end sm:text-right">
              Прайс от {supplier.quotationDate}
            </div>
          </div>
        </footer>

        <CartDrawer />
        <PlantDialog />
        </PlantModalProvider>
        </CartProvider>
      </body>
    </html>
  );
}
