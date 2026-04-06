import { vi } from "vitest";

export const OWNER_USER = {
  id: "user_1",
  createdAt: "2026-03-27T00:00:00.000Z",
  email: "owner@example.com",
  workspaceRole: "admin",
  workspaceOwnerId: "owner_1"
} as const;

export const GROWTH_AI_ASSIST_ACCESS = {
  ownerUserId: "owner_1",
  planKey: "growth",
  settings: {
    replySuggestionsEnabled: true,
    conversationSummariesEnabled: true,
    rewriteAssistanceEnabled: true,
    suggestedTagsEnabled: true
  }
} as const;

export const SHELL_DATA = {
  unreadCount: 3,
  notificationSettings: { email: true },
  aiAssistWarning: null,
  canManageBilling: true
} as const;

export const EMPTY_INBOX_STATS = {
  totalConversations: 0,
  answeredConversations: 0,
  ratedConversations: 0,
  topTags: []
} as const;

export function primeWrapperDefaults(mocks: {
  requireUser: ReturnType<typeof vi.fn>;
  getUserOnboardingStep?: ReturnType<typeof vi.fn>;
  usePathname?: ReturnType<typeof vi.fn>;
}) {
  mocks.requireUser.mockResolvedValue(OWNER_USER);
  mocks.getUserOnboardingStep?.mockResolvedValue("done");
  mocks.usePathname?.mockReturnValue("/dashboard");
}
