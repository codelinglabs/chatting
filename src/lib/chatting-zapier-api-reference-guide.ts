import type { GuideArticle } from "@/lib/guide-article";
import { chattingZapierApiReferenceGuideSections } from "@/lib/chatting-zapier-api-reference-guide-sections";

export const chattingZapierApiReferenceGuide: GuideArticle = {
  slug: "chatting-zapier-api-reference",
  title: "Chatting Zapier API reference",
  excerpt:
    "Reference docs for Chatting's Zapier auth check, trigger subscriptions, action endpoints, error codes, and sample payloads.",
  subtitle:
    "The endpoint-level reference for Chatting's Zapier app, including auth headers, trigger lifecycle requests, actions, and the payload shapes reviewers and integrators need.",
  seoTitle: "Chatting Zapier API Reference",
  publishedAt: "2026-04-09T00:45:00.000Z",
  updatedAt: "2026-04-09T00:45:00.000Z",
  readingTime: 6,
  image: {
    src: "/blog/chatting-zapier-integration-guide.svg",
    alt: "Chatting Zapier API reference artwork showing a trigger, workflow, and action flow."
  },
  sections: chattingZapierApiReferenceGuideSections
};
