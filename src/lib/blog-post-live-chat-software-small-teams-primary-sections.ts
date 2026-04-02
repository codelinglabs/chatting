import { comparison, list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const liveChatSoftwareSmallTeamsPrimarySections: BlogSection[] = [
  section("small-team-dilemma", "The small team dilemma", [
    paragraph("You've decided to add live chat. Smart move. It can lift conversions, reduce slow email back-and-forth, and give customers answers while they're still on your site."),
    paragraph("Then you start researching and find a familiar mess:"),
    list([
      "Intercom: per-seat pricing, add-ons, and enough complexity to make a simple inbox feel expensive fast.",
      "Zendesk: tickets, queues, routing rules, escalation workflows, and a whole operating system for support.",
      "Drift: enterprise positioning and custom pricing.",
      "Free tools: branding you can't remove, shallow features, or reliability that feels shaky."
    ]),
    paragraph("Here's the problem: most live chat software is built for 50-person support teams with dedicated admins. You're a 5-person company where \"support\" is whoever isn't in a meeting."),
    paragraph("You need something different.")
  ]),
  section("what-small-teams-actually-need", "What small teams actually need", [
    paragraph("After talking to hundreds of small teams, the requirements are usually boring, practical, and wildly different from the enterprise checklist."),
    list([
      "Fast setup: You don't have implementation week. You have 15 minutes between calls. Benchmark: under 10 minutes from signup to live widget.",
      "Simple inbox: You need to see messages and reply. Not juggle ticket numbers and escalation states. Benchmark: one screen, no training required.",
      "Visitor context: You want to know what page someone is on, how long they've been there, and where they came from. Benchmark: context visible in the conversation sidebar.",
      "Mobile notifications: You're not at your desk all day. Benchmark: notifications you can actually trust while you're out.",
      "Basic team features: Multiple people need access, and everyone should know when a conversation is already handled. Benchmark: shared inbox, replying indicator, simple teammate management.",
      "Affordable pricing: $500/month for chat is absurd for a 5-person team. Benchmark: pricing that scales with actual team size, not enterprise assumptions."
    ])
  ]),
  section("what-small-teams-dont-need", "What small teams don't need", [
    paragraph("The enterprise feature list sounds impressive. Most small teams should ignore most of it."),
    list([
      "AI chatbots: If you only get a handful of chats a day, you usually want to talk to those people, not deflect them.",
      "Complex routing rules: With 3-5 people, someone can just open the inbox and answer the conversation.",
      "Ticketing bureaucracy: Statuses, queues, priorities, and SLAs create overhead before they create value.",
      "Help desk sprawl: If you don't already run a heavy help desk, your live chat tool does not need to become one.",
      "Deep analytics theater: At small scale, you mostly need conversation volume, response time, and which pages trigger questions."
    ]),
    quote("For a small team, the best live chat tool is usually the one everyone can use without training.")
  ]),
  section("small-team-chat-stack", "The small team chat stack", [
    paragraph("Here's what most small teams actually need:"),
    comparison(["What small teams actually use"], [
      { label: "Live chat", values: ["A simple, fast tool like Chatting"] },
      { label: "Email backup", values: ["An offline chat form that lands in your inbox"] },
      { label: "Knowledge base", values: ["A simple FAQ page, maybe"] },
      { label: "CRM", values: ["A spreadsheet, honestly, until you outgrow it"] }
    ]),
    paragraph("That's it. You don't need a \"customer platform.\" You need to talk to people.")
  ]),
  section("how-to-evaluate-tools", "How to evaluate live chat tools", [
    paragraph("Before you commit to any tool, run four simple tests:"),
    list([
      "Test 1: The setup clock. Start a timer when you click sign up. Stop when the widget is live. Under 5 minutes is great. Over 15 minutes is a warning sign.",
      "Test 2: The grandma test. Could your least technical teammate use the dashboard without explanation? If not, it's too complex.",
      "Test 3: The mobile test. Install the app, get a notification, and reply to a real message. Does it feel practical or annoying?",
      "Test 4: The pricing math. Count the seats you need, the plan that unlocks the features you'll actually use, and any extra usage fees hiding in the fine print."
    ]),
    paragraph("Enterprise tools bury the real cost in add-ons and seat logic. Small teams should do the math before they fall in love with a demo.")
  ])
];
