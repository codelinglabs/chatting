import type { BlogPost } from "@/lib/blog-types";
import { chatlyVsZendeskSections } from "@/lib/blog-post-chatly-vs-zendesk-sections";

export const chatlyVsZendeskPost: BlogPost = {
  slug: "chatting-vs-zendesk",
  title: "Chatting vs Zendesk: Conversations vs tickets",
  excerpt:
    "If you're comparing Zendesk vs simple live chat, the real question is whether your team needs a help desk or just a fast way to talk to customers.",
  subtitle:
    "Zendesk turns every chat into a ticket. Chatting keeps it a conversation. Here's why that matters when you want simple live chat for a small team.",
  seoTitle: "Zendesk vs Simple Live Chat: What Small Teams Actually Need (2026)",
  publishedAt: "2026-03-18T09:00:00.000Z",
  updatedAt: "2026-03-18T09:00:00.000Z",
  readingTime: 7,
  authorSlug: "tina",
  categorySlug: "comparisons",
  image: { src: "/blog/chatting-vs-zendesk.svg", alt: "Abstract comparison card showing chat conversations versus ticket queues." },
  aliases: ["chatly-vs-zendesk", "zendesk-vs-simple-live-chat"],
  relatedSlugs: ["chatting-vs-intercom", "best-intercom-alternatives-small-teams", "reduce-response-time-under-2-minutes"],
  sections: chatlyVsZendeskSections
};
