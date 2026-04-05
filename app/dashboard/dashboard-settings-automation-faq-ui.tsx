"use client";

import type { SVGProps } from "react";

export function AutomationSectionLabel({ label }: { label: string }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>;
}

export function AutomationHowItWorksPanel() {
  return (
    <div className="space-y-3">
      <AutomationSectionLabel label="How it works" />
      <div className="rounded-xl bg-slate-50 px-5 py-4">
        <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
          <AutomationHowItWorksStep number="1" title="Visitor sends" detail="first message" />
          <AutomationHowItWorksArrow />
          <AutomationHowItWorksStep number="2" title="Matching FAQs" detail="shown to visitor" />
          <AutomationHowItWorksArrow />
          <AutomationHowItWorksStep number="3" title="If none help," detail="connect to team" />
        </div>
      </div>
    </div>
  );
}

function AutomationHowItWorksStep({
  number,
  title,
  detail
}: {
  number: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="text-center">
      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">{number}</span>
      <p className="mt-3 text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function AutomationHowItWorksArrow() {
  return <p className="hidden text-lg text-slate-300 md:block">→</p>;
}

export function AutomationHelpCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.8 9.25a2.35 2.35 0 1 1 3.7 1.9c-.95.68-1.5 1.18-1.5 2.35" />
      <circle cx="12" cy="16.75" r=".6" fill="currentColor" stroke="none" />
    </svg>
  );
}
