import { CHATTING_STARTER_PLAN_LINE, getChattingPaidStartingPriceCopy } from "@/lib/pricing";
import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const bestLiveChatForStartupsSecondarySections = [
  section("choose-by-stage", "How to choose by startup stage", [
    list([
      "Pre-product-market-fit: pick the simplest possible live chat tool and stay close to every conversation",
      "Sales-led B2B startup: prioritize visitor context, proactive messages, and fast handoff to a founder or AE",
      "Ecommerce startup: favor tools with strong store integrations and automation support",
      "Support-heavy scale-up: move toward a suite only when ticketing, routing, and analytics become real bottlenecks"
    ]),
    paragraph("A good rule: buy for the team you are now, not the team you hope to be in two years.")
  ]),
  section("mistakes", "Mistakes startups make with live chat", [
    list([
      "Buying enterprise software too early because it feels more serious",
      "Turning on bots before anyone has learned the real customer questions",
      "Treating chat like a support-only channel instead of a conversion channel",
      "Letting response times slip so the widget promises more than the team can deliver",
      "Choosing a tool based on edge-case features instead of daily usability"
    ])
  ]),
  section("our-take", "Our take", [
    paragraph("For most startups, the best live chat tool is the one that is easy to install, easy to reply from, and cheap enough that you do not resent paying for it before you have scale."),
    paragraph(`That is why the default answer for most early-stage teams is a simple chat-first product. Chatting is ${getChattingPaidStartingPriceCopy()}, which fits the reality of a small startup team a lot better than enterprise pricing models.`),
    cta(
      "Start simple and stay close to your customers",
      `Get live quickly, learn what buyers are actually asking, and upgrade later if you truly outgrow it. ${CHATTING_STARTER_PLAN_LINE}.`,
      "Start free",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "What is the best live chat for an early-stage startup?",
        answer:
          "Usually the simplest chat-first tool your team will actually use. Early-stage startups benefit more from speed, visibility, and low overhead than from enterprise workflow features."
      },
      {
        question: "Should startups use Intercom right away?",
        answer:
          "Only if you already know you need a broader helpdesk and AI-heavy customer service suite. For many startups, Intercom makes more sense later than the sales pitch suggests."
      },
      {
        question: "When does Zendesk start to make sense?",
        answer:
          "Zendesk starts to make more sense when live chat is no longer just conversations and your team genuinely needs ticketing, queues, and heavier support operations."
      },
      {
        question: "Is free live chat enough for a startup?",
        answer:
          "Often yes at the start. The real question is not just whether the plan is free, but whether the tool is simple enough that your team answers quickly and learns from the conversations."
      },
      {
        question: "Should startup chat be owned by sales or support?",
        answer:
          "At startup stage it is usually both. Pre-purchase chat is often sales, activation questions sit with product or ops, and support gets involved later as volume grows."
      }
    ])
  ])
];
