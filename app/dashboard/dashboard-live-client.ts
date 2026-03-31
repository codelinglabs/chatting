"use client";

import type { DashboardLiveEvent } from "@/lib/live-events";

type DashboardLiveMessage = DashboardLiveEvent | { type: "connected" };

type DashboardLiveListener = {
  onOpen?: () => void;
  onError?: () => void;
  onMessage?: (event: DashboardLiveMessage) => void;
};

let dashboardLiveSource: EventSource | null = null;
const dashboardLiveListeners = new Set<DashboardLiveListener>();

function ensureDashboardLiveSource() {
  if (dashboardLiveSource || typeof EventSource === "undefined") {
    return;
  }

  dashboardLiveSource = new EventSource("/dashboard/live");
  dashboardLiveSource.onopen = () => {
    for (const listener of dashboardLiveListeners) {
      listener.onOpen?.();
    }
  };
  dashboardLiveSource.onmessage = (messageEvent) => {
    let event: DashboardLiveMessage;

    try {
      event = JSON.parse(messageEvent.data) as DashboardLiveMessage;
    } catch {
      return;
    }

    for (const listener of dashboardLiveListeners) {
      listener.onMessage?.(event);
    }
  };
  dashboardLiveSource.onerror = () => {
    for (const listener of dashboardLiveListeners) {
      listener.onError?.();
    }

    if (!dashboardLiveListeners.size) {
      dashboardLiveSource?.close();
      dashboardLiveSource = null;
    }
  };
}

function maybeCloseDashboardLiveSource() {
  if (dashboardLiveListeners.size || !dashboardLiveSource) {
    return;
  }

  dashboardLiveSource.close();
  dashboardLiveSource = null;
}

export function subscribeDashboardLiveClient(listener: DashboardLiveListener) {
  dashboardLiveListeners.add(listener);
  ensureDashboardLiveSource();

  return () => {
    dashboardLiveListeners.delete(listener);
    maybeCloseDashboardLiveSource();
  };
}
