import type { GuideArticle } from "@/lib/guide-article";
import { chattingShopifyIntegrationGuideSections } from "@/lib/chatting-shopify-integration-guide-sections";

export const chattingShopifyIntegrationGuide: GuideArticle = {
  slug: "chatting-shopify-integration",
  title: "Chatting Shopify integration guide: bring order context into the inbox",
  excerpt:
    "Connect Shopify to Chatting so the inbox can show customer and order context next to each conversation.",
  subtitle:
    "Step-by-step Shopify connection guide with the store domain format, authorization flow, and inbox behavior.",
  seoTitle: "Chatting Shopify Integration Guide",
  publishedAt: "2026-04-08T15:20:00.000Z",
  updatedAt: "2026-04-10T09:30:00.000Z",
  readingTime: 4,
  image: {
    src: "/blog/chatting-shopify-integration-guide.svg",
    alt: "Chatting Shopify guide cover with storefront, order, and customer context panels."
  },
  sections: chattingShopifyIntegrationGuideSections
};
