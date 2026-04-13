"use client";

import { useState } from "react";

export default function ToolSuggestion() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    // mailto opens their mail app with the suggestion pre-filled
    const subject = encodeURIComponent("Tool suggestion for Create Good");
    const body = encodeURIComponent(
      `Hi Create Good,\n\nI'd love to see a tool that helps with:\n\n${value.trim()}\n\nThanks!`
    );
    window.location.href = `mailto:tools@creategood.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <section className="mb-12">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-2xl">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          What tool would you benefit from?
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          We build tools for Christ-centered creatives. Tell us what would help you.
        </p>

        {submitted ? (
          <p className="text-sm font-medium text-[#0D6E6E]">
            Thanks — your mail app should have opened with your suggestion. We read every one.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. a prayer journaling tracker, a giving calculator..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent bg-[#FAFAF8] text-stone-800 placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#0D6E6E] text-white text-sm font-semibold hover:bg-[#0A5A5A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Send suggestion
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
