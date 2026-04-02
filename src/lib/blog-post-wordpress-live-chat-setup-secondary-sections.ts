import { CHATTING_STARTER_PLAN_LINE } from "@/lib/pricing";
import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const wordpressLiveChatSetupSecondarySections = [
  section("use-cases", "WordPress live chat for different sites", [
    paragraph("The setup is the same, but the way you use chat should match the kind of site you run."),
    list([
      "Service business: show chat on services, pricing, and contact pages to capture leads",
      "WooCommerce store: focus on product, cart, and shipping pages to remove buying friction",
      "Membership or course site: answer pre-signup questions before someone commits",
      "Agency or freelancer site: qualify leads quickly, then move them to email or a booking link"
    ])
  ]),
  section("working-with-tools", "Working with popular WordPress tools", [
    list([
      "Page builders like Elementor, Divi, Beaver Builder, and Gutenberg: no special setup, because the widget loads site-wide from the header",
      "Caching plugins: if the widget does not appear right away, clear cache and test again in incognito",
      "Security plugins: if external scripts are blocked, allow the Chatting widget script domain",
      "WooCommerce: chat works well on product, cart, and returns-heavy pages"
    ])
  ]),
  section("wordpress-com", "WordPress.com vs. WordPress.org", [
    paragraph("Self-hosted WordPress.org gives you full control, so either the direct snippet method or a code plugin works fine."),
    paragraph("As of April 2026, WordPress.com limits full JavaScript installs to plugin-enabled plans. At the time of writing, that includes Personal, Premium, Business, and Commerce. Free sites still have code restrictions."),
    paragraph("If you are on a restricted WordPress.com plan, you will need to upgrade before adding a live chat script.")
  ]),
  section("managing-chat", "Managing chat on WordPress", [
    list([
      "Turn on browser notifications so new chats do not get missed",
      "Set business hours and an honest offline message",
      "Build saved replies for the questions you answer most often",
      "Review your first 30-50 conversations and tighten weak pages based on what people ask"
    ]),
    paragraph("For many teams, chat is not just support. It is lead capture, sales reassurance, and a faster path to real conversations.")
  ]),
  section("after-installation", "After installation: quick wins", [
    list([
      "Week 1: respond quickly and note the top repeat questions",
      "Week 2: add one proactive message to your most valuable page",
      "Week 3: turn repeated answers into saved replies",
      "Week 4: review which pages drive the most chats and improve those pages"
    ], true),
    cta(
      "Ready to add chat to your WordPress site?",
      `5 minutes, no bloated plugin, and ${CHATTING_STARTER_PLAN_LINE}.`,
      "Get started free",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do I need a plugin, or is the code snippet enough?",
        answer:
          "The code snippet is enough. A plugin only helps you inject the same snippet without editing theme files."
      },
      {
        question: "Will this slow down my WordPress site?",
        answer:
          "Modern chat widgets are designed to load asynchronously, so they should not block the initial page render. It is still smart to measure the impact on your own site."
      },
      {
        question: "Does it work with my theme or page builder?",
        answer:
          "Usually yes. Because the widget sits on top of the site rather than inside your layout, it works across most themes and builders."
      },
      {
        question: "What if my theme update removes the code?",
        answer:
          "That can happen if you edited a theme file directly. A child theme or a code snippets plugin is the safer long-term option."
      },
      {
        question: "How do I add live chat to WordPress for free?",
        answer:
          `Start with Chatting's free tier. Right now that means ${CHATTING_STARTER_PLAN_LINE}.`
      }
    ])
  ])
];
