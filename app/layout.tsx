import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
    </html>
  );
}
