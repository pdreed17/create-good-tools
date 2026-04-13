"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  calcMemorization,
  calcRealisticGoal,
  BIBLE_BOOKS,
  POPULAR_PASSAGES,
  TRANSLATIONS,
  METHOD_LABELS,
  METHOD_DESCRIPTIONS,
  EXPERIENCE_LABELS,
  EXPERIENCE_DESCRIPTIONS,
  getBookWordCount,
  isVerifiedTranslation,
  formatDateLong,
  formatWeeks,
  type MemorizationMethod,
  type ExperienceLevel,
  type ScopeType,
  type TranslationKey,
} from "@/lib/scriptureMemoryCalculator";

type Mode = "how-long" | "what-can-i";

const TIMEFRAME_OPTIONS = [
  { label: "1 month", weeks: 4 },
  { label: "3 months", weeks: 13 },
  { label: "6 months", weeks: 26 },
  { label: "1 year", weeks: 52 },
  { label: "2 years", weeks: 104 },
];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function TranslationSelector({
  translationKey,
  setTranslationKey,
}: {
  translationKey: TranslationKey;
  setTranslationKey: (k: TranslationKey) => void;
}) {
  const selected = TRANSLATIONS.find(t => t.key === translationKey);
  const isVerified = isVerifiedTranslation(translationKey);
  return (
    <fieldset>
      <legend className="block text-sm font-semibold text-stone-800 mb-3">
        Bible translation
      </legend>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {TRANSLATIONS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTranslationKey(t.key as TranslationKey)}
            className={`py-2 rounded-lg text-sm font-medium border transition-all relative ${
              translationKey === t.key
                ? "bg-[#0D6E6E] text-white border-[#0D6E6E]"
                : "border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {t.key}
            {!isVerifiedTranslation(t.key) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" title="Estimated word counts" />
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-400">
        {selected?.fullName}
        {isVerified
          ? " — verified per-book word counts"
          : " — word counts are proportional estimates"}
        {!isVerified && (
          <span className="inline-flex items-center gap-1 ml-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="text-amber-600">estimate</span>
          </span>
        )}
      </p>
    </fieldset>
  );
}

export default function ScriptureMemoryCalculator() {
  const [mode, setMode] = useState<Mode>("how-long");
  const [scopeType, setScopeType] = useState<ScopeType>("passage");
  const [passageText, setPassageText] = useState("");
  const [selectedPassage, setSelectedPassage] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [customVerses, setCustomVerses] = useState(10);
  const [minutesPerDay, setMinutesPerDay] = useState(10);
  const [daysPerWeek, setDaysPerWeek] = useState(6);
  const [method, setMethod] = useState<MemorizationMethod>("spaced-repetition");
  const [experience, setExperience] = useState<ExperienceLevel>("some");
  const [translationKey, setTranslationKey] = useState<TranslationKey>("NIV");
  const [timeframeWeeks, setTimeframeWeeks] = useState(52);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const translation = TRANSLATIONS.find(t => t.key === translationKey) ?? TRANSLATIONS[0];

  const { verseCount, wordCount, scopeLabel } = useMemo(() => {
    if (scopeType === "passage") {
      const rawWords = passageText.trim()
        ? countWords(passageText)
        : (selectedPassage ? (POPULAR_PASSAGES.find(p => p.reference === selectedPassage)?.words ?? 25) : 25);
      // Scale passage word counts from NIV baseline to selected translation (NT ratio)
      const scale = passageText.trim() ? 1 : (translation.words.nt / 176251);
      const words = Math.round(rawWords * scale);
      const verses = selectedPassage
        ? (POPULAR_PASSAGES.find(p => p.reference === selectedPassage)?.verses ?? 1)
        : Math.max(1, Math.ceil(words / 25));
      const label = selectedPassage ?? (passageText.trim() ? "Custom passage" : "John 3:16");
      return { verseCount: verses, wordCount: words, scopeLabel: label };
    } else if (scopeType === "book") {
      const book = BIBLE_BOOKS.find(b => b.name === selectedBook);
      if (!book) return { verseCount: 0, wordCount: 0, scopeLabel: "" };
      return {
        verseCount: book.verses,
        wordCount: getBookWordCount(book, translation),
        scopeLabel: book.name,
      };
    } else {
      const scale = translation.words.nt / 176251;
      return {
        verseCount: customVerses,
        wordCount: Math.round(customVerses * 25 * scale),
        scopeLabel: `${customVerses} verses`,
      };
    }
  }, [scopeType, passageText, selectedPassage, selectedBook, customVerses, translation]);

  const howLongResult = useMemo(() => calcMemorization({
    verseCount,
    wordCount,
    minutesPerDay,
    daysPerWeek,
    method,
    experience,
  }), [verseCount, wordCount, minutesPerDay, daysPerWeek, method, experience]);

  const realisticGoalResult = useMemo(() => calcRealisticGoal({
    timeframeWeeks,
    minutesPerDay,
    daysPerWeek,
    method,
    experience,
  }), [timeframeWeeks, minutesPerDay, daysPerWeek, method, experience]);

  const handlePassageSelect = useCallback((reference: string) => {
    setSelectedPassage(reference);
    setPassageText("");
  }, []);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const showBeginnerWarning = experience === "beginner" && wordCount > 500 && mode === "how-long";
  const otBooks = BIBLE_BOOKS.filter(b => b.testament === "OT");
  const ntBooks = BIBLE_BOOKS.filter(b => b.testament === "NT");

  const faqs = [
    {
      q: "How long does it take to memorize a Bible verse?",
      a: "A single verse of around 25 words typically takes 3–7 days of consistent practice (10 minutes/day). Shorter verses with vivid imagery — like John 3:16 — can come in 2–3 days. Longer passages scale roughly linearly: a 10-verse passage at 10 min/day with spaced repetition takes about 2–3 weeks.",
    },
    {
      q: "What is the best method for memorizing scripture?",
      a: "Research and centuries of practice point to spaced repetition as the most effective method for long-term retention. Review a verse after 12 hours, then 2 days, then a week, then monthly. For speed of initial acquisition, the song/music method is hard to beat — setting words to a familiar tune can cut memorization time in half. The best method is ultimately the one you'll actually stick with.",
    },
    {
      q: "Is it better to memorize single verses or whole passages?",
      a: "Whole passages, where possible. Memorizing verses in context means you understand what they mean and can retrieve them more reliably under pressure. Isolated verse memory is great for individual promises or anchors, but passage memory gives you the full weight of the argument, the narrative, or the prayer. Start with a verse, then expand outward.",
    },
    {
      q: "How do I make memorized verses stick long-term?",
      a: "The key is review at increasing intervals — not grinding it fresh every day. Once you've memorized a passage, review it at Day 1, Day 3, Day 7, then monthly. After 7 months of spaced review, it tends to be truly internalized. Also: use it. Quote it in prayer, write it in a journal, speak it to a friend. Living use is the deepest review.",
    },
    {
      q: "What does the Bible say about memorizing scripture?",
      a: "Psalm 119:11 says, 'I have hidden your word in my heart that I might not sin against you.' Deuteronomy 6:6 says God's commands should be 'on your hearts.' Colossians 3:16 calls us to let 'the word of Christ dwell in you richly.' The pattern throughout Scripture is that God's Word should be internalized — not just read, but known.",
    },
    {
      q: "How many verses can I realistically memorize in a year?",
      a: "At 10 minutes/day using spaced repetition with some prior experience, you can realistically memorize 100–150 verses in a year and retain them deeply. At 20 min/day with the active recall method, some memorizers reach 200–300 verses annually. The Navigator Topical Memory System suggests starting with 60 verses (their basic course), which is very achievable for beginners.",
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="pt-8 pb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#D97706] mb-3">Scripture</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
          Scripture Memory Calculator
        </h1>
        <p className="text-base text-stone-600 leading-relaxed max-w-2xl" style={{ fontFamily: "Georgia, serif" }}>
          "I have hidden your word in my heart that I might not sin against you." — Psalm 119:11.
          Find out how long it will take to memorize any verse, passage, or book — and get a
          daily practice plan to get there.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mb-6">
        <div className="inline-flex rounded-xl border border-stone-200 bg-white p-1 gap-1">
          {(["how-long", "what-can-i"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m ? "bg-[#0D6E6E] text-white" : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              {m === "how-long" ? "How long will it take?" : "What can I memorize?"}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mb-10">
        {/* Input panel */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-7">

          {/* MODE 1 — scope + translation */}
          {mode === "how-long" && (
            <>
              <fieldset>
                <legend className="block text-sm font-semibold text-stone-800 mb-3">
                  What do you want to memorize?
                </legend>
                <div className="flex gap-2 mb-4">
                  {(["passage", "book", "custom"] as ScopeType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setScopeType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        scopeType === t
                          ? "bg-[#0D6E6E] text-white border-[#0D6E6E]"
                          : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      {t === "passage" ? "A passage" : t === "book" ? "A whole book" : "Custom # of verses"}
                    </button>
                  ))}
                </div>

                {scopeType === "passage" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Popular passages</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {POPULAR_PASSAGES.map((p) => (
                          <button
                            key={p.reference}
                            onClick={() => handlePassageSelect(p.reference)}
                            className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                              selectedPassage === p.reference
                                ? "bg-[#E6F3F3] border-[#0D6E6E] text-[#0D6E6E]"
                                : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                            }`}
                          >
                            <div className="font-medium">{p.reference}</div>
                            <div className="text-stone-400">{p.words} words (NIV)</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Or paste your passage</label>
                      <textarea
                        value={passageText}
                        onChange={(e) => { setPassageText(e.target.value); setSelectedPassage(null); }}
                        placeholder="Paste or type the passage you want to memorize..."
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent bg-[#FAFAF8] resize-none"
                      />
                      {passageText.trim() && (
                        <p className="text-xs text-[#0D6E6E] font-medium mt-1">
                          {countWords(passageText)} words detected
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {scopeType === "book" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">Old Testament</label>
                        <select
                          value={otBooks.find(b => b.name === selectedBook) ? selectedBook : ""}
                          onChange={(e) => { if (e.target.value) setSelectedBook(e.target.value); }}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent bg-[#FAFAF8]"
                        >
                          <option value="">Select OT book…</option>
                          {otBooks.map((b) => (
                            <option key={b.name} value={b.name}>{b.name} ({b.verses} v)</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">New Testament</label>
                        <select
                          value={ntBooks.find(b => b.name === selectedBook) ? selectedBook : ""}
                          onChange={(e) => { if (e.target.value) setSelectedBook(e.target.value); }}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent bg-[#FAFAF8]"
                        >
                          <option value="">Select NT book…</option>
                          {ntBooks.map((b) => (
                            <option key={b.name} value={b.name}>{b.name} ({b.verses} v)</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {selectedBook && (() => {
                      const book = BIBLE_BOOKS.find(b => b.name === selectedBook);
                      if (!book) return null;
                      const wc = getBookWordCount(book, translation);
                      return (
                        <div className="bg-[#E6F3F3] rounded-xl p-3 text-sm text-[#0D6E6E]">
                          <span className="font-semibold">{selectedBook}:</span>{" "}
                          {book.verses} verses, ~{wc.toLocaleString()} words
                          <span className="text-[#0D6E6E]/60 ml-1">
                            ({translationKey}{isVerifiedTranslation(translationKey) ? "" : " — est."})
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {scopeType === "custom" && (
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2">
                      Number of verses: <span className="text-[#0D6E6E] font-bold">{customVerses}</span>
                    </label>
                    <input
                      type="range" min={1} max={500} value={customVerses}
                      onChange={(e) => setCustomVerses(Number(e.target.value))}
                      className="w-full accent-[#0D6E6E]"
                    />
                    <div className="flex justify-between text-xs text-stone-400 mt-1">
                      <span>1 verse</span><span>500 verses</span>
                    </div>
                  </div>
                )}
              </fieldset>

              {/* Translation — right after scope in Mode 1 */}
              <TranslationSelector translationKey={translationKey} setTranslationKey={setTranslationKey} />
            </>
          )}

          {/* MODE 2 — timeframe + translation */}
          {mode === "what-can-i" && (
            <>
              <fieldset>
                <legend className="block text-sm font-semibold text-stone-800 mb-3">
                  How much time do you have?
                </legend>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {TIMEFRAME_OPTIONS.map((opt) => (
                    <button
                      key={opt.weeks}
                      onClick={() => setTimeframeWeeks(opt.weeks)}
                      className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all ${
                        timeframeWeeks === opt.weeks
                          ? "bg-[#0D6E6E] text-white border-[#0D6E6E]"
                          : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Translation — right after timeframe in Mode 2 */}
              <TranslationSelector translationKey={translationKey} setTranslationKey={setTranslationKey} />
            </>
          )}

          <div className="border-t border-stone-100" />

          {/* Minutes per day */}
          <fieldset>
            <legend className="block text-sm font-semibold text-stone-800 mb-2">
              Minutes per day: <span className="text-[#0D6E6E] font-bold">{minutesPerDay} min</span>
            </legend>
            <input
              type="range" min={2} max={60} step={1} value={minutesPerDay}
              onChange={(e) => setMinutesPerDay(Number(e.target.value))}
              className="w-full accent-[#0D6E6E]"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>2 min</span><span>60 min</span>
            </div>
          </fieldset>

          {/* Days per week */}
          <fieldset>
            <legend className="block text-sm font-semibold text-stone-800 mb-3">
              Days per week: <span className="text-[#0D6E6E] font-bold">{daysPerWeek} day{daysPerWeek !== 1 ? "s" : ""}</span>
            </legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => setDaysPerWeek(d)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    daysPerWeek === d
                      ? "bg-[#0D6E6E] text-white border-[#0D6E6E]"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="border-t border-stone-100" />

          {/* Method */}
          <fieldset>
            <legend className="block text-sm font-semibold text-stone-800 mb-3">Memorization method</legend>
            <div className="space-y-2">
              {(Object.keys(METHOD_LABELS) as MemorizationMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    method === m ? "bg-[#E6F3F3] border-[#0D6E6E]" : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className={`text-sm font-semibold ${method === m ? "text-[#0D6E6E]" : "text-stone-800"}`}>
                    {METHOD_LABELS[m]}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{METHOD_DESCRIPTIONS[m]}</div>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="border-t border-stone-100" />

          {/* Experience */}
          <fieldset>
            <legend className="block text-sm font-semibold text-stone-800 mb-3">Your experience level</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setExperience(e)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all ${
                    experience === e ? "bg-[#E6F3F3] border-[#0D6E6E]" : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className={`text-sm font-semibold ${experience === e ? "text-[#0D6E6E]" : "text-stone-800"}`}>
                    {EXPERIENCE_LABELS[e]}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{EXPERIENCE_DESCRIPTIONS[e]}</div>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Results panel */}
        <div ref={resultsRef} className="space-y-4">
          {mode === "how-long" ? (
            <>
              <div className="bg-[#0D6E6E] rounded-2xl p-6 text-white">
                <p className="text-xs font-semibold tracking-widest uppercase text-white/60 mb-1">Time to memorize</p>
                <p className="text-4xl font-bold leading-tight mb-1">
                  {formatWeeks(howLongResult.initialMemorizationWeeks)}
                </p>
                <p className="text-sm text-white/70">
                  {scopeLabel} · {verseCount} verse{verseCount !== 1 ? "s" : ""} · ~{wordCount.toLocaleString()} words ({translationKey}{!isVerifiedTranslation(translationKey) ? " est." : ""})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <p className="text-xs text-stone-500 mb-1">Memorized by</p>
                  <p className="text-base font-bold text-stone-900 leading-snug">
                    {formatDateLong(howLongResult.initialMemorizationDate)}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">Initial recall</p>
                </div>
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <p className="text-xs text-stone-500 mb-1">Deeply retained by</p>
                  <p className="text-base font-bold text-stone-900 leading-snug">
                    {formatDateLong(howLongResult.deepRetentionDate)}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">After review cycle</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-sm font-semibold text-stone-800 mb-2">Daily practice</p>
                <p className="text-sm text-stone-600 mb-3">
                  {howLongResult.versesPerDay >= 1
                    ? <><span className="font-bold text-stone-900">{Math.round(howLongResult.versesPerDay * 10) / 10} new verse{howLongResult.versesPerDay >= 2 ? "s" : ""}</span> per study day</>
                    : <>1 new verse every <span className="font-bold text-stone-900">{Math.round(howLongResult.daysPerVerse)} day{Math.round(howLongResult.daysPerVerse) !== 1 ? "s" : ""}</span></>
                  }
                </p>
                <div className="space-y-2">
                  {[
                    { label: "New material", value: howLongResult.dailyBreakdown.newMaterial, color: "bg-[#0D6E6E]" },
                    { label: "Recent review", value: howLongResult.dailyBreakdown.recentReview, color: "bg-[#5FAAAA]" },
                    { label: "Long-term review", value: howLongResult.dailyBreakdown.longTermReview, color: "bg-stone-200" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.max(8, (value / minutesPerDay) * 100)}%`, minWidth: 8 }} />
                      <span className="text-xs text-stone-600 whitespace-nowrap">{label}: <span className="font-medium text-stone-800">{value} min</span></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 leading-relaxed italic">
                  "{howLongResult.encouragementText}"
                </p>
              </div>

              {showBeginnerWarning && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-stone-800 mb-1">A gentle suggestion</p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    This is an ambitious goal for starting out. Consider beginning with a shorter
                    passage like Philippians 4:6-7 or Psalm 23, then building from there.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-[#0D6E6E] rounded-2xl p-6 text-white">
                <p className="text-xs font-semibold tracking-widest uppercase text-white/60 mb-1">Verses achievable</p>
                <p className="text-4xl font-bold leading-tight mb-1">
                  {realisticGoalResult.versesAchievable} verses
                </p>
                <p className="text-sm text-white/70">
                  in {TIMEFRAME_OPTIONS.find(o => o.weeks === timeframeWeeks)?.label} at {minutesPerDay} min/day
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <p className="text-xs text-stone-500 mb-1">Rate</p>
                  <p className="text-xl font-bold text-stone-900">{realisticGoalResult.versesPerWeek}</p>
                  <p className="text-xs text-stone-400 mt-0.5">verses per week</p>
                </div>
                <div className="bg-white rounded-xl border border-stone-200 p-4">
                  <p className="text-xs text-stone-500 mb-1">~Words</p>
                  <p className="text-xl font-bold text-stone-900">{realisticGoalResult.wordsAchievable.toLocaleString()}</p>
                  <p className="text-xs text-stone-400 mt-0.5">estimated words</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <p className="text-xs text-stone-500 mb-1">Suggested scope</p>
                <p className="text-sm font-semibold text-stone-900 leading-snug">
                  {realisticGoalResult.suggestedScope}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 leading-relaxed">
                  <span className="font-semibold">The goal isn't quantity.</span> A handful of verses truly internalized will serve you more
                  than a hundred half-remembered. Start small, review faithfully.
                </p>
              </div>
            </>
          )}

          <button
            onClick={copyLink}
            className="w-full py-3 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:border-[#0D6E6E] hover:text-[#0D6E6E] transition-all"
          >
            {copied ? "Link copied!" : "Share this calculator"}
          </button>
        </div>
      </div>

      {/* Spaced repetition explainer */}
      <section className="mb-10">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-lg font-bold text-stone-900 mb-1">Why spaced repetition changes everything</h2>
          <p className="text-sm text-stone-600 leading-relaxed mb-5" style={{ fontFamily: "Georgia, serif" }}>
            The goal isn&apos;t to memorize a verse for Sunday school. It&apos;s to have it ready when you need it
            most — in grief, in temptation, in a conversation. That kind of retention requires review
            at increasing intervals. Here&apos;s the review cadence after initial memorization:
          </p>
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {howLongResult.spacedRepetitionSchedule.map((step, i, arr) => (
              <div key={i} className="flex flex-col items-center min-w-[100px]">
                <div className="flex items-center w-full">
                  <div className={`h-3 w-3 rounded-full flex-shrink-0 ${i === 0 || i === arr.length - 1 ? "bg-[#0D6E6E]" : "bg-[#5FAAAA]"}`} />
                  {i < arr.length - 1 && <div className="flex-1 h-0.5 bg-stone-200" />}
                </div>
                <div className="mt-2 text-center px-1">
                  <p className="text-xs font-semibold text-stone-800">{step.label}</p>
                  <p className="text-xs text-stone-500 leading-snug mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suggested starting passages */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Not sure where to start?</h2>
        <p className="text-sm text-stone-600 mb-4">Here are passages Christians love to memorize first.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_PASSAGES.slice(0, 6).map((p) => {
            const est = calcMemorization({
              verseCount: p.verses, wordCount: p.words,
              minutesPerDay: 10, daysPerWeek: 6,
              method: "spaced-repetition", experience: "some",
            });
            return (
              <button
                key={p.reference}
                onClick={() => {
                  setScopeType("passage");
                  handlePassageSelect(p.reference);
                  setMode("how-long");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group text-left bg-white rounded-2xl border border-stone-200 p-5 hover:border-[#0D6E6E] hover:shadow-md transition-all"
              >
                <p className="text-xs font-medium text-[#D97706] tracking-wide uppercase mb-1">{p.theme}</p>
                <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-[#0D6E6E] transition-colors">{p.reference}</h3>
                <p className="text-xs text-stone-500 mb-2">{p.words} words (NIV) · {p.verses} verse{p.verses !== 1 ? "s" : ""}</p>
                <p className="text-xs text-[#0D6E6E] font-medium">~{formatWeeks(est.initialMemorizationWeeks)} at 10 min/day →</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Famous memorization systems */}
      <section className="mb-10">
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6">
          <h2 className="text-base font-semibold text-stone-900 mb-2">Trusted scripture memory systems</h2>
          <p className="text-sm text-stone-600 mb-4 leading-relaxed">
            Many Christians have gone before you with structured systems worth knowing about.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Navigator TMS", desc: "The Navigators' Topical Memory System — 60 verses across 5 themes, a classic starting point.", href: "https://www.navigators.org/resource/topical-memory-system/" },
              { name: "Fighter Verses", desc: "Desiring God's curated set of verses for fighting sin and fueling faith, with an app.", href: "https://www.fighterverstices.com" },
              { name: "Charlotte Mason Method", desc: "Long-form passage memorization through daily oral repetition — used in classical education.", href: "https://www.amblesideonline.org/cmscale.shtml" },
            ].map((sys) => (
              <a key={sys.name} href={sys.href} target="_blank" rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-stone-200 p-4 hover:border-[#0D6E6E] transition-colors">
                <p className="text-sm font-semibold text-stone-900 mb-1">{sys.name}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{sys.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-4">Common questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors"
              >
                <span className="text-sm font-semibold text-stone-900">{faq.q}</span>
                <span className="text-stone-400 flex-shrink-0 transition-transform duration-200"
                  style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-stone-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mb-4">
        <div className="bg-[#E6F3F3] rounded-2xl p-6 mb-4">
          <h2 className="text-xl font-bold text-stone-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Know someone memorizing scripture?
          </h2>
          <p className="text-sm text-stone-600 mb-4">
            Share this tool with your small group, Bible study, or anyone working on hiding God&apos;s Word in their heart.
          </p>
          <button
            onClick={copyLink}
            className="px-5 py-2.5 rounded-xl bg-[#0D6E6E] text-white text-sm font-semibold hover:bg-[#0A5A5A] transition-colors"
          >
            {copied ? "Link copied!" : "Copy link to share"}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-base font-semibold text-stone-900 mb-1">Stay connected with Create Good</h2>
          <p className="text-sm text-stone-500 mb-4">
            New tools, resources, and encouragement for Christ-centered creatives.
          </p>
          <iframe
            src="https://tally.so/embed/EkJerB?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
            width="100%"
            height="160"
            frameBorder={0}
            title="Stay connected with Create Good"
            style={{ minHeight: 160 }}
          />
        </div>
      </section>
    </div>
  );
}
