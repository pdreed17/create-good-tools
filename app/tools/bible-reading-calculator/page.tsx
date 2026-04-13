import type { Metadata } from "next";
import BibleReadingCalculator from "./BibleReadingCalculator";
import ToolLayout from "@/components/ToolLayout";

export const metadata: Metadata = {
  title:
    "How Long to Read the Bible? Free Calculator + Reading Plans | Create Good",
  description:
    "Calculate how long to read the Bible with our free tool. Customize by translation (NIV, ESV, KJV, NLT), reading speed, daily schedule, and Old or New Testament.",
  alternates: {
    canonical: "https://creategoodnow.com/tools/bible-reading-calculator",
  },
  openGraph: {
    title: "Free Bible Reading Calculator — Your Personalized Reading Plan",
    description:
      "Calculate how long to read the Bible with our free tool. Customize by translation, reading speed, daily schedule, and OT/NT.",
    url: "https://creategoodnow.com/tools/bible-reading-calculator",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does it take to read the Bible?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At a comfortable reading pace of 200 words per minute, the entire Bible takes roughly 70–80 hours to read. Reading just 15 minutes per day, you can finish the whole Bible in about a year. The exact time depends on your translation — formal translations like KJV and NASB have more words than thought-for-thought translations like NIV or NLT.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to read the New Testament?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The New Testament contains approximately 180,000 words and takes roughly 15–18 hours to read at a normal pace of 200 WPM. At 15 minutes per day, you can complete the New Testament in about 3–4 months. Most people find the New Testament easier to read consecutively because it's shorter and more narrative-driven than the Old Testament.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to read the Old Testament?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Old Testament contains approximately 550,000 words and takes roughly 45–55 hours to read at 200 WPM. At 15 minutes per day, reading the entire Old Testament takes roughly 8–10 months. This is why many reading plans recommend pairing Old and New Testament passages each day.",
      },
    },
    {
      "@type": "Question",
      name: "How many chapters should I read per day to finish the Bible in a year?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To read the whole Bible in one year, plan for 3–4 chapters per day. At a reading pace of 200 WPM, that takes about 15–20 minutes daily. The exact number depends on your translation — KJV chapters tend to be longer than NIV — and whether you're reading, studying, or listening.",
      },
    },
    {
      "@type": "Question",
      name: "Is 15 minutes a day enough to read the Bible in a year?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — for most translations, 15 minutes per day at a normal reading pace (around 200 WPM) is enough to complete the whole Bible in approximately one year. Some translations with more words (like KJV or NASB) may take slightly longer at that pace.",
      },
    },
    {
      "@type": "Question",
      name: "Which Bible translation is easiest to read through?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Thought-for-thought translations like the NLT (New Living Translation), NIV (New International Version), and The Message are generally the easiest to read through quickly, as they use more natural modern English and have slightly fewer total words. Formal equivalence translations like the ESV, KJV, and NASB are excellent for study but may feel denser to read.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between reading and studying the Bible?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Reading the Bible means moving through the text at a steady pace to grasp the narrative, themes, and overall message — similar to reading a book. Studying means slowing down to examine individual passages closely, look up cross-references, and reflect deeply. Both are valuable. This calculator supports both modes: reading pace (~200 WPM) and studying pace (~100 WPM).",
      },
    },
    {
      "@type": "Question",
      name: "Can I use this calculator for an audio Bible?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Select the 'Listening' reading style, which uses approximately 150 WPM — close to the natural narration speed of most audio Bibles. If you listen at 1.25x speed, you can use around 185 WPM for a more accurate estimate.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Create Good",
      item: "https://creategoodnow.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Tools",
      item: "https://creategoodnow.com/tools",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Bible Reading Calculator",
      item: "https://creategoodnow.com/tools/bible-reading-calculator",
    },
  ],
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Bible Reading Pace Calculator",
  description:
    "Free tool to calculate how long it takes to read the Bible and build a personalized reading plan by translation, pace, and schedule.",
  url: "https://creategoodnow.com/tools/bible-reading-calculator",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function BibleReadingCalculatorPage() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <ToolLayout toolSlug="bible-reading-calculator">
        <BibleReadingCalculator />
      </ToolLayout>
    </>
  );
}
