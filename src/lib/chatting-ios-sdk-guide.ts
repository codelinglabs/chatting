import type { GuideArticle } from "@/lib/guide-article";
import { chattingIosSdkGuideSections } from "@/lib/chatting-ios-sdk-guide-sections";

export const chattingIosSdkGuide: GuideArticle = {
  slug: "chatting-ios-sdk-guide",
  title: "Chatting iOS SDK guide: add native visitor chat to your app",
  excerpt:
    "Install the iOS SDK with Swift Package Manager or CocoaPods, create a client, and present a native support screen in your app.",
  subtitle:
    "Step-by-step iOS installation guide with the exact package setup, client configuration, and support screen code.",
  seoTitle: "Chatting iOS SDK Guide",
  publishedAt: "2026-04-09T15:45:00.000Z",
  updatedAt: "2026-04-09T19:50:00.000Z",
  readingTime: 5,
  image: {
    src: "/blog/chatting-ios-sdk-guide.svg",
    alt: "Chatting iOS SDK cover with an iPhone chat mockup and simplified app panels."
  },
  sections: chattingIosSdkGuideSections
};
