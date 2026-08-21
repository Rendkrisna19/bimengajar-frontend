import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FontAwesomeLoader from "@/components/ui/FontAwesomeLoader";
import VisitorTracker from "@/components/ui/VisitorTracker";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Home Page | PLAT-BK",
  description: "Platform Edukasi dan Layanan Publik Bank Indonesia Pematang Siantar",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/images/logo.png?v=3", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
        {/* Favicon high contrast vector icon */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.svg" />

        {/* Preconnect & DNS Prefetch to Cloudflare CDN to eliminate TCP/TLS latency */}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Dynamic Fonts for Edukasi Content & Rich Text Editor */}
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Cinzel:wght@600;800&family=Fira+Code:wght@400;600&family=Inter:wght@400;600;700;800&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600;700&family=Oswald:wght@500;700&family=Outfit:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Poppins:wght@400;600;700;800&family=Roboto:wght@400;500;700&display=swap" 
        />
        
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
      <body className={`${montserrat.className} ${montserrat.variable} ${plusJakartaSans.variable} antialiased min-h-screen flex flex-col bg-gray-50 text-gray-900`}>
        <FontAwesomeLoader />
        <VisitorTracker />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
