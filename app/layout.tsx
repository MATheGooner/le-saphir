import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { SiteChrome } from "@/components/site-chrome";
import { absoluteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: { default: "Le Saphir | Modern French Restaurant in Paris", template: "%s | Le Saphir" },
  description: "Modern French cooking in Paris 7e. Dine in, book a table, or order for collection and local delivery.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_GB", siteName: "Le Saphir", title: "Le Saphir | Modern French Restaurant in Paris", description: "Modern French cooking in Paris 7e, for dining in, collection and local delivery.", url: "/" },
  twitter: { card: "summary_large_image", title: "Le Saphir | Modern French Restaurant in Paris", description: "Modern French cooking in Paris 7e, for dining in, collection and local delivery." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
    <body><CartProvider><SiteChrome>{children}</SiteChrome></CartProvider></body>
  </html>;
}
