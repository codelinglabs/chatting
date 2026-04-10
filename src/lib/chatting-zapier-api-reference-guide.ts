import type { GuideArticle } from "@/lib/guide-article";
import { chattingZapierApiReferenceGuideSections } from "@/lib/chatting-zapier-api-reference-guide-sections";

export const chattingZapierApiReferenceGuide: GuideArticle = {
  slug: "chatting-zapier-api-reference",
  title: "Chatting Zapier API reference",
  excerpt:
    "Endpoint reference for Chatting's Zapier auth check, trigger subscriptions, sample endpoints, actions, and error codes.",
  subtitle:
    "Use this reference while reviewing or building the Chatting Zapier app.",
  seoTitle: "Chatting Zapier API Reference",
  publishedAt: "2026-04-09T00:45:00.000Z",
  updatedAt: "2026-04-10T09:30:00.000Z",
  readingTime: 6,
  image: {
    src: "/blog/chatting-zapier-api-reference.svg",
    alt: "Chatting Zapier API reference cover with endpoint, request, and response panels."
  },
  sections: chattingZapierApiReferenceGuideSections
};
