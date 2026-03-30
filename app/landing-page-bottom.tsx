import { Button } from "./components/ui/Button";
import { CheckIcon } from "./dashboard/dashboard-ui";
import { LandingConversionSections } from "./landing-page-conversion-sections";
import { LandingFinalCtaFooter } from "./landing-page-final-cta-footer";
import { LandingProofSections } from "./landing-page-proof-sections";
import { SectionLabel } from "./landing-page-primitives";

export function LandingBottomSections() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-14 px-2 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <h2 className="display-font text-4xl text-slate-900 sm:text-5xl">One inbox for your entire team</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Every conversation in one place. See who&apos;s handling what. Jump in when teammates need backup.
                No more &ldquo;Did anyone reply to this?&rdquo;
              </p>
              <ul className="mt-8 space-y-4 text-sm leading-7 text-slate-600">
                <li>All conversations, one view</li>
                <li>Filter by open, resolved, or everything</li>
                <li>Assign, tag, and hand off seamlessly</li>
                <li>Keyboard shortcuts for power users</li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-[34px] border border-slate-200/90 bg-[#FCFDFE] shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
              <div className="grid min-h-[540px] lg:grid-cols-[192px_minmax(0,1.35fr)_208px]">
                <div className="border-b border-slate-200 bg-slate-50/80 p-4 lg:border-b-0 lg:border-r">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 font-medium text-slate-700">
                      <span>All</span>
                      <span>12</span>
                    </div>
                    <div className="flex items-center justify-between rounded-[18px] bg-blue-50 px-4 py-3 font-medium text-blue-700">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-[radial-gradient(circle_at_30%_30%,#60A5FA,transparent_28%),#2563EB]" />
                        Open
                      </span>
                      <span>5</span>
                    </div>
                    <div className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 font-medium text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <CheckIcon className="h-4 w-4" />
                        Resolved
                      </span>
                      <span>7</span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      ["Alex Chen", "2m", "Quick question about pricing..."],
                      ["Emma Wilson", "8m", "Is there a free trial?"],
                      ["Jordan Park", "1h", "Thanks for the help!"]
                    ].map(([name, time, preview], index) => (
                      <div
                        key={name}
                        className={`rounded-[22px] border px-4 py-3 text-sm ${
                          index === 0
                            ? "border-blue-200 bg-white shadow-[0_10px_24px_rgba(37,99,235,0.08)]"
                            : "border-transparent bg-white/75"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-900">{name}</span>
                          <span className="text-xs text-slate-400">{time}</span>
                        </div>
                        <p className="mt-2 truncate text-slate-500">{preview}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-b border-slate-200 bg-white px-6 py-5 lg:border-b-0 lg:border-r">
                  <div className="border-b border-slate-200 pb-5">
                    <p className="text-sm font-semibold text-slate-900">Alex Chen</p>
                    <p className="mt-1 text-sm text-slate-500">alex@example.com</p>
                  </div>

                  <div className="space-y-4 py-5">
                    <div className="max-w-[76%] rounded-[18px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm leading-7 text-slate-700">
                      Quick question about pricing...
                    </div>
                    <div className="ml-auto max-w-[88%] rounded-[18px] rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-7 text-white">
                      Happy to help! What would you like to know?
                    </div>
                  </div>
                </div>

                <div className="bg-[#FCFDFE] px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      AC
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Alex Chen</p>
                      <p className="text-sm text-slate-500">alex@example.com</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Current page</p>
                      <p className="mt-2 font-medium text-blue-600">/pricing</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Location</p>
                      <p className="mt-2 text-slate-700">San Francisco, CA</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Tags</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">lead</span>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">pricing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 grid gap-14 px-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["AC", "Alex Chen", "San Francisco, CA", "/pricing"],
                  ["EW", "Emma Wilson", "London, UK", "/features"]
                ].map(([initials, name, location, page]) => (
                  <div key={name} className="hover-lift rounded-[26px] border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {initials}
                      </div>
                      <span className="text-xs font-medium text-emerald-600">● Online</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{name}</h3>
                    <p className="mt-3 text-sm text-slate-600">📍 {location}</p>
                    <p className="mt-2 text-sm font-medium text-blue-600">📄 {page}</p>
                    <Button type="button" size="md" fullWidth className="mt-5">
                      Start chat
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <SectionLabel>Visitor Intelligence</SectionLabel>
              <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl">See who&apos;s on your site right now</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Watch visitors browse in real-time. Spot high-intent prospects on your pricing page.
                Start conversations before they leave.
              </p>
              <ul className="mt-8 space-y-4 text-sm leading-7 text-slate-600">
                <li>Live visitor list with current page</li>
                <li>Location, browser, and time on site</li>
                <li>Conversation history at your fingertips</li>
                <li>Proactively reach out to hot leads</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <LandingProofSections />
      <LandingConversionSections />
      <LandingFinalCtaFooter />
    </>
  );
}
