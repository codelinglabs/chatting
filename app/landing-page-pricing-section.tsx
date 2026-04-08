import { ChatBubbleIcon, CheckIcon } from "./dashboard/dashboard-ui";
import { GrometricsButtonLink } from "./grometrics-button-link";
import { PricingPlanCard, type PricingFeatureItem } from "./pricing-plan-card";

const starterFeatures: PricingFeatureItem[] = [
  "50 conversations/month",
  "1 team member",
  "Widget customization",
  "Email notifications"
];

const growthFeatures: PricingFeatureItem[] = [
  "Unlimited conversations",
  {
    label: "3 team members included",
    note: "Then $6/member/month"
  },
  "Proactive chat",
  "Visitor tracking",
  "Advanced analytics",
  "AI assist",
  "Routing rules",
  "Saved replies",
  "API access",
  "Custom branding",
  "White-label widget",
  "Integrations"
];

export function LandingPricingSection() {
  return (
    <section id="pricing" className="bg-slate-50">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24">
        <div className="mx-auto max-w-[900px] text-center">
          <h2 className="display-font text-4xl leading-tight text-slate-900 lg:text-5xl">
            Simple pricing. No per-seat games.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-500">Start free. Pay when you&apos;re ready.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-[820px] gap-6 md:grid-cols-2">
          <PricingPlanCard
            planKey="starter"
            interval="monthly"
            className="order-2 md:order-1"
            displayPriceOverride={{ amount: "Free", cadence: "", note: null }}
            featureItems={starterFeatures}
            priceNotePlacement="hidden"
            action={
              <GrometricsButtonLink
                href="/signup"
                variant="secondary"
                fullWidth
                className="h-12 rounded-[10px] border-slate-300 text-[15px]"
                eventName="signup_started"
                eventProperties={{ plan: "starter", source: "pricing_page" }}
              >
                Start free →
              </GrometricsButtonLink>
            }
          />
          <PricingPlanCard
            planKey="growth"
            interval="monthly"
            className="order-1 md:order-2"
            displayPriceOverride={{ amount: "$20", cadence: "/month", note: null }}
            featureItems={growthFeatures}
            priceNotePlacement="hidden"
            action={
              <GrometricsButtonLink
                href="/signup"
                fullWidth
                className="h-12 rounded-[10px] text-[15px] shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
                eventName="signup_started"
                eventProperties={{ plan: "growth", source: "pricing_page" }}
              >
                Start 14 day free trial →
              </GrometricsButtonLink>
            }
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckIcon className="h-3 w-3" />
          </span>
          <span>No credit card required</span>
        </div>

        <div className="mx-auto mt-10 max-w-[820px] px-7 py-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-blue-600">
              <ChatBubbleIcon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Need more than 3 people?</h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-600">
                <span className="font-semibold text-slate-700">$6/member/month</span> after that. Team of 10 =
                {" "}<span className="font-semibold text-slate-700">$62/month</span>. Still less than one Intercom
                seat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
