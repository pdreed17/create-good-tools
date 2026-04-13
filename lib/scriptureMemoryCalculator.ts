// Scripture Memory Calculator — core logic

export { TRANSLATIONS, type Translation, type TranslationKey } from "./bibleCalculator";

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
  translationKey?: string;
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
  versesPerDay: number;
  daysPerVerse: number;
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

  const deepRetentionDate = new Date(initialMemorizationDate);
  deepRetentionDate.setMonth(deepRetentionDate.getMonth() + 7);

  const totalStudyDays = initialMemorizationDays * (daysPerWeek / 7);
  const versesPerDay = verseCount / Math.max(1, totalStudyDays);
  const daysPerVerse = 1 / versesPerDay;

  const newMaterial = Math.min(minutesPerDay * 0.6, minutesPerDay);
  const recentReview = Math.min(minutesPerDay * 0.25, minutesPerDay - newMaterial);
  const longTermReview = Math.max(0, minutesPerDay - newMaterial - recentReview);

  const dailyBreakdown: DailyBreakdown = {
    newMaterial: Math.round(newMaterial),
    recentReview: Math.round(recentReview),
    longTermReview: Math.round(longTermReview),
  };

  const spacedRepetitionSchedule: SpacedRepetitionMilestone[] = [
    { label: "Day 1", description: "Review once — cement the first impression", daysFromStart: 0 },
    { label: "Day 3", description: "Review again before it fades", daysFromStart: 2 },
    { label: "Day 7", description: "Weekly review begins", daysFromStart: 6 },
    { label: "Month 2", description: "Review monthly — it's becoming yours", daysFromStart: 30 },
    { label: "Month 4+", description: "Quarterly touch — deep in the heart", daysFromStart: 90 },
    { label: "Month 7", description: "Full retention — ready when you need it most", daysFromStart: 210 },
  ];

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

// ─── Per-book word count data ─────────────────────────────────────────────────
//
// Data sources and accuracy tiers:
//
// TIER 1 — Verified per-book counts (all 66 books individually sourced):
//   NIV:  biblememorygoal.com — sums match verified totals (OT 551,742 / NT 176,251)
//   ESV:  bethyada.blogspot.com (ESV 2007 independent count) — total 757,058
//         (vs. our verified 756,846 for ESV 2016; ~200 word difference from edition update)
//   KJV:  biblebelievers.com — per-book data; note methodology gives ~788k sum
//         vs. the commonly cited 783,137. We normalize below to match verified totals.
//   NASB: davidknoppblog.com — per-book data; sums to 775,317 vs. verified 782,815.
//         Likely NASB 1995 edition. We use for book proportions only, normalized to
//         verified OT/NT totals.
//
// TIER 2 — Proportional estimates (no public per-book data exists):
//   NLT, NKJV, CSB, MSG — scaled from NIV using OT/NT ratios.
//   The UI labels these as "estimate" so users know.

export interface BibleBook {
  name: string;
  testament: "OT" | "NT";
  section: SectionKey;
  chapters: number;
  verses: number;
  // Per-translation verified word counts. Use getBookWordCount() which
  // normalizes each translation's per-book data to match verified totals.
  wordsByTranslation: {
    NIV: number;
    ESV: number;
    KJV: number;
    NASB: number;
  };
}

// Translations with verified per-book data
export type VerifiedTranslationKey = "NIV" | "ESV" | "KJV" | "NASB";

// Whether a translation has verified per-book data or uses proportional estimates
export function isVerifiedTranslation(key: string): key is VerifiedTranslationKey {
  return ["NIV", "ESV", "KJV", "NASB"].includes(key);
}

type SectionKey =
  | "the-law" | "historical" | "wisdom" | "major-prophets" | "minor-prophets"
  | "gospels" | "acts" | "pauline" | "general-epistles" | "revelation";

// Verified OT/NT totals from bibleCalculator.ts — used to normalize per-book data
const VERIFIED_TOTALS: Record<VerifiedTranslationKey, { ot: number; nt: number }> = {
  NIV:  { ot: 551742, nt: 176251 },
  ESV:  { ot: 581112, nt: 175734 },
  KJV:  { ot: 602755, nt: 180382 },
  NASB: { ot: 603804, nt: 179011 },
};

// Raw per-book sums from sources (before normalization)
const RAW_SUMS: Record<VerifiedTranslationKey, { ot: number; nt: number }> = {
  NIV:  { ot: 551742, nt: 176251 }, // exact match — no normalization needed
  ESV:  { ot: 581609, nt: 175449 }, // bethyada ESV 2007
  KJV:  { ot: 610296, nt: 178041 }, // biblebelievers.com per-book sum
  NASB: { ot: 592860, nt: 182457 }, // davidknoppblog.com per-book sum
};

/**
 * Get word count for a book in any translation.
 * For NIV/ESV/KJV/NASB: uses verified per-book data, normalized to match
 * the verified OT/NT totals from bibleCalculator.ts.
 * For NLT/NKJV/CSB/MSG: scales from NIV proportionally (estimated).
 */
export function getBookWordCount(
  book: BibleBook,
  translation: import("./bibleCalculator").Translation
): number {
  const key = translation.key as string;

  if (isVerifiedTranslation(key)) {
    const rawCount = book.wordsByTranslation[key];
    const testament = book.testament === "NT" ? "nt" : "ot";
    const rawSum = RAW_SUMS[key][testament];
    const verifiedTotal = VERIFIED_TOTALS[key][testament];
    // Normalize: scale the raw per-book count so all books in this testament
    // sum to the verified total
    return Math.round(rawCount * (verifiedTotal / rawSum));
  }

  // Proportional estimate for NLT/NKJV/CSB/MSG
  const nivCount = book.wordsByTranslation.NIV;
  const testament = book.testament === "NT" ? "nt" : "ot";
  const nivTotal = VERIFIED_TOTALS.NIV[testament];
  const transTotal = testament === "nt" ? translation.words.nt : translation.words.ot;
  return Math.round(nivCount * (transTotal / nivTotal));
}

export const BIBLE_BOOKS: BibleBook[] = [
  // ── OT: The Law ──
  // NIV source: biblememorygoal.com | ESV: bethyada | KJV: biblebelievers | NASB: davidknoppblog
  { name: "Genesis",        testament: "OT", section: "the-law",        chapters: 50,  verses: 1533, wordsByTranslation: { NIV: 38290, ESV: 36321, KJV: 38262, NASB: 37357 } },
  { name: "Exodus",         testament: "OT", section: "the-law",        chapters: 40,  verses: 1213, wordsByTranslation: { NIV: 32688, ESV: 30881, KJV: 32685, NASB: 31848 } },
  { name: "Leviticus",      testament: "OT", section: "the-law",        chapters: 27,  verses: 859,  wordsByTranslation: { NIV: 24541, ESV: 23431, KJV: 24541, NASB: 24227 } },
  { name: "Numbers",        testament: "OT", section: "the-law",        chapters: 36,  verses: 1288, wordsByTranslation: { NIV: 32902, ESV: 30950, KJV: 32896, NASB: 31452 } },
  { name: "Deuteronomy",    testament: "OT", section: "the-law",        chapters: 34,  verses: 959,  wordsByTranslation: { NIV: 28461, ESV: 27528, KJV: 28352, NASB: 27637 } },
  // ── OT: Historical ──
  { name: "Joshua",         testament: "OT", section: "historical",     chapters: 24,  verses: 658,  wordsByTranslation: { NIV: 18854, ESV: 17935, KJV: 18854, NASB: 18503 } },
  { name: "Judges",         testament: "OT", section: "historical",     chapters: 21,  verses: 618,  wordsByTranslation: { NIV: 18976, ESV: 18281, KJV: 18966, NASB: 18320 } },
  { name: "Ruth",           testament: "OT", section: "historical",     chapters: 4,   verses: 85,   wordsByTranslation: { NIV: 2578,  ESV: 2425,  KJV: 2574,  NASB: 2478  } },
  { name: "1 Samuel",       testament: "OT", section: "historical",     chapters: 31,  verses: 810,  wordsByTranslation: { NIV: 25061, ESV: 24118, KJV: 25048, NASB: 24361 } },
  { name: "2 Samuel",       testament: "OT", section: "historical",     chapters: 24,  verses: 695,  wordsByTranslation: { NIV: 20612, ESV: 19734, KJV: 20600, NASB: 20087 } },
  { name: "1 Kings",        testament: "OT", section: "historical",     chapters: 22,  verses: 816,  wordsByTranslation: { NIV: 24524, ESV: 23415, KJV: 24513, NASB: 23638 } },
  { name: "2 Kings",        testament: "OT", section: "historical",     chapters: 25,  verses: 719,  wordsByTranslation: { NIV: 23532, ESV: 22760, KJV: 23517, NASB: 22740 } },
  { name: "1 Chronicles",   testament: "OT", section: "historical",     chapters: 29,  verses: 942,  wordsByTranslation: { NIV: 20366, ESV: 18522, KJV: 20365, NASB: 19524 } },
  { name: "2 Chronicles",   testament: "OT", section: "historical",     chapters: 36,  verses: 822,  wordsByTranslation: { NIV: 26074, ESV: 24779, KJV: 26069, NASB: 24701 } },
  { name: "Ezra",           testament: "OT", section: "historical",     chapters: 10,  verses: 280,  wordsByTranslation: { NIV: 7441,  ESV: 6889,  KJV: 7440,  NASB: 6799  } },
  { name: "Nehemiah",       testament: "OT", section: "historical",     chapters: 13,  verses: 406,  wordsByTranslation: { NIV: 10483, ESV: 9842,  KJV: 10480, NASB: 9871  } },
  { name: "Esther",         testament: "OT", section: "historical",     chapters: 10,  verses: 167,  wordsByTranslation: { NIV: 5637,  ESV: 5478,  KJV: 5633,  NASB: 5457  } },
  // ── OT: Wisdom ──
  { name: "Job",            testament: "OT", section: "wisdom",         chapters: 42,  verses: 1070, wordsByTranslation: { NIV: 18097, ESV: 17603, KJV: 18098, NASB: 17302 } },
  { name: "Psalms",         testament: "OT", section: "wisdom",         chapters: 150, verses: 2461, wordsByTranslation: { NIV: 41032, ESV: 42284, KJV: 42704, NASB: 43179 } },
  { name: "Proverbs",       testament: "OT", section: "wisdom",         chapters: 31,  verses: 915,  wordsByTranslation: { NIV: 14148, ESV: 14530, KJV: 15038, NASB: 14847 } },
  { name: "Ecclesiastes",   testament: "OT", section: "wisdom",         chapters: 12,  verses: 222,  wordsByTranslation: { NIV: 5024,  ESV: 5333,  KJV: 5579,  NASB: 5458  } },
  { name: "Song of Solomon",testament: "OT", section: "wisdom",         chapters: 8,   verses: 117,  wordsByTranslation: { NIV: 2542,  ESV: 2533,  KJV: 2658,  NASB: 2714  } },
  // ── OT: Major Prophets ──
  { name: "Isaiah",         testament: "OT", section: "major-prophets", chapters: 66,  verses: 1292, wordsByTranslation: { NIV: 34420, ESV: 35244, KJV: 37036, NASB: 36111 } },
  { name: "Jeremiah",       testament: "OT", section: "major-prophets", chapters: 52,  verses: 1364, wordsByTranslation: { NIV: 38522, ESV: 40432, KJV: 42654, NASB: 42130 } },
  { name: "Lamentations",   testament: "OT", section: "major-prophets", chapters: 5,   verses: 154,  wordsByTranslation: { NIV: 3178,  ESV: 3251,  KJV: 3411,  NASB: 3362  } },
  { name: "Ezekiel",        testament: "OT", section: "major-prophets", chapters: 48,  verses: 1273, wordsByTranslation: { NIV: 36080, ESV: 37184, KJV: 39401, NASB: 37666 } },
  { name: "Daniel",         testament: "OT", section: "major-prophets", chapters: 12,  verses: 357,  wordsByTranslation: { NIV: 10538, ESV: 11224, KJV: 11602, NASB: 11735 } },
  // ── OT: Minor Prophets ──
  { name: "Hosea",          testament: "OT", section: "minor-prophets", chapters: 14,  verses: 197,  wordsByTranslation: { NIV: 4844,  ESV: 4964,  KJV: 5174,  NASB: 5075  } },
  { name: "Joel",           testament: "OT", section: "minor-prophets", chapters: 3,   verses: 73,   wordsByTranslation: { NIV: 1840,  ESV: 1895,  KJV: 2033,  NASB: 1941  } },
  { name: "Amos",           testament: "OT", section: "minor-prophets", chapters: 9,   verses: 146,  wordsByTranslation: { NIV: 3801,  ESV: 4047,  KJV: 4216,  NASB: 4110  } },
  { name: "Obadiah",        testament: "OT", section: "minor-prophets", chapters: 1,   verses: 21,   wordsByTranslation: { NIV: 575,   ESV: 604,   KJV: 669,   NASB: 627   } },
  { name: "Jonah",          testament: "OT", section: "minor-prophets", chapters: 4,   verses: 48,   wordsByTranslation: { NIV: 1201,  ESV: 1298,  KJV: 1320,  NASB: 1280  } },
  { name: "Micah",          testament: "OT", section: "minor-prophets", chapters: 7,   verses: 105,  wordsByTranslation: { NIV: 2826,  ESV: 3000,  KJV: 3152,  NASB: 3020  } },
  { name: "Nahum",          testament: "OT", section: "minor-prophets", chapters: 3,   verses: 47,   wordsByTranslation: { NIV: 1112,  ESV: 1111,  KJV: 1284,  NASB: 1185  } },
  { name: "Habakkuk",       testament: "OT", section: "minor-prophets", chapters: 3,   verses: 56,   wordsByTranslation: { NIV: 1320,  ESV: 1356,  KJV: 1475,  NASB: 1410  } },
  { name: "Zephaniah",      testament: "OT", section: "minor-prophets", chapters: 3,   verses: 53,   wordsByTranslation: { NIV: 1496,  ESV: 1556,  KJV: 1616,  NASB: 1569  } },
  { name: "Haggai",         testament: "OT", section: "minor-prophets", chapters: 2,   verses: 38,   wordsByTranslation: { NIV: 1032,  ESV: 1083,  KJV: 1130,  NASB: 1077  } },
  { name: "Zechariah",      testament: "OT", section: "minor-prophets", chapters: 14,  verses: 211,  wordsByTranslation: { NIV: 5601,  ESV: 6050,  KJV: 6443,  NASB: 6260  } },
  { name: "Malachi",        testament: "OT", section: "minor-prophets", chapters: 4,   verses: 55,   wordsByTranslation: { NIV: 1672,  ESV: 1738,  KJV: 1781,  NASB: 1802  } },
  // ── NT: Gospels ──
  { name: "Matthew",        testament: "NT", section: "gospels",        chapters: 28,  verses: 1071, wordsByTranslation: { NIV: 22625, ESV: 22640, KJV: 23343, NASB: 23519 } },
  { name: "Mark",           testament: "NT", section: "gospels",        chapters: 16,  verses: 678,  wordsByTranslation: { NIV: 13852, ESV: 14344, KJV: 14949, NASB: 14831 } },
  { name: "Luke",           testament: "NT", section: "gospels",        chapters: 24,  verses: 1151, wordsByTranslation: { NIV: 24214, ESV: 24605, KJV: 25640, NASB: 25774 } },
  { name: "John",           testament: "NT", section: "gospels",        chapters: 21,  verses: 879,  wordsByTranslation: { NIV: 18616, ESV: 18882, KJV: 18658, NASB: 19512 } },
  // ── NT: Acts ──
  { name: "Acts",           testament: "NT", section: "acts",           chapters: 28,  verses: 1007, wordsByTranslation: { NIV: 23131, ESV: 23464, KJV: 24229, NASB: 24493 } },
  // ── NT: Pauline Epistles ──
  { name: "Romans",         testament: "NT", section: "pauline",        chapters: 16,  verses: 433,  wordsByTranslation: { NIV: 9886,  ESV: 9467,  KJV: 9422,  NASB: 9729  } },
  { name: "1 Corinthians",  testament: "NT", section: "pauline",        chapters: 16,  verses: 437,  wordsByTranslation: { NIV: 9721,  ESV: 9268,  KJV: 9462,  NASB: 9648  } },
  { name: "2 Corinthians",  testament: "NT", section: "pauline",        chapters: 13,  verses: 257,  wordsByTranslation: { NIV: 6247,  ESV: 6050,  KJV: 6046,  NASB: 6234  } },
  { name: "Galatians",      testament: "NT", section: "pauline",        chapters: 6,   verses: 149,  wordsByTranslation: { NIV: 3243,  ESV: 3102,  KJV: 3084,  NASB: 3220  } },
  { name: "Ephesians",      testament: "NT", section: "pauline",        chapters: 6,   verses: 155,  wordsByTranslation: { NIV: 3077,  ESV: 3010,  KJV: 3022,  NASB: 3171  } },
  { name: "Philippians",    testament: "NT", section: "pauline",        chapters: 4,   verses: 104,  wordsByTranslation: { NIV: 2294,  ESV: 2144,  KJV: 2183,  NASB: 2277  } },
  { name: "Colossians",     testament: "NT", section: "pauline",        chapters: 4,   verses: 95,   wordsByTranslation: { NIV: 2069,  ESV: 1934,  KJV: 1979,  NASB: 2126  } },
  { name: "1 Thessalonians",testament: "NT", section: "pauline",        chapters: 5,   verses: 89,   wordsByTranslation: { NIV: 1944,  ESV: 1841,  KJV: 1837,  NASB: 1922  } },
  { name: "2 Thessalonians",testament: "NT", section: "pauline",        chapters: 3,   verses: 47,   wordsByTranslation: { NIV: 1109,  ESV: 1065,  KJV: 1022,  NASB: 1106  } },
  { name: "1 Timothy",      testament: "NT", section: "pauline",        chapters: 6,   verses: 113,  wordsByTranslation: { NIV: 2432,  ESV: 2315,  KJV: 2244,  NASB: 2458  } },
  { name: "2 Timothy",      testament: "NT", section: "pauline",        chapters: 4,   verses: 83,   wordsByTranslation: { NIV: 1723,  ESV: 1631,  KJV: 1666,  NASB: 1667  } },
  { name: "Titus",          testament: "NT", section: "pauline",        chapters: 3,   verses: 46,   wordsByTranslation: { NIV: 994,   ESV: 926,   KJV: 896,   NASB: 907   } },
  { name: "Philemon",       testament: "NT", section: "pauline",        chapters: 1,   verses: 25,   wordsByTranslation: { NIV: 480,   ESV: 457,   KJV: 430,   NASB: 473   } },
  // ── NT: General Epistles ──
  { name: "Hebrews",        testament: "NT", section: "general-epistles", chapters: 13, verses: 303, wordsByTranslation: { NIV: 7051,  ESV: 6903,  KJV: 6897,  NASB: 7074  } },
  { name: "James",          testament: "NT", section: "general-epistles", chapters: 5,  verses: 108, wordsByTranslation: { NIV: 2316,  ESV: 2317,  KJV: 2304,  NASB: 2408  } },
  { name: "1 Peter",        testament: "NT", section: "general-epistles", chapters: 5,  verses: 105, wordsByTranslation: { NIV: 2495,  ESV: 2389,  KJV: 2476,  NASB: 2544  } },
  { name: "2 Peter",        testament: "NT", section: "general-epistles", chapters: 3,  verses: 61,  wordsByTranslation: { NIV: 1552,  ESV: 1550,  KJV: 1553,  NASB: 1559  } },
  { name: "1 John",         testament: "NT", section: "general-epistles", chapters: 5,  verses: 105, wordsByTranslation: { NIV: 2525,  ESV: 2490,  KJV: 2517,  NASB: 2553  } },
  { name: "2 John",         testament: "NT", section: "general-epistles", chapters: 1,  verses: 13,  wordsByTranslation: { NIV: 302,   ESV: 298,   KJV: 298,   NASB: 316   } },
  { name: "3 John",         testament: "NT", section: "general-epistles", chapters: 1,  verses: 15,  wordsByTranslation: { NIV: 323,   ESV: 303,   KJV: 294,   NASB: 319   } },
  { name: "Jude",           testament: "NT", section: "general-epistles", chapters: 1,  verses: 25,  wordsByTranslation: { NIV: 624,   ESV: 604,   KJV: 608,   NASB: 640   } },
  // ── NT: Revelation ──
  { name: "Revelation",     testament: "NT", section: "revelation",     chapters: 22,  verses: 404,  wordsByTranslation: { NIV: 11406, ESV: 11450, KJV: 11952, NASB: 11977 } },
];

// Popular memory passages — word counts are NIV
export interface MemoryPassage {
  reference: string;
  words: number;
  verses: number;
  theme: string;
}

export const POPULAR_PASSAGES: MemoryPassage[] = [
  { reference: "John 3:16",        words: 25,  verses: 1,  theme: "The gospel in a sentence" },
  { reference: "Psalm 23",         words: 118, verses: 6,  theme: "God as Shepherd" },
  { reference: "Romans 8:28",      words: 30,  verses: 1,  theme: "All things for good" },
  { reference: "Philippians 4:6-7",words: 60,  verses: 2,  theme: "Peace over anxiety" },
  { reference: "John 1:1-14",      words: 224, verses: 14, theme: "The Word made flesh" },
  { reference: "Romans 12:1-2",    words: 65,  verses: 2,  theme: "Living sacrifice" },
  { reference: "Ephesians 2:8-9",  words: 37,  verses: 2,  theme: "Saved by grace" },
  { reference: "Isaiah 40:31",     words: 29,  verses: 1,  theme: "Renewed strength" },
  { reference: "Proverbs 3:5-6",   words: 30,  verses: 2,  theme: "Trust in the Lord" },
  { reference: "Matthew 6:9-13",   words: 66,  verses: 5,  theme: "The Lord's Prayer" },
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
