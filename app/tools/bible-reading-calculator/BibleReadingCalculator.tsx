"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  TRANSLATIONS,
  READING_STYLES,
  SCOPES,
  calcDuration,
  calcPace,
  getBenchmarks,
  aggregateWords,
  aggregateChapters,
  formatDate,
  formatDateShort,
  todayString,
  parseDateInput,
  type TranslationKey,
  type ReadingStyle,
  type ScopeKey,
  type Scope,
} from "@/lib/bibleCalculator";

type Mode = "duration" | "pace";

export default function BibleReadingCalculator() {
  // Shared state
  const [mode, setMode] = useState<Mode>("duration");
  const [translationKey, setTranslationKey] = useState<TranslationKey>("NIV");
  const [readingStyle, setReadingStyle] = useState<ReadingStyle>("reading");
  const [scopes, setScopes] = useState<ScopeKey[]>(["whole"]);
  // Which days are grace (missed) — stored as a Set of 0-indexed day positions
  const [graceDaySet, setGraceDaySet] = useState<Set<number>>(new Set());

  const daysPerWeek = 7 - graceDaySet.size;
  const graceDays = graceDaySet.size;

  function toggleScope(key: ScopeKey) {
    setScopes((prev) => {
      const overviewKeys: ScopeKey[] = ["whole", "ot", "nt"];
      const isOverview = overviewKeys.includes(key);

      // If clicking an already-selected item that's the only selection, do nothing
      if (prev.includes(key) && prev.length === 1) return prev;

      if (isOverview) {
        // Overview keys are single-select: selecting one clears everything else
        if (prev.includes(key)) {
          // Deselecting an overview — no-op if it's the only selection (handled above)
          return prev.filter((k) => k !== key).length > 0
            ? prev.filter((k) => k !== key)
            : prev;
        }
        return [key];
      } else {
        // Section key: clear any overview keys, toggle this section
        const withoutOverview = prev.filter(
          (k) => !overviewKeys.includes(k)
        );
        if (withoutOverview.includes(key)) {
          const next = withoutOverview.filter((k) => k !== key);
          return next.length > 0 ? next : prev; // don't allow empty
        }
        return [...withoutOverview, key];
      }
    });
  }

  function toggleGraceDay(i: number) {
    setGraceDaySet(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  // Mode 1 specific
  const [minutesPerDay, setMinutesPerDay] = useState(15);
  const [startDate, setStartDate] = useState("");
  const [goalDate, setGoalDate] = useState("");


  const translation = TRANSLATIONS.find((t) => t.key === translationKey)!;
  const wpm =
    READING_STYLES.find((s) => s.key === readingStyle)?.wpm ?? 200;

  const durationResult = useMemo(
    () =>
      startDate
        ? calcDuration({
            translation,
            scopes,
            wpm,
            minutesPerDay,
            daysPerWeek,
            graceDaysPerWeek: 0,
            startDate: parseDateInput(startDate),
          })
        : null,
    [translation, scopes, wpm, minutesPerDay, daysPerWeek, startDate]
  );

  const paceResult = useMemo(
    () =>
      goalDate
        ? calcPace({
            translation,
            scopes,
            wpm,
            goalDate: parseDateInput(goalDate),
            daysPerWeek,
            graceDaysPerWeek: 0,
            startDate: startDate ? parseDateInput(startDate) : new Date(),
          })
        : null,
    [translation, scopes, wpm, goalDate, daysPerWeek, startDate]
  );

  const results = mode === "duration" ? durationResult : paceResult;
  if (!results) return null;

  const benchmarks = useMemo(() => getBenchmarks(translation), [translation]);

  // ── Sharing helpers ──────────────────────────────────────────────────────
  const [copied, setCopied] = useState<"url" | "text" | null>(null);

  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(`${window.location.origin}${window.location.pathname}`);
  }, []);

  const shareUrl = useMemo(() => {
    if (!origin) return "";
    const params = new URLSearchParams({
      mode,
      t: translationKey,
      rs: readingStyle,
      sc: scopes.join(","),
      dpw: String(daysPerWeek),
      gd: String(graceDays),
      ...(mode === "duration"
        ? { mpd: String(minutesPerDay), sd: startDate }
        : { gdate: goalDate }),
    });
    return `${origin}?${params}`;
  }, [mode, translationKey, readingStyle, scopes, daysPerWeek, graceDays, minutesPerDay, startDate, goalDate]);

  const shareText = useMemo(() => {
    const scopeLabels = scopes
      .map((k) => SCOPES.find((s) => s.key === k)?.label ?? k)
      .join(", ");
    if (mode === "duration") {
      return [
        `My Bible Reading Plan`,
        `Translation: ${translation.fullName}`,
        `Reading: ${scopeLabels}`,
        `Pace: ${minutesPerDay} min/day, ${daysPerWeek} days/week`,
        durationResult ? `Finish date: ${formatDate(durationResult.finishDate)}` : "",
        durationResult ? `Chapters/day: ${durationResult.chaptersPerSession}` : "",
        ``,
        `Calculate yours: ${shareUrl}`,
      ].join("\n");
    } else {
      return [
        `My Bible Reading Plan`,
        `Translation: ${translation.fullName}`,
        `Reading: ${scopeLabels}`,
        `Goal: finish by ${formatDateShort(parseDateInput(goalDate))}`,
        paceResult ? `Required: ${paceResult.minutesPerDay} min/day, ${daysPerWeek} days/week` : "",
        paceResult ? `Chapters/day: ${paceResult.chaptersPerSession}` : "",
        ``,
        `Calculate yours: ${shareUrl}`,
      ].join("\n");
    }
  }, [mode, translation, scopes, minutesPerDay, daysPerWeek, goalDate, durationResult, paceResult, shareUrl]);

  const mailtoLink = useMemo(() => {
    const subject = encodeURIComponent("My Bible Reading Plan");
    const body = encodeURIComponent(shareText);
    return `mailto:?subject=${subject}&body=${body}`;
  }, [shareText]);

  const copyToClipboard = useCallback(async (type: "url" | "text", text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const downloadCalendar = useCallback(() => {
    if (!startDate) return;

    const scopeLabels = scopes
      .map((k) => SCOPES.find((s) => s.key === k)?.label ?? k)
      .join(", ");

    const mpd = mode === "duration" ? minutesPerDay : (paceResult?.minutesPerDay ?? 0);
    const chap = mode === "duration"
      ? (durationResult?.chaptersPerSession ?? 0)
      : (paceResult?.chaptersPerSession ?? 0);

    const summary = `Bible Reading — ${scopeLabels}`;
    const description = [
      `Translation: ${translation.fullName}`,
      `Reading: ${scopeLabels}`,
      `${mpd} min/day · ${chap} chapters/session`,
      ``,
      `Plan built at: ${origin || "creategood.com/tools/bible-reading-calculator"}`,
    ].join("\\n");

    // Build RRULE: daily on reading days. If all 7 days are reading days use FREQ=DAILY,
    // otherwise list specific days (BYDAY).
    const dayMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    const readingDayIndices = [0, 1, 2, 3, 4, 5, 6].filter(
      (i) => !graceDaySet.has(i)
    );
    const rrule =
      readingDayIndices.length === 7
        ? "RRULE:FREQ=DAILY"
        : `RRULE:FREQ=WEEKLY;BYDAY=${readingDayIndices.map((i) => dayMap[i]).join(",")}`;

    // Format start date as YYYYMMDD for all-day event
    const dtstart = startDate.replace(/-/g, "");

    // Finish date — use duration result or parsed goal date
    const finishDate = mode === "duration"
      ? (durationResult?.finishDate ?? new Date())
      : parseDateInput(goalDate);
    // UNTIL in ICS must be the day after the last recurrence (exclusive end)
    const until = new Date(finishDate);
    until.setDate(until.getDate() + 1);
    const untilStr = until.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const uid = `brc-${Date.now()}@creategood`;
    const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Create Good//Bible Reading Calculator//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `${rrule};UNTIL=${untilStr}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bible-reading-plan.ics";
    a.click();
    URL.revokeObjectURL(url);
  }, [mode, scopes, translation, minutesPerDay, startDate, goalDate, graceDaySet, durationResult, paceResult, origin]);

  const STORAGE_KEY = "brc-state-v1";

  // Restore state on mount: URL params take priority, then localStorage, then defaults
  useEffect(() => {
    const today = todayString();
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const oneYearOut = d.toISOString().split("T")[0];

    const p = new URLSearchParams(window.location.search);
    const hasUrlParams = p.has("t") || p.has("sc") || p.has("mode");

    if (hasUrlParams) {
      // Restore from URL
      if (p.get("t")) setTranslationKey(p.get("t") as TranslationKey);
      if (p.get("rs")) setReadingStyle(p.get("rs") as ReadingStyle);
      if (p.get("sc")) {
        const keys = p.get("sc")!.split(",").filter(Boolean) as ScopeKey[];
        if (keys.length > 0) setScopes(keys);
      }
      if (p.get("mpd")) setMinutesPerDay(Number(p.get("mpd")));
      if (p.get("sd")) setStartDate(p.get("sd")!);
      else setStartDate(today);
      if (p.get("gdate")) setGoalDate(p.get("gdate")!);
      else setGoalDate(oneYearOut);
      if (p.get("mode")) setMode(p.get("mode") as Mode);
      if (p.get("gd")) {
        const g = Number(p.get("gd"));
        const dpw = Number(p.get("dpw") ?? 7);
        const set = new Set<number>();
        for (let i = dpw - g; i < dpw; i++) set.add(i);
        setGraceDaySet(set);
      }
    } else {
      // Restore from localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const s = JSON.parse(saved);
          if (s.mode) setMode(s.mode);
          if (s.translationKey) setTranslationKey(s.translationKey);
          if (s.readingStyle) setReadingStyle(s.readingStyle);
          if (s.scopes?.length) setScopes(s.scopes);
          if (s.minutesPerDay) setMinutesPerDay(s.minutesPerDay);
          if (s.startDate) setStartDate(s.startDate);
          else setStartDate(today);
          if (s.goalDate) setGoalDate(s.goalDate);
          else setGoalDate(oneYearOut);
          if (s.graceDays?.length) setGraceDaySet(new Set(s.graceDays));
        } else {
          setStartDate(today);
          setGoalDate(oneYearOut);
        }
      } catch {
        setStartDate(today);
        setGoalDate(oneYearOut);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state to localStorage on every change
  useEffect(() => {
    if (!startDate) return; // don't save before hydration
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mode,
        translationKey,
        readingStyle,
        scopes,
        minutesPerDay,
        startDate,
        goalDate,
        graceDays: [...graceDaySet],
      }));
    } catch {
      // localStorage unavailable (private browsing, etc.) — silently ignore
    }
  }, [mode, translationKey, readingStyle, scopes, minutesPerDay, startDate, goalDate, graceDaySet]);

  const sustainabilityBg =
    results.sustainability.level === "great" ||
    results.sustainability.level === "solid"
      ? "bg-[#E6F3F3] border-[#0D6E6E]/20"
      : results.sustainability.level === "slow"
      ? "bg-stone-50 border-stone-200"
      : "bg-amber-50 border-amber-200";

  return (
    <article>
      {/* Page header */}
      <div className="pt-8 pb-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#D97706] mb-2">
          Scripture
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3 leading-tight">
          How Long Does It Take to Read the Bible?
        </h1>
        <p
          className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Reading through the Bible is one of the most formative habits a
          follower of Jesus can build. This free{" "}
          <strong>bible reading calculator</strong>{" "}
          helps you find a pace that&apos;s actually sustainable — whether
          you&apos;re wondering{" "}
          <em>how long to read the Bible</em> at your current schedule, or
          building a <strong>bible reading plan</strong> toward a specific date.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mb-8">
        <div
          className="inline-flex rounded-xl border border-stone-200 bg-white p-1"
          role="group"
          aria-label="Calculator mode"
        >
          <button
            onClick={() => setMode("duration")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "duration"
                ? "bg-[#0D6E6E] text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            How long will it take?
          </button>
          <button
            onClick={() => setMode("pace")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "pace"
                ? "bg-[#0D6E6E] text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            How much do I need to read?
          </button>
        </div>
      </div>

      {/* Calculator layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-12">
        {/* ── Inputs panel ── */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-7">

          {/* Start date (mode 1) or Goal date (mode 2) */}
          {mode === "duration" ? (
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-semibold text-stone-800 mb-2"
              >
                Start date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent bg-[#FAFAF8]"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="goal-date"
                className="block text-sm font-semibold text-stone-800 mb-2"
              >
                Goal finish date
              </label>
              <input
                id="goal-date"
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent bg-[#FAFAF8]"
              />
            </div>
          )}

          {/* Minutes per day — mode 1 only */}
          {mode === "duration" && (
            <TrackSlider
              id="minutes-per-day"
              label="Minutes per day"
              value={minutesPerDay}
              min={1}
              max={120}
              color="#0D6E6E"
              displayValue={`${minutesPerDay} min`}
              minLabel="1 min"
              maxLabel="2 hrs"
              tickPositions={[15, 30, 45, 60, 75, 90, 105, 120]}
              snapToTicks={false}
              onChange={setMinutesPerDay}
            />
          )}

          {/* Days per week — toggle each day between reading and grace */}
          <WeekDayPicker
            graceDaySet={graceDaySet}
            onToggle={toggleGraceDay}
          />

          {/* Divider */}
          <div className="border-t border-stone-100" />

          {/* Translation */}
          <fieldset>
            <legend className="block text-sm font-semibold text-stone-800 mb-2">
              Translation
            </legend>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 mb-3">
              {TRANSLATIONS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTranslationKey(t.key)}
                  className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all ${
                    translationKey === t.key
                      ? "bg-[#0D6E6E] text-white border-[#0D6E6E]"
                      : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                  aria-pressed={translationKey === t.key}
                >
                  {t.key}
                </button>
              ))}
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Word counts vary by translation. Formal translations (KJV, NASB,
              ESV) take slightly longer to read than thought-for-thought
              translations (NIV, NLT, CSB).
            </p>
          </fieldset>

          {/* Reading style */}
          <fieldset>
            <legend className="block text-sm font-semibold text-stone-800 mb-2">
              Reading style
            </legend>
            <div className="flex rounded-xl border border-stone-200 overflow-hidden">
              {READING_STYLES.map((style, i) => (
                <button
                  key={style.key}
                  onClick={() => setReadingStyle(style.key)}
                  className={`flex-1 py-2.5 px-3 text-sm font-medium transition-all ${
                    i !== 0 ? "border-l border-stone-200" : ""
                  } ${
                    readingStyle === style.key
                      ? "bg-[#0D6E6E] text-white"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                  aria-pressed={readingStyle === style.key}
                >
                  {style.label}
                  <span
                    className={`block text-xs mt-0.5 font-normal ${
                      readingStyle === style.key
                        ? "text-white/70"
                        : "text-stone-400"
                    }`}
                  >
                    {style.description}
                  </span>
                </button>
              ))}
            </div>
            {readingStyle === "listening" && (
              <p className="text-xs text-stone-400 mt-2">
                Listening at 1.25x speed? Use ~185 WPM — select Reading style
                for a closer estimate.
              </p>
            )}
          </fieldset>

          {/* Scope */}
          <ScopeSelector scopes={scopes} onToggle={toggleScope} />
        </div>

        {/* ── Results panel ── */}
        <div className="space-y-4">
          {/* Primary result */}
          <div className="bg-[#0D6E6E] rounded-2xl p-6 text-white">
            {/* Selected sections */}
            <p className="text-xs text-white/50 mb-3 leading-snug">
              {scopes
                .map((k) => SCOPES.find((s) => s.key === k)?.label ?? k)
                .join(" · ")}
            </p>
            {mode === "duration" ? (
              <>
                <p className="text-sm text-white/70 font-medium mb-1">
                  You&apos;ll finish on
                </p>
                <p className="text-2xl font-bold leading-tight mb-1">
                  {durationResult ? formatDate(durationResult.finishDate) : "—"}
                </p>
                <p className="text-sm text-white/60">
                  {durationResult?.calendarDays} calendar days •{" "}
                  {durationResult?.totalReadingDays} reading days
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-white/70 font-medium mb-1">
                  You need to read
                </p>
                <p className="text-3xl font-bold mb-1">
                  {paceResult?.minutesPerDay} min/day
                </p>
                <p className="text-sm text-white/60">
                  to finish by {formatDateShort(parseDateInput(goalDate))}
                </p>
              </>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs text-stone-500 mb-1">Chapters/session</p>
              <p className="text-2xl font-bold text-stone-900">
                {results.chaptersPerSession}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <p className="text-xs text-stone-500 mb-1">Pages/session</p>
              <p className="text-2xl font-bold text-stone-900">
                {results.pagesPerSession}
              </p>
            </div>
          </div>

          {/* Sustainability */}
          <div
            className={`rounded-xl border p-4 ${sustainabilityBg}`}
          >
            <div className="flex items-start gap-3">
              <div>
                <p
                  className={`text-sm font-semibold ${results.sustainability.color}`}
                >
                  {results.sustainability.label}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {results.sustainability.description}
                </p>
              </div>
            </div>
          </div>

          {/* Milestones */}
          {scopes.includes("whole") &&
            (results.milestones.gospelsDate ||
              results.milestones.ntDate ||
              results.milestones.halfwayDate) && (
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                  Milestones
                </h3>
                <ul className="space-y-2.5">
                  {results.milestones.halfwayDate && (
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#0D6E6E] shrink-0" />
                      <div>
                        <p className="text-xs text-stone-500">Halfway point</p>
                        <p className="text-sm font-medium text-stone-800">
                          {formatDateShort(results.milestones.halfwayDate)}
                        </p>
                      </div>
                    </li>
                  )}
                  {results.milestones.gospelsDate && (
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#0D6E6E] shrink-0" />
                      <div>
                        <p className="text-xs text-stone-500">
                          Finish the Gospels
                        </p>
                        <p className="text-sm font-medium text-stone-800">
                          {formatDateShort(results.milestones.gospelsDate)}
                        </p>
                      </div>
                    </li>
                  )}
                  {results.milestones.ntDate && (
                    <li className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#0D6E6E] shrink-0" />
                      <div>
                        <p className="text-xs text-stone-500">
                          Finish the New Testament
                        </p>
                        <p className="text-sm font-medium text-stone-800">
                          {formatDateShort(results.milestones.ntDate)}
                        </p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            )}

          {/* Translation note */}
          <p className="text-xs text-stone-400 text-center px-2">
            Calculated for{" "}
            <span className="font-medium">
              {translation.fullName} ({translation.key})
            </span>{" "}
            · {aggregateWords(translation, scopes).toLocaleString()} words
          </p>
        </div>
      </div>

      {/* ── Share & Export ── */}
      <section className="mb-12" aria-label="Share your reading plan">
        <h2 className="text-xl font-bold text-stone-900 mb-1">Save or share your plan</h2>
        <p className="text-sm text-stone-500 mb-5">Keep this for yourself or send it to a friend.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          {/* Copy link */}
          <button
            onClick={() => copyToClipboard("url", shareUrl)}
            className="flex flex-col items-start gap-2 bg-white rounded-xl border border-stone-200 p-4 hover:border-[#0D6E6E] transition-colors text-left group"
          >
            <span className="text-sm font-semibold text-stone-800 group-hover:text-[#0D6E6E]">
              {copied === "url" ? "Copied!" : "Copy link"}
            </span>
            <span className="text-xs text-stone-400">
              Share a link that restores your exact settings.
            </span>
          </button>

          {/* Copy as text */}
          <button
            onClick={() => copyToClipboard("text", shareText)}
            className="flex flex-col items-start gap-2 bg-white rounded-xl border border-stone-200 p-4 hover:border-[#0D6E6E] transition-colors text-left group"
          >
            <span className="text-sm font-semibold text-stone-800 group-hover:text-[#0D6E6E]">
              {copied === "text" ? "Copied!" : "Copy as text"}
            </span>
            <span className="text-xs text-stone-400">
              Copy a plain-text summary to paste anywhere.
            </span>
          </button>

          {/* Email to self */}
          <a
            href={mailtoLink}
            className="flex flex-col items-start gap-2 bg-white rounded-xl border border-stone-200 p-4 hover:border-[#0D6E6E] transition-colors group"
          >
            <span className="text-sm font-semibold text-stone-800 group-hover:text-[#0D6E6E]">
              Email to myself
            </span>
            <span className="text-xs text-stone-400">
              Opens your mail app with your plan pre-filled.
            </span>
          </a>

          {/* Print / Save as PDF */}
          <button
            onClick={() => window.print()}
            className="flex flex-col items-start gap-2 bg-white rounded-xl border border-stone-200 p-4 hover:border-[#0D6E6E] transition-colors text-left group"
          >
            <span className="text-sm font-semibold text-stone-800 group-hover:text-[#0D6E6E]">
              Print / Save as PDF
            </span>
            <span className="text-xs text-stone-400">
              Use your browser&apos;s &ldquo;Save as PDF&rdquo; to keep a copy.
            </span>
          </button>

          {/* Add to Calendar */}
          <button
            onClick={downloadCalendar}
            className="flex flex-col items-start gap-2 bg-white rounded-xl border border-stone-200 p-4 hover:border-[#0D6E6E] transition-colors text-left group"
          >
            <span className="text-sm font-semibold text-stone-800 group-hover:text-[#0D6E6E]">
              Add to Calendar
            </span>
            <span className="text-xs text-stone-400">
              Downloads a .ics file — opens in Apple Calendar, Google Calendar, or Outlook.
            </span>
          </button>

        </div>
      </section>

      {/* ── Benchmark cards ── */}
      <section className="mb-12" aria-label="Reading benchmarks">
        <h2 className="text-xl font-bold text-stone-900 mb-1">
          Common reading benchmarks
        </h2>
        <p className="text-sm text-stone-500 mb-5">
          Based on {translation.fullName} at reading pace (200 WPM)
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benchmarks.map((b, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-stone-200 p-4"
            >
              <p className="text-2xl font-bold text-[#0D6E6E] mb-1">
                {b.minutesPerDay} min/day
              </p>
              <p className="text-sm text-stone-700 font-medium mb-0.5">
                {b.scopeLabel}
              </p>
              <p className="text-sm text-stone-500">{b.timeframe}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mb-12" aria-label="Frequently asked questions">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">
          Frequently asked questions
        </h2>
        <div className="max-w-3xl divide-y divide-stone-100">
          {[
            {
              q: "How long does it take to read the Bible?",
              a: "At a comfortable reading pace of 200 words per minute, the entire Bible takes roughly 70–80 hours to read. Reading just 15 minutes per day, you can finish the whole Bible in about a year. The exact time depends on your translation — formal translations like KJV and NASB have more words than thought-for-thought translations like NIV or NLT.",
            },
            {
              q: "How long does it take to read the New Testament?",
              a: "The New Testament contains approximately 180,000 words and takes roughly 15–18 hours to read at a normal pace of 200 WPM. At 15 minutes per day, you can complete the New Testament in about 3–4 months. Most people find it easier to read consecutively because it's shorter and more narrative-driven than the Old Testament.",
            },
            {
              q: "How long does it take to read the Old Testament?",
              a: "The Old Testament contains approximately 550,000 words and takes roughly 45–55 hours to read at 200 WPM. At 15 minutes per day, reading the entire Old Testament takes roughly 8–10 months. Many reading plans recommend pairing Old and New Testament passages each day to keep variety.",
            },
            {
              q: "How many chapters should I read per day to finish the Bible in a year?",
              a: "To read the whole Bible in one year, plan for 3–4 chapters per day. At a reading pace of 200 WPM, that takes about 15–20 minutes daily. The exact number depends on your translation — KJV chapters tend to be longer than NIV — and whether you're reading, studying, or listening.",
            },
            {
              q: "Is 15 minutes a day enough to read the Bible in a year?",
              a: "Yes — for most translations, 15 minutes per day at a normal reading pace (around 200 WPM) is enough to complete the whole Bible in approximately one year. Some translations with more words (like KJV or NASB) may take slightly longer at that pace.",
            },
            {
              q: "Which Bible translation is easiest to read through?",
              a: "Thought-for-thought translations like the NLT, NIV, and The Message are generally the easiest to read through quickly, as they use more natural modern English. Formal equivalence translations like the ESV, KJV, and NASB are excellent for study but may feel denser to read.",
            },
            {
              q: "What's the difference between reading and studying the Bible?",
              a: "Reading means moving through the text at a steady pace to grasp the narrative and overall message — similar to reading a book. Studying means slowing down to examine individual passages closely, cross-reference, and reflect deeply. Both are valuable. This calculator supports both modes: reading pace (~200 WPM) and studying pace (~100 WPM).",
            },
            {
              q: "Can I use this for an audio Bible?",
              a: "Yes. Select the 'Listening' reading style, which uses approximately 150 WPM — close to the natural narration speed of most audio Bibles. If you listen at 1.25x speed, you can use around 185 WPM for a more accurate estimate.",
            },
          ].map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ── Share this calculator ── */}
      <section
        className="rounded-2xl p-8 mb-6 text-center"
        style={{ backgroundColor: "#E6F3F3" }}
        aria-label="Share this calculator"
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-[#0D6E6E] mb-3">
          Create Good
        </p>
        <h2
          className="text-2xl font-bold text-stone-900 mb-3"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Know someone who wants to read the Bible?
        </h2>
        <p className="text-stone-600 mb-6 max-w-md mx-auto">
          Share this calculator with a friend, small group, or church community.
        </p>
        <ShareCalculatorButton />
      </section>

      {/* ── Stay connected ── */}
      <section
        className="rounded-2xl p-8 mb-4 text-center border border-stone-200 bg-white"
        aria-label="Stay connected"
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-3">
          Stay Connected
        </p>
        <h2
          className="text-2xl font-bold text-stone-900 mb-3"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Get updates from Create Good
        </h2>
        <p className="text-stone-500 mb-6 max-w-md mx-auto text-sm">
          New tools, resources, and opportunities — straight to your inbox.
        </p>
        <a
          href="https://tally.so/r/EkJerB"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 rounded-xl bg-[#0D6E6E] text-white text-sm font-semibold hover:bg-[#0A5A5A] transition-colors"
        >
          Stay in touch
        </a>
        <p className="text-xs text-stone-400 mt-3">No spam. Unsubscribe any time.</p>
      </section>
    </article>
  );
}

// ─── ShareCalculatorButton ───────────────────────────────────────────────────

function ShareCalculatorButton() {
  const [copied, setCopied] = React.useState(false);
  const url = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
      <button
        onClick={handleCopy}
        className="px-6 py-3 rounded-xl bg-[#0D6E6E] text-white text-sm font-semibold hover:bg-[#0A5A5A] transition-colors"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=How+long+does+it+take+to+read+the+Bible%3F+This+free+calculator+helps+you+find+a+sustainable+pace.&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-colors"
      >
        Share on X
      </a>
    </div>
  );
}

// ─── FaqItem ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
        aria-expanded={open}
      >
        <h3 className="text-base font-semibold text-stone-800 group-hover:text-[#0D6E6E] transition-colors">
          {q}
        </h3>
        <span
          className="shrink-0 text-stone-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open && (
        <p className="text-stone-600 leading-relaxed text-sm pb-4">
          {a}
        </p>
      )}
    </div>
  );
}

// ─── ScopeSelector ───────────────────────────────────────────────────────────

interface ScopeSelectorProps {
  scopes: ScopeKey[];
  onToggle: (key: ScopeKey) => void;
}

const OT_SECTIONS: ScopeKey[] = [
  "the-law",
  "historical",
  "wisdom",
  "major-prophets",
  "minor-prophets",
];
const NT_SECTIONS: ScopeKey[] = [
  "gospels",
  "acts",
  "pauline",
  "general-epistles",
  "revelation",
];

function ScopeButton({
  s,
  selected,
  onToggle,
}: {
  s: Scope;
  selected: boolean;
  onToggle: (key: ScopeKey) => void;
}) {
  return (
    <button
      onClick={() => onToggle(s.key)}
      className={`w-full py-2.5 px-3 rounded-xl text-sm font-medium border transition-all text-left ${
        selected
          ? "bg-[#0D6E6E] text-white border-[#0D6E6E]"
          : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
      }`}
      aria-pressed={selected}
    >
      {s.label}
      <span
        className={`block text-xs mt-0.5 font-normal leading-snug ${
          selected ? "text-white/70" : "text-stone-400"
        }`}
      >
        {s.books}
      </span>
    </button>
  );
}

function ScopeSelector({ scopes, onToggle }: ScopeSelectorProps) {
  const getScopeData = (key: ScopeKey) => SCOPES.find((s) => s.key === key)!;

  return (
    <fieldset>
      <legend className="block text-sm font-semibold text-stone-800 mb-1">
        What are you reading?
      </legend>
      <p className="text-xs text-stone-400 mb-3">Select one or more sections.</p>

      {/* Whole Bible — full width */}
      <div className="mb-2">
        <ScopeButton
          s={getScopeData("whole")}
          selected={scopes.includes("whole")}
          onToggle={onToggle}
        />
      </div>

      {/* OT / NT — 50/50 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(["ot", "nt"] as ScopeKey[]).map((key) => (
          <ScopeButton
            key={key}
            s={getScopeData(key)}
            selected={scopes.includes(key)}
            onToggle={onToggle}
          />
        ))}
      </div>

      {/* OT Sections */}
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
        Old Testament
      </p>
      <div className="grid grid-cols-1 gap-1.5 mb-4">
        {OT_SECTIONS.map((key) => {
          const s = getScopeData(key);
          return (
            <ScopeButton
              key={key}
              s={s}
              selected={scopes.includes(key)}
              onToggle={onToggle}
            />
          );
        })}
      </div>

      {/* NT Sections */}
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
        New Testament
      </p>
      <div className="grid grid-cols-1 gap-1.5">
        {NT_SECTIONS.map((key) => {
          const s = getScopeData(key);
          return (
            <ScopeButton
              key={key}
              s={s}
              selected={scopes.includes(key)}
              onToggle={onToggle}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

// ─── WeekDayPicker ───────────────────────────────────────────────────────────

const DAY_LABELS = ["Su", "M", "T", "W", "Th", "F", "Sa"];

interface WeekDayPickerProps {
  graceDaySet: Set<number>;
  onToggle: (i: number) => void;
}

function WeekDayPicker({ graceDaySet, onToggle }: WeekDayPickerProps) {
  const readingDays = 7 - graceDaySet.size;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-semibold text-stone-800">Days per week</span>
        <span className="text-sm">
          <span className="font-bold" style={{ color: "#0D6E6E" }}>{readingDays} reading</span>
          {graceDaySet.size > 0 && (
            <span className="font-semibold" style={{ color: "#5FAAAA" }}>
              {" "}· {graceDaySet.size} grace
            </span>
          )}
        </span>
      </div>

      <div className="flex gap-1.5" role="group" aria-label="Days per week">
        {DAY_LABELS.map((label, i) => {
          const isGrace = graceDaySet.has(i);
          return (
            <button
              key={i}
              onClick={() => onToggle(i)}
              className="flex-1 flex items-center justify-center py-4 rounded-lg text-sm font-bold transition-colors duration-100 select-none"
              style={{
                backgroundColor: isGrace ? "#A8D5D5" : "#0D6E6E",
                color: isGrace ? "#0D6E6E" : "white",
              }}
              aria-pressed={!isGrace}
              title={isGrace ? "Tap to mark as reading day" : "Tap to mark as grace day"}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-stone-400 mt-2">
        All days start as reading days.{" "}
        <span style={{ color: "#5FAAAA" }} className="font-medium">Tap any day</span> to mark it as a grace day you expect to miss — tap again to restore it.
      </p>
    </div>
  );
}

// ─── TrackSlider ─────────────────────────────────────────────────────────────

interface TrackSliderProps {
  id: string;
  label: string;
  hideLabel?: boolean;
  value: number;
  min: number;
  max: number;
  color: string;
  displayValue: string;
  minLabel: string;
  maxLabel: string;
  /** Absolute values at which to place tick marks (e.g. [15,30,45,...,120]) */
  tickPositions?: number[];
  /** Evenly-spaced tick count (legacy, use tickPositions for precise control) */
  tickCount?: number;
  /** Whether dragging snaps to tickPositions. Default true if tickPositions provided. */
  snapToTicks?: boolean;
  onChange: (val: number) => void;
}

function TrackSlider({
  id,
  label,
  hideLabel = false,
  value,
  min,
  max,
  color,
  displayValue,
  minLabel,
  maxLabel,
  tickPositions,
  tickCount,
  snapToTicks = true,
  onChange,
}: TrackSliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  // Track whether the pointer moved during the current press so we can
  // distinguish a pure click (no movement) from a drag-then-release.
  const didDragRef = React.useRef(false);
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  // Build tick percentages: prefer tickPositions, fall back to tickCount
  const ticks: number[] = tickPositions
    ? tickPositions
        .filter((v) => v >= min && v <= max)
        .map((v) => ((v - min) / (max - min)) * 100)
    : tickCount && tickCount > 1
    ? Array.from({ length: tickCount }, (_, i) => (i / (tickCount - 1)) * 100)
    : [];

  return (
    <div>
      {!hideLabel && (
        <div className="flex items-baseline justify-between mb-3">
          <label htmlFor={id} className="text-sm font-semibold text-stone-800">
            {label}:{" "}
            <span className="font-bold ml-2" style={{ color }}>{displayValue}</span>
          </label>
        </div>
      )}

      {/* Track container — py-4 gives 44px+ touch area on mobile */}
      <div ref={trackRef} className="relative py-4">
        {/* Background track */}
        <div className="relative h-1.5 rounded-full" style={{ backgroundColor: "#E7E5E4" }}>
          {/* Filled portion */}
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-75"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>

        {/* Tick marks — pointer-events none, purely visual */}
        {ticks.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {ticks.map((tickPct, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${tickPct}%`,
                  top: "50%",
                  width: "2px",
                  height: "10px",
                  borderRadius: "1px",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: tickPct <= pct ? "rgba(255,255,255,0.9)" : "#C7C4C1",
                }}
              />
            ))}
          </div>
        )}

        {/* Range input — handles all drag interaction */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onMouseDown={() => { didDragRef.current = false; }}
          onTouchStart={() => { didDragRef.current = false; }}
          onMouseMove={() => { didDragRef.current = true; }}
          onTouchMove={() => { didDragRef.current = true; }}
          onChange={(e) => onChange(Number(e.target.value))}
          onClick={(e) => {
            // Only snap on a pure click (no drag movement during the press).
            if (didDragRef.current) return;
            if (!tickPositions || tickPositions.length === 0) return;
            const raw = Number((e.target as HTMLInputElement).value);
            const nearest = tickPositions.reduce((a, b) =>
              Math.abs(b - raw) < Math.abs(a - raw) ? b : a
            );
            const nearestPct = ((nearest - min) / (max - min)) * 100;
            const rawPct = ((raw - min) / (max - min)) * 100;
            // Snap only when click lands within 4% of a tick mark.
            if (Math.abs(nearestPct - rawPct) <= 4) onChange(nearest);
          }}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ margin: 0, height: "100%" }}
          aria-label={hideLabel ? label : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={displayValue}
        />

        {/* Thumb — corrected for half-thumb inset so it tracks the native input accurately */}
        <div
          className="absolute top-1/2 w-5 h-5 rounded-full shadow-md border-2 border-white transition-all duration-75 pointer-events-none"
          style={{ left: `${pct}%`, transform: "translate(-50%, -50%)", backgroundColor: color }}
        />
      </div>

      {/* Min / max labels */}
      <div className="flex justify-between text-xs text-stone-400 mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
