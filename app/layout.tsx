import type { Metadata } from "next";
import { Anton, Archivo, Archivo_Black, Syne } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const syne = Syne({
  weight: ["700", "800"],
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const archivo = Archivo({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CABINET VALLEY 2026 — Official Student Fest",
  description: "Cabinet Valley brings together founders, creators, builders, traders, and communities for 3 days of showcases, competitions, and recognition.",
  keywords: ["Cabinet Valley", "Student Fest", "Startup Roulette", "The War Room", "The Boardroom", "Bay Area Stalls", "Bulls and Bears", "Student Cabinet"],
  icons: {
    icon: "/Cabinet Assets/cabinet-square-logo-white-bg.png",
    shortcut: "/Cabinet Assets/cabinet-square-logo-white-bg.png",
    apple: "/Cabinet Assets/cabinet-square-logo-white-bg.png",
  },
  openGraph: {
    title: "CABINET VALLEY 2026",
    description: "3 Days of Showcases, Competitions, and Recognition.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${syne.variable} ${archivoBlack.variable} ${archivo.variable}`}>
      <body className="bg-white text-brand-ink antialiased selection:bg-brand-violet selection:text-white">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
