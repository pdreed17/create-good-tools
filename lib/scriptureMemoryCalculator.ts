// Scripture Memory Calculator — core logic

export type MemorizationMethod =
  | "daily-repetition"
  | "spaced-repetition"
  | "active-recall"
  | "song-music"
  | "memory-palace";

export type ExperienceLevel = "beginner" | "some" | "experienced";

export type ScopeType = "passage" | "book" | "custom";

// Method multipliers (>1 = slower, <1 = faster than baseline)
export const METHOD_MULTIPLIERS: Record<MemorizationMethod, number> = {
  "daily-repetition": 1.0,
  "spaced-repetition": 0.65,
  "active-recall": 0.75,
  "song-music": 0.5,
  "memory-palace": 0.6,
};

export const METHOD_LABELS: Record<MemorizationMethod, string> = {
  "daily-repetition": "Daily repetition",
  "spaced-repetition": "Spaced repetition",
  "active-recall": "Active recall / typing",
  "song-music": "Song / music method",
  "memory-palace": "Memory palace",
};

export const METHOD_DESCRIPTIONS: Record<MemorizationMethod, string> = {
  "daily-repetition": "Say it aloud once per day — simple, steady baseline",
  "spaced-repetition": "Review at increasing intervals (12 hrs → 2d → 1 wk → 1 mo)",
  "active-recall": "Write or type it from memory, self-correct immediately",
  "song-music": "Set the passage to a tune — fastest initial acquisition",
  "memory-palace": "Place each phrase in a familiar mental location",
};

export const EXPERIENCE_MULTIPLIERS: Record<ExperienceLevel, number> = {
  beginner: 1.4,
  some: 1.0,
  experienced: 0.75,
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  some: "Some experience",
  experienced: "Experienced",
};

export const EXPERIENCE_DESCRIPTIONS: Record<ExperienceLevel, string> = {
  beginner: "Never memorized scripture systematically",
  some: "Memorized verses here and there",
  experienced: "Active memorizer — 50+ verses",
};

// Base rate: 5 verses per week at 10 min/day with daily repetition
const BASE_VERSES_PER_WEEK = 5;
const BASE_MINUTES_PER_DAY = 10;
const BASE_DAYS_PER_WEEK = 7;

export interface MemoryCalcInput {
  verseCount: number;
  wordCount: number;
  minutesPerDay: number;
  daysPerWeek: number;
  method: MemorizationMethod;
  experience: ExperienceLevel;
}

export interface DailyBreakdown {
  newMaterial: number;
  recentReview: number;
  longTermReview: number;
}

export interface SpacedRepetitionMilestone {
  label: string;
  description: string;
  daysFromStart: number;
}

export interface MemoryCalcResult {
  initialMemorizationWeeks: number;
  initialMemorizationDays: number;
  initialMemorizationDate: Date;
  deepRetentionDate: Date;
  versesPerDay: number; // new verses per day (may be fractional)
  daysPerVerse: number; // days per new verse (when < 1 verse/day)
  dailyBreakdown: DailyBreakdown;
  spacedRepetitionSchedule: SpacedRepetitionMilestone[];
  encouragementText: string;
}

export function calcMemorization(input: MemoryCalcInput): MemoryCalcResult {
  const { verseCount, minutesPerDay, daysPerWeek, method, experience } = input;

  const methodMultiplier = METHOD_MULTIPLIERS[method];
  const experienceMultiplier = EXPERIENCE_MULTIPLIERS[experience];
  const minutesMultiplier = BASE_MINUTES_PER_DAY / Math.max(1, minutesPerDay);
  const daysMultiplier = BASE_DAYS_PER_WEEK / Math.max(1, daysPerWeek);

  const rawWeeks =
    (verseCount / BASE_VERSES_PER_WEEK) *
    methodMultiplier *
    experienceMultiplier *
    minutesMultiplier *
    daysMultiplier;

  const initialMemorizationWeeks = Math.max(0.5, rawWeeks);
  const initialMemorizationDays = Math.round(initialMemorizationWeeks * 7);

  const today = new Date();
  const initialMemorizationDate = new Date(today);
  initialMemorizationDate.setDate(today.getDate() + initialMemorizationDays);

  // Deep retention = initial + 7 months of spaced review
  const deepRetentionDate = new Date(initialMemorizationDate);
  deepRetentionDate.setMonth(deepRetentionDate.getMonth() + 7);

  // Verses per day (based on active study days)
  const totalStudyDays = initialMemorizationDays * (daysPerWeek / 7);
  const versesPerDay = verseCount / Math.max(1, totalStudyDays);
  const daysPerVerse = 1 / versesPerDay;

  // Daily time breakdown
  const newMaterial = Math.min(minutesPerDay * 0.6, minutesPerDay);
  const recentReview = Math.min(minutesPerDay * 0.25, minutesPerDay - newMaterial);
  const longTermReview = Math.max(0, minutesPerDay - newMaterial - recentReview);

  const dailyBreakdown: DailyBreakdown = {
    newMaterial: Math.round(newMaterial),
    recentReview: Math.round(recentReview),
    longTermReview: Math.round(longTermReview),
  };

  // Spaced repetition schedule (after initial memorization)
  const spacedRepetitionSchedule: SpacedRepetitionMilestone[] = [
    {
      label: "Day 1",
      description: "Review once — cement the first impression",
      daysFromStart: 0,
    },
    {
      label: "Day 3",
      description: "Review again before it fades",
      daysFromStart: 2,
    },
    {
      label: "Day 7",
      description: "Weekly review begins",
      daysFromStart: 6,
    },
    {
      label: "Month 2",
      description: "Review monthly — it's becoming yours",
      daysFromStart: 30,
    },
    {
      label: "Month 4+",
      description: "Quarterly touch — deep in the heart",
      daysFromStart: 90,
    },
    {
      label: "Month 7",
      description: "Full retention — ready when you need it most",
      daysFromStart: 210,
    },
  ];

  // Encouragement text
  let encouragementText = "";
  if (verseCount === 1) {
    encouragementText = `One verse, memorized deeply, can change a moment. At ${minutesPerDay} min/day you'll have it in ${initialMemorizationDays <= 7 ? "under a week" : `about ${Math.round(initialMemorizationWeeks)} weeks`}.`;
  } else if (verseCount <= 5) {
    encouragementText = `A handful of verses memorized well is worth more than a hundred half-remembered. At ${minutesPerDay} min/day, you'll have these ready in ${Math.round(initialMemorizationWeeks)} week${Math.round(initialMemorizationWeeks) === 1 ? "" : "s"}.`;
  } else if (verseCount <= 15) {
    encouragementText = `This is a passage worth knowing by heart. At ${minutesPerDay} min/day, you'll have it memorized in about ${Math.round(initialMemorizationWeeks)} weeks.`;
  } else {
    encouragementText = `This is an ambitious and beautiful goal. At ${minutesPerDay} min/day, steady practice will get you there in ${Math.round(initialMemorizationWeeks)} weeks.`;
  }

  return {
    initialMemorizationWeeks,
    initialMemorizationDays,
    initialMemorizationDate,
    deepRetentionDate,
    versesPerDay,
    daysPerVerse,
    dailyBreakdown,
    spacedRepetitionSchedule,
    encouragementText,
  };
}

export interface RealisticGoalInput {
  timeframeWeeks: number;
  minutesPerDay: number;
  daysPerWeek: number;
  method: MemorizationMethod;
  experience: ExperienceLevel;
}

export interface RealisticGoalResult {
  versesAchievable: number;
  suggestedScope: string;
  wordsAchievable: number;
  versesPerWeek: number;
}

export function calcRealisticGoal(input: RealisticGoalInput): RealisticGoalResult {
  const { timeframeWeeks, minutesPerDay, daysPerWeek, method, experience } = input;

  const methodMultiplier = METHOD_MULTIPLIERS[method];
  const experienceMultiplier = EXPERIENCE_MULTIPLIERS[experience];
  const minutesMultiplier = minutesPerDay / BASE_MINUTES_PER_DAY;
  const daysMultiplier = daysPerWeek / BASE_DAYS_PER_WEEK;

  const versesPerWeek =
    (BASE_VERSES_PER_WEEK / methodMultiplier / experienceMultiplier) *
    minutesMultiplier *
    daysMultiplier;

  const versesAchievable = Math.floor(versesPerWeek * timeframeWeeks);
  // rough average NIV verse ~25 words
  const wordsAchievable = versesAchievable * 25;

  let suggestedScope = "";
  if (versesAchievable <= 5) {
    suggestedScope = "A short passage like Philippians 4:6-7 or John 3:16";
  } else if (versesAchievable <= 15) {
    suggestedScope = "A key passage like Psalm 23 or Romans 8:28-39";
  } else if (versesAchievable <= 30) {
    suggestedScope = "A short epistle like Philippians or Colossians";
  } else if (versesAchievable <= 100) {
    suggestedScope = "A full chapter or short NT book like Titus or Philemon";
  } else if (versesAchievable <= 250) {
    suggestedScope = "A medium epistle like Romans or 1 Peter";
  } else {
    suggestedScope = "Multiple books or a large portion of the NT";
  }

  return {
    versesAchievable,
    suggestedScope,
    wordsAchievable,
    versesPerWeek: Math.round(versesPerWeek * 10) / 10,
  };
}

// All 66 books with verse counts and approximate NIV word counts
export interface BibleBook {
  name: string;
  testament: "OT" | "NT";
  chapters: number;
  verses: number;
  words: number; // NIV approximate
}

export const BIBLE_BOOKS: BibleBook[] = [
  // OT
  { name: "Genesis", testament: "OT", chapters: 50, verses: 1533, words: 38290 },
  { name: "Exodus", testament: "OT", chapters: 40, verses: 1213, words: 32688 },
  { name: "Leviticus", testament: "OT", chapters: 27, verses: 859, words: 24541 },
  { name: "Numbers", testament: "OT", chapters: 36, verses: 1288, words: 32902 },
  { name: "Deuteronomy", testament: "OT", chapters: 34, verses: 959, words: 28461 },
  { name: "Joshua", testament: "OT", chapters: 24, verses: 658, words: 18854 },
  { name: "Judges", testament: "OT", chapters: 21, verses: 618, words: 18976 },
  { name: "Ruth", testament: "OT", chapters: 4, verses: 85, words: 2578 },
  { name: "1 Samuel", testament: "OT", chapters: 31, verses: 810, words: 25061 },
  { name: "2 Samuel", testament: "OT", chapters: 24, verses: 695, words: 20612 },
  { name: "1 Kings", testament: "OT", chapters: 22, verses: 816, words: 24524 },
  { name: "2 Kings", testament: "OT", chapters: 25, verses: 719, words: 23532 },
  { name: "1 Chronicles", testament: "OT", chapters: 29, verses: 942, words: 20366 },
  { name: "2 Chronicles", testament: "OT", chapters: 36, verses: 822, words: 26074 },
  { name: "Ezra", testament: "OT", chapters: 10, verses: 280, words: 7441 },
  { name: "Nehemiah", testament: "OT", chapters: 13, verses: 406, words: 10483 },
  { name: "Esther", testament: "OT", chapters: 10, verses: 167, words: 5637 },
  { name: "Job", testament: "OT", chapters: 42, verses: 1070, words: 18097 },
  { name: "Psalms", testament: "OT", chapters: 150, verses: 2461, words: 42706 },
  { name: "Proverbs", testament: "OT", chapters: 31, verses: 915, words: 15043 },
  { name: "Ecclesiastes", testament: "OT", chapters: 12, verses: 222, words: 5584 },
  { name: "Song of Solomon", testament: "OT", chapters: 8, verses: 117, words: 2661 },
  { name: "Isaiah", testament: "OT", chapters: 66, verses: 1292, words: 37044 },
  { name: "Jeremiah", testament: "OT", chapters: 52, verses: 1364, words: 42654 },
  { name: "Lamentations", testament: "OT", chapters: 5, verses: 154, words: 3415 },
  { name: "Ezekiel", testament: "OT", chapters: 48, verses: 1273, words: 39401 },
  { name: "Daniel", testament: "OT", chapters: 12, verses: 357, words: 11606 },
  { name: "Hosea", testament: "OT", chapters: 14, verses: 197, words: 5175 },
  { name: "Joel", testament: "OT", chapters: 3, verses: 73, words: 2034 },
  { name: "Amos", testament: "OT", chapters: 9, verses: 146, words: 4217 },
  { name: "Obadiah", testament: "OT", chapters: 1, verses: 21, words: 440 },
  { name: "Jonah", testament: "OT", chapters: 4, verses: 48, words: 1321 },
  { name: "Micah", testament: "OT", chapters: 7, verses: 105, words: 3153 },
  { name: "Nahum", testament: "OT", chapters: 3, verses: 47, words: 1285 },
  { name: "Habakkuk", testament: "OT", chapters: 3, verses: 56, words: 1476 },
  { name: "Zephaniah", testament: "OT", chapters: 3, verses: 53, words: 1617 },
  { name: "Haggai", testament: "OT", chapters: 2, verses: 38, words: 1131 },
  { name: "Zechariah", testament: "OT", chapters: 14, verses: 211, words: 6444 },
  { name: "Malachi", testament: "OT", chapters: 4, verses: 55, words: 1782 },
  // NT
  { name: "Matthew", testament: "NT", chapters: 28, verses: 1071, words: 18300 },
  { name: "Mark", testament: "NT", chapters: 16, verses: 678, words: 11304 },
  { name: "Luke", testament: "NT", chapters: 24, verses: 1151, words: 19482 },
  { name: "John", testament: "NT", chapters: 21, verses: 879, words: 15600 },
  { name: "Acts", testament: "NT", chapters: 28, verses: 1007, words: 18600 },
  { name: "Romans", testament: "NT", chapters: 16, verses: 433, words: 7100 },
  { name: "1 Corinthians", testament: "NT", chapters: 16, verses: 437, words: 6830 },
  { name: "2 Corinthians", testament: "NT", chapters: 13, verses: 257, words: 4477 },
  { name: "Galatians", testament: "NT", chapters: 6, verses: 149, words: 2230 },
  { name: "Ephesians", testament: "NT", chapters: 6, verses: 155, words: 2422 },
  { name: "Philippians", testament: "NT", chapters: 4, verses: 104, words: 1629 },
  { name: "Colossians", testament: "NT", chapters: 4, verses: 95, words: 1582 },
  { name: "1 Thessalonians", testament: "NT", chapters: 5, verses: 89, words: 1481 },
  { name: "2 Thessalonians", testament: "NT", chapters: 3, verses: 47, words: 823 },
  { name: "1 Timothy", testament: "NT", chapters: 6, verses: 113, words: 1591 },
  { name: "2 Timothy", testament: "NT", chapters: 4, verses: 83, words: 1238 },
  { name: "Titus", testament: "NT", chapters: 3, verses: 46, words: 897 },
  { name: "Philemon", testament: "NT", chapters: 1, verses: 25, words: 430 },
  { name: "Hebrews", testament: "NT", chapters: 13, verses: 303, words: 4953 },
  { name: "James", testament: "NT", chapters: 5, verses: 108, words: 1742 },
  { name: "1 Peter", testament: "NT", chapters: 5, verses: 105, words: 1684 },
  { name: "2 Peter", testament: "NT", chapters: 3, verses: 61, words: 1099 },
  { name: "1 John", testament: "NT", chapters: 5, verses: 105, words: 2523 },
  { name: "2 John", testament: "NT", chapters: 1, verses: 13, words: 299 },
  { name: "3 John", testament: "NT", chapters: 1, verses: 15, words: 294 },
  { name: "Jude", testament: "NT", chapters: 1, verses: 25, words: 613 },
  { name: "Revelation", testament: "NT", chapters: 22, verses: 404, words: 9852 },
];

// Popular memory passages
export interface MemoryPassage {
  reference: string;
  words: number;
  verses: number;
  theme: string;
}

export const POPULAR_PASSAGES: MemoryPassage[] = [
  { reference: "John 3:16", words: 25, verses: 1, theme: "The gospel in a sentence" },
  { reference: "Psalm 23", words: 118, verses: 6, theme: "God as Shepherd" },
  { reference: "Romans 8:28", words: 30, verses: 1, theme: "All things for good" },
  { reference: "Philippians 4:6-7", words: 60, verses: 2, theme: "Peace over anxiety" },
  { reference: "John 1:1-14", words: 224, verses: 14, theme: "The Word made flesh" },
  { reference: "Romans 12:1-2", words: 65, verses: 2, theme: "Living sacrifice" },
  { reference: "Ephesians 2:8-9", words: 37, verses: 2, theme: "Saved by grace" },
  { reference: "Isaiah 40:31", words: 29, verses: 1, theme: "Renewed strength" },
  { reference: "Proverbs 3:5-6", words: 30, verses: 2, theme: "Trust in the Lord" },
  { reference: "Matthew 6:9-13", words: 66, verses: 5, theme: "The Lord's Prayer" },
];

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatWeeks(weeks: number): string {
  if (weeks < 1) return "less than a week";
  const rounded = Math.round(weeks);
  if (rounded === 1) return "1 week";
  if (rounded < 8) return `${rounded} weeks`;
  const months = Math.round(weeks / 4.33);
  if (months === 1) return "about 1 month";
  return `about ${months} months`;
}
