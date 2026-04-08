import { ButtonLink } from "./components/ui/Button";
import { GrometricsButtonLink } from "./grometrics-button-link";
import { LandingHeroMockup } from "./landing-page-hero-mockup";

export function LandingTopSections() {
  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFBF5_0%,#FFFFFF_100%)]">
        <div className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_34%)]" />
        <div className="relative mx-auto w-full max-w-[1240px] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <section className="grid gap-14 px-2 pb-20 pt-16 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center lg:gap-10 lg:pt-24">
            <div className="max-w-2xl lg:pr-6">
              <h1 className="display-font text-5xl leading-[0.96] text-slate-900 sm:text-6xl lg:text-7xl">
                Live chat for
                <br />
                <span className="text-blue-600">small teams.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                See who&apos;s on your site. Answer their questions. Close the deal. Simple pricing, no per-seat
                games.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <GrometricsButtonLink
                  href="/signup"
                  eventName="signup_started"
                  eventProperties={{ source: "landing_hero" }}
                  trailingIcon={<span aria-hidden="true">→</span>}
                >
                  Start free
                </GrometricsButtonLink>
                <ButtonLink
                  href="#features"
                  variant="secondary"
                >
                  See how it works
                </ButtonLink>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[540px] lg:max-w-none lg:justify-self-end">
              <LandingHeroMockup />
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
