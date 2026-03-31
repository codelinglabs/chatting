"use client";

import { useEffect, useRef, useState } from "react";
import type { DashboardLiveEvent } from "@/lib/live-events";
import { countUnreadConversations } from "./dashboard-unread-count";

type ConversationSummariesResponse = {
  ok: true;
  conversations: Array<{
    unreadCount: number;
  }>;
};

export function useDashboardLiveUnreadCount(initialUnreadCount: number) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);
  const refreshQueuedRef = useRef(false);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  useEffect(() => {
    let isActive = true;

    const refreshUnreadCount = async () => {
      if (refreshInFlightRef.current) {
        refreshQueuedRef.current = true;
        return;
      }

      const task = (async () => {
        try {
          const response = await fetch("/dashboard/conversations", {
            method: "GET",
            cache: "no-store"
          });

          if (!response.ok || !isActive) {
            return;
          }

          const payload = (await response.json()) as ConversationSummariesResponse;
          if (!isActive) {
            return;
          }

          setUnreadCount(countUnreadConversations(payload.conversations));
        } catch {
          return;
        } finally {
          refreshInFlightRef.current = null;

          if (refreshQueuedRef.current) {
            refreshQueuedRef.current = false;
            void refreshUnreadCount();
          }
        }
      })();

      refreshInFlightRef.current = task;
      await task;
    };

    const eventSource = new EventSource("/dashboard/live");

    eventSource.onmessage = (messageEvent) => {
      let event: DashboardLiveEvent | { type: "connected" };

      try {
        event = JSON.parse(messageEvent.data);
      } catch {
        return;
      }

      if (event.type === "conversation.read" || (event.type === "message.created" && event.sender === "user")) {
        void refreshUnreadCount();
      }
    };

    eventSource.onerror = () => {
      void refreshUnreadCount();
    };

    return () => {
      isActive = false;
      eventSource.close();
    };
  }, []);

  return { unreadCount, setUnreadCount };
}
