import type { GuideArticle } from "@/lib/guide-article";
import { chattingZapierStarterZapsGuideSections } from "@/lib/chatting-zapier-starter-zaps-guide-sections";

export const chattingZapierStarterZapsGuide: GuideArticle = {
  slug: "chatting-zapier-starter-zaps",
  title: "Chatting Zapier starter Zaps: four workflows worth publishing first",
  excerpt:
    "Four Zapier workflows to publish first for alerts, logging, lead import, and follow-up.",
  subtitle:
    "Use these starter Zaps as your first public templates after Chatting is connected to Zapier.",
  seoTitle: "Chatting Zapier Starter Zaps",
  publishedAt: "2026-04-09T02:05:00.000Z",
  updatedAt: "2026-04-10T09:30:00.000Z",
  readingTime: 4,
  image: {
    src: "/blog/chatting-zapier-starter-zaps.svg",
    alt: "Chatting Zapier starter Zaps cover with four workflow cards and a simple automation row."
  },
  sections: chattingZapierStarterZapsGuideSections
};
