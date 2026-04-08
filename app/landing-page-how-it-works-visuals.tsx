import type { ReactNode } from "react";
import { codeSnippet } from "./landing-page-data";

const installPlatforms = ["WordPress", "Webflow", "Shopify", "Squarespace", "HTML"];

function StepShell({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function InstallSnippetVisual() {
  const src = codeSnippet().match(/src="([^"]+)"/)?.[1] ?? "";

  return (
    <StepShell>
      <div className="overflow-hidden rounded-[24px] bg-[#111318] text-[12px] text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_20px_40px_rgba(15,23,42,0.16)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-300">Copy</span>
        </div>
        <pre className="overflow-x-auto px-4 py-4 font-mono leading-7">
          <code>
            <span className="text-rose-300">&lt;script</span>
            {"\n"}
            <span className="pl-4 text-sky-300">src=</span>
            <span className="text-emerald-300">&quot;{src}&quot;</span>
            {"\n"}
            <span className="pl-4 text-sky-300">data-site-id=</span>
            <span className="text-emerald-300">&quot;your-site-id&quot;</span>
            {"\n"}
            <span className="text-rose-300">&gt;&lt;/script&gt;</span>
          </code>
        </pre>
      </div>
      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Works everywhere</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {installPlatforms.map((platform) => (
            <span
              key={platform}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-500"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    </StepShell>
  );
}

export function CustomizeStepVisual() {
  return (
    <StepShell>
      <div className="space-y-5 px-1 text-sm text-slate-700">
        <p className="text-sm font-semibold text-slate-900">Widget Settings</p>
        <div>
          <p className="font-medium text-slate-900">Brand color</p>
          <div className="mt-2 flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3">
            <span className="h-8 w-8 rounded-[10px] bg-blue-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)]" />
            <span className="font-semibold text-slate-900">#2563EB</span>
            <span className="ml-auto rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
              color picker
            </span>
          </div>
        </div>
        <div>
          <p className="font-medium text-slate-900">Welcome message</p>
          <div className="mt-2 rounded-[18px] border border-slate-200 bg-white px-3 py-3 text-slate-600">
            Hey! How can we help today?
          </div>
        </div>
        <div>
          <p className="font-medium text-slate-900">Position</p>
          <div className="mt-2 flex gap-2">
            <span className="rounded-full border border-slate-200 px-3 py-1.5 text-[12px] text-slate-500">Left</span>
            <span className="rounded-full bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white">Right</span>
          </div>
        </div>
        <div>
          <p className="font-medium text-slate-900">Business hours</p>
          <div className="mt-2 flex gap-2 text-[12px] text-slate-500">
            <span className="rounded-full border border-slate-200 px-3 py-1.5">Mon-Fri</span>
            <span className="rounded-full border border-slate-200 px-3 py-1.5">9:00-6:00</span>
          </div>
        </div>
        <button className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Save changes</button>
      </div>
    </StepShell>
  );
}

export function StartTalkingStepVisual() {
  return (
    <StepShell>
      <div className="space-y-4 sm:relative sm:min-h-[320px] sm:space-y-0">
        <div className="w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_22px_48px_rgba(15,23,42,0.08)] sm:ml-[110px]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
                JM
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">James Mitchell</p>
                <p className="truncate text-xs text-slate-500">On /team now</p>
              </div>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">Live</span>
          </div>
          <div className="space-y-3 px-4 py-4 text-sm">
            <div className="max-w-[220px] rounded-[16px] rounded-bl-md bg-slate-100 px-3 py-2.5 text-slate-700">
              Can teammates share one inbox?
            </div>
            <div className="ml-auto max-w-[230px] rounded-[16px] rounded-br-md bg-blue-600 px-3 py-2.5 text-white">
              Yep, everyone replies in one place.
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm">
            <span className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-slate-400">Type reply...</span>
            <span className="rounded-full bg-slate-900 px-3 py-2 font-semibold text-white">Send</span>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:absolute sm:bottom-3 sm:left-0 sm:w-[188px]">
          <div className="flex items-center justify-between rounded-t-[22px] bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
            <span>Chat with us</span>
            <span>x</span>
          </div>
          <div className="space-y-3 px-4 py-4 text-sm">
            <div className="max-w-[150px] rounded-[16px] rounded-bl-md bg-slate-100 px-3 py-2.5 text-slate-700">
              Questions about your team setup?
            </div>
            <div className="ml-auto max-w-[130px] rounded-[16px] rounded-br-md bg-blue-600 px-3 py-2.5 text-white">
              Can teammates share one inbox?
            </div>
          </div>
          <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-400">Type a message...</div>
        </div>

        <div className="pointer-events-none hidden sm:absolute sm:left-[78px] sm:top-[124px] sm:block sm:h-px sm:w-12 sm:border-t sm:border-dashed sm:border-slate-300" />
      </div>
    </StepShell>
  );
}
