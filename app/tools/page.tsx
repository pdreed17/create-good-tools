import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/toolsConfig";
import ToolSuggestion from "./ToolSuggestion";

export const metadata: Metadata = {
  title: "Free Tools for Creatives | Create Good",
  description:
    "Free interactive tools to help you grow in faith, stewardship, and creativity. Bible reading calculators, scripture memory trackers, and more — from Create Good.",
  alternates: {
    canonical: "https://creategoodnow.com/tools",
  },
  openGraph: {
    title: "Free Tools for Creatives | Create Good",
    description:
      "Free interactive tools to help you grow in faith, stewardship, and creativity.",
    url: "https://creategoodnow.com/tools",
  },
};

export default function ToolsHub() {
  const liveTools = tools.filter((t) => t.status === "live");
  const comingSoonTools = tools.filter((t) => t.status === "coming-soon");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAF8" }}>
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="https://creategoodnow.com"
            className="font-semibold text-stone-800 hover:text-[#0D6E6E] transition-colors text-sm"
          >
            Create Good
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* Hero */}
        <div className="pt-14 pb-10 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#D97706] mb-4">
            Create Good Tools
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-5 leading-tight">
            Free tools for{" "}
            <span style={{ color: "#0D6E6E" }}>Christ-centered</span> creatives
          </h1>
          <p
            className="text-lg text-stone-600 leading-relaxed"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Simple, free calculators and planners to help you go deeper in Scripture,
            stewardship, and your creative calling. No sign-up required.
          </p>
        </div>

        {/* Live tools */}
        {liveTools.length > 0 && (
          <section aria-label="Live tools" className="mb-12">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-4">
              Available now
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group bg-white rounded-2xl border border-stone-200 p-6 hover:border-[#0D6E6E] hover:shadow-md transition-all duration-200"
                >
                  <span className="text-xs font-medium text-[#D97706] tracking-wide uppercase mb-1 block">
                    {tool.category}
                  </span>
                  <h3 className="font-semibold text-stone-900 mb-2 group-hover:text-[#0D6E6E] transition-colors leading-snug">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 text-sm font-medium text-[#0D6E6E] flex items-center gap-1">
                    Open tool
                    <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tool suggestion */}
        <ToolSuggestion />

        {/* Coming soon tools */}
        {comingSoonTools.length > 0 && (
          <section aria-label="Coming soon tools">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-400 mb-4">
              Coming soon
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {comingSoonTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group bg-white/60 rounded-2xl border border-stone-200 p-6 opacity-70 hover:opacity-90 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold tracking-wide uppercase rounded-full bg-stone-100 text-stone-400 px-2.5 py-1">
                      Coming soon
                    </span>
                  </div>
                  <span className="text-xs font-medium text-stone-400 tracking-wide uppercase mb-1 block">
                    {tool.category}
                  </span>
                  <h3 className="font-semibold text-stone-500 mb-2 leading-snug">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-stone-200 bg-white/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-sm text-stone-500">
            Made with care by{" "}
            <Link
              href="https://creategoodnow.com"
              className="text-[#0D6E6E] hover:underline font-medium"
            >
              Create Good
            </Link>{" "}
            — a community and newsletter for Christ-centered creatives
          </p>
        </div>
      </footer>
    </div>
  );
}
