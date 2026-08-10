import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FontAwesomeLoader from "@/components/ui/FontAwesomeLoader";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Home Page | PLAT-BK",
  description: "Platform Edukasi dan Layanan Publik Bank Indonesia Pematang Siantar",
  icons: {
    icon: "/images/logo.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Preconnect & DNS Prefetch to Cloudflare CDN to eliminate TCP/TLS latency */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        
        {/* Preload LCP Background Element & Banner Illustration with high priority */}
        <link
          rel="preload"
          href="/images/banner/hero1.png"
          as="image"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/images/element/1.png"
          as="image"
          fetchPriority="high"
        />
        
        {/* Preload FontAwesome WebFonts to eliminate FOIT & satisfy Lighthouse font-display: swap */}
        <link
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

      </head>
      <body className={`${plusJakartaSans.className} ${plusJakartaSans.variable} ${montserrat.variable} antialiased min-h-screen flex flex-col bg-gray-50 text-gray-900`}>
        <FontAwesomeLoader />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
