import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Geist_Mono, Cormorant } from "next/font/google";
import "./globals.css";
import { supplier } from "@/data/supplier";

const sans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const serif = Cormorant({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
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
      className={`${sans.variable} ${geistMono.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <header className="border-b border-line bg-background/85 backdrop-blur-md sticky top-0 z-30">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-paper text-sm font-serif italic">
                x
              </span>
              <span className="font-serif text-xl leading-none group-hover:text-accent transition-colors">
                TC&nbsp;Plant
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="text-muted hover:text-foreground transition-colors">
                Каталог
              </Link>
              <Link href="/about" className="text-muted hover:text-foreground transition-colors">
                Поставщик
              </Link>
              <span className="hidden sm:inline font-mono text-xs text-faint">
                {supplier.currency} · EXW
              </span>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line mt-20 bg-paper">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-10 grid gap-6 sm:grid-cols-3 text-sm">
            <div>
              <p className="font-serif text-lg">{supplier.name}</p>
              <p className="text-muted mt-1">{supplier.tagline}</p>
            </div>
            <div className="text-muted">
              <p>{supplier.location}</p>
              <a href={`mailto:${supplier.email}`} className="hover:text-accent transition-colors">
                {supplier.email}
              </a>
            </div>
            <div className="text-faint font-mono text-xs sm:text-right sm:self-end">
              Прайс от {supplier.quotationDate}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
