export type ToolStatus = "live" | "coming-soon";

export interface Tool {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  status: ToolStatus;
  icon: string; // emoji or icon name
  category: string;
}

export const tools: Tool[] = [
  {
    slug: "bible-reading-calculator",
    title: "Bible Reading Pace Calculator",
    subtitle: "How long will it take to read the Bible?",
    description:
      "Find your finish date or daily reading target based on your translation, pace, and schedule. Works for whole Bible, OT, NT, or just the Gospels.",
    status: "live",
    icon: "",
    category: "Scripture",
  },
  {
    slug: "scripture-memory-calculator",
    title: "Scripture Memory Calculator",
    subtitle: "How many verses can you memorize this year?",
    description:
      "Set a memory goal and get a daily review schedule. Based on spaced repetition principles so the Word really sticks.",
    status: "live",
    icon: "",
    category: "Scripture",
  },
  {
    slug: "generosity-calculator",
    title: "Generosity Calculator",
    subtitle: "What would it look like to give more?",
    description:
      "Explore giving percentages, project your annual impact, and see what a step of faith could mean for the Kingdom.",
    status: "coming-soon",
    icon: "",
    category: "Stewardship",
  },
  {
    slug: "creative-calling-calculator",
    title: "Creative Calling Calculator",
    subtitle: "Are you using your gifts?",
    description:
      "A reflection tool to help you see where your skills, passions, and Kingdom opportunities intersect — and what to do next.",
    status: "coming-soon",
    icon: "",
    category: "Calling",
  },
  {
    slug: "sermon-series-calculator",
    title: "Sermon Series Planner",
    subtitle: "Map out your preaching calendar",
    description:
      "Plan sermon series across a year, balance topics, and see your preaching calendar at a glance.",
    status: "coming-soon",
    icon: "",
    category: "Ministry",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
