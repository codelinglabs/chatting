import { comparison, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const ecommerceLiveChatSupportPrimarySections: BlogSection[] = [
  section("why-live-chat-matters", "Why live chat matters for e-commerce stores", [
    paragraph("Most store visitors do not need a full sales call. They need a quick answer before they buy."),
    paragraph("The questions are usually simple: shipping speed, return policy, sizing, stock, discount rules, or whether a product is right for them. When nobody answers, that hesitation turns into an abandoned cart."),
    list([
      "Pre-purchase questions get answered while buying intent is still high",
      "Shoppers trust your store more when support feels visible and responsive",
      "A quick reply often removes the last bit of friction before checkout",
      "You learn which questions your product pages still are not answering clearly"
    ]),
    paragraph("That is why live chat works so well for online stores. It is not just support. It is conversion help in real time.")
  ]),
  section("you-do-not-need-24-7", "You do not need 24/7 coverage to make chat work", [
    paragraph("Small stores often avoid chat because they imagine someone has to sit online all day. That is not the job."),
    paragraph("The real job is creating clear coverage during your highest-intent hours, then handling the rest with graceful fallbacks."),
    list([
      "Set visible business hours inside the widget",
      "Turn on offline capture after hours so shoppers can leave their email and question",
      "Use saved replies for your most common questions",
      "Send chat notifications to the person already closest to orders or sales"
    ]),
    paragraph("A clear \"We reply fast during these hours\" experience is better than pretending you are always online and leaving visitors hanging.")
  ]),
  section("in-house-vs-outsourced", "Should you handle chat in-house or outsource it?", [
    comparison(["In-house", "Outsourced", "Hybrid"], [
      { label: "Best for", values: ["Product-specific questions and brand voice", "Large volumes of repetitive questions", "Small teams that want speed without losing the human touch"] },
      { label: "Coverage", values: ["Business hours or peak hours", "Extended evenings, weekends, or near-24/7", "Live coverage for key hours plus offline follow-up"] },
      { label: "Main upside", values: ["Most personalized conversations", "Less day-to-day pressure on your team", "Protects quality while reducing workload"] },
      { label: "Main risk", values: ["Founders become the bottleneck", "Replies can feel generic", "Needs simple rules for who owns what"] }
    ], 2),
    paragraph("For most small e-commerce teams, the hybrid model wins. Let automation and documentation handle the predictable questions, and keep humans close to product advice, delivery issues, and high-intent buyers.")
  ]),
  section("what-small-stores-should-do", "What most small stores should actually do", [
    list([
      "Start with chat during peak shopping hours, not around the clock",
      "Document your top 10 questions before you worry about advanced automation",
      "Keep product and checkout questions owned by someone in-house",
      "Use after-hours email capture instead of forcing visitors to a cold contact page",
      "Review conversations weekly so your store pages and saved replies keep improving"
    ]),
    paragraph("That setup is simple, realistic, and usually enough to get the conversion upside of chat without creating a second full-time job.")
  ])
];
