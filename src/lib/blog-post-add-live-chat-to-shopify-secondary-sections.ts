import { CHATTING_GROWTH_MONTHLY_PRICE, CHATTING_STARTER_PLAN_LINE } from "@/lib/pricing";
import { comparison, cta, faq, list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const addLiveChatToShopifySecondarySections = [
  section("common-mistakes", "Common mistakes to avoid", [
    paragraph("A few bad habits make live chat feel annoying instead of helpful."),
    paragraph("Being too aggressive:"),
    quote("\"Hey! Ready to buy? Here's 10% off! Don't leave!!!\""),
    paragraph("Better:"),
    quote("\"Hey there. Let me know if you have any questions about the product.\""),
    list([
      "Don't fire multiple proactive messages on the same visit",
      "Don't offer live chat if nobody is realistically watching it",
      "Don't fake live support with a clumsy bot menu",
      "Don't leave business hours vague if your team isn't online all day"
    ])
  ]),
  section("measuring-success", "Measuring success", [
    paragraph("After your first month, watch a handful of practical numbers:"),
    list([
      "Chat engagement rate: what percentage of visitors start a chat",
      "Response time: how quickly your team replies",
      "Chat-to-conversion rate: how often chats turn into orders",
      "Questions by page: which pages generate the most confusion or hesitation"
    ]),
    paragraph("If engagement is low, work on the welcome message and proactive triggers. If engagement is high but conversions are weak, improve the scripts and product-page clarity.")
  ]),
  section("apps-vs-snippet", "Shopify live chat apps vs. code snippet", [
    comparison(["Shopify App Store app", "Code snippet"], [
      { label: "Install", values: ["Usually one-click", "Takes a couple of extra minutes"] },
      { label: "Flexibility", values: ["Limited to app marketplace options", "Works with whichever chat tool fits best"] },
      { label: "Performance overhead", values: ["Another app in the stack", "Lightweight embed"] },
      { label: "Cost structure", values: ["Can include Shopify app markup", "Usually just the chat-tool price"] }
    ], 1),
    paragraph("For most stores, the snippet route is just as easy in practice and gives you more flexibility.")
  ]),
  section("roi", "The ROI of Shopify live chat", [
    paragraph("Here's a conservative example."),
    comparison(["Without live chat", "With live chat"], [
      { label: "Monthly visitors", values: ["5,000", "5,000"] },
      { label: "Conversion rate", values: ["2.5%", "2.875%"] },
      { label: "Average order value", values: ["$75", "$75"] },
      { label: "Monthly revenue", values: ["$9,375", "$10,725"] }
    ], 1),
    paragraph("That extra lift is $1,350/month in additional revenue."),
    paragraph(`If your live chat spend starts at ${CHATTING_GROWTH_MONTHLY_PRICE}, the math gets attractive very quickly.`)
  ]),
  section("getting-started", "Getting started", [
    list([
      "Sign up for a chat tool",
      "Customize your colors and welcome message",
      "Add the code to your Shopify theme",
      "Test the widget in an incognito window",
      "Create 3-5 saved replies for common questions",
      "Add one proactive message for product pages",
      "Set your business hours and offline message"
    ], true),
    cta(
      "Ready to turn visitors into customers?",
      `Add live chat to your Shopify store in 5 minutes. ${CHATTING_STARTER_PLAN_LINE}.`,
      "Get started free",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Will live chat slow down my Shopify store?",
        answer:
          "No. The Chatting widget is loaded through a lightweight external script and does not block the rest of the page from rendering."
      },
      {
        question: "What if I can't be online all day?",
        answer:
          "Set business hours and use an offline message that collects email addresses. Many Shopify stores only staff chat during their peak hours and still get strong results."
      },
      {
        question: "Do I need a dedicated support person?",
        answer:
          "Usually no. Many small stores can handle their daily chat volume alongside normal store operations as long as saved replies and alerts are set up properly."
      },
      {
        question: "Which Shopify plan do I need?",
        answer:
          "The snippet-based install works across Shopify plans because you're adding the widget to the theme, not relying on a special Shopify tier."
      },
      {
        question: "Can I use chat for sales, not just support?",
        answer:
          "Absolutely. Some of the best Shopify chat workflows are sales-first: pre-purchase questions, product recommendations, and shipping reassurance."
      }
    ])
  ])
];
