import { list, paragraph, quote, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const afterHoursLiveChatEcommerceLeadsPrimarySections: BlogSection[] = [
  section("short-version", "The short version", [
    paragraph("Most small e-commerce stores do not have a traffic problem. They have an availability problem."),
    paragraph("Visitors show up at night, ask one or two simple buying questions, get no answer, and leave. After-hours live chat fixes that by either answering the question or capturing the lead before the visit disappears."),
    list([
      "Use chat to answer simple pre-sales questions while buying intent is still high.",
      "Capture email and context when the question needs a human follow-up.",
      "Keep the workflow lightweight enough that a small team can actually maintain it."
    ]),
    quote("Hope is not a funnel.")
  ]),
  section("missed-intent-is-the-real-problem", "The real problem is missed intent", [
    paragraph("A lot of small stores assume after-hours visitors will just come back tomorrow. Most of them do not."),
    paragraph("If someone is on your site late at night asking about delivery timing, personalization, or order turnaround, they are not casually browsing. They are trying to decide whether to buy. If your store gives them no answer and no next step, they keep looking."),
    paragraph("That is why after-hours live chat matters so much for e-commerce. It helps you capture buying intent when it actually appears instead of hoping that person remembers you later.")
  ]),
  section("personalized-gift-store-case", "A simple case: a personalized gift store", [
    paragraph("A good example is a small store selling engraved gifts and custom keepsakes."),
    paragraph("A lot of their best traffic comes in the evening, when people are shopping for birthdays, anniversaries, weddings, or last-minute gifts. The questions are simple, but they are exactly the kind that stop a sale:"),
    list([
      "How long does personalization take?",
      "Can this arrive before Friday?",
      "What are the engraving limits?",
      "Is gift packaging available?"
    ]),
    paragraph("Before chat, those visitors often left without doing anything. No answer. No contact details. No follow-up."),
    paragraph("Once after-hours chat was in place, that changed. Some visitors got quick answers immediately. Others left their details when the question needed a human reply. The result was not a traffic spike. It was better lead capture and fewer missed buying moments.")
  ]),
  section("why-most-tools-miss-the-mark", "Why most live chat tools are the wrong fit for small stores", [
    paragraph("This is where a lot of small businesses get pushed into the wrong software."),
    paragraph("They try tools built for bigger teams, bigger platforms, and bigger process. More settings. More cost. More overhead. More things to babysit."),
    list([
      "Most small stores do not need enterprise chat software.",
      "They need a widget on the site, a shared inbox, clear visitor context, and offline lead capture.",
      "They need something a lean team will actually keep using after launch week."
    ]),
    paragraph("That is a much smaller problem than most support platforms are trying to solve.")
  ])
];
