// ─── Translation word counts ────────────────────────────────────────────────

export type TranslationKey =
  | "NIV"
  | "ESV"
  | "NLT"
  | "CSB"
  | "KJV"
  | "NKJV"
  | "NASB"
  | "MSG";

export interface Translation {
  key: TranslationKey;
  label: string;
  fullName: string;
  words: {
    whole: number;
    ot: number;
    nt: number;
  };
}

export const TRANSLATIONS: Translation[] = [
  {
    key: "NIV",
    label: "NIV",
    fullName: "New International Version",
    words: { whole: 727993, ot: 551742, nt: 176251 },
  },
  {
    key: "ESV",
    label: "ESV",
    fullName: "English Standard Version",
    words: { whole: 756846, ot: 581112, nt: 175734 },
  },
  {
    key: "NLT",
    label: "NLT",
    fullName: "New Living Translation",
    words: { whole: 735000, ot: 560000, nt: 175000 },
  },
  {
    key: "CSB",
    label: "CSB",
    fullName: "Christian Standard Bible",
    words: { whole: 750000, ot: 575000, nt: 175000 },
  },
  {
    key: "KJV",
    label: "KJV",
    fullName: "King James Version",
    words: { whole: 783137, ot: 602755, nt: 180382 },
  },
  {
    key: "NKJV",
    label: "NKJV",
    fullName: "New King James Version",
    words: { whole: 770430, ot: 592000, nt: 178000 },
  },
  {
    key: "NASB",
    label: "NASB",
    fullName: "New American Standard",
    words: { whole: 782815, ot: 603804, nt: 179011 },
  },
  {
    key: "MSG",
    label: "MSG",
    fullName: "The Message",
    words: { whole: 550000, ot: 420000, nt: 130000 },
  },
];

// ─── Reading styles ──────────────────────────────────────────────────────────

export type ReadingStyle = "reading" | "studying" | "listening";

export interface ReadingStyleConfig {
  key: ReadingStyle;
  label: string;
  wpm: number;
  description: string;
}

export const READING_STYLES: ReadingStyleConfig[] = [
  {
    key: "reading",
    label: "Reading",
    wpm: 200,
    description: "200 WPM",
  },
  {
    key: "studying",
    label: "Studying",
    wpm: 100,
    description: "100 WPM — stopping to reflect",
  },
  {
    key: "listening",
    label: "Listening",
    wpm: 150,
    description: "150 WPM — audio Bible",
  },
];

// ─── Scope ───────────────────────────────────────────────────────────────────

export type ScopeKey =
  | "whole"
  | "ot"
  | "nt"
  // OT sections
  | "the-law"
  | "historical"
  | "wisdom"
  | "major-prophets"
  | "minor-prophets"
  // NT sections
  | "gospels"
  | "acts"
  | "pauline"
  | "general-epistles"
  | "revelation";

export interface Scope {
  key: ScopeKey;
  label: string;
  chapters: number;
  books: string;
  /** NIV word count — used as ratio base for other translations */
  nivWords: number;
  testament: "ot" | "nt" | "both";
}

export const SCOPES: Scope[] = [
  {
    key: "whole",
    label: "Whole Bible",
    chapters: 1189,
    books: "Genesis – Revelation",
    nivWords: 727969,
    testament: "both",
  },
  {
    key: "ot",
    label: "Old Testament",
    chapters: 929,
    books: "Genesis – Malachi",
    nivWords: 551742,
    testament: "ot",
  },
  {
    key: "nt",
    label: "New Testament",
    chapters: 260,
    books: "Matthew – Revelation",
    nivWords: 176251,
    testament: "nt",
  },
  // ── OT Sections ──
  {
    key: "the-law",
    label: "The Law",
    chapters: 187,
    books: "Genesis, Exodus, Leviticus, Numbers, Deuteronomy",
    nivWords: 155684,
    testament: "ot",
  },
  {
    key: "historical",
    label: "Historical Books",
    chapters: 249,
    books: "Joshua, Judges, Ruth, 1–2 Samuel, 1–2 Kings, 1–2 Chronicles, Ezra, Nehemiah, Esther",
    nivWords: 198524,
    testament: "ot",
  },
  {
    key: "wisdom",
    label: "Wisdom Literature",
    chapters: 243,
    books: "Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon",
    nivWords: 99726,
    testament: "ot",
  },
  {
    key: "major-prophets",
    label: "Major Prophets",
    chapters: 183,
    books: "Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel",
    nivWords: 80705,
    testament: "ot",
  },
  {
    key: "minor-prophets",
    label: "Minor Prophets",
    chapters: 67,
    books: "Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi",
    nivWords: 17103,
    testament: "ot",
  },
  // ── NT Sections ──
  {
    key: "gospels",
    label: "Gospels",
    chapters: 89,
    books: "Matthew, Mark, Luke, John",
    nivWords: 83799,
    testament: "nt",
  },
  {
    key: "acts",
    label: "Acts",
    chapters: 28,
    books: "Acts",
    nivWords: 18600,
    testament: "nt",
  },
  {
    key: "pauline",
    label: "Pauline Epistles",
    chapters: 87,
    books: "Romans, 1–2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1–2 Thessalonians, 1–2 Timothy, Titus, Philemon",
    nivWords: 48000,
    testament: "nt",
  },
  {
    key: "general-epistles",
    label: "General Epistles",
    chapters: 34,
    books: "Hebrews, James, 1–2 Peter, 1–3 John, Jude",
    nivWords: 18000,
    testament: "nt",
  },
  {
    key: "revelation",
    label: "Revelation",
    chapters: 22,
    books: "Revelation",
    nivWords: 9852,
    testament: "nt",
  },
];

// Ratio of each scope's NIV words to the full-Bible NIV word count.
// Used to scale word counts for other translations proportionally.
const NIV_WHOLE = 727969;
const NIV_OT = 551742;
const NIV_NT = 176251;

export function getWordCount(
  translation: Translation,
  scope: ScopeKey
): number {
  switch (scope) {
    case "whole":
      return translation.words.whole;
    case "ot":
      return translation.words.ot;
    case "nt":
      return translation.words.nt;
    default: {
      const s = SCOPES.find((sc) => sc.key === scope)!;
      // Scale NIV section words proportionally to the selected translation
      const base = s.testament === "nt"
        ? NIV_NT
        : s.testament === "ot"
        ? NIV_OT
        : NIV_WHOLE;
      const translationBase = s.testament === "nt"
        ? translation.words.nt
        : s.testament === "ot"
        ? translation.words.ot
        : translation.words.whole;
      return Math.round((s.nivWords / base) * translationBase);
    }
  }
}

// ─── Scope aggregation (multi-select, deduplication) ────────────────────────

const OT_SECTION_KEYS: ScopeKey[] = [
  "the-law",
  "historical",
  "wisdom",
  "major-prophets",
  "minor-prophets",
];
const NT_SECTION_KEYS: ScopeKey[] = [
  "gospels",
  "acts",
  "pauline",
  "general-epistles",
  "revelation",
];

/**
 * Deduplicate scope keys — remove sub-scopes covered by a parent.
 * The UI prevents mixing overview and section keys, but this is a safety net.
 */
function deduplicateScopes(scopes: ScopeKey[]): ScopeKey[] {
  if (scopes.length === 0) return ["whole"];
  if (scopes.includes("whole")) return ["whole"];
  const hasOt = scopes.includes("ot");
  const hasNt = scopes.includes("nt");
  const deduped: ScopeKey[] = [];
  for (const key of scopes) {
    if (hasOt && OT_SECTION_KEYS.includes(key)) continue;
    if (hasNt && NT_SECTION_KEYS.includes(key)) continue;
    deduped.push(key);
  }
  return deduped.length > 0 ? deduped : ["whole"];
}

export function aggregateWords(
  translation: Translation,
  scopes: ScopeKey[]
): number {
  const effective = deduplicateScopes(scopes);
  return effective.reduce((sum, key) => sum + getWordCount(translation, key), 0);
}

export function aggregateChapters(scopes: ScopeKey[]): number {
  const effective = deduplicateScopes(scopes);
  return effective.reduce((sum, key) => {
    const s = SCOPES.find((sc) => sc.key === key)!;
    return sum + s.chapters;
  }, 0);
}

// ─── Sustainability ──────────────────────────────────────────────────────────

export type SustainabilityLevel =
  | "slow"
  | "great"
  | "solid"
  | "dedicated"
  | "ambitious";

export interface Sustainability {
  level: SustainabilityLevel;
  label: string;
  description: string;
  color: string; // tailwind color class
}

export function getSustainability(minutesPerDay: number): Sustainability {
  if (minutesPerDay < 5) {
    return {
      level: "slow",
      label: "Very slow pace",
      description: "This will take many years — try bumping up to 10–15 min/day",
      color: "text-stone-500",
    };
  } else if (minutesPerDay <= 15) {
    return {
      level: "great",
      label: "Great pace",
      description: "Very achievable — you've got this",
      color: "text-teal-700",
    };
  } else if (minutesPerDay <= 30) {
    return {
      level: "solid",
      label: "Solid commitment",
      description: "A meaningful daily habit — well worth it",
      color: "text-teal-700",
    };
  } else if (minutesPerDay <= 45) {
    return {
      level: "dedicated",
      label: "Dedicated reader",
      description: "Build the habit first, then expand",
      color: "text-amber-700",
    };
  } else {
    return {
      level: "ambitious",
      label: "Ambitious",
      description: "Consider a longer timeframe or more days per week",
      color: "text-amber-700",
    };
  }
}

// ─── Milestone helpers ───────────────────────────────────────────────────────

// Chapters at which milestones occur (cumulative from Genesis)
const GOSPELS_END_CHAPTER = 1018; // OT(929) + Gospels(89) = 1018
const NT_END_CHAPTER = 1189;
const HALFWAY_CHAPTER = 595; // ~halfway through whole Bible

interface MilestoneResult {
  gospelsDate: Date | null;
  ntDate: Date | null;
  halfwayDate: Date | null;
}

/**
 * Given a start date and effective reading days per week,
 * calculate when milestones will be reached.
 */
export function getMilestones(
  scope: ScopeKey,
  totalChapters: number,
  totalReadingDays: number,
  startDate: Date,
  effectiveDaysPerWeek: number
): MilestoneResult {
  if (scope !== "whole") {
    return { gospelsDate: null, ntDate: null, halfwayDate: null };
  }

  const chaptersPerDay = totalChapters / totalReadingDays;
  const calendarDaysPerReadingDay = 7 / effectiveDaysPerWeek;
  // Total calendar days for the whole reading (matches calcDuration)
  const totalCalendarDays = Math.ceil(totalReadingDays * calendarDaysPerReadingDay);

  function getDaysToChapter(targetChapter: number): number | null {
    if (targetChapter > totalChapters) return null;
    // If this IS the last chapter (NT end = whole Bible end), use the exact finish
    if (targetChapter >= totalChapters) return totalCalendarDays;
    const readingDaysNeeded = Math.ceil(targetChapter / chaptersPerDay);
    // Use floor to avoid creeping past the finish date on milestones
    return Math.min(
      Math.ceil(readingDaysNeeded * calendarDaysPerReadingDay),
      totalCalendarDays
    );
  }

  function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  const gospelsDays = getDaysToChapter(GOSPELS_END_CHAPTER);
  const ntDays = getDaysToChapter(NT_END_CHAPTER);
  const halfwayDays = getDaysToChapter(HALFWAY_CHAPTER);

  return {
    gospelsDate: gospelsDays ? addDays(startDate, gospelsDays) : null,
    ntDate: ntDays ? addDays(startDate, ntDays) : null,
    halfwayDate: halfwayDays ? addDays(startDate, halfwayDays) : null,
  };
}

// ─── Mode 1: How long will it take? ─────────────────────────────────────────

export interface Mode1Result {
  totalWords: number;
  totalMinutes: number;
  totalReadingDays: number;
  calendarDays: number;
  finishDate: Date;
  chaptersPerSession: number;
  pagesPerSession: number;
  minutesPerDay: number;
  sustainability: Sustainability;
  milestones: MilestoneResult;
}

export function calcDuration(params: {
  translation: Translation;
  scopes: ScopeKey[];
  wpm: number;
  minutesPerDay: number;
  daysPerWeek: number;
  graceDaysPerWeek: number;
  startDate: Date;
}): Mode1Result {
  const {
    translation,
    scopes,
    wpm,
    minutesPerDay,
    daysPerWeek,
    graceDaysPerWeek,
    startDate,
  } = params;

  // Aggregate across all selected scopes (avoid double-counting overlapping sections)
  const totalWords = aggregateWords(translation, scopes);
  const totalChapters = aggregateChapters(scopes);
  // Use "whole" milestone logic only if whole Bible is selected
  const milestoneScope: ScopeKey = scopes.includes("whole") ? "whole" : scopes[0];

  const totalMinutes = totalWords / wpm;
  // daysPerWeek already reflects effective reading days (grace days excluded by caller)
  const effectiveDaysPerWeek = Math.max(0.5, daysPerWeek);

  const totalReadingDays = Math.ceil(totalMinutes / minutesPerDay);
  const calendarDays = Math.ceil(
    totalReadingDays / (effectiveDaysPerWeek / 7)
  );

  const finishDate = new Date(startDate);
  finishDate.setDate(finishDate.getDate() + calendarDays);

  const chaptersPerSession =
    Math.round((totalChapters / totalReadingDays) * 10) / 10;
  // ~1800 words per page in a standard Bible
  const pagesPerSession =
    Math.round((totalWords / totalReadingDays / 1800) * 10) / 10;

  const sustainability = getSustainability(minutesPerDay);

  const milestones = getMilestones(
    milestoneScope,
    totalChapters,
    totalReadingDays,
    startDate,
    effectiveDaysPerWeek
  );

  return {
    totalWords,
    totalMinutes,
    totalReadingDays,
    calendarDays,
    finishDate,
    chaptersPerSession,
    pagesPerSession,
    minutesPerDay,
    sustainability,
    milestones,
  };
}

// ─── Mode 2: How much do I need to read? ────────────────────────────────────

export interface Mode2Result {
  totalWords: number;
  totalMinutes: number;
  minutesPerDay: number;
  chaptersPerSession: number;
  pagesPerSession: number;
  totalReadingDays: number;
  sustainability: Sustainability;
  milestones: MilestoneResult;
}

export function calcPace(params: {
  translation: Translation;
  scopes: ScopeKey[];
  wpm: number;
  goalDate: Date;
  daysPerWeek: number;
  graceDaysPerWeek: number;
  startDate: Date;
}): Mode2Result {
  const {
    translation,
    scopes,
    wpm,
    goalDate,
    daysPerWeek,
    graceDaysPerWeek,
    startDate,
  } = params;

  const totalWords = aggregateWords(translation, scopes);
  const totalChapters = aggregateChapters(scopes);
  const milestoneScope: ScopeKey = scopes.includes("whole") ? "whole" : scopes[0];

  const totalMinutes = totalWords / wpm;
  // daysPerWeek already reflects effective reading days (grace days excluded by caller)
  const effectiveDaysPerWeek = Math.max(0.5, daysPerWeek);

  // Calendar days available
  const msPerDay = 1000 * 60 * 60 * 24;
  const calendarDays = Math.max(
    1,
    Math.floor((goalDate.getTime() - startDate.getTime()) / msPerDay)
  );

  // Actual reading days available
  const totalReadingDays = Math.floor(
    calendarDays * (effectiveDaysPerWeek / 7)
  );

  const minutesPerDay =
    totalReadingDays > 0
      ? Math.ceil(totalMinutes / totalReadingDays)
      : totalMinutes;

  const chaptersPerSession =
    totalReadingDays > 0
      ? Math.round((totalChapters / totalReadingDays) * 10) / 10
      : totalChapters;

  const pagesPerSession =
    Math.round((totalWords / Math.max(1, totalReadingDays) / 1800) * 10) / 10;

  const sustainability = getSustainability(minutesPerDay);

  const milestones = getMilestones(
    milestoneScope,
    totalChapters,
    Math.max(1, totalReadingDays),
    startDate,
    effectiveDaysPerWeek
  );

  return {
    totalWords,
    totalMinutes,
    minutesPerDay,
    chaptersPerSession,
    pagesPerSession,
    totalReadingDays,
    sustainability,
    milestones,
  };
}

// ─── Benchmark cards ─────────────────────────────────────────────────────────

export interface BenchmarkCard {
  minutesPerDay: number;
  scope: ScopeKey;
  scopeLabel: string;
  timeframe: string;
}

export function getBenchmarks(translation: Translation): BenchmarkCard[] {
  function timeframeLabel(minutes: number, scope: ScopeKey): string {
    const words = getWordCount(translation, scope);
    const totalMins = words / 200; // reading pace
    const daysPerWeek = 7;
    const readingDaysPerDay = daysPerWeek / 7;
    const totalDays = Math.ceil(totalMins / minutes);
    const calendarDays = Math.ceil(totalDays / readingDaysPerDay);
    const months = Math.round(calendarDays / 30);
    if (months < 2) return "about 1 month";
    if (months === 12) return "exactly 1 year";
    if (months < 12) return `about ${months} months`;
    const years = Math.round(months / 12);
    return `about ${years} year${years > 1 ? "s" : ""}`;
  }

  return [
    {
      minutesPerDay: 15,
      scope: "whole",
      scopeLabel: "Whole Bible",
      timeframe: timeframeLabel(15, "whole"),
    },
    {
      minutesPerDay: 10,
      scope: "nt",
      scopeLabel: "New Testament",
      timeframe: timeframeLabel(10, "nt"),
    },
    {
      minutesPerDay: 5,
      scope: "gospels",
      scopeLabel: "Gospels",
      timeframe: timeframeLabel(5, "gospels"),
    },
    {
      minutesPerDay: 30,
      scope: "whole",
      scopeLabel: "Whole Bible",
      timeframe: timeframeLabel(30, "whole"),
    },
  ];
}

// ─── Formatters ──────────────────────────────────────────────────────────────

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateInput(value: string): Date {
  // Parse YYYY-MM-DD without timezone offset issues
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
