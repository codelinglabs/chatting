import type { GuideArticle } from "@/lib/guide-article";
import { chattingInboxShortcutsGuideSections } from "@/lib/chatting-inbox-shortcuts-guide-sections";

export const chattingInboxShortcutsGuide: GuideArticle = {
  slug: "chatting-inbox-shortcuts",
  title: "Chatting inbox shortcuts: every keyboard shortcut and AI Assist command",
  excerpt:
    "Reference guide for Chatting inbox shortcuts, AI Assist keys, and command palette actions.",
  subtitle:
    "Use this page to find the exact keyboard shortcuts available in the inbox and the fastest way to open them in the product.",
  seoTitle: "Chatting Inbox Shortcuts Guide",
  publishedAt: "2026-04-06T09:00:00.000Z",
  updatedAt: "2026-04-10T09:30:00.000Z",
  readingTime: 5,
  image: {
    src: "/blog/chatting-inbox-shortcuts.svg",
    alt: "Chatting inbox shortcuts cover with keyboard-inspired panels and command palette shapes."
  },
  sections: chattingInboxShortcutsGuideSections
};
