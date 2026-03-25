import Link from "next/link";

function codeSnippet() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

  return `<script
  src="${appUrl}/widget.js"
  data-site-id="your-site-id"
  data-brand-color="#0f766e"
  data-greeting="Ask us anything before you bounce"
></script>`;
}

export default function HomePage() {
  return (
    <main className="grain min-h-screen px-6 py-8 sm:px-10 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="glass-panel flex flex-col gap-6 rounded-[2rem] px-6 py-6 shadow-glow sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-tide">SaaS founder chat</p>
            <h1 className="display-font mt-3 max-w-2xl text-4xl leading-tight text-ink sm:text-6xl">
              Talk to users before they leave and see what is blocking conversion.
            </h1>
          </div>
          <div className="flex flex-col gap-3 text-sm text-slate-700 sm:min-w-[260px]">
            <Link
              href="/login"
              className="rounded-full bg-ink px-5 py-3 text-center font-semibold text-white transition hover:translate-y-[-1px]"
            >
              Create account
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-black/10 px-5 py-3 text-center font-semibold text-ink transition hover:border-black/25"
            >
              Open dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-[2rem] p-8 shadow-glow">
            <p className="text-sm uppercase tracking-[0.28em] text-tide">What this SaaS does</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <article className="rounded-[1.5rem] bg-white/80 p-5">
                <h2 className="text-xl font-semibold text-ink">Embeddable widget</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Vanilla JS bubble, chat panel, customizable greeting and brand color, no visitor
                  login required.
                </p>
              </article>
              <article className="rounded-[1.5rem] bg-white/80 p-5">
                <h2 className="text-xl font-semibold text-ink">Per-account ownership</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Each account owns its own sites, inbox, tags, and replies instead of sharing one
                  admin password.
                </p>
              </article>
              <article className="rounded-[1.5rem] bg-white/80 p-5">
                <h2 className="text-xl font-semibold text-ink">Founder inbox</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review threads, tag objections, and reply from one dashboard without real-time
                  infrastructure.
                </p>
              </article>
              <article className="rounded-[1.5rem] bg-white/80 p-5">
                <h2 className="text-xl font-semibold text-ink">Email loop</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Founder replies go out by email, users can reply back into the thread, and every
                  reply can collect helpful feedback.
                </p>
              </article>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-highlight">Positioning</p>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
              <li>Talk to users before they leave.</li>
              <li>See what is blocking your conversions in real time.</li>
              <li>Every question becomes a revenue signal you can tag and learn from.</li>
            </ul>

            <div className="mt-8 rounded-[1.5rem] bg-ink p-5 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Widget snippet</p>
              <pre className="mt-4 overflow-x-auto text-xs leading-6 text-white/90">
                <code>{codeSnippet()}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
