"use client";

import { useEffect, useRef, useState } from "react";
import type { ConversationSummary, VisitorPresenceSession } from "@/lib/types";
import { subscribeDashboardLiveClient } from "./dashboard-live-client";
import {
  upsertVisitorConversationSummary,
  upsertVisitorPresenceSession
} from "./dashboard-visitors-live-state";

type VisitorsDataResponse = {
  ok: true;
  conversations: ConversationSummary[];
  liveSessions: VisitorPresenceSession[];
};

type ConversationSummaryResponse = {
  ok: true;
  summary: ConversationSummary;
};

type VisitorSessionResponse = {
  ok: true;
  session: VisitorPresenceSession;
};

export function useDashboardVisitorsData(input: {
  initialConversations: ConversationSummary[];
  initialLiveSessions: VisitorPresenceSession[];
}) {
  const [conversations, setConversations] = useState(input.initialConversations);
  const [liveSessions, setLiveSessions] = useState(input.initialLiveSessions);
  const [refreshing, setRefreshing] = useState(false);
  const [, setClockTick] = useState(0);
  const intervalIdRef = useRef<number | null>(null);
  const unsubscribeLiveRef = useRef<(() => void) | null>(null);

  async function refreshVisitors(manual = false) {
    if (manual) {
      setRefreshing(true);
    }

    try {
      const response = await fetch("/dashboard/visitors-data", {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as VisitorsDataResponse;
      setConversations(payload.conversations);
      setLiveSessions(payload.liveSessions);
    } catch {
      // Keep the current UI steady if a refresh misses.
    } finally {
      if (manual) {
        setRefreshing(false);
      }
    }
  }

  async function refreshConversationSummary(conversationId: string) {
    try {
      const response = await fetch(
        `/dashboard/conversation-summary?conversationId=${encodeURIComponent(conversationId)}`,
        {
          method: "GET",
          cache: "no-store"
        }
      );

      if (!response.ok) {
        return false;
      }

      const payload = (await response.json()) as ConversationSummaryResponse;
      setConversations((current) => upsertVisitorConversationSummary(current, payload.summary));
      return true;
    } catch {
      return false;
    }
  }

  async function refreshLiveSession(siteId: string, sessionId: string) {
    try {
      const response = await fetch(
        `/dashboard/visitor-session?siteId=${encodeURIComponent(siteId)}&sessionId=${encodeURIComponent(sessionId)}`,
        {
          method: "GET",
          cache: "no-store"
        }
      );

      if (!response.ok) {
        return false;
      }

      const payload = (await response.json()) as VisitorSessionResponse;
      setLiveSessions((current) => upsertVisitorPresenceSession(current, payload.session));
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    setConversations(input.initialConversations);
    setLiveSessions(input.initialLiveSessions);
  }, [input.initialConversations, input.initialLiveSessions]);

  useEffect(() => {
    if (intervalIdRef.current !== null) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setClockTick((current) => current + 1);
    }, 30000);
    intervalIdRef.current = intervalId;

    return () => {
      if (intervalIdRef.current !== null) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (unsubscribeLiveRef.current) {
      return;
    }

    const unsubscribe = subscribeDashboardLiveClient({
      onError() {
        void refreshVisitors();
      },
      onMessage(event) {
        if (event.type === "visitor.presence.updated") {
          void refreshLiveSession(event.siteId, event.sessionId).then((ok) => {
            if (!ok) {
              void refreshVisitors();
            }
          });
          return;
        }

        if (event.type === "message.created" && event.sender === "user" && event.conversationId) {
          void refreshConversationSummary(event.conversationId).then((ok) => {
            if (!ok) {
              void refreshVisitors();
            }
          });
        }
      }
    });
    unsubscribeLiveRef.current = unsubscribe;

    return () => {
      unsubscribeLiveRef.current?.();
      unsubscribeLiveRef.current = null;
    };
  }, []);

  return {
    conversations,
    liveSessions,
    refreshing,
    refreshVisitors
  };
}
