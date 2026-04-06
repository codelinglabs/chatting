import type { GuideArticle } from "@/lib/chatting-inbox-shortcuts-guide";
import { chattingInboxShortcutsGuide } from "@/lib/chatting-inbox-shortcuts-guide";

const guides = [chattingInboxShortcutsGuide] as const satisfies readonly GuideArticle[];

export function getAllGuides(): GuideArticle[] {
  return [...guides].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );
}

export function getGuideBySlug(slug: string): GuideArticle | null {
  return guides.find((guide) => guide.slug === slug) ?? null;
}

export function getFeaturedGuide(): GuideArticle {
  return getAllGuides()[0];
}
