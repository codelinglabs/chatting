import { LandingPageLauncherIcon } from "./landing-page-launcher-icon";
import { LandingWhatItDoesPanelFrame } from "./landing-page-what-it-does-panel-frame";

export function LandingWhatItDoesWidgetPanel({ lifted = true }: { lifted?: boolean }) {
  return (
    <LandingWhatItDoesPanelFrame address="pricing.yoursite.com" className={lifted ? "self-start lg:translate-y-5" : "self-start"}>
      <div className="relative h-[364px] overflow-hidden rounded-[20px] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent_34%),linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] p-4">
        <div className="space-y-4 opacity-55">
          <div className="h-3 w-16 rounded-full bg-slate-200" />
          <div className="h-9 w-40 rounded-full bg-slate-300/80" />
          <div className="grid gap-3">
            <div className="rounded-[20px] bg-white/84 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75)]">
              <div className="h-3 w-14 rounded-full bg-slate-200" />
              <div className="mt-4 h-16 rounded-[16px] bg-slate-100" />
            </div>
            <div className="rounded-[20px] bg-blue-50/70 p-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-14 rounded-full bg-blue-200" />
                <div className="h-5 w-14 rounded-full bg-blue-200/80" />
              </div>
              <div className="mt-4 h-16 rounded-[16px] bg-white/80" />
            </div>
          </div>
        </div>
        <div className="absolute left-4 top-5 z-20 w-[236px] rounded-[18px] border border-blue-200 bg-white px-4 py-3.5 shadow-[0_12px_28px_rgba(37,99,235,0.12)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">Trigger</p>
          <p className="mt-2 text-sm leading-5 text-slate-700">On /pricing for 30+ seconds</p>
        </div>
        <svg aria-hidden="true" viewBox="0 0 152 116" className="pointer-events-none absolute left-[212px] top-[96px] z-10 hidden h-[116px] w-[152px] md:block">
          <path d="M1 1 H88 V76 H128" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
          <path d="M122 70 L130 76 L122 82" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <div className="what-does-proactive-launcher absolute bottom-4 right-4 z-10 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_34px_rgba(37,99,235,0.28)]">
          <LandingPageLauncherIcon />
        </div>
        <div className="what-does-proactive-window absolute bottom-5 right-4 z-20 w-[272px] overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_22px_54px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3.5 text-white">
            <div>
              <p className="text-sm font-semibold">Chatting Team</p>
              <p className="mt-1 text-[11px] text-blue-100">Usually replies in minutes</p>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="bg-white px-4 py-5">
            <div className="what-does-proactive-message flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700">C</div>
              <div className="min-w-0 flex-1">
                <div className="max-w-[188px] rounded-[16px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
                  Questions about our plans?
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">Auto</span>
                  <p className="text-[11px] text-slate-400">Just now</p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 px-4 py-3.5">
            <div className="rounded-[16px] bg-slate-50 px-4 py-3 text-sm text-slate-400">Type a message...</div>
          </div>
        </div>
      </div>
    </LandingWhatItDoesPanelFrame>
  );
}
