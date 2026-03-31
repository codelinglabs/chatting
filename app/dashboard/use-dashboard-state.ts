"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { ConversationThread } from "@/lib/types";
import type { BannerState, DashboardClientProps } from "./dashboard-client.types";
import { topTagsFromConversations } from "./dashboard-client.utils";
import { filterDashboardConversations } from "./dashboard-state-helpers";
import { createDashboardStateNetwork } from "./dashboard-state-network";
import { useDashboardStateEffects } from "./use-dashboard-state-effects";
import { createDashboardActions } from "./use-dashboard-actions";

export type ThreadFilter = "all" | "open" | "resolved";

export function useDashboardState({
  initialStats,
  initialSites,
  initialConversations,
  initialActiveConversation
}: Pick<
  DashboardClientProps,
  "initialStats" | "initialSites" | "initialConversations" | "initialActiveConversation"
>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeConversationId = searchParams?.get("id")?.trim() || null;
  const initialLoadingConversationId =
    routeConversationId && routeConversationId !== initialActiveConversation?.id ? routeConversationId : null;
  const [sites, setSites] = useState(initialSites);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversation, setActiveConversation] = useState(initialActiveConversation);
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(initialLoadingConversationId);
  const [answeredConversations, setAnsweredConversations] = useState(initialStats.answeredConversations);
  const [ratedConversations, setRatedConversations] = useState(initialStats.ratedConversations);
  const [banner, setBanner] = useState<BannerState>(null);
  const [savingSiteId, setSavingSiteId] = useState<string | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [threadFilter, setThreadFilter] = useState<ThreadFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visitorTypingConversationId, setVisitorTypingConversationId] = useState<string | null>(null);
  const [liveConnectionState, setLiveConnectionState] = useState<"connected" | "reconnecting">("connected");
  const activeTypingConversationIdRef = useRef<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(initialActiveConversation?.id ?? null);
  const conversationsRef = useRef(initialConversations);
  const conversationCacheRef = useRef<Map<string, ConversationThread>>(
    initialActiveConversation ? new Map([[initialActiveConversation.id, initialActiveConversation]]) : new Map()
  );
  const openRequestIdRef = useRef(0);
  const lastTypingSentAtRef = useRef(0);
  const recentOptimisticReplyAtRef = useRef<Map<string, number>>(new Map());
  const pendingTagMutationsRef = useRef<Set<string>>(new Set());
  const {
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
  } = createDashboardStateNetwork({
    setBanner,
    setConversations,
    setActiveConversation,
    setLoadingConversationId,
    conversationCacheRef,
    openRequestIdRef,
    activeTypingConversationIdRef,
    lastTypingSentAtRef
  });

  useEffect(() => {
    if (activeConversation) {
      conversationCacheRef.current.set(activeConversation.id, activeConversation);
    }
  }, [activeConversation]);

  useDashboardStateEffects({
    pathname,
    searchParams: searchParams ? new URLSearchParams(searchParams.toString()) : null,
    routeConversationId,
    initialSites,
    initialConversations,
    initialActiveConversation,
    initialAnsweredConversations: initialStats.answeredConversations,
    initialRatedConversations: initialStats.ratedConversations,
    conversations,
    activeConversation,
    loadingConversationId,
    setSites,
    setConversations,
    setActiveConversation,
    setAnsweredConversations,
    setRatedConversations,
    setBanner,
    setLoadingConversationId,
    setVisitorTypingConversationId,
    setLiveConnectionState,
    activeTypingConversationIdRef,
    activeConversationIdRef,
    conversationsRef,
    recentOptimisticReplyAtRef,
    applyReadState,
    refreshConversationList,
    refreshConversationSummary,
    refreshConversation,
    openConversation,
    clearActiveConversation,
    clearTypingSignal,
    markConversationAsRead
  });

  const {
    handleSiteTitleSave,
    handleSaveConversationEmail,
    handleReplySend,
    handleConversationStatusChange,
    handleTagToggle,
    handleReplyComposerInput,
    handleReplyComposerFocus,
    handleReplyComposerBlur
  } = createDashboardActions({
    activeConversation,
    conversations,
    sendingReply,
    setSites,
    setConversations,
    setActiveConversation,
    setSavingSiteId,
    setSavingEmail,
    setSendingReply,
    setUpdatingStatus,
    setAnsweredConversations,
    setBanner,
    recentOptimisticReplyAtRef,
    pendingTagMutationsRef,
    activeTypingConversationIdRef,
    lastTypingSentAtRef,
    showBanner,
    clearTypingSignal,
    postTypingSignal
  });

  const filteredConversations = filterDashboardConversations(conversations, threadFilter, searchQuery);

  return {
    sites,
    conversations,
    filteredConversations,
    activeConversation,
    answeredConversations,
    ratedConversations,
    banner,
    savingSiteId,
    savingEmail,
    sendingReply,
    updatingStatus,
    threadFilter,
    searchQuery,
    visitorTypingConversationId,
    liveConnectionState,
    loadingConversationId,
    topTags: topTagsFromConversations(conversations),
    handleSiteTitleSave,
    handleSaveConversationEmail,
    handleReplySend,
    handleConversationStatusChange,
    handleReplyComposerBlur,
    handleReplyComposerFocus,
    handleReplyComposerInput,
    handleTagToggle,
    openConversation,
    clearActiveConversation,
    setThreadFilter,
    setSearchQuery
  };
}

export type DashboardState = ReturnType<typeof useDashboardState>;
