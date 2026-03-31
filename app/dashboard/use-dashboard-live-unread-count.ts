"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeDashboardLiveClient } from "./dashboard-live-client";

type UnreadCountResponse = {
  ok: true;
  unreadCount: number;
};

export function useDashboardLiveUnreadCount(initialUnreadCount: number, liveSyncEnabled = true) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);
  const refreshQueuedRef = useRef(false);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  useEffect(() => {
    if (!liveSyncEnabled) {
      return;
    }

    let isActive = true;

    const refreshUnreadCount = async () => {
      if (refreshInFlightRef.current) {
        refreshQueuedRef.current = true;
        return;
      }

      const task = (async () => {
        try {
          const response = await fetch("/dashboard/unread-count", {
            method: "GET",
            cache: "no-store"
          });

          if (!response.ok || !isActive) {
            return;
          }

          const payload = (await response.json()) as UnreadCountResponse;
          if (!isActive) {
            return;
          }

          setUnreadCount(payload.unreadCount);
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

    const unsubscribe = subscribeDashboardLiveClient({
      onMessage(event) {
        if (event.type === "conversation.read" || (event.type === "message.created" && event.sender === "user")) {
          void refreshUnreadCount();
        }
      },
      onError() {
        void refreshUnreadCount();
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [liveSyncEnabled]);

  return { unreadCount, setUnreadCount };
}
