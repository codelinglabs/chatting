import type { ReactNode } from "react";

function PanelShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function VisitorsFeatureIllustration() {
  return (
    <PanelShell className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <p className="text-sm font-semibold text-slate-900">Live visitors</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Visitors browsing right now</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          4 online
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {[
          { name: "Visitor on /pricing", meta: "London, UK · 8m on page", active: true },
          { name: "Visitor on /demo", meta: "Berlin, DE · 3m on page" },
          { name: "Visitor on /integrations", meta: "Austin, US · 2m on page" }
        ].map((visitor) => (
          <div
            key={visitor.name}
            className={`rounded-[18px] border p-4 ${visitor.active ? "border-blue-200 bg-blue-50 shadow-[0_10px_24px_rgba(37,99,235,0.12)]" : "border-slate-200 bg-white"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{visitor.name}</p>
                <p className="mt-1 text-xs text-slate-500">{visitor.meta}</p>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${visitor.active ? "bg-blue-600" : "bg-emerald-500"}`} />
            </div>
            {visitor.active ? (
              <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-xs font-medium text-blue-700">Start conversation</div>
            ) : null}
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

export function OfflineFeatureIllustration() {
  return (
    <div className="relative">
      <PanelShell className="bg-[linear-gradient(180deg,#fffaf0_0%,#ffffff_100%)]">
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Offline mode</p>
              <p className="mt-1 text-xs text-slate-500">Never lose a lead</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">2:47 AM</span>
          </div>
          <div className="mt-4 rounded-[20px] bg-slate-50 p-4">
            <p className="text-base font-semibold text-slate-900">We&apos;ll reply by email</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Leave your details and we&apos;ll pick this up first thing.</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-400">Your email</div>
              <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-400">How can we help?</div>
            </div>
          </div>
        </div>
      </PanelShell>

      <div className="absolute -bottom-7 left-8 max-w-[17rem] rounded-[22px] border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_18px_38px_rgba(15,23,42,0.16)]">
        <p className="text-xs font-semibold">Reply continues by email</p>
        <div className="mt-3 space-y-2 text-[12px]">
          <div className="rounded-2xl bg-white/10 px-3 py-2">Thanks, here&apos;s the link and pricing breakdown.</div>
          <div className="rounded-2xl bg-blue-500 px-3 py-2">Perfect, can we start next week?</div>
        </div>
      </div>
    </div>
  );
}

function RoutingTeamNode({
  initials,
  label,
  tone
}: {
  initials: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-semibold ${tone}`}>{initials}</div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{label}</p>
    </div>
  );
}

export function SmartRoutingFeatureIllustration() {
  return (
    <PanelShell className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
      <div className="relative h-[360px] rounded-[22px] border border-slate-200 bg-white p-6">
        <svg aria-hidden="true" viewBox="0 0 420 260" className="pointer-events-none absolute inset-x-0 top-0 h-[320px] w-full">
          <path d="M210 52 V92" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M210 136 V152" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M210 152 L115 210" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M210 152 L305 210" stroke="#CBD5E1" strokeWidth="1.5" />
        </svg>

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
            <span className="text-base text-slate-400">💬</span>
            New chat
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="relative h-16 w-16 rotate-45 rounded-[18px] border border-blue-200 bg-blue-50">
            <div className="absolute inset-0 flex -rotate-45 items-center justify-center text-center text-[11px] font-semibold leading-4 text-blue-700">
              Which
              <br />
              page?
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-[86px] top-[166px] rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-500">
          /pricing
        </div>
        <div className="pointer-events-none absolute right-[80px] top-[166px] rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-500">
          /support
        </div>

        <div className="mt-16 grid grid-cols-2 gap-10">
          <RoutingTeamNode initials="SA" label="Sales Team" tone="bg-emerald-100 text-emerald-700" />
          <RoutingTeamNode initials="SP" label="Support Team" tone="bg-violet-100 text-violet-700" />
        </div>
      </div>
    </PanelShell>
  );
}
