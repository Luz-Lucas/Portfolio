import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PageFrame } from "@/app/_components/PageFrame";
import { SmoothScroll } from "@/app/_components/SmoothScroll";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_URL = "https://lucaspereira.dev";
const SITE_TITLE = "Lucas Pereira — Desenvolvedor Front-end";
const SITE_DESCRIPTION =
  "Portfólio de Lucas Pereira, estudante de Engenharia de Software e desenvolvedor front-end em Minas Gerais, Brasil — React, TypeScript e interfaces responsivas.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Lucas Pereira",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1815",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased bg-surface text-ink">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-6 focus:left-6 focus:z-[100] focus:rounded-md focus:bg-terracotta-deep focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-terracotta"
        >
          Pular para o conteúdo
        </a>
        <div className="grain" aria-hidden="true" />
        <PageFrame>
          <SmoothScroll>{children}</SmoothScroll>
        </PageFrame>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
