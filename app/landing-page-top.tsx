import Link from "next/link";
import { CheckIcon } from "./dashboard/dashboard-ui";
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
                Talk to your visitors.
                <br />
                <span className="text-blue-600">Not at them.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Live chat that feels like a conversation between friends, not a support ticket.
                Built for small teams who care about every customer.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-7 py-4 text-center text-base font-semibold text-white transition hover:scale-[1.02] hover:bg-blue-700"
                >
                  Start chatting free
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href="#features"
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:scale-[1.02] hover:border-slate-300"
                >
                  See it in action
                </a>
              </div>

              <div className="mt-10">
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  Trusted by 2,400+ teams who reply in minutes, not hours.
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[396px]">
              <div className="float-badge pointer-events-none absolute left-6 -top-12 z-10 hidden rounded-full border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.08)] xl:block">
                ⚡ Reply in 1.2 min
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
                      <p className="mt-1 text-xs text-white/80">Online • Replies in minutes</p>
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
                        <div className="mt-2 text-[11px] text-blue-100">2:35 PM ✓✓</div>
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
                Your visitors have questions. Right now.
              </h2>
              <p className="mt-5 text-xl font-medium leading-8 text-slate-800 sm:text-2xl">
                They're on your pricing page. They're hovering over the buy button.
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                They just need one quick answer, but your contact form sends them into a black hole.
              </p>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                By the time you email back, they've already found a competitor who was actually there.
              </p>
            </div>
            <div className="flex flex-col justify-center lg:pl-12">
              <div className="h-1.5 w-32 rounded-full bg-blue-600" />
              <div className="mt-8 text-7xl font-bold tracking-tight text-slate-900">67%</div>
              <p className="mt-4 max-w-xs text-xl font-semibold leading-8 text-slate-900">
                of visitors leave without buying when they can't get instant answers
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-slate-50">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl px-2">
            <SectionLabel>Why Chatting</SectionLabel>
            <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl">
              Be there the moment it matters
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Real conversations that turn browsers into buyers, without the enterprise complexity.
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
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <div className="text-xl font-semibold text-slate-900">{pillar.stat}</div>
                  <p className="mt-1 text-sm text-slate-500">{pillar.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      
    </>
  );
}
