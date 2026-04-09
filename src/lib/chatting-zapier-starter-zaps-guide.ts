import type { GuideArticle } from "@/lib/guide-article";
import { chattingZapierStarterZapsGuideSections } from "@/lib/chatting-zapier-starter-zaps-guide-sections";

export const chattingZapierStarterZapsGuide: GuideArticle = {
  slug: "chatting-zapier-starter-zaps",
  title: "Chatting Zapier starter Zaps: four workflows worth publishing first",
  excerpt:
    "Use these starter Chatting and Zapier workflows as your first alerting, logging, lead-import, and auto-reply templates.",
  subtitle:
    "A short list of the best first-use Zaps to publish in your docs, onboarding, or future Zap templates once Chatting is live in Zapier.",
  seoTitle: "Chatting Zapier Starter Zaps",
  publishedAt: "2026-04-09T02:05:00.000Z",
  updatedAt: "2026-04-09T02:05:00.000Z",
  readingTime: 4,
  image: {
    src: "/blog/chatting-zapier-integration-guide.svg",
    alt: "Chatting Zapier starter workflows for alerts, contact logging, imports, and automatic replies."
  },
  sections: chattingZapierStarterZapsGuideSections
};
