import { CHATTING_GROWTH_MONTHLY_PRICE, CHATTING_STARTER_PLAN_LINE, formatChattingGrowthTotalLabel } from "@/lib/pricing";
import { comparison, cta, faq, list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

const chattingFiveTeamPrice = formatChattingGrowthTotalLabel("monthly", 5)
  .replace("5 members - ", "")
  .replace("/month", "/mo");

const chattingGrowthStartingPrice = CHATTING_GROWTH_MONTHLY_PRICE.replace("/month", "/mo");
const chattingStarterPlanLine = CHATTING_STARTER_PLAN_LINE.replace("Starter: ", "");

export const liveChatSoftwareSmallTeamsSecondarySections: BlogSection[] = [
  section("pricing-comparison", "Pricing comparison for small teams", [
    paragraph("As of April 2026, small teams can end up paying wildly different prices for very similar core chat functionality."),
    comparison(["Typical cost (as of April 2026)", "Notes"], [
      {
        label: "Chatting",
        values: [chattingGrowthStartingPrice, `Growth starts at ${chattingGrowthStartingPrice}; a 5-person team is ${chattingFiveTeamPrice}`]
      },
      { label: "Crisp", values: ["$95/mo", "Essentials plan includes up to 10 seats"] },
      { label: "Tidio", values: ["$49.17/mo starting", "Conversation-based pricing with up to 10 seats on Growth"] },
      { label: "LiveChat", values: ["$245/mo", "Team plan is $49/person/mo billed annually"] },
      { label: "Intercom", values: ["$145/mo plus usage", "Essential is $29/seat/mo billed annually, plus usage-based charges"] },
      { label: "Zendesk", values: ["$275/mo", "Suite Team is $55/agent/mo billed annually"] },
      { label: "Drift", values: ["Contact sales", "Custom enterprise-style pricing"] }
    ]),
    paragraph("The spread is massive. A small team can pay something manageable or wander into an enterprise bill without realizing it until the invoice lands.")
  ]),
  section("features-that-actually-matter", "The features that actually matter", [
    paragraph("When a small team chooses a live chat tool, a few features do most of the real work:"),
    list([
      "Saved replies: Create templates for your top questions so you can reply fast without sounding robotic.",
      "Offline mode: When you're away, the widget should collect email addresses and context cleanly so leads don't disappear.",
      "Triggered messages: A helpful nudge on pricing, checkout, or product pages can turn passive chat into proactive sales.",
      "Business hours: Visitors should know when you're online and what response time to expect.",
      "Simple analytics: Conversation volume, response time, and which pages create the most questions are usually enough."
    ]),
    quote("Saved replies usually save more real time than a chatbot for a small team, because customers still get a human.")
  ]),
  section("making-chat-work", "Making chat work for a small team", [
    paragraph("The tool matters, but the operating rhythm matters too."),
    list([
      "Set expectations: Be honest about your hours. Most visitors prefer clarity over fake always-on availability.",
      "Create coverage blocks: Even a 3-person team should know who is watching chat during which window.",
      "Build your saved-reply library: Track your first 50 conversations and templatize the top recurring questions.",
      "Use visitor context: If someone has been on pricing for 3 minutes, skip the generic opener and help from where they already are.",
      "Know when to switch to email: Some questions need research, handoffs, or a longer answer. Say that clearly and follow through."
    ]),
    paragraph("A tiny support process beats no support process. Chat works best when the team agrees who is covering it and what fast, helpful replies look like.")
  ]),
  section("bottom-line", "The bottom line", [
    paragraph("Small teams don't need enterprise software. You need a widget on your site, an inbox on your phone, notifications that work, and pricing that doesn't hurt."),
    list([
      "A widget on your site",
      "An inbox your team can actually use",
      "Notifications that work",
      "Pricing that fits a small team"
    ]),
    paragraph("Everything else is optional until you're big enough to need it. The best live chat tool for a small team is the one simple enough that everyone actually uses it."),
    cta(
      "Ready to add chat to your site?",
      `Join small teams who chose simple over complicated. Get live in minutes. ${chattingStarterPlanLine}.`,
      "Start free with Chatting",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do I really need live chat?",
        answer:
          "If visitors have questions and you want more conversions, yes. Live chat helps you answer in the moment instead of after someone has already bounced."
      },
      {
        question: "What if nobody chats with us?",
        answer:
          "Usually that means the widget is too hidden, the welcome message is too passive, or you need more time. Give it a few weeks and test proactive prompts on high-intent pages."
      },
      {
        question: "Can one person handle chat alone?",
        answer:
          "Often, yes. Many small businesses only see a manageable number of daily conversations, especially if saved replies and mobile notifications are set up properly."
      },
      {
        question: "What's the difference between live chat and chatbots?",
        answer:
          "Live chat is humans talking to humans in real time. Chatbots are automated systems trying to resolve questions without human involvement. For many small teams, direct conversation is the point."
      },
      {
        question: "Should I buy the expensive tool now and grow into it later?",
        answer:
          "Usually no. Start simple, learn what your team actually uses, and upgrade only when your workflow genuinely demands more complexity."
      }
    ])
  ])
];
