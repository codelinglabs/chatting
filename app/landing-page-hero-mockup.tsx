import { LandingPageLauncherIcon } from "./landing-page-launcher-icon";

function HeroSiteScene() {
  return (
    <div className="relative h-full px-5 pb-10 pt-6 opacity-60 sm:px-6 sm:pb-12 sm:pt-7" style={{ filter: "saturate(0.86)" }}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-16 rounded-full bg-slate-300" />
            <div className="h-9 w-44 rounded-full bg-slate-300/85" />
            <div className="h-3 w-36 rounded-full bg-slate-200" />
          </div>
          <div className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-500">
            Monthly billing
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[0.94fr_1.06fr]">
          <div className="space-y-4 rounded-[26px] border border-white/80 bg-white/80 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]">
            <div className="h-3 w-16 rounded-full bg-slate-200" />
            <div className="h-8 w-20 rounded-full bg-slate-300/80" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-100" />
              <div className="h-3 w-[84%] rounded-full bg-slate-100" />
              <div className="h-3 w-[68%] rounded-full bg-slate-100" />
            </div>
            <div className="rounded-[20px] bg-slate-50 p-3">
              <div className="h-3 w-20 rounded-full bg-slate-200" />
              <div className="mt-3 h-10 rounded-[16px] bg-slate-200/85" />
            </div>
          </div>

          <div className="space-y-4 rounded-[26px] border border-blue-100 bg-blue-50/65 p-5 shadow-[0_16px_40px_rgba(37,99,235,0.08)]">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded-full bg-blue-200" />
              <div className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white">Popular</div>
            </div>
            <div className="h-8 w-24 rounded-full bg-blue-600/15" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-white/85" />
              <div className="h-3 w-[82%] rounded-full bg-white/85" />
              <div className="h-3 w-[68%] rounded-full bg-white/85" />
            </div>
            <div className="rounded-[20px] bg-white/80 p-3">
              <div className="h-3 w-24 rounded-full bg-blue-100" />
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-[88%] rounded-full bg-slate-100" />
                  <div className="h-3 w-[64%] rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
            <div className="rounded-[20px] bg-white/72 p-3">
              <div className="h-3 w-28 rounded-full bg-slate-200" />
              <div className="mt-3 h-12 rounded-[16px] bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroChatWindow({ animated }: { animated: boolean }) {
  const windowClass = animated ? "hero-loop-window" : "";
  const statusClass = animated ? "hero-status-dot" : "";
  const proactiveClass = animated ? "hero-chat-proactive" : "";
  const typingClass = animated ? "hero-chat-typing" : "";
  const visitorClass = animated ? "hero-chat-visitor" : "";
  const replyClass = animated ? "hero-chat-reply" : "";

  return (
    <div className={`absolute bottom-7 right-5 z-20 flex h-[452px] w-[80%] max-w-[328px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(37,99,235,0.16)] ${windowClass}`}>
      <div className="rounded-t-[24px] bg-blue-600 px-4 py-3.5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/18 text-sm font-semibold text-white">
              C
            </div>
            <div>
              <p className="text-sm font-semibold">Chatting Team</p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-blue-100">
                <span className={`h-2 w-2 rounded-full bg-emerald-300 ${statusClass}`} />
                Usually replies in minutes
              </div>
            </div>
          </div>
          <span className="pt-1 text-sm text-white/70">×</span>
        </div>
      </div>

      <div className="relative flex-1 bg-white px-5 py-6 text-sm">
        <div className={`absolute right-5 top-6 max-w-[248px] rounded-[18px] rounded-br-md bg-blue-600 px-4 py-3 text-white ${proactiveClass}`}>
          Questions about our plans?
        </div>

        <div className={`absolute left-5 top-[110px] rounded-full bg-blue-50 px-4 py-2 text-xs text-slate-500 ${typingClass}`}>
          <div className="flex items-center gap-2">
            <span className="typing-dot h-2 w-2 rounded-full bg-blue-400" />
            <span className="typing-dot h-2 w-2 rounded-full bg-blue-600" />
            <span className="typing-dot h-2 w-2 rounded-full bg-blue-500" />
            <span>Visitor is typing...</span>
          </div>
        </div>

        <div className={`absolute left-5 top-[110px] max-w-[232px] rounded-[18px] rounded-bl-md bg-slate-100 px-4 py-3 text-slate-700 ${visitorClass}`}>
          Do you offer monthly billing?
        </div>

        <div className={`absolute right-5 top-[198px] flex max-w-[252px] items-end gap-2 ${replyClass}`}>
          <div className="rounded-[18px] rounded-br-md bg-blue-600 px-4 py-3 text-white">
            Yes! All plans are month-to-month, cancel anytime.
          </div>
          <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700">
            S
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-4">
        <div className="flex items-center justify-between rounded-full bg-slate-50 px-4 py-3.5 text-[13px] text-slate-400">
          <span>Type a message...</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-base text-white">→</span>
        </div>
      </div>
    </div>
  );
}

function HeroBrowserShell({ animated }: { animated: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="absolute inset-x-10 bottom-2 h-10 rounded-full bg-slate-900/10 blur-2xl" />
      <div className="absolute inset-x-12 top-3 h-24 rounded-full bg-blue-100/75 blur-3xl" />
      <div className="absolute right-8 top-12 h-32 w-32 rounded-full bg-amber-100/60 blur-3xl" />

      <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-[0_28px_90px_rgba(15,23,42,0.14)] backdrop-blur">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/95 px-5 py-4">
          <span className="h-3 w-3 rounded-full bg-rose-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-300" />
          <div className="ml-4 rounded-full border border-slate-200 bg-white px-4 py-1 text-[11px] font-medium text-slate-400">
            pricing.yoursite.com
          </div>
        </div>

        <div className="relative h-[560px] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] sm:h-[580px]">
          <HeroSiteScene />
          {animated ? (
            <div className="hero-loop-launcher absolute bottom-7 right-5 z-30">
              <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_38px_rgba(37,99,235,0.32)]">
                <LandingPageLauncherIcon />
              </div>
            </div>
          ) : null}
          <HeroChatWindow animated={animated} />
        </div>
      </div>
    </div>
  );
}

export function LandingHeroMockup() {
  return <HeroBrowserShell animated={true} />;
}
