import type { Metadata } from "next";
import { GuideArticlePage } from "../guide-article-page";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { getGuideBySlug } from "@/lib/guides-data";

const guidePath = "/guides/chatting-inbox-shortcuts";
const guide = getGuideBySlug("chatting-inbox-shortcuts");

if (!guide) {
  throw new Error("GUIDE_NOT_FOUND");
}

export const metadata: Metadata = {
  title: `${guide.seoTitle} | Chatting`,
  description: guide.excerpt,
  alternates: { canonical: buildAbsoluteUrl(guidePath) },
  openGraph: {
    title: guide.title,
    description: guide.excerpt,
    url: buildAbsoluteUrl(guidePath),
    type: "article",
    publishedTime: guide.publishedAt,
    modifiedTime: guide.updatedAt,
    images: [
      {
        url: buildAbsoluteUrl(guide.image.src),
        alt: guide.image.alt,
        width: 1200,
        height: 630
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: guide.title,
    description: guide.excerpt,
    images: [buildAbsoluteUrl(guide.image.src)]
  }
};

export default function ChattingInboxShortcutsGuideRoute() {
  return <GuideArticlePage guide={guide} />;
}
