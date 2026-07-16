import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { supplier } from "@/data/supplier";
import ThemeToggle from "@/components/ThemeToggle";
import { CartProvider } from "@/lib/cart";
import CartButton from "@/components/CartButton";
import CartDrawer from "@/components/CartDrawer";

const themeInit = `try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`;

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
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <CartProvider>
        <header className="glass sticky top-0 z-30 border-b border-line/60">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 h-14 flex items-center justify-between">
            <Link href="/" className="press flex items-center gap-2.5 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-accent text-white text-sm font-semibold">
                x
              </span>
              <span className="display text-[17px] leading-none group-hover:text-accent transition-colors">
                TC&nbsp;Plant
              </span>
            </Link>
            <nav className="flex items-center gap-7 text-[13px]">
              <Link href="/" className="text-muted hover:text-foreground transition-colors">
                Каталог
              </Link>
              <Link href="/about" className="text-muted hover:text-foreground transition-colors">
                Поставщик
              </Link>
              <span className="hidden sm:inline font-mono text-[11px] text-faint">
                {supplier.currency} · EXW
              </span>
              <ThemeToggle />
              <CartButton />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line mt-24 bg-paper">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-12 grid gap-6 sm:grid-cols-3 text-sm">
            <div>
              <p className="display text-lg">{supplier.name}</p>
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

        <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
