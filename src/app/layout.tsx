import type { Metadata } from "next";
import { Bebas_Neue, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://laboutique-bnm.com"),
  title: {
    default: "La Boutique by BNM",
    template: "%s | La Boutique by BNM",
  },
  description: "High-tech & accessoires numériques — Yaoundé, Cameroun",
  icons: {
    icon: "/logo-light.png",
    apple: "/logo-light.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${bebasNeue.variable} ${inter.variable} ${playfair.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
