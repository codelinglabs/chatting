"use client";

import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type { ConversationSummary, ConversationThread, Site } from "@/lib/types";
import type { BannerState } from "./dashboard-client.types";
import { useDashboardLiveSync } from "./use-dashboard-live-sync";

type SetState<T> = Dispatch<SetStateAction<T>>;

export function useDashboardStateEffects(input: {
  pathname: string;
  searchParams: URLSearchParams | null;
  routeConversationId: string | null;
  initialSites: Site[];
  initialConversations: ConversationSummary[];
  initialActiveConversation: ConversationThread | null;
  initialAnsweredConversations: number;
  initialRatedConversations: number;
  conversations: ConversationSummary[];
  activeConversation: ConversationThread | null;
  loadingConversationId: string | null;
  setSites: SetState<Site[]>;
  setConversations: SetState<ConversationSummary[]>;
  setActiveConversation: SetState<ConversationThread | null>;
  setAnsweredConversations: SetState<number>;
  setRatedConversations: SetState<number>;
  setBanner: SetState<BannerState>;
  setLoadingConversationId: SetState<string | null>;
  setVisitorTypingConversationId: SetState<string | null>;
  setLiveConnectionState: SetState<"connected" | "reconnecting">;
  activeTypingConversationIdRef: MutableRefObject<string | null>;
  activeConversationIdRef: MutableRefObject<string | null>;
  conversationsRef: MutableRefObject<ConversationSummary[]>;
  recentOptimisticReplyAtRef: MutableRefObject<Map<string, number>>;
  applyReadState: (conversationId: string) => void;
  refreshConversationList: () => Promise<void>;
  refreshConversationSummary: (conversationId: string, moveToTop?: boolean) => Promise<{ id: string } | null>;
  refreshConversation: (conversationId: string) => Promise<{ id: string } | null>;
  openConversation: (conversationId: string) => Promise<{ id: string } | null>;
  clearActiveConversation: () => void;
  clearTypingSignal: () => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
}) {
  useEffect(() => {
    input.setSites(input.initialSites);
    input.setConversations(input.initialConversations);
    input.setActiveConversation(input.initialActiveConversation);
    input.setAnsweredConversations(input.initialAnsweredConversations);
    input.setRatedConversations(input.initialRatedConversations);
    input.setBanner(null);
  }, [
    input.initialActiveConversation,
    input.initialAnsweredConversations,
    input.initialConversations,
    input.initialRatedConversations,
    input.initialSites,
    input.setActiveConversation,
    input.setAnsweredConversations,
    input.setBanner,
    input.setConversations,
    input.setRatedConversations,
    input.setSites
  ]);

  useEffect(() => {
    input.conversationsRef.current = input.conversations;
  }, [input.conversations, input.conversationsRef]);

  useEffect(() => {
    input.activeConversationIdRef.current = input.activeConversation?.id ?? null;
  }, [input.activeConversation?.id, input.activeConversationIdRef]);

  useEffect(() => {
    if (input.pathname !== "/dashboard/inbox") {
      return;
    }

    if (!input.routeConversationId) {
      input.clearActiveConversation();
      return;
    }

    if (input.routeConversationId === input.activeConversation?.id) {
      if (input.loadingConversationId) {
        input.setLoadingConversationId(null);
      }
      return;
    }

    if (input.routeConversationId === input.loadingConversationId) {
      return;
    }

    void input.openConversation(input.routeConversationId);
  }, [
    input.pathname,
    input.routeConversationId,
    input.activeConversation?.id,
    input.loadingConversationId,
    input.clearActiveConversation,
    input.openConversation,
    input.setLoadingConversationId
  ]);

  useEffect(() => {
    const currentTypingConversationId = input.activeTypingConversationIdRef.current;
    if (currentTypingConversationId && currentTypingConversationId !== (input.activeConversation?.id ?? null)) {
      void input.clearTypingSignal();
    }
  }, [input.activeConversation?.id, input.activeTypingConversationIdRef, input.clearTypingSignal]);

  useEffect(
    () => () => {
      void input.clearTypingSignal();
    },
    [input.clearTypingSignal]
  );

  useEffect(() => {
    if (!input.activeConversation?.id) {
      return;
    }

    input.setVisitorTypingConversationId((current) =>
      current === input.activeConversation!.id ? current : null
    );
    void input.markConversationAsRead(input.activeConversation.id);
  }, [input.activeConversation?.id, input.markConversationAsRead, input.setVisitorTypingConversationId]);

  useEffect(() => {
    if (!input.searchParams) {
      return;
    }

    const nextParams = new URLSearchParams(input.searchParams.toString());
    const hadSuccess = nextParams.has("success");
    const hadError = nextParams.has("error");

    nextParams.delete("success");
    nextParams.delete("error");

    if (!hadSuccess && !hadError) {
      return;
    }

    const nextUrl = nextParams.toString() ? `${input.pathname}?${nextParams.toString()}` : input.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [input.pathname, input.searchParams]);

  useDashboardLiveSync({
    activeConversationIdRef: input.activeConversationIdRef,
    recentOptimisticReplyAtRef: input.recentOptimisticReplyAtRef,
    applyReadState: input.applyReadState,
    refreshConversationList: input.refreshConversationList,
    refreshConversationSummary: input.refreshConversationSummary,
    refreshConversation: input.refreshConversation,
    markConversationAsRead: input.markConversationAsRead,
    setVisitorTypingConversationId: input.setVisitorTypingConversationId,
    setLiveConnectionState: input.setLiveConnectionState
  });
}
