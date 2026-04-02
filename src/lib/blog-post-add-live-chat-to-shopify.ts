import type { BlogPost } from "@/lib/blog-types";
import { addLiveChatToShopifyPrimarySections } from "@/lib/blog-post-add-live-chat-to-shopify-primary-sections";
import { addLiveChatToShopifySecondarySections } from "@/lib/blog-post-add-live-chat-to-shopify-secondary-sections";

export const addLiveChatToShopifyPost: BlogPost = {
  slug: "shopify-live-chat",
  title: "Shopify live chat: turn \"just browsing\" into \"take my money\"",
  excerpt:
    "Add live chat to your Shopify store in 5 minutes. Plus: what to say, when to reach out, and how to turn browsers into buyers.",
  subtitle:
    "68% of shoppers abandon because they still have unanswered questions. Here's how to catch them before they leave.",
  seoTitle: "Shopify Live Chat: How to Add Chat and Actually Use It (2026)",
  publishedAt: "2026-03-21T09:00:00.000Z",
  updatedAt: "2026-03-21T09:00:00.000Z",
  readingTime: 11,
  authorSlug: "tina",
  categorySlug: "how-to-guides",
  image: {
    src: "/blog/add-live-chat-to-shopify.svg",
    alt: "Shopify storefront artwork with a live chat widget and support inbox."
  },
  aliases: ["add-live-chat-to-shopify"],
  relatedSlugs: ["wordpress-live-chat-setup", "live-chat-vs-contact-forms", "live-chat-software-small-teams"],
  sections: [...addLiveChatToShopifyPrimarySections, ...addLiveChatToShopifySecondarySections]
};
