import type { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import ScriptureMemoryCalculator from "./ScriptureMemoryCalculator";

export const metadata: Metadata = {
  title: "Scripture Memory Calculator — How Long to Memorize a Bible Verse? | Create Good",
  description:
    "Calculate how long it will take to memorize any Bible verse, passage, or book. Get a daily practice schedule with spaced repetition built in. Free tool for Christians.",
  alternates: {
    canonical: "https://creategoodnow.com/tools/scripture-memory-calculator",
  },
  openGraph: {
    title: "Scripture Memory Calculator | Create Good",
    description:
      "Calculate how long it will take to memorize any Bible verse, passage, or book. Free tool for Christians.",
    url: "https://creategoodnow.com/tools/scripture-memory-calculator",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does it take to memorize a Bible verse?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A single verse of around 25 words typically takes 3–7 days of consistent practice (10 minutes/day). Shorter verses with vivid imagery can come in 2–3 days. Longer passages scale roughly linearly.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best method for memorizing scripture?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Spaced repetition is the most effective method for long-term retention — review a verse after 12 hours, 2 days, a week, then monthly. For speed, the song/music method is highly effective.",
      },
    },
    {
      "@type": "Question",
      name: "Is it better to memorize single verses or whole passages?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Whole passages, where possible. Memorizing verses in context means you understand what they mean and can retrieve them more reliably. Start with a verse, then expand outward.",
      },
    },
    {
      "@type": "Question",
      name: "How do I make memorized verses stick long-term?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Review at increasing intervals — Day 1, Day 3, Day 7, then monthly. After 7 months of spaced review, a passage tends to be truly internalized. Also: use it in prayer, journaling, and conversation.",
      },
    },
    {
      "@type": "Question",
      name: "What does the Bible say about memorizing scripture?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Psalm 119:11 says 'I have hidden your word in my heart.' Deuteronomy 6:6 says God's commands should be 'on your hearts.' Colossians 3:16 calls us to let 'the word of Christ dwell in you richly.'",
      },
    },
    {
      "@type": "Question",
      name: "How many verses can I realistically memorize in a year?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At 10 minutes/day using spaced repetition with some prior experience, you can realistically memorize 100–150 verses in a year and retain them deeply.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Tools", item: "https://creategoodnow.com/tools" },
    { "@type": "ListItem", position: 2, name: "Scripture Memory Calculator", item: "https://creategoodnow.com/tools/scripture-memory-calculator" },
  ],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Scripture Memory Calculator",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: "Calculate how long it will take to memorize any Bible verse, passage, or book. Get a daily practice schedule with spaced repetition built in.",
  url: "https://creategoodnow.com/tools/scripture-memory-calculator",
};

export default function ScriptureMemoryCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <ToolLayout toolSlug="scripture-memory-calculator">
        <ScriptureMemoryCalculator />
      </ToolLayout>
    </>
  );
}
