import {
  CHATTING_GROWTH_MONTHLY_PRICE,
  formatChattingGrowthTotalLabel
} from "@/lib/pricing";
import { comparison, cta, list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

const chattingFiveTeamMonthly = formatChattingGrowthTotalLabel("monthly", 5)
  .replace("5 members - ", "")
  .replace("/month", "/mo");
const chattingFiveTeamAnnual = formatChattingGrowthTotalLabel("annual", 5)
  .replace("5 members - ", "")
  .replace("/year", "");

export const bestIntercomAlternativesPrimarySections: BlogSection[] = [
  section("elephant-in-the-room", "Let's talk about the elephant in the room", [
    paragraph("Intercom is a fantastic product. The interface is polished, the onboarding is smooth, and the feature set is deep."),
    paragraph("It's also still easy for a small business to outgrow Intercom's budget before it outgrows Intercom's features."),
    paragraph("As of April 2026, Intercom Essential is listed at $29/seat/month billed annually or $39/seat/month billed monthly. That means a 5-person team starts at $145/month on annual billing before you layer on usage-based AI costs or add-ons like Copilot."),
    paragraph("For a startup or small business that mostly wants live chat, a shared inbox, and faster replies, that's a lot of money to spend on a chat widget."),
    quote("Intercom is not the problem. Paying for an enterprise-style stack when you only need live chat is.")
  ]),
  section("why-small-businesses-leave-intercom", "Why small businesses leave Intercom", [
    paragraph("The pattern is usually the same: price first, complexity second, overkill third."),
    list([
      "Price: a seat-based tool is fine until your team grows from 2 people to 5 and the bill scales faster than your needs.",
      "Complexity: many small teams use a small slice of Intercom while still paying for the weight of the whole platform.",
      "Overkill: if you mostly need live chat, a shared inbox, and quick visitor context, the rest can feel like flying a 747 to the grocery store."
    ]),
    paragraph("If that sounds familiar, these are the alternatives worth your time.")
  ]),
  section("chatting-best-for-simplicity", "1. Chatting — Best for simplicity", [
    paragraph(`Price: ${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members, then $6/member from 4-9`),
    paragraph("Best for: Small teams that want live chat, not a sprawling customer platform"),
    paragraph("Chatting is intentionally narrow. It focuses on live chat for small teams: a customizable widget, a shared inbox, visitor context, saved replies, and proactive messages."),
    paragraph("What you get:"),
    list([
      "Customizable live chat widget",
      "Shared inbox for the whole team",
      "Visitor tracking and page context",
      "Triggered messages and saved replies",
      "Pricing that scales with team size instead of enterprise bundles"
    ]),
    paragraph("What you don't get:"),
    list([
      "Email marketing automation",
      "Product tours",
      "AI bot builders",
      "A help desk trying to turn every conversation into a workflow"
    ]),
    paragraph("Intercom vs Chatting math, as of April 2026:"),
    comparison(["Chatting (5 members)", "Intercom Essential (5 seats, billed annually)"], [
      { label: "Monthly cost", values: [chattingFiveTeamMonthly, "$145/mo"] },
      { label: "Annual cost", values: [`$${chattingFiveTeamAnnual}`, "$1,740"] },
      { label: "What you're paying for", values: ["Live chat for a small team", "Core support platform with a lot more surface area"] },
      { label: "Savings with Chatting", values: ["—", "$1,440/year"] }
    ]),
    cta("Try Chatting free", "", "Try Chatting free", "/login")
  ]),
  section("crisp-best-free-option", "2. Crisp — Best free option", [
    paragraph("Price: Free, then $45/month for Mini or $95/month for Essentials"),
    paragraph("Best for: Very early-stage teams that want a genuinely useful free plan"),
    paragraph("Crisp's free tier is still one of the most generous public offers in this category. As of April 2026, it includes unlimited conversations and 2 seats."),
    paragraph("Pros:"),
    list([
      "Free plan is actually usable",
      "Flat workspace pricing instead of per-seat pricing on the core tiers",
      "Good feature depth for the money",
      "Strong chat triggers and shared inbox basics"
    ]),
    paragraph("Cons:"),
    list([
      "Interface can feel busy",
      "White labeling sits higher up the pricing ladder",
      "It can feel like it wants to grow into an all-in-one support suite"
    ]),
    paragraph("Best for: Teams with almost no budget that still want real chat on the site.")
  ]),
  section("tidio-best-for-ecommerce", "3. Tidio — Best for e-commerce and automation", [
    paragraph("Price: Free, then Starter at $24.17/month billed annually or Growth from $49.17/month billed annually"),
    paragraph("Best for: Shopify and e-commerce teams that want more automation than a plain chat tool"),
    paragraph("Tidio's pricing is no longer the old per-operator story. The current customer-service plans are conversation-based, with 10 seats included on the free, Starter, and Growth tiers."),
    paragraph("Pros:"),
    list([
      "Strong e-commerce positioning",
      "Good automation tooling",
      "Includes visitor list, viewed-page history, and analytics on paid tiers",
      "Lower starting cost than many seat-based tools"
    ]),
    paragraph("Cons:"),
    list([
      "Conversation-based limits can get restrictive if volume climbs",
      "The higher-end plans jump sharply",
      "It's a better fit for teams that want automation than teams that want pure simplicity"
    ])
  ]),
  section("livechat-best-for-established-teams", "4. LiveChat — Best for established teams", [
    paragraph("Price: $19/agent/month for Starter or $49/agent/month for Team, both billed annually"),
    paragraph("Best for: Teams that want a mature, reliable product and don't mind per-agent pricing"),
    paragraph("LiveChat is stable, established, and easy to understand. It's not the cheapest path for a five-person team, but it's more straightforward than Intercom's broader platform positioning."),
    paragraph("Pros:"),
    list([
      "Long track record and strong reliability",
      "Good reporting and integrations",
      "Clearer product scope than Intercom",
      "Solid choice for support-led teams"
    ]),
    paragraph("Cons:"),
    list([
      "No meaningful free plan",
      "Per-agent pricing still compounds quickly",
      "A 5-person team jumps from $95/month on Starter to $245/month on Team"
    ])
  ])
];
