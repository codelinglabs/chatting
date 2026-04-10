import type { GuideArticle } from "@/lib/guide-article";
import { chattingZapierIntegrationGuideSections } from "@/lib/chatting-zapier-integration-guide-sections";

export const chattingZapierIntegrationGuide: GuideArticle = {
  slug: "chatting-zapier-integration",
  title: "Chatting Zapier integration guide: build triggers and actions that actually help",
  excerpt:
    "Connect Chatting to Zapier so conversations, contacts, and tags can trigger automations or receive actions back.",
  subtitle:
    "Step-by-step Zapier setup guide with the API key flow, supported triggers and actions, and a first Zap to test.",
  seoTitle: "Chatting Zapier Integration Guide",
  publishedAt: "2026-04-08T15:10:00.000Z",
  updatedAt: "2026-04-10T09:30:00.000Z",
  readingTime: 5,
  image: {
    src: "/blog/chatting-zapier-integration-guide.svg",
    alt: "Chatting Zapier guide cover with trigger, routing, and action panels."
  },
  sections: chattingZapierIntegrationGuideSections
};
