import type { BlogPost } from "@/lib/blog-types";
import { bestLiveChatForStartupsPrimarySections } from "@/lib/blog-post-best-live-chat-for-startups-primary-sections";
import { bestLiveChatForStartupsSecondarySections } from "@/lib/blog-post-best-live-chat-for-startups-secondary-sections";

export const bestLiveChatForStartupsPost: BlogPost = {
  slug: "best-live-chat-for-startups",
  title: "Best live chat for startups: what to pick before you overbuy",
  excerpt:
    "The best live chat for startups is simple, fast, and affordable. Here's how to choose a tool that helps you talk to customers without buying enterprise bloat.",
  subtitle:
    "You do not need a giant customer platform on day one. You need a widget, an inbox, and a fast way to help real buyers.",
  seoTitle: "Best Live Chat for Startups: What to Pick Before You Overbuy (2026)",
  publishedAt: "2026-04-02T09:00:00.000Z",
  updatedAt: "2026-04-02T09:00:00.000Z",
  readingTime: 9,
  authorSlug: "tina",
  categorySlug: "small-teams",
  image: {
    src: "/blog/best-live-chat-for-startups.svg",
    alt: "Startup-themed illustration showing a chat widget, shared inbox, and launch rocket."
  },
  relatedSlugs: ["live-chat-software-small-teams", "intercom-alternatives-small-business", "ecommerce-live-chat-support"],
  sections: [...bestLiveChatForStartupsPrimarySections, ...bestLiveChatForStartupsSecondarySections]
};
