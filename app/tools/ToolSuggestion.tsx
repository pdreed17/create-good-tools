export default function ToolSuggestion() {
  return (
    <section className="mb-12">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-2xl">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          What tool would you benefit from?
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          We build tools for Christ-centered creatives. Tell us what would help you.
        </p>
        <iframe
          src="https://tally.so/embed/vGOVlQ?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
          width="100%"
          height="220"
          frameBorder={0}
          title="Tool Suggestion"
        />
      </div>
    </section>
  );
}
