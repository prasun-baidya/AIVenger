import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AIVenger - AI-Powered Avatar Creation",
    template: "%s | AIVenger",
  },
  description:
    "Create stunning, personalized superhero avatars powered by advanced AI. Transform yourself into the hero you were meant to be with AIVenger.",
  keywords: [
    "AI Avatar",
    "Superhero Avatar",
    "Avatar Creator",
    "AI-Powered",
    "Avatar Generation",
    "Digital Avatar",
    "Hero Avatar",
    "Character Creation",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AIVenger",
    title: "AIVenger - AI-Powered Avatar Creation",
    description:
      "Create stunning, personalized superhero avatars powered by advanced AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIVenger - AI-Powered Avatar Creation",
    description:
      "Create stunning, personalized superhero avatars powered by advanced AI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AIVenger",
  description:
    "Create stunning, personalized superhero avatars powered by advanced AI",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
