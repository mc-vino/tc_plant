import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { meta } from "@/lib/catalog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TC Plant Catalogue — Xanh Xanh Urban Forest",
  description:
    "Wholesale tissue-culture plant catalogue: Alocasia, Philodendron, Monstera, Anthurium and more. Quantity-tier pricing in USD.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-line bg-background/80 backdrop-blur sticky top-0 z-20">
          <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight">TC Plant</span>
              <span className="text-muted text-sm hidden sm:inline">Catalogue</span>
            </Link>
            <span className="text-xs text-muted font-mono">
              {meta.currency} · {meta.incoterm}
            </span>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line mt-16">
          <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-muted flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>{meta.supplier}</span>
            <span className="font-mono text-xs">
              Quotation {meta.quotation_date} · {meta.count} varieties
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
