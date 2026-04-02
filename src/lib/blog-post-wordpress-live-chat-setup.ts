import type { BlogPost } from "@/lib/blog-types";
import { wordpressLiveChatSetupPrimarySections } from "@/lib/blog-post-wordpress-live-chat-setup-primary-sections";
import { wordpressLiveChatSetupSecondarySections } from "@/lib/blog-post-wordpress-live-chat-setup-secondary-sections";

export const wordpressLiveChatSetupPost: BlogPost = {
  slug: "wordpress-live-chat",
  title: "WordPress live chat without the plugin bloat",
  excerpt: "Add live chat to WordPress in 5 minutes without installing another plugin. Works with any theme. Step-by-step guide included.",
  subtitle:
    "Your WordPress site has enough plugins. Here's how to add live chat with one line of code - no maintenance, no updates, no conflicts.",
  seoTitle: "WordPress Live Chat: The No-Plugin Setup Guide (2026)",
  publishedAt: "2026-03-12T09:00:00.000Z",
  updatedAt: "2026-03-12T09:00:00.000Z",
  readingTime: 9,
  authorSlug: "tina",
  categorySlug: "how-to-guides",
  image: { src: "/blog/wordpress-live-chat-setup.svg", alt: "WordPress dashboard-themed artwork with a live chat installation snippet." },
  aliases: ["wordpress-live-chat-setup"],
  relatedSlugs: ["shopify-live-chat", "reduce-response-time-under-2-minutes", "live-chat-vs-contact-forms"],
  sections: [...wordpressLiveChatSetupPrimarySections, ...wordpressLiveChatSetupSecondarySections]
};
