import Link from "next/link";
import { ButtonLink } from "./components/ui/Button";
import { pillars } from "./landing-page-data";
import { PillarIcon, SectionLabel } from "./landing-page-primitives";

export function LandingTopSections() {
  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFBF5_0%,#FFFFFF_100%)]">
        <div className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_34%)]" />
        <div className="relative mx-auto w-full max-w-[1240px] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <section className="grid gap-16 px-2 pb-20 pt-16 lg:grid-cols-[minmax(0,1fr)_396px] lg:items-center lg:pt-24">
            <div className="max-w-2xl">
              <h1 className="display-font text-5xl leading-[0.96] text-slate-900 sm:text-6xl lg:text-7xl">
                Live chat
                <br />
                <span className="text-blue-600">for small teams. No tickets. No enterprise bloat.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                White-label your widget, watch live visitors, reply from a shared inbox, and keep the same
                conversation going by email when nobody is online.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href="/signup"
                  trailingIcon={<span aria-hidden="true">→</span>}
                >
                  Start free
                </ButtonLink>
                <ButtonLink
                  href="#pricing"
                  variant="secondary"
                >
                  See pricing
                </ButtonLink>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                <a href="#how-it-works" className="transition hover:text-slate-900">
                  See how install works
                </a>
              </div>

              <div className="mt-10">
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  Operating hours, proactive chat, install verification, analytics exports, and weekly reports.
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[396px]">
              <div className="float-badge pointer-events-none absolute left-6 -top-12 z-10 hidden rounded-full border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.08)] xl:block">
                White-label widget
              </div>
              <div className="relative">
                <div className="absolute inset-x-10 top-0 h-24 rounded-b-full bg-blue-100/70 blur-3xl" />
                <div className="relative shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
                  <div className="flex items-center justify-between rounded-t-[28px] bg-blue-600 px-5 py-4 text-white">
                    <div>
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true">👋</span>
                        <span className="text-sm font-semibold">Chatting Team</span>
                      </div>
                      <p className="mt-1 text-xs text-white/80">Online • Shared inbox live</p>
                    </div>
                    <div className="flex items-center gap-4 text-lg text-white/90">
                      <span aria-hidden="true">−</span>
                      <span aria-hidden="true">×</span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-b-[28px] bg-[#FFFDF9]">
                    <div className="space-y-4 px-5 py-5">
                      <div className="message-enter max-w-[78%] rounded-[18px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-700">
                        Hi! Quick question about your pricing page...
                        <div className="mt-2 text-[11px] text-slate-400">2:34 PM</div>
                      </div>
                      <div
                        className="message-enter ml-auto max-w-[82%] rounded-[18px] rounded-br-md bg-blue-600 px-4 py-3 text-sm text-white"
                        style={{ animationDelay: "120ms" }}
                      >
                        Hey! Happy to help. What would you like to know? 😊
                        <div className="mt-2 text-[11px] text-blue-100">2:35 PM</div>
                      </div>
                      <div
                        className="message-enter max-w-[68%] rounded-[18px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-700"
                        style={{ animationDelay: "220ms" }}
                      >
                        Do you have a free trial?
                        <div className="mt-2 text-[11px] text-slate-400">2:36 PM</div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs text-slate-500">
                        <span className="typing-dot h-2 w-2 rounded-full bg-blue-600" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-blue-600" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-blue-600" />
                        Sarah is typing...
                      </div>
                    </div>
                    <div className="border-t border-slate-200 bg-white px-5 py-4">
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                        <span className="flex-1">Type a message...</span>
                        <span className="glow-send inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 px-2 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <h2 className="display-font text-4xl leading-tight text-slate-900 sm:text-5xl">
                Talk to visitors while they&apos;re still deciding
              </h2>
              <p className="mt-5 text-xl font-medium leading-8 text-slate-800 sm:text-2xl">
                They&apos;re on your pricing page. They&apos;re hovering over the buy button.
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                They just need one quick answer, but without live chat they disappear into a contact form or leave for
                someone easier to reach.
              </p>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                No tickets, no queue theater, no support-suite detour. Just a faster way to answer while intent is still high.
              </p>
            </div>
            <div className="flex flex-col justify-center lg:pl-12">
              <div className="rounded-[28px] border border-slate-200 bg-[#FFFBF5] p-8 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">What small teams need</p>
                <h3 className="mt-4 text-3xl font-semibold leading-tight text-slate-900">
                  Website chat that helps you answer now, then follow up later without switching tools.
                </h3>
                <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
                  <li>White-label widget with colors, welcome copy, operating hours, and proactive prompts</li>
                  <li>Live visitors, real-time inbox updates, and shared context while someone is still browsing</li>
                  <li>Offline email capture plus threaded follow-up replies when the team is away</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-slate-50">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl px-2">
            <SectionLabel>Shipped Strengths</SectionLabel>
            <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl">
              The product story is simple: widget, visitors, inbox
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Chatting is built for small teams that want website live chat, not a help desk, not a CRM, and not a
              suite full of ticketing ceremony.
            </p>
          </div>

          <div className="mt-12 grid gap-6 px-2 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="hover-lift rounded-[28px] border border-slate-200/80 bg-white/85 p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <PillarIcon icon={pillar.icon} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-slate-900">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      
    </>
  );
}
