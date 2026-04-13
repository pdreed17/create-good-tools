import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Free Tools for Creatives | Create Good",
  description:
    "Free interactive tools for Christ-centered creatives. Bible reading calculators, scripture memory trackers, generosity planners, and more.",
  metadataBase: new URL("https://creategoodnow.com"),
  icons: {
    icon: "/favicon.png",
  },
  verification: {
    google: "5j86jin4QcDNG4TzevJBU3qnryPovqFpMXacjfoxKpM",
  },
  openGraph: {
    siteName: "Create Good",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAFAF8]">{children}</body>
      <GoogleAnalytics gaId="G-8TNJRW1CLM" />
    </html>
  );
}
