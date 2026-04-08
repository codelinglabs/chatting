const faqArticles = [
  "How does billing work?",
  "Can I change my plan later?",
  "What payment methods do you accept?"
] as const;

function ArticleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-slate-500">
      <path d="M6 3.5h5.5L15 7v9a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 16V5A1.5 1.5 0 0 1 6.5 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M11.5 3.5V7H15" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function ArticleCard({ title, active = false }: { title: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex w-full items-start gap-3 rounded-[16px] border px-4 py-3 text-left ${
        active ? "border-blue-200 bg-blue-50/70 shadow-[0_8px_24px_rgba(37,99,235,0.1)]" : "border-slate-200 bg-white"
      }`}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-slate-100">
        <ArticleIcon />
      </span>
      <span className="text-sm font-medium leading-6 text-slate-800">{title}</span>
    </button>
  );
}

export function FAQSuggestionsFeatureIllustration() {
  return (
    <div className="relative mx-auto max-w-[430px] rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_18px_46px_rgba(15,23,42,0.08)]">
      <div className="mx-auto w-full max-w-[332px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_48px_rgba(15,23,42,0.14)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-slate-900">Help &amp; Support</p>
            <div className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
              Pricing page
            </div>
          </div>
          <span className="text-sm font-medium text-slate-400">×</span>
        </div>

        <div className="space-y-3 px-4 py-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">Common questions</p>
          {faqArticles.map((article, index) => (
            <ArticleCard key={article} title={article} active={index === 1} />
          ))}
        </div>

        <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-4">
          <p className="text-sm font-medium text-slate-700">Still need help?</p>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-between rounded-[14px] bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
          >
            <span>Chat with our team</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
