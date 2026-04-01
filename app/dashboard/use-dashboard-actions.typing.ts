import type { DashboardActionsParams } from "./use-dashboard-actions.types";

export function createDashboardTypingActions({
  activeConversation,
  activeTypingConversationIdRef,
  lastTypingSentAtRef,
  clearTypingSignal,
  postTypingSignal
}: DashboardActionsParams) {
  function handleReplyComposerInput(value: string) {
    if (!activeConversation) {
      return;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      void clearTypingSignal();
      return;
    }
    const now = Date.now();
    if (
      activeTypingConversationIdRef.current !== activeConversation.id ||
      now - lastTypingSentAtRef.current >= 2000
    ) {
      activeTypingConversationIdRef.current = activeConversation.id;
      lastTypingSentAtRef.current = now;
      void postTypingSignal(activeConversation.id, true);
    }
  }

  function handleReplyComposerFocus(value: string) {
    if (value.trim()) {
      handleReplyComposerInput(value);
    }
  }

  function handleReplyComposerBlur() {
    void clearTypingSignal();
  }

  return {
    handleReplyComposerInput,
    handleReplyComposerFocus,
    handleReplyComposerBlur
  };
}
