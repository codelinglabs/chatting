import { CHATTING_GROWTH_MONTHLY_PRICE, formatChattingGrowthTotalLabel } from "@/lib/pricing";
import { comparison, cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

const chattingFiveTeamMonthly = formatChattingGrowthTotalLabel("monthly", 5)
  .replace("5 members - ", "")
  .replace("/month", "/mo");

export const bestLiveChatToolsSmallBusinessSecondarySections: BlogSection[] = [
  section("tidio-best-for-ecommerce", "3. Tidio — Best for ecommerce and automation", [
    paragraph("Price: Free, then Starter at $24.17/month billed annually or Growth from $49.17/month billed annually."),
    paragraph("Best for: Ecommerce businesses that want more automation than a plain chat tool."),
    paragraph("Tidio leans hard into store-friendly support and automation. Its official product pages highlight real-time visitor monitoring, viewed-page history, live typing, automatic chat assignment, operating hours, macros, and advanced analytics on paid plans."),
    paragraph("Pros:"),
    list([
      "Strong ecommerce positioning",
      "Visitor monitoring and browsing context are useful for sales conversations",
      "Good automation tooling for repeated pre-sales questions",
      "Lower starting cost than many seat-based tools"
    ]),
    paragraph("Cons:"),
    list([
      "Conversation-based limits can feel restrictive if volume climbs",
      "The higher-end plans jump sharply",
      "Better for teams that want more automation than pure simplicity"
    ])
  ]),
  section("hubspot-best-for-hubspot-users", "4. HubSpot Live Chat — Best if you already use HubSpot", [
    paragraph("Price: Free tools available. Service Hub Starter is listed from $15/seat/month."),
    paragraph("Best for: Teams already committed to the HubSpot ecosystem."),
    paragraph("HubSpot's live chat makes the most sense when the rest of your sales and service workflow is already living in HubSpot. If that is your world, the CRM tie-in is real value. If not, it can be a much bigger system than the live-chat problem actually requires."),
    paragraph("Pros:"),
    list([
      "Free entry point",
      "Chat tied directly to CRM records and team email",
      "Easy handoff into broader HubSpot workflows",
      "Strong fit if your sales and support motions already live there"
    ]),
    paragraph("Cons:"),
    list([
      "Best value depends on using more of HubSpot",
      "A lot of platform if you only want live chat",
      "Easy to solve a small problem with a much larger system"
    ])
  ]),
  section("tawk-best-free", "5. tawk.to — Best if free matters most", [
    paragraph("Price: Free. Forever."),
    paragraph("Best for: Businesses where spending as little as possible matters more than polish."),
    paragraph("tawk.to stays on every small-business shortlist because the public pricing pitch is still exactly what people want to hear: free forever, not freemium. The product also includes much more than a basic widget, including ticketing, CRM, knowledge base, chat pages, reporting, unlimited agents, and unlimited history."),
    paragraph("Pros:"),
    list([
      "The price is unbeatable",
      "More functionality than most free tools give you",
      "Easy to test the live-chat channel without budget friction",
      "Unlimited agents and history are unusually generous"
    ]),
    paragraph("Cons:"),
    list([
      "Free is not automatically the same thing as best fit",
      "Many teams eventually want a more polished product and tighter positioning",
      "The broader free bundle can still feel less focused than a purpose-built small-business chat tool"
    ])
  ]),
  section("quick-comparison-table", "Quick comparison table", [
    paragraph("As of April 5, 2026, here is the fastest way to stack up the five options:"),
    comparison(["Entry point", "Best for", "Watch out for"], [
      { label: "Chatting", values: [chattingFiveTeamMonthly, "Most small businesses", "You will not get a giant enterprise support suite" ] },
      { label: "Crisp", values: ["$45-$95/mo", "Broader inbox workflows", "Busier interface and wider surface area" ] },
      { label: "Tidio", values: ["$24.17-$49.17/mo starting", "Ecommerce and automation", "Conversation-based limits and heavier automation bias" ] },
      { label: "HubSpot Live Chat", values: ["Free, then $15/seat/mo starting", "HubSpot users", "Best only if you want the wider HubSpot platform" ] },
      { label: "tawk.to", values: ["Free", "Budget-first teams", "Less product focus than a tool built specifically for small-team chat" ] }
    ], 0)
  ]),
  section("our-take", "Our take", [
    paragraph("For most small businesses, the best live chat tool on this list is Chatting."),
    list([
      "It gives you the widget, inbox, context, and automation you actually need.",
      "It stays focused on live chat instead of turning every conversation into support-ops theater.",
      `It starts free, and Growth is ${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members.`,
      "It is built for the team you are now, not the enterprise team you might become later."
    ]),
    paragraph("The other tools can make sense in the right context. Crisp is solid if you want a broader inbox. Tidio is a real option for ecommerce. HubSpot is logical if you are already there. tawk.to is obvious if budget is the first filter. But if you want the best balance of simplicity, speed, and small-business fit, start with Chatting."),
    cta("Try Chatting free", "Get live in minutes, stay responsive with a small team, and skip the enterprise bloat.", "Try Chatting free", "/login")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "What is the best live chat tool for a small business?",
        answer:
          "For most small businesses, Chatting is the best fit because it stays focused on live chat, visitor context, shared inbox workflows, and useful automation without dragging you into a bigger support platform than you need."
      },
      {
        question: "Is free live chat software enough for a small business?",
        answer:
          "Sometimes yes. If budget is the main constraint, a free option like tawk.to can be a good way to prove the channel. The bigger question is whether the tool still fits once your team wants more polish, better workflow, or a cleaner product focus."
      },
      {
        question: "Should a small business buy HubSpot or another broader platform just for live chat?",
        answer:
          "Usually no. HubSpot makes more sense when you already want the CRM and wider platform. If you mainly need website chat, a smaller tool is usually the smarter buy."
      },
      {
        question: "What live chat tool is best for ecommerce stores?",
        answer:
          "Tidio is worth a look if you want stronger automation and ecommerce-oriented workflows. If you want a lighter, more human chat-first setup, Chatting will usually be the cleaner fit."
      },
      {
        question: "How should a small business choose between these tools?",
        answer:
          "Start with your actual workflow. If you want the best general fit, choose Chatting. If you want a broader shared inbox, choose Crisp. If you want more ecommerce automation, choose Tidio. If you already live in HubSpot, use HubSpot. If you only care about cost, start with tawk.to."
      }
    ])
  ])
];
