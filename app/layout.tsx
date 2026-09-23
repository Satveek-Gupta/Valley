import type { Metadata } from "next";
import { Anton, Archivo, Archivo_Black, Syne } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://valley.cabinetbu.tech";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CABINET VALLEY 2026 — The Ultimate Student Fest & Startup Showcase",
    template: "%s | Cabinet Valley 2026",
  },
  description:
    "Cabinet Valley brings together founders, creators, builders, traders, and communities for 3 days of showcases, competitions, and recognition. 50+ stalls, 6 flagship events, 5000+ attendees.",
  keywords: [
    "Cabinet Valley",
    "Cabinet Valley 2026",
    "Student Fest 2026",
    "College Tech Fest",
    "Startup Roulette",
    "The War Room",
    "The Boardroom",
    "Bay Area Stalls",
    "Bulls and Bears",
    "Student Cabinet",
    "Tech Showcase",
    "Student Entrepreneurship",
    "Hackathon & Competitions",
  ],
  authors: [{ name: "Student Cabinet", url: siteUrl }],
  creator: "Student Cabinet",
  publisher: "Student Cabinet",
  category: "technology",
  icons: {
    icon: "/Cabinet Assets/cabinet-square-logo-white-bg.png",
    shortcut: "/Cabinet Assets/cabinet-square-logo-white-bg.png",
    apple: "/Cabinet Assets/cabinet-square-logo-white-bg.png",
  },
  openGraph: {
    title: "CABINET VALLEY 2026 — Official Student Fest",
    description:
      "3 Days of Showcases, Competitions, and Recognition. Join 5,000+ builders, founders, and creators.",
    url: siteUrl,
    siteName: "Cabinet Valley 2026",
    images: [
      {
        url: "/Cabinet Assets/cabinet-square-logo-white-bg.png",
        width: 800,
        height: 800,
        alt: "Cabinet Valley 2026 Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CABINET VALLEY 2026 — Official Student Fest",
    description:
      "3 Days of Showcases, Competitions, and Recognition. Join 5,000+ builders, founders, and creators.",
    images: ["/Cabinet Assets/cabinet-square-logo-white-bg.png"],
    creator: "@StudentCabinet",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Festival",
      "@id": `${siteUrl}/#event`,
      name: "Cabinet Valley 2026",
      description:
        "Cabinet Valley is a 3-day student festival and startup showcase bringing together founders, creators, builders, traders, and communities.",
      startDate: "2026-09-24T09:00:00+05:30",
      endDate: "2026-09-26T20:00:00+05:30",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: "Cabinet Valley Campus Grounds",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bangalore",
          addressRegion: "Karnataka",
          addressCountry: "IN",
        },
      },
      image: [`${siteUrl}/Cabinet Assets/cabinet-square-logo-white-bg.png`],
      organizer: {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Student Cabinet",
        url: siteUrl,
        logo: `${siteUrl}/Cabinet Assets/cabinet-square-logo-white-bg.png`,
      },
      offers: {
        "@type": "Offer",
        url: `${siteUrl}/register`,
        price: "0",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        validFrom: "2026-01-01T00:00:00+05:30",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Student Cabinet",
      url: siteUrl,
      logo: `${siteUrl}/Cabinet Assets/cabinet-square-logo-white-bg.png`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${syne.variable} ${archivoBlack.variable} ${archivo.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-brand-ink antialiased selection:bg-brand-violet selection:text-white">
        <SmoothScroll>{children}</SmoothScroll>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
