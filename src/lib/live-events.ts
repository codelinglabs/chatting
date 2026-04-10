import "server-only";

import {
  ensureRedisLiveBridge,
  publishRedisConversationLive,
  publishRedisDashboardLive
} from "@/lib/live-events-redis";
import {
  publishLocalConversationLive,
  publishLocalDashboardLive,
  subscribeLocalConversationLive,
  subscribeLocalDashboardLive
} from "@/lib/live-events-state";
import type {
  DashboardLiveEvent,
  LiveEventListener,
  PublicConversationLiveEvent
} from "@/lib/live-events.types";

export type { DashboardLiveEvent, PublicConversationLiveEvent } from "@/lib/live-events.types";

const redisDispatchers = {
  dashboard: publishLocalDashboardLive,
  conversation: publishLocalConversationLive
};

function reportRedisBridgeError(error: unknown) {
  console.error("redis live bridge failed", error);
}

function warmRedisLiveBridge() {
  void ensureRedisLiveBridge(redisDispatchers).catch(reportRedisBridgeError);
}

export function warmLiveEventBridge() {
  return ensureRedisLiveBridge(redisDispatchers).catch((error) => {
    reportRedisBridgeError(error);
    throw error;
  });
}

function subscribeLive<TEvent>(
  subscribeLocal: (key: string, listener: LiveEventListener<TEvent>) => () => void,
  key: string,
  listener: LiveEventListener<TEvent>
) {
  warmRedisLiveBridge();
  return subscribeLocal(key, listener);
}

function publishLive<TEvent>(
  publishLocal: (key: string, event: TEvent) => void,
  publishRedis: (key: string, event: TEvent) => Promise<unknown>,
  key: string,
  event: TEvent
) {
  publishLocal(key, event);
  void ensureRedisLiveBridge(redisDispatchers)
    .then(() => publishRedis(key, event))
    .catch(reportRedisBridgeError);
}

export function subscribeDashboardLive(
  userId: string,
  listener: LiveEventListener<DashboardLiveEvent>
) {
  return subscribeLive(subscribeLocalDashboardLive, userId, listener);
}

export function publishDashboardLive(userId: string, event: DashboardLiveEvent) {
  publishLive(publishLocalDashboardLive, publishRedisDashboardLive, userId, event);
}

export function subscribeConversationLive(
  conversationId: string,
  listener: LiveEventListener<PublicConversationLiveEvent>
) {
  return subscribeLive(subscribeLocalConversationLive, conversationId, listener);
}

export function publishConversationLive(
  conversationId: string,
  event: PublicConversationLiveEvent
) {
  publishLive(publishLocalConversationLive, publishRedisConversationLive, conversationId, event);
}
