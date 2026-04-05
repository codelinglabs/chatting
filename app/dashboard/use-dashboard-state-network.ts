"use client";

import { useMemo } from "react";
import { createDashboardStateNetwork } from "./dashboard-state-network";

export function useDashboardStateNetwork(
  input: Parameters<typeof createDashboardStateNetwork>[0]
) {
  return useMemo(
    () => createDashboardStateNetwork(input),
    [
      input.setBanner,
      input.setConversations,
      input.setActiveConversation,
      input.setLoadingConversationId,
      input.conversationCacheRef,
      input.openRequestIdRef,
      input.activeTypingConversationIdRef,
      input.lastTypingSentAtRef
    ]
  );
}
