import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogSection } from "@/lib/blog-types";

export const afterHoursLiveChatEcommerceLeadsSecondarySections: BlogSection[] = [
  section("what-actually-works-after-hours", "What actually works after hours", [
    paragraph("For most small e-commerce teams, the best after-hours setup is simple."),
    list([
      "Let chat handle the obvious repeat questions.",
      "Collect details when the answer needs a human.",
      "Follow up later without losing the thread."
    ], true),
    paragraph("That usually covers the questions that matter most: pricing, shipping, delivery timing, turnaround time, customization, and product options."),
    paragraph("The goal is not to fake 24/7 support. The goal is to stop wasting high-intent visits when your team is offline.")
  ]),
  section("why-chatting-fits-this-use-case", "Why Chatting makes sense here", [
    paragraph("This is exactly the kind of problem Chatting is built for."),
    paragraph("Small stores do not need a bloated support stack. They need a live chat setup that feels lightweight, works after hours, and gives the team a clean path to follow up."),
    list([
      "A customizable widget that fits the store instead of feeling bolted on",
      "Offline capture when nobody is available",
      "FAQ suggestions for the common pre-sales questions that repeat every week",
      "A shared inbox so follow-up stays organized",
      "Visitor context so replies start with context instead of guesswork"
    ]),
    paragraph("That is the difference. Chatting helps small stores stay responsive after hours without buying software meant for someone else's company.")
  ]),
  section("you-do-not-need-overnight-coverage", "You do not need to be online all night", [
    paragraph("This is where a lot of store owners talk themselves out of live chat. They think: if I cannot answer 24/7, what is the point?"),
    paragraph("The point is that silence is worse."),
    list([
      "A useful answer is good.",
      "A captured lead is still good.",
      "A clear handoff is still good.",
      "Even a simple leave-your-details flow is better than letting a serious buyer disappear."
    ]),
    paragraph("Small businesses do not need perfect coverage. They need a better next step.")
  ]),
  section("our-take", "Our take", [
    paragraph("If your e-commerce store gets after-hours traffic, live chat is worth it. Not because it magically creates demand, but because it helps you stop losing the demand you already earned."),
    paragraph("And for most small stores, the best answer is not a giant platform with enterprise baggage. It is a simpler tool that helps you answer common questions, capture serious leads, and follow up cleanly when a human needs to step in."),
    cta(
      "Capture after-hours buyers with less overhead",
      "Use Chatting to answer common pre-sales questions, collect better leads when your team is offline, and keep the conversation moving without a 24/7 support setup.",
      "Start free with Chatting",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do small e-commerce stores need 24/7 live chat?",
        answer:
          "No. Most just need a way to answer basic after-hours questions and capture contact details for follow-up when a human reply is needed."
      },
      {
        question: "What should after-hours live chat handle first?",
        answer:
          "Start with the questions most likely to block a purchase: price, shipping, timing, delivery, customization, and product options."
      },
      {
        question: "Is after-hours live chat more about support or sales?",
        answer:
          "For many small stores, it is closer to lead capture and qualification than traditional support. The value is keeping serious buyers from disappearing."
      },
      {
        question: "What if the chat cannot answer the question?",
        answer:
          "It should collect the visitor's details and context so a human can continue the conversation later without starting from scratch."
      },
      {
        question: "Why is Chatting a good fit for this?",
        answer:
          "Because it gives small teams the parts that matter here: a customizable widget, offline capture, visitor context, FAQ suggestions, and a shared inbox without the weight of an enterprise support stack."
      }
    ])
  ])
];
