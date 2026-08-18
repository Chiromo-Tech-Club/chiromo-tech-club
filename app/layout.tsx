// import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter as FontSans } from "next/font/google";
import { SITE_CONFIG } from "../config/site";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Caveat } from "next/font/google";
import {CommandPalette} from "@/components/navigation/CommandPalette";
import {GlobalLoaderProvider} from "@/context/LoadingContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: ["400", "700"],
});

// Make sure to add `${caveat.variable}` to your body's className
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
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${plusJakartaSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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