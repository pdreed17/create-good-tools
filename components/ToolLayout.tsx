import Link from "next/link";
import { tools, type Tool } from "@/lib/toolsConfig";

interface ToolLayoutProps {
  toolSlug: string;
  children: React.ReactNode;
}

export default function ToolLayout({ toolSlug, children }: ToolLayoutProps) {
  const tool = tools.find((t) => t.slug === toolSlug);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAFAF8" }}>
      {/* Site Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="https://creategood.com"
            className="font-semibold text-stone-800 hover:text-[#0D6E6E] transition-colors text-sm"
          >
            Create Good
          </Link>
          <Link
            href="/tools"
            className="text-sm text-stone-500 hover:text-[#0D6E6E] transition-colors"
          >
            All Tools →
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 w-full">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-stone-500">
          <Link href="/tools" className="hover:text-[#0D6E6E] transition-colors">
            Tools
          </Link>
          {tool && (
            <>
              <span>/</span>
              <span className="text-stone-700">{tool.title}</span>
            </>
          )}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pb-16 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white/60 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-stone-500">
            Free tools from{" "}
            <Link
              href="https://creategood.com"
              className="text-[#0D6E6E] hover:underline font-medium"
            >
              Create Good
            </Link>{" "}
            — a community for Christ-centered creatives
          </p>
          <Link
            href="/tools"
            className="text-sm text-stone-500 hover:text-[#0D6E6E] transition-colors"
          >
            ← Browse all tools
          </Link>
        </div>
      </footer>
    </div>
  );
}

// Standalone coming-soon wrapper for scaffold pages
export function ComingSoonPage({ tool }: { tool: Tool }) {
  return (
    <ToolLayout toolSlug={tool.slug}>
      <div className="py-16 text-center max-w-xl mx-auto">
        <div className="text-5xl mb-6">{tool.icon}</div>
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full bg-stone-100 text-stone-500 mb-4">
          Coming Soon
        </span>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">{tool.title}</h1>
        <p className="text-stone-600 leading-relaxed mb-10 font-serif">{tool.description}</p>

        {/* Notify form placeholder */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 text-left">
          <h2 className="text-base font-semibold text-stone-800 mb-1">
            Get notified when this launches
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Join the Create Good newsletter and we&apos;ll let you know.
          </p>
          <form
            action="#"
            method="post"
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              aria-label="Email address"
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D6E6E] focus:border-transparent bg-[#FAFAF8]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0D6E6E] text-white text-sm font-medium hover:bg-[#0A5A5A] transition-colors"
            >
              Notify me
            </button>
          </form>
        </div>

        <div className="mt-8">
          <Link
            href="/tools"
            className="text-sm text-[#0D6E6E] hover:underline font-medium"
          >
            ← See tools that are live now
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}
