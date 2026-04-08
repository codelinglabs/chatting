import { GrometricsButtonLink } from "./grometrics-button-link";
import {
  InboxFeatureIllustration,
  ProactiveMessagesFeatureIllustration
} from "./landing-page-conversation-feature-illustrations";
import { ContactHistoryFeatureIllustration } from "./landing-page-contact-history-illustration";
import { FAQSuggestionsFeatureIllustration } from "./landing-page-faq-suggestions-illustration";
import {
  OfflineFeatureIllustration,
  SmartRoutingFeatureIllustration,
  VisitorsFeatureIllustration
} from "./landing-page-feature-illustrations";

const coreFeatures = [
  {
    title: "Team Inbox",
    body: "One inbox. Whole team.",
    detail:
      "Every conversation in one place. Assign chats, tag them, search them. Keyboard shortcuts for speed. Nobody drops the ball.",
    reverse: true,
    wideIllustration: true,
    Illustration: InboxFeatureIllustration
  },
  {
    title: "Offline Mode",
    body: "Never lose a lead.",
    detail:
      "Set business hours. Show a custom offline message. Capture their email. Reply later — it goes straight to their inbox, and they can reply back into the chat.",
    reverse: true,
    wideIllustration: false,
    Illustration: OfflineFeatureIllustration
  },
  {
    title: "Proactive Messages",
    body: "Start conversations first.",
    detail:
      "Don't wait for visitors to reach out. Set automated messages on high-intent pages. Someone's been on pricing for 30 seconds? \"Questions about our plans?\" You make the first move.",
    reverse: false,
    wideIllustration: false,
    Illustration: ProactiveMessagesFeatureIllustration
  },
  {
    title: "Smart Routing",
    body: "Right chat. Right person. Automatically.",
    detail:
      "Route conversations based on page URL, keywords, or visitor data. Pricing questions go to sales. Support issues go to support. No manual sorting.",
    reverse: true,
    wideIllustration: false,
    Illustration: SmartRoutingFeatureIllustration
  },
  {
    title: "Contact History",
    body: "Know who you're talking to.",
    detail:
      "Chatting remembers visitors across sessions. See their full history — every page, every conversation, every visit. When someone comes back, you have context. Not \"Visitor #4827.\"",
    reverse: false,
    wideIllustration: true,
    Illustration: ContactHistoryFeatureIllustration
  },
  {
    title: "FAQ Suggestions",
    body: "Instant answers before the chat starts.",
    detail:
      "Show relevant help articles before connecting to your team. Visitors get instant answers. You handle the complex stuff.",
    reverse: true,
    wideIllustration: false,
    Illustration: FAQSuggestionsFeatureIllustration
  },
  {
    title: "Visitor Tracking",
    body: "See who's on your site right now.",
    detail:
      "Watch visitors browse in real-time. See what page they're on, where they came from, how long they've been there. Spot high-intent prospects on your pricing page. Reach out before they leave.",
    reverse: false,
    wideIllustration: true,
    Illustration: VisitorsFeatureIllustration
  }
] as const;

function CoreFeatureCard({
  detail,
  Illustration,
  reverse,
  title,
  body,
  wideIllustration
}: (typeof coreFeatures)[number]) {
  const illustrationOrder = reverse ? "lg:order-2" : "";
  const copyOrder = reverse ? "lg:order-1" : "";
  const gridClassName = wideIllustration
    ? reverse
      ? "lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]"
      : "lg:grid-cols-[minmax(0,1.14fr)_minmax(0,0.86fr)]"
    : "lg:grid-cols-2";

  return (
    <article className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)] sm:p-8 lg:p-12">
      <div className={`grid items-center gap-10 lg:gap-14 ${gridClassName}`}>
        <div className={illustrationOrder}>
          <Illustration />
        </div>
        <div className={copyOrder}>
          <h3 className="text-3xl font-semibold leading-tight text-slate-900">{title}</h3>
          <div className="mt-5 space-y-4 text-[17px] leading-8 text-slate-600">
            <p>{body}</p>
            <p className="text-base leading-7 text-slate-500">{detail}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function LandingCoreFeaturesSection() {
  return (
    <section id="features" className="bg-white">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="display-font text-4xl leading-[1.12] text-slate-900 sm:text-5xl">
            The difference between a visitor and a customer is often one answer.
          </h2>
        </div>

        <div className="mt-16 space-y-8">
          {coreFeatures.map((feature) => (
            <CoreFeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl px-6 text-center sm:px-10">
          <p className="text-lg font-medium text-slate-600">This is all most teams need.</p>
          <div className="mt-6">
            <GrometricsButtonLink
              href="/signup"
              eventName="signup_started"
              eventProperties={{ source: "landing_features" }}
              className="shadow-[0_10px_26px_rgba(37,99,235,0.28)] hover:-translate-y-0.5"
              trailingIcon={<span aria-hidden="true">→</span>}
            >
              Start chatting free
            </GrometricsButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
