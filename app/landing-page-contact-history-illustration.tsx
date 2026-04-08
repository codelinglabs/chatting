const visitStats = [
  { value: "3 visits", label: "Visitor history" },
  { value: "2 weeks ago", label: "First seen" },
  { value: "24 min", label: "Total time" }
] as const;

const pageHistory = [
  { page: "/pricing", time: "2m" },
  { page: "/features", time: "1m" },
  { page: "/blog/live-chat-tips", time: "4m" },
  { page: "/ (homepage)", time: "30s" }
] as const;

const previousChats = [
  { title: "How do I install the widget?", date: "2 weeks ago" },
  { title: "Pricing question", date: "1 month ago" }
] as const;

function SectionLabel({ children }: { children: string }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{children}</p>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-[13px]">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function InboxPreviewRow({ active = false }: { active?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-[14px] px-3 py-3 ${active ? "border border-blue-200 bg-white" : "border border-slate-200/80 bg-white/80"}`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
          JM
        </div>
        <div className="min-w-0 flex-1">
          <div className={`h-2.5 rounded-full ${active ? "w-8 bg-slate-300" : "w-7 bg-slate-200"}`} />
          <div className={`mt-2 h-2.5 rounded-full ${active ? "w-10 bg-slate-200" : "w-8 bg-slate-100"}`} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: (typeof visitStats)[number]) {
  return (
    <div className="rounded-[14px] bg-slate-50 px-3 py-3">
      <p className="text-sm font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">{label}</p>
    </div>
  );
}

export function ContactHistoryFeatureIllustration() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_18px_46px_rgba(15,23,42,0.08)]">
      <div className="grid h-[520px] w-full grid-cols-[118px_minmax(0,1fr)] overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="border-r border-slate-200 bg-slate-50/85 px-3 py-4">
          <div className="space-y-3">
            <InboxPreviewRow active />
            <InboxPreviewRow />
            <InboxPreviewRow />
            <InboxPreviewRow />
          </div>
        </div>

        <aside className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4">
          <div className="flex h-full flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                JM
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[18px] font-semibold leading-tight text-slate-900">James Mitchell</p>
                    <p className="mt-1 truncate text-[13px] text-slate-600">james@company.com</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[13px] text-slate-500">London, UK</p>
                    <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                      Returning visitor
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <SectionLabel>Visit stats</SectionLabel>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {visitStats.map((stat) => (
                  <StatCard key={stat.value} {...stat} />
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <SectionLabel>This visit</SectionLabel>
              <div className="mt-2">
                <div className="flex items-center justify-between gap-3 py-1.5 text-[13px]">
                  <span className="text-slate-500">Current page</span>
                  <span className="inline-flex items-center gap-2 font-medium text-slate-900">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    /pricing
                  </span>
                </div>
                <DetailRow label="Time on page" value="2m 34s" />
                <DetailRow label="Referrer" value="Google search" />
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between gap-3">
                <SectionLabel>Pages viewed</SectionLabel>
                <span className="text-[12px] font-medium text-blue-600">View all</span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {pageHistory.map((entry) => (
                  <div key={entry.page} className="flex items-center justify-between gap-3 rounded-[12px] bg-slate-50 px-3 py-2 text-[13px]">
                    <span className="truncate text-slate-700">{entry.page}</span>
                    <span className="shrink-0 text-slate-500">{entry.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <SectionLabel>Previous chats</SectionLabel>
              <div className="mt-2.5 space-y-2">
                {previousChats.map((chat) => (
                  <div key={chat.title} className="rounded-[12px] bg-slate-50 px-3 py-3">
                    <p className="text-[13px] font-medium leading-5 text-slate-900">{chat.title}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500">{chat.date}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        Resolved
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
