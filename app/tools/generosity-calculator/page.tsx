import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/ToolLayout";
import { getToolBySlug } from "@/lib/toolsConfig";

export const metadata: Metadata = {
  title: "Generosity Calculator — What Would It Look Like to Give More? | Create Good",
  description:
    "Explore giving percentages, project your annual Kingdom impact, and see what a step of faith could mean. Free generosity planning tool from Create Good.",
  alternates: {
    canonical: "https://creategood.com/tools/generosity-calculator",
  },
  openGraph: {
    title: "Generosity Calculator | Create Good",
    description:
      "Explore giving percentages, project your annual Kingdom impact, and see what a step of faith could mean.",
    url: "https://creategood.com/tools/generosity-calculator",
  },
};

export default function GenerosityCalculatorPage() {
  const tool = getToolBySlug("generosity-calculator")!;
  return <ComingSoonPage tool={tool} />;
}
