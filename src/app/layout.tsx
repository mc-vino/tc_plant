import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { supplier } from "@/data/supplier";
import { catalogs } from "@/lib/catalog";
import { CartProvider } from "@/lib/cart";
import { PlantModalProvider } from "@/lib/plantModal";
import SiteHeader from "@/components/SiteHeader";
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
        <SiteHeader />

        <main className="flex-1">{children}</main>

        {/* Absolute Black terminal anchor at the foot of the page. */}
        <footer className="mt-24 bg-[#000000] text-[#faf8f5] [--focus:#faf8f5]">
          <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-12 text-sm sm:grid-cols-3 sm:px-8">
            <div>
              <p className="serif text-2xl text-[#faf8f5]">{supplier.name}</p>
              <p className="mt-1 text-[#d1cfc7]">{supplier.tagline}</p>
            </div>
            <div className="text-[#d1cfc7]">
              <p>{supplier.location}</p>
              <a href={`mailto:${supplier.email}`} className="transition-colors hover:text-[#faf8f5]">
                {supplier.email}
              </a>
            </div>
            <div className="font-mono text-xs text-[#7c7464] sm:self-end sm:text-right">
              Прайс от {catalogs[0].quotationDate ?? supplier.quotationDate}
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
