import { cta, faq, list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const ecommerceLiveChatSupportSecondarySections: BlogSection[] = [
  section("stay-personal-without-burning-out", "How to stay personal without burning out", [
    paragraph("The mistake is thinking personalization means writing every response from scratch."),
    list([
      "Write saved replies in your real brand voice, then personalize the first line",
      "Use visitor context like cart page, product page, or referrer to skip obvious questions",
      "Route refund, shipping-delay, or product-fit questions to the right person fast",
      "Escalate emotional or high-value conversations to a human immediately",
      "Treat repetitive chats as signals to improve your product pages, FAQ, or shipping page"
    ]),
    quote("The goal is not to answer every message manually. The goal is to make every customer feel helped.")
  ]),
  section("what-to-look-for-in-a-tool", "What to look for in an e-commerce live chat tool", [
    paragraph("The best tool for a small store is the one that reduces workload without making conversations feel robotic."),
    list([
      "Business hours and offline capture",
      "Mobile notifications so someone can reply without living in the inbox",
      "Saved replies for shipping, returns, sizing, and order-status questions",
      "Visitor context like current page and recent activity",
      "Simple reporting so you can see response time and top conversation themes",
      "Store-friendly setup that does not require a long implementation project"
    ]),
    paragraph("If a tool looks powerful but adds setup, admin work, and too many knobs, it is probably solving a problem you do not have yet.")
  ]),
  section("simple-operating-playbook", "A simple live chat playbook for small e-commerce teams", [
    list([
      "Turn chat on during the hours when purchase intent is highest.",
      "Add saved replies for shipping, returns, sizing, stock, and promotions.",
      "Use a short after-hours message that captures email and sets response expectations.",
      "Review transcripts each week and update product pages based on repeated questions.",
      "Expand coverage only after chat volume proves you need it."
    ], true),
    paragraph("This is the boring answer, which is usually the right answer. Start small, stay consistent, and let the workload tell you when to add more process.")
  ]),
  section("bottom-line", "The bottom line", [
    paragraph("Live chat can absolutely help an e-commerce store convert more visitors and recover more hesitant buyers."),
    paragraph("But small businesses do not need 24/7 staffing or a complicated support org to make it worthwhile. They need clear hours, good saved replies, after-hours capture, and a human available for the conversations that actually move revenue."),
    cta(
      "Add chat without adding chaos",
      "Use a simple widget, shared inbox, and after-hours fallback so your team can stay responsive without being online all day.",
      "Start free with Chatting",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Does live chat really help reduce cart abandonment?",
        answer:
          "It often does, especially when shoppers are hesitating because of shipping, returns, sizing, stock, or discount questions. Chat removes that friction in the moment instead of after they leave."
      },
      {
        question: "Can one person handle live chat for an online store?",
        answer:
          "Often yes, especially for a smaller store with clear hours, saved replies, and mobile notifications. The key is not volume alone but whether the questions are predictable and the ownership is clear."
      },
      {
        question: "Should e-commerce live chat be outsourced?",
        answer:
          "Only when volume or coverage needs justify it. Outsourcing can help with repetitive questions, but product advice, checkout objections, and sensitive issues usually work better when someone close to the business handles them."
      },
      {
        question: "What if we are not online at night?",
        answer:
          "That is normal. Use business hours, an after-hours message, and email capture. Most customers are fine with waiting when you set expectations clearly and follow through quickly."
      },
      {
        question: "How do I keep chat from sounding robotic?",
        answer:
          "Use saved replies as starting points, not final scripts. Personalize the opener, reference what the visitor is browsing, and let humans take over when the conversation needs judgment or empathy."
      }
    ])
  ])
];
