import { LandingWhatItDoesPanelFrame } from "./landing-page-what-it-does-panel-frame";

const inboxThreads = [
  { name: "James Mitchell", preview: "Do you offer monthly billing or...", tags: ["Pricing", "Hot lead"], time: "2m", initials: "JM", avatar: "bg-blue-100 text-blue-700", selected: true, unread: true },
  { name: "Sarah Kim", preview: "How do I connect Slack to my...", tags: ["Integration"], time: "8m", initials: "SK", avatar: "bg-violet-100 text-violet-700", selected: false, unread: false },
  { name: "Ryan Lopez", preview: "Widget isn't showing on mobile...", tags: ["Bug"], time: "24m", initials: "RL", avatar: "bg-rose-100 text-rose-700", selected: false, unread: false },
  { name: "Aisha Thompson", preview: "Thanks! That fixed it.", tags: ["Resolved"], time: "1h", initials: "AT", avatar: "bg-emerald-100 text-emerald-700", selected: false, unread: false }
] as const;

const inboxTagTone: Record<string, string> = { Pricing: "bg-blue-100 text-blue-700", "Hot lead": "bg-emerald-100 text-emerald-700", Integration: "bg-violet-100 text-violet-700", Bug: "bg-rose-100 text-rose-700", Resolved: "bg-emerald-100 text-emerald-700" };

export function LandingWhatItDoesInboxPanel({ className }: { className?: string }) {
  return (
    <LandingWhatItDoesPanelFrame address="inbox.chatting.app" className={className}>
      <div className="grid min-h-[392px] grid-cols-[216px_minmax(0,1fr)] overflow-hidden rounded-[20px] border border-slate-200 bg-white xl:grid-cols-[228px_minmax(0,1fr)]">
        <div className="border-r border-slate-200 bg-slate-50/90 p-3.5">
          <div className="px-1 pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Inbox</p>
                <p className="mt-1 text-[11px] text-slate-500">4 active chats</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">1 new</span>
            </div>
          </div>
          <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
            {inboxThreads.map((thread, index) => (
              <div key={thread.name} className={`relative px-3.5 py-3 ${thread.selected ? "bg-blue-50/60" : "bg-white"} ${index > 0 ? "border-t border-slate-200" : ""}`}>
                {thread.selected ? <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-blue-600" /> : null}
                <div className="flex items-start gap-3 pl-1">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${thread.avatar}`}>{thread.initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {thread.unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" /> : null}
                        <p className="truncate text-sm font-semibold text-slate-900">{thread.name}</p>
                      </div>
                      <span className="text-[11px] text-slate-400">{thread.time}</span>
                    </div>
                    <p className="mt-1 truncate text-[12px] text-slate-500">{thread.preview}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {thread.tags.map((tag) => (
                        <span key={tag} className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${inboxTagTone[tag]}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700">JM</div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-slate-900">James Mitchell</p>
                <p className="mt-1 truncate text-[12px] text-slate-500">/pricing · London</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">Pricing lead</span>
          </div>
          <div className="flex flex-1 flex-col gap-3 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-5 py-6 text-sm">
            <div className="w-fit max-w-[72%] rounded-[18px] rounded-bl-md bg-slate-100 px-4 py-3 text-slate-700">Do you offer monthly billing?</div>
            <div className="ml-auto w-fit max-w-[72%] rounded-[18px] rounded-br-md bg-blue-600 px-4 py-3 text-white shadow-[0_10px_24px_rgba(37,99,235,0.16)]">Yep. Plans are month-to-month.</div>
          </div>
          <div className="border-t border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
              <span className="flex-1">Reply to James...</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-base text-white">→</span>
            </div>
          </div>
        </div>
      </div>
    </LandingWhatItDoesPanelFrame>
  );
}
