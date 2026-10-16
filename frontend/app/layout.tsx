import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/app";
import "@/app/styles/globals.scss";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "MoneyWarden",
  description: "Ваши деньги под контролем: расходы, доходы и статистика",
  // «На экран Домой» в Safari: открывается без адресной строки, контент под статус-баром
  appleWebApp: { capable: true, title: "MoneyWarden", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#111113" },
  ],
  // Отступы под чёлку и полоску «домой» — через env(safe-area-inset-*)
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
