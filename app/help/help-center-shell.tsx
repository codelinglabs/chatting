import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ChatBubbleIcon } from "../dashboard/dashboard-ui";

export function formatHelpCenterDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function HelpCenterBody({ body }: { body: string }) {
  const paragraphs = body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <div className="space-y-5 text-[15px] leading-8 text-slate-700">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}:${paragraph.slice(0, 24)}`} className="whitespace-pre-wrap">{paragraph}</p>
      ))}
    </div>
  );
}

export function HelpCenterShell({
  siteName,
  title,
  intro,
  children,
  backHref,
  backLabel = "Back"
}: {
  siteName: string;
  title: string;
  intro: string;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#ffffff_35%,#f8fafc_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)]">
              <ChatBubbleIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Help center</p>
              <p className="text-base font-semibold text-slate-900">{siteName}</p>
            </div>
          </Link>
          {backHref ? <Link href={backHref as Route} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">{backLabel}</Link> : null}
        </div>
      </header>

      <section className="mx-auto max-w-[860px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white px-7 py-8 shadow-[0_20px_48px_rgba(15,23,42,0.06)] sm:px-10 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">{siteName}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{intro}</p>
          <div className="mt-10">{children}</div>
        </div>
      </section>
    </main>
  );
}
