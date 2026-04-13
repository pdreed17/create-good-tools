import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ToolLayout";
import { getToolBySlug } from "@/lib/toolsConfig";

export const metadata: Metadata = {
  title: "Sermon Series Planner — Map Out Your Preaching Calendar | Create Good",
  description:
    "Plan sermon series across a year, balance topics and books, and see your full preaching calendar at a glance. Free tool for pastors and teachers from Create Good.",
  alternates: {
    canonical: "https://creategood.com/tools/sermon-series-calculator",
  },
  openGraph: {
    title: "Sermon Series Planner | Create Good",
    description:
      "Plan sermon series across a year and see your full preaching calendar at a glance.",
    url: "https://creategood.com/tools/sermon-series-calculator",
  },
};

export default function SermonSeriesCalculatorPage() {
  const tool = getToolBySlug("sermon-series-calculator")!;
  return <ComingSoonPage tool={tool} />;
}
