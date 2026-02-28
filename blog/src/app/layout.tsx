import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flompt.dev"),
  title: {
    default: "flompt blog",
    template: "%s | flompt blog",
  },
  description:
    "Prompt engineering, visual prompt building, and AI optimization. Practical guides in French and English.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "flompt blog",
    images: [
      {
        url: "https://flompt.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "flompt — Visual AI Prompt Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://flompt.dev/og-image.png"],
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale || "fr"} suppressHydrationWarning>
      <body className={`${inter.variable} ${caveat.variable} font-sans antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YR5TEHJQB1"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YR5TEHJQB1');
          `}
        </Script>
        <Suspense>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
