export type Sender = "user" | "founder";

export type CurrentUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type Site = {
  id: string;
  userId: string;
  name: string;
  domain: string | null;
  brandColor: string;
  greetingText: string;
  createdAt: string;
  conversationCount: number;
};

export type ConversationSummary = {
  id: string;
  siteId: string;
  siteName: string;
  email: string | null;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  pageUrl: string | null;
  referrer: string | null;
  userAgent: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  helpful: boolean | null;
  tags: string[];
};

export type ThreadMessage = {
  id: string;
  conversationId: string;
  sender: Sender;
  content: string;
  createdAt: string;
};

export type ConversationThread = ConversationSummary & {
  messages: ThreadMessage[];
};

export type DashboardStats = {
  totalConversations: number;
  answeredConversations: number;
  helpfulResponses: number;
  topTags: Array<{ tag: string; count: number }>;
};
