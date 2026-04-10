import "server-only";

import type {
  DashboardLiveEvent,
  LiveEventListener,
  PublicConversationLiveEvent
} from "@/lib/live-events.types";

declare global {
  // eslint-disable-next-line no-var
  var __chattingLiveListeners:
    | {
        dashboardByUserId: Map<string, Set<LiveEventListener<DashboardLiveEvent>>>;
        conversationById: Map<string, Set<LiveEventListener<PublicConversationLiveEvent>>>;
      }
    | undefined;
}

function getState() {
  if (!global.__chattingLiveListeners) {
    global.__chattingLiveListeners = {
      dashboardByUserId: new Map(),
      conversationById: new Map()
    };
  }

  return global.__chattingLiveListeners;
}

function subscribe<T>(
  bucket: Map<string, Set<LiveEventListener<T>>>,
  key: string,
  listener: LiveEventListener<T>
) {
  const listeners = bucket.get(key) ?? new Set<LiveEventListener<T>>();
  listeners.add(listener);
  bucket.set(key, listeners);

  return () => {
    const current = bucket.get(key);
    if (!current) {
      return;
    }

    current.delete(listener);
    if (!current.size) {
      bucket.delete(key);
    }
  };
}

function publish<T>(bucket: Map<string, Set<LiveEventListener<T>>>, key: string, event: T) {
  const listeners = bucket.get(key);
  if (!listeners?.size) {
    return;
  }

  for (const listener of listeners) {
    try {
      listener(event);
    } catch (error) {
      console.error("live event listener failed", error);
    }
  }
}

export function subscribeLocalDashboardLive(
  userId: string,
  listener: LiveEventListener<DashboardLiveEvent>
) {
  return subscribe(getState().dashboardByUserId, userId, listener);
}

export function publishLocalDashboardLive(userId: string, event: DashboardLiveEvent) {
  publish(getState().dashboardByUserId, userId, event);
}

export function subscribeLocalConversationLive(
  conversationId: string,
  listener: LiveEventListener<PublicConversationLiveEvent>
) {
  return subscribe(getState().conversationById, conversationId, listener);
}

export function publishLocalConversationLive(
  conversationId: string,
  event: PublicConversationLiveEvent
) {
  publish(getState().conversationById, conversationId, event);
}
