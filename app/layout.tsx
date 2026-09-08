// import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter as FontSans } from "next/font/google";
import { SITE_CONFIG } from "../config/site";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Caveat } from "next/font/google";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { GlobalLoaderProvider } from "@/context/LoadingContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site-url";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: ["400", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_CONFIG.name} | University of Nairobi Tech Community`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  keywords: [...SITE_CONFIG.keywords],
  authors: [{ name: SITE_CONFIG.name, url: siteUrl }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  category: "education",
  classification: "Student Technology Club",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: siteUrl,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: absoluteUrl("/images/image.svg"),
        width: 512,
        height: 512,
        alt: `${SITE_CONFIG.name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — Chiromo · UoN`,
    description: SITE_CONFIG.description,
    images: [absoluteUrl("/images/image.svg")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/images/image.svg", type: "image/svg+xml" }],
    apple: [{ url: "/images/image.svg" }],
  },
  other: {
    "geo.region": "KE-30",
    "geo.placename": "Chiromo, Nairobi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-KE"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${plusJakartaSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteJsonLd />
        <ThemeProvider>
          <GlobalLoaderProvider>
            {/* <ClerkProvider> */}
            {children}
            <CommandPalette />
            {/* </ClerkProvider> */}
          </GlobalLoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
