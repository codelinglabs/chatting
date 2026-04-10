import type { GuideArticle } from "@/lib/guide-article";
import { chattingWebhooksIntegrationGuideSections } from "@/lib/chatting-webhooks-integration-guide-sections";

export const chattingWebhooksIntegrationGuide: GuideArticle = {
  slug: "chatting-webhooks-integration",
  title: "Chatting webhooks guide: send conversation events to your own endpoint",
  excerpt:
    "Send Chatting events to your own HTTPS endpoint and verify signed deliveries in your backend.",
  subtitle:
    "Step-by-step webhook guide with supported events, endpoint setup, signature verification, and test deliveries.",
  seoTitle: "Chatting Webhooks Guide",
  publishedAt: "2026-04-08T15:30:00.000Z",
  updatedAt: "2026-04-10T09:30:00.000Z",
  readingTime: 4,
  image: {
    src: "/blog/chatting-webhooks-integration-guide.svg",
    alt: "Chatting webhooks guide cover with event payload cards and a secure endpoint panel."
  },
  sections: chattingWebhooksIntegrationGuideSections
};
