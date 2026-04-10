import type { GuideArticle } from "@/lib/guide-article";
import { chattingSlackIntegrationGuideSections } from "@/lib/chatting-slack-integration-guide-sections";

export const chattingSlackIntegrationGuide: GuideArticle = {
  slug: "chatting-slack-integration",
  title: "Chatting Slack integration guide: connect alerts and reply from Slack",
  excerpt:
    "Connect Slack to Chatting to send conversation alerts into a channel and optionally reply from Slack.",
  subtitle:
    "Step-by-step Slack connection guide with the authorization flow, channel setup, and reply options.",
  seoTitle: "Chatting Slack Integration Guide",
  publishedAt: "2026-04-08T15:00:00.000Z",
  updatedAt: "2026-04-10T09:30:00.000Z",
  readingTime: 4,
  image: {
    src: "/blog/chatting-slack-integration-guide.svg",
    alt: "Chatting Slack guide cover with channel-style cards and reply panels."
  },
  sections: chattingSlackIntegrationGuideSections
};
