import type { BlogPost } from "@/lib/blog-types";
import { bestIntercomAlternativesPrimarySections } from "@/lib/blog-post-best-intercom-alternatives-primary-sections";
import { bestIntercomAlternativesSecondarySections } from "@/lib/blog-post-best-intercom-alternatives-secondary-sections";

export const bestIntercomAlternativesSmallTeamsPost: BlogPost = {
  slug: "intercom-alternatives-small-business",
  title: "Intercom alternatives that won't require a second mortgage",
  excerpt:
    "If you want an Intercom alternative for small teams, these 7 options give you live chat without the enterprise-style bill.",
  subtitle:
    "Love Intercom's polish. Hate the per-seat bill. Here are lower-cost live chat options for small teams and startups.",
  seoTitle: "Intercom Alternative for Small Teams: 7 Lower-Cost Options (2026)",
  publishedAt: "2026-03-09T09:00:00.000Z",
  updatedAt: "2026-03-09T09:00:00.000Z",
  readingTime: 12,
  authorSlug: "tina",
  categorySlug: "comparisons",
  image: {
    src: "/blog/best-intercom-alternatives-small-teams.svg",
    alt: "Stacked pricing cards representing Intercom alternatives for small businesses."
  },
  aliases: [
    "best-intercom-alternatives-small-teams",
    "intercom-alternative-small-teams",
    "intercom-alternative-for-small-teams",
    "intercom-alternatives-small-teams"
  ],
  relatedSlugs: ["chatting-vs-intercom", "chatting-vs-zendesk", "live-chat-software-small-teams"],
  sections: [...bestIntercomAlternativesPrimarySections, ...bestIntercomAlternativesSecondarySections]
};
