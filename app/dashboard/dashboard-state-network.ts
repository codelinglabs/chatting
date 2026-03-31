"use client";

import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { ConversationSummary, ConversationThread } from "@/lib/types";
import type { BannerState } from "./dashboard-client.types";
import { syncConversationSummaryList, toSummary } from "./dashboard-state-helpers";

type SetState<T> = Dispatch<SetStateAction<T>>;

export function createDashboardStateNetwork(input: {
  setBanner: SetState<BannerState>;
  setConversations: SetState<ConversationSummary[]>;
  setActiveConversation: SetState<ConversationThread | null>;
  setLoadingConversationId: SetState<string | null>;
  conversationCacheRef: MutableRefObject<Map<string, ConversationThread>>;
  openRequestIdRef: MutableRefObject<number>;
  activeTypingConversationIdRef: MutableRefObject<string | null>;
  lastTypingSentAtRef: MutableRefObject<number>;
}) {
  function showBanner(tone: NonNullable<BannerState>["tone"], text: string) {
    input.setBanner({ tone, text });
  }

  function syncSummary(summary: ConversationSummary) {
    input.setConversations((current) => syncConversationSummaryList(current, summary));
  }

  function applyReadState(conversationId: string) {
    input.setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
      )
    );
    input.setActiveConversation((current) =>
      current && current.id === conversationId ? { ...current, unreadCount: 0 } : current
    );
  }

  async function refreshConversationList() {
    try {
      const response = await fetch("/dashboard/conversations", {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { ok: true; conversations: ConversationSummary[] };
      input.setConversations(payload.conversations);
    } catch {
      return;
    }
  }

  async function refreshConversationSummary(conversationId: string) {
    try {
      const response = await fetch(
        `/dashboard/conversation-summary?conversationId=${encodeURIComponent(conversationId)}`,
        { method: "GET", cache: "no-store" }
      );

      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as { ok: true; summary: ConversationSummary };
      const cachedConversation = input.conversationCacheRef.current.get(payload.summary.id);
      if (cachedConversation) {
        input.conversationCacheRef.current.set(payload.summary.id, {
          ...cachedConversation,
          ...payload.summary
        });
      }

      syncSummary(payload.summary);
      input.setActiveConversation((current) =>
        current && current.id === payload.summary.id ? { ...current, ...payload.summary } : current
      );
      return payload.summary;
    } catch {
      return null;
    }
  }

  async function fetchConversationById(conversationId: string) {
    try {
      const response = await fetch(`/dashboard/conversation?conversationId=${encodeURIComponent(conversationId)}`, {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as { ok: true; conversation: ConversationThread };
      input.conversationCacheRef.current.set(payload.conversation.id, payload.conversation);
      return payload.conversation;
    } catch {
      return null;
    }
  }

  function syncActiveConversation(conversation: ConversationThread) {
    input.setActiveConversation(conversation);
    syncSummary(toSummary(conversation));
  }

  async function refreshConversation(conversationId: string) {
    const conversation = await fetchConversationById(conversationId);
    if (!conversation) {
      return null;
    }

    syncActiveConversation(conversation);
    return conversation;
  }

  async function openConversation(conversationId: string) {
    const requestId = ++input.openRequestIdRef.current;
    input.setLoadingConversationId(conversationId);

    const cached = input.conversationCacheRef.current.get(conversationId);
    const conversation = cached ?? await fetchConversationById(conversationId);
    if (!cached && input.openRequestIdRef.current !== requestId) {
      return conversation;
    }

    if (conversation) {
      syncActiveConversation(conversation);
      void markConversationAsRead(conversationId);
    }

    input.setLoadingConversationId(null);
    return conversation;
  }

  function clearActiveConversation() {
    input.setLoadingConversationId(null);
    input.setActiveConversation(null);
  }

  async function markConversationAsRead(conversationId: string) {
    applyReadState(conversationId);
    await fetch("/dashboard/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
      keepalive: true
    }).catch(() => {});
  }

  async function postTypingSignal(conversationId: string, typing: boolean) {
    await fetch("/dashboard/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, typing }),
      keepalive: !typing
    }).catch(() => {});
  }

  async function clearTypingSignal() {
    const conversationId = input.activeTypingConversationIdRef.current;
    if (!conversationId) {
      return;
    }

    input.activeTypingConversationIdRef.current = null;
    input.lastTypingSentAtRef.current = 0;
    await postTypingSignal(conversationId, false);
  }

  return {
    showBanner,
    applyReadState,
    refreshConversationList,
    refreshConversationSummary,
    refreshConversation,
    openConversation,
    clearActiveConversation,
    markConversationAsRead,
    postTypingSignal,
    clearTypingSignal
  };
}
