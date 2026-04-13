import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ToolLayout";
import { getToolBySlug } from "@/lib/toolsConfig";

export const metadata: Metadata = {
  title: "Creative Calling Calculator — Are You Using Your Gifts? | Create Good",
  description:
    "A reflection tool for Christ-centered creatives to see where your skills, passions, and Kingdom opportunities intersect — and what to do next. Free from Create Good.",
  alternates: {
    canonical: "https://creategood.com/tools/creative-calling-calculator",
  },
  openGraph: {
    title: "Creative Calling Calculator | Create Good",
    description:
      "Discover where your skills, passions, and Kingdom opportunities intersect.",
    url: "https://creategood.com/tools/creative-calling-calculator",
  },
};

export default function CreativeCallingCalculatorPage() {
  const tool = getToolBySlug("creative-calling-calculator")!;
  return <ComingSoonPage tool={tool} />;
}
