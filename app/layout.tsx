import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AnimatedBackground } from "@/components/AnimatedBackground";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lucas Pereira | Backend Software Engineer",
  description:
    "Backend software engineer specializing in API architecture, event-driven systems, and cloud-ready infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased bg-black text-white`}>
        <AnimatedBackground />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
