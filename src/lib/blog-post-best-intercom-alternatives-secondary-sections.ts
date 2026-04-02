import { CHATTING_GROWTH_MONTHLY_PRICE, formatChattingGrowthTotalLabel } from "@/lib/pricing";
import { comparison, cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

const chattingFiveTeamMonthly = formatChattingGrowthTotalLabel("monthly", 5)
  .replace("5 members - ", "")
  .replace("/month", "/mo");

export const bestIntercomAlternativesSecondarySections: BlogSection[] = [
  section("hubspot-best-for-hubspot-users", "5. HubSpot Live Chat — Best for HubSpot users", [
    paragraph("Price: Free with HubSpot CRM"),
    paragraph("Best for: Teams already committed to the HubSpot ecosystem"),
    paragraph("HubSpot's live chat tool is free, and it makes the most sense when the rest of your CRM, forms, automation, and sales workflow already live there."),
    paragraph("Pros:"),
    list([
      "Free live chat software",
      "Shared inbox and CRM context out of the box",
      "Strong fit if your team already uses HubSpot",
      "Easy handoff into the rest of the HubSpot system"
    ]),
    paragraph("Cons:"),
    list([
      "Best value depends on broader HubSpot adoption",
      "Not the best pick if you only want a lightweight standalone chat tool",
      "Easy to end up solving a small problem with a much bigger platform"
    ])
  ]),
  section("freshchat-best-for-scaling-teams", "6. Freshchat — Best for teams that may need a help desk later", [
    paragraph("Price: Free for up to 10 agents, then $19/agent/month for Growth billed annually"),
    paragraph("Best for: Small teams that expect to need deeper support workflows later"),
    paragraph("Freshchat sits in a middle ground between lightweight live chat and full help-desk territory. If you think your team will need broader service tooling, it can be a reasonable stepping stone."),
    paragraph("Pros:"),
    list([
      "Free plan is generous on seats",
      "Clear upgrade path into Freshworks products",
      "Good if you're planning for a more structured support operation"
    ]),
    paragraph("Cons:"),
    list([
      "Paid tiers get expensive fast for small teams",
      "The interface can feel heavier than simple-chat tools",
      "You may end up paying for where you think you'll be later, not what you need now"
    ])
  ]),
  section("olark-best-simple-alternative", "7. Olark — Best straightforward alternative", [
    paragraph("Price: $29/seat/month, with cheaper annual and two-year commitments"),
    paragraph("Best for: Teams that want a simple, established chat product and don't mind per-seat pricing"),
    paragraph("Olark stays close to the core chat use case. It feels less platform-heavy than Intercom, but the economics still matter once your team gets past one or two seats."),
    paragraph("Pros:"),
    list([
      "Simple, established product",
      "Good automation and reporting fundamentals",
      "Free account exists after trial, with one agent and 20 chats per month"
    ]),
    paragraph("Cons:"),
    list([
      "Per-seat pricing makes a 5-person team $145/month on month-to-month billing",
      "The product feels more traditional than newer alternatives",
      "Not the best value if your main goal is lowering software spend"
    ])
  ]),
  section("quick-comparison-table", "Quick comparison table", [
    paragraph("As of April 2026, here's the quickest way to stack up the main options for a five-person small business:"),
    comparison(["5-person team cost", "Best for", "Free plan"], [
      { label: "Chatting", values: [chattingFiveTeamMonthly, "Simplicity", "✓"] },
      { label: "Crisp", values: ["$95/mo", "Free-first teams", "✓"] },
      { label: "Tidio", values: ["$49.17/mo starting", "E-commerce and automation", "✓"] },
      { label: "LiveChat", values: ["$95-$245/mo", "Reliability", "✗"] },
      { label: "HubSpot Live Chat", values: ["Free", "HubSpot users", "✓"] },
      { label: "Freshchat", values: ["Free-$95/mo", "Future help-desk needs", "✓"] },
      { label: "Olark", values: ["$145/mo", "Straightforward chat", "✓"] },
      { label: "Intercom Essential", values: ["$145+/mo", "Broader support platform", "✗"] }
    ], 0)
  ]),
  section("how-to-choose", "How to choose", [
    list([
      "Choose Chatting if you want the simplest possible setup, clear pricing, and a tool built around live chat instead of platform sprawl.",
      "Choose Crisp if you need a genuinely useful free plan and can live with a busier interface.",
      "Choose Tidio if you run an e-commerce store and want more automation than a pure live-chat tool.",
      "Choose LiveChat if reliability and maturity matter more than minimizing spend.",
      "Choose HubSpot if you're already on HubSpot and want chat to slot into that ecosystem.",
      "Choose Freshchat if you expect to need deeper help-desk structure later.",
      "Choose Olark if you want straightforward chat and are comfortable paying per seat."
    ]),
    paragraph("The real Intercom alternative question is simpler than most pricing pages make it look: do you actually need a platform, or do you need live chat?")
  ]),
  section("making-the-switch", "Making the switch", [
    paragraph("Switching away from Intercom is usually less dramatic than teams expect."),
    list([
      "Migration is mostly operational, not technical. Keep your old conversation history in Intercom and launch the new widget on your site.",
      "You can run both tools side by side for a short overlap period if you want a low-risk transition.",
      "Customers care that the chat button works and someone answers. They do not care which vendor logo is behind the scenes.",
      "The sunk-cost trap is real. Keeping a bloated subscription because you've already paid for it doesn't make the next invoice smarter."
    ])
  ]),
  section("our-recommendation", "Our recommendation", [
    paragraph("If you're a small business looking for an Intercom alternative, start with Chatting."),
    list([
      "5-minute setup",
      `${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members, then $6/member`,
      "Built for small teams instead of enterprise ops",
      "No sprawling feature set you have to justify using"
    ]),
    cta("Try Chatting free", "You've got nothing to lose except a bloated software bill.", "Try Chatting free", "/login")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Can I really replace Intercom with something cheaper?",
        answer:
          "For live chat, yes. Intercom's edge is its broader platform. If you mainly need a chat widget, a shared inbox, and faster replies, a lighter tool can do the job for much less."
      },
      {
        question: "What about Intercom's AI features?",
        answer:
          "They matter if you truly want AI-led support workflows. Many small teams still want humans talking to customers, especially when chat volume is manageable."
      },
      {
        question: "Will I lose my conversation history?",
        answer:
          "Your old history stays in Intercom. Most teams just keep that account accessible for reference while moving new conversations into the replacement tool."
      },
      {
        question: "What if I need Intercom-level features later?",
        answer:
          "Then you can re-evaluate later. Most small businesses benefit more from using the simplest tool that matches today's workflow than from prepaying for tomorrow's complexity."
      },
      {
        question: "Is the switch disruptive?",
        answer:
          "Usually not. For most teams it's a widget swap, some internal habit changes, and a short overlap period if you want extra reassurance."
      }
    ])
  ])
];
