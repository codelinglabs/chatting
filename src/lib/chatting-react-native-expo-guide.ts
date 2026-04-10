import type { GuideArticle } from "@/lib/guide-article";
import { chattingReactNativeExpoGuideSections } from "@/lib/chatting-react-native-expo-guide-sections";

export const chattingReactNativeExpoGuide: GuideArticle = {
  slug: "chatting-react-native-expo-guide",
  title: "Chatting Expo and React Native guide: add visitor chat with a real mobile package",
  excerpt:
    "Install the published React Native package, create a client, add a support screen, and register Expo push notifications.",
  subtitle:
    "Step-by-step Expo and React Native installation guide with the exact npm command, imports, push setup, and support screen code.",
  seoTitle: "Chatting Expo and React Native Guide",
  publishedAt: "2026-04-09T19:15:00.000Z",
  updatedAt: "2026-04-09T19:50:00.000Z",
  readingTime: 5,
  image: {
    src: "/blog/chatting-react-native-expo-guide.svg",
    alt: "Chatting Expo and React Native guide cover with a mobile chat mockup and app setup panels."
  },
  sections: chattingReactNativeExpoGuideSections
};
