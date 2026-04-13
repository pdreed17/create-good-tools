import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ToolLayout";
import { getToolBySlug } from "@/lib/toolsConfig";

export const metadata: Metadata = {
  title: "Scripture Memory Calculator — How Many Verses Can You Memorize? | Create Good",
  description:
    "Set a scripture memory goal and get a realistic daily review schedule. Based on spaced repetition principles so God's Word really sticks. Free tool from Create Good.",
  alternates: {
    canonical: "https://creategoodnow.com/tools/scripture-memory-calculator",
  },
  openGraph: {
    title: "Scripture Memory Calculator | Create Good",
    description:
      "Set a scripture memory goal and get a realistic daily review schedule.",
    url: "https://creategoodnow.com/tools/scripture-memory-calculator",
  },
};

export default function ScriptureMemoryCalculatorPage() {
  const tool = getToolBySlug("scripture-memory-calculator")!;
  return <ComingSoonPage tool={tool} />;
}
