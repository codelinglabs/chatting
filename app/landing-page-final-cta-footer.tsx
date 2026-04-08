import Link from "next/link";
import { GrometricsButtonLink } from "./grometrics-button-link";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "/changelog" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/guides" },
      { label: "Blog", href: "/blog" }
    ]
  },
  {
    title: "Compare",
    links: [
      { label: "All comparisons", href: "/blog?category=comparisons" },
      { label: "Chatting vs Intercom", href: "/blog/chatting-vs-intercom" },
      { label: "Intercom alternatives", href: "/blog/intercom-alternatives-small-business" },
      { label: "Chatting vs Zendesk", href: "/blog/chatting-vs-zendesk" }
    ]
  },
  {
    title: "Legal",
    links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }]
  }
] as const;

export function LandingFinalCtaFooter() {
  return (
    <section
      className="relative -mt-px overflow-hidden text-white"
      style={{
        backgroundImage: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 58%, #1E40AF 100%)"
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_48%)]" />
      <div className="relative mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <section className="relative px-2 py-28 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="display-font text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
              Live chat for small teams.
              <br />
              No enterprise bloat.
            </h2>
            <div className="mt-12 flex flex-col items-center gap-4">
              <GrometricsButtonLink
                href="/signup"
                eventName="signup_started"
                eventProperties={{ source: "landing_footer" }}
                variant="secondary"
                className="min-h-[60px] border-white bg-white px-10 text-base text-blue-700 shadow-[0_18px_46px_rgba(15,23,42,0.16)] hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700"
              >
                Start free — live in 3 minutes →
              </GrometricsButtonLink>
              <p className="text-sm font-medium text-blue-100/82">No credit card. No sales call.</p>
            </div>
          </div>
        </section>

        <footer id="footer" className="border-t border-white/15 py-14">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_repeat(4,minmax(0,0.7fr))]">
            <div className="max-w-sm">
              <p className="text-2xl font-semibold text-white">Chatting</p>
              <p className="mt-4 text-sm leading-7 text-blue-100/80">
                Live chat for small teams that want fast conversations, shared context, and none of the enterprise bloat.
              </p>
            </div>

            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-white">{group.title}</p>
                <ul className="mt-4 space-y-3 text-sm text-blue-100/80">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link className="transition hover:text-white" href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 space-y-1 text-sm leading-6 text-blue-100/72">
            <p>Chatting by Regulus Framework Limited. All rights reserved.</p>
            <p>Registered in England and Wales. Company No. 16998528</p>
            <p>Registered office: 124-128 City Road, London, EC1V 2NX</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
