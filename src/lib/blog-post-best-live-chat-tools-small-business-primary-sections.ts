import { CHATTING_GROWTH_MONTHLY_PRICE, CHATTING_STARTER_PLAN_LINE } from "@/lib/pricing";
import { list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const bestLiveChatToolsSmallBusinessPrimarySections: BlogSection[] = [
  section("short-version", "The short version", [
    paragraph("Most small businesses do not need a customer support platform with 47 tabs. You need a chat widget on your site, a shared inbox your team will actually check, and a way to answer before the visitor leaves."),
    paragraph("That is why the best live chat tool for most small businesses is Chatting. It gives you the widget, shared inbox, visitor context, saved replies, offline follow-up, and lightweight automation you actually need without dragging you into help-desk complexity."),
    list([
      "Choose Chatting if you want the best small-business fit overall.",
      "Choose Crisp if you want a broader shared-inbox style product.",
      "Choose Tidio if you run an ecommerce-heavy business and want more automation.",
      "Choose HubSpot Live Chat if you already live in HubSpot.",
      "Choose tawk.to if free matters more than polish."
    ]),
    quote("Buy for the team you are now, not the one the software sales deck keeps describing.")
  ]),
  section("what-small-businesses-actually-need", "What small businesses actually need", [
    paragraph("After enough conversations with lean teams, the list is usually boring in the best possible way."),
    list([
      "Fast setup: you do not have implementation week, you have 15 minutes between everything else.",
      "A shared inbox: multiple people need access, and everyone should know when a conversation is already handled.",
      "Visitor context: page URL, referrer, and session detail help you skip the obvious questions.",
      "Saved replies and notifications: speed matters more than a giant feature matrix.",
      "Business hours and offline capture: if you are not online 24/7, the tool should help instead of pretending otherwise.",
      "Simple automation: proactive prompts, routing, and FAQ suggestions are useful only if they stay easy to manage."
    ]),
    paragraph("What small businesses usually do not need is ticketing ceremony, queue design, and a platform built for a support department that does not exist yet.")
  ]),
  section("chatting-best-for-most-small-businesses", "1. Chatting — Best for most small businesses", [
    paragraph(`Price: ${CHATTING_STARTER_PLAN_LINE}. Growth is ${CHATTING_GROWTH_MONTHLY_PRICE} for 1-3 members, then scales by team size.`),
    paragraph("Best for: Small businesses that want live chat, not help-desk sprawl."),
    paragraph("Chatting is built around the way small teams actually work. You can customize the widget, route the right conversations to the right teammate, use saved replies, stay on top of chats with alerts, and keep the conversation going even when the visitor has already left the site."),
    paragraph("Why it stands out:"),
    list([
      "Customizable widget with your brand colors, copy, and online, away, and offline states",
      "Shared inbox with real visitor context like page URL, referrer, and session activity",
      "Saved replies, browser alerts, and email notifications that help small teams stay responsive",
      "Useful automation such as proactive prompts, offline auto-replies, FAQ suggestions, and routing rules",
      "Offline follow-up by email without breaking the conversation thread"
    ]),
    paragraph("The point is not that Chatting has the longest feature list. The point is that the feature set is tight around what small businesses usually need to convert more visitors and reply faster without a lot of operational drag.")
  ]),
  section("crisp-best-broader-inbox", "2. Crisp — Best if you want a broader shared inbox", [
    paragraph("Price: Free, then $45/month for Mini or $95/month for Essentials, billed per workspace."),
    paragraph("Best for: Teams that want a broader inbox-style product than a pure live-chat tool."),
    paragraph("Crisp is still one of the better small-business options if you want website chat plus a more expansive collaboration surface. Its pricing is easier to stomach than many seat-based tools, and the official plans highlight the website widget, shared inbox, mobile apps, ecommerce integrations, shortcuts, chat triggers, private notes, analytics, and routing on higher tiers."),
    paragraph("Pros:"),
    list([
      "Flat workspace pricing instead of straight per-seat pressure",
      "Strong shared inbox and team-collaboration basics",
      "Good feature depth for a growing small team",
      "Useful if your business is already juggling more than just website chat"
    ]),
    paragraph("Cons:"),
    list([
      "The interface can feel busier than a chat-first product",
      "Some of the more compelling features sit higher up the ladder",
      "If all you really want is live chat on your site, it can be more surface area than you need"
    ])
  ])
];
