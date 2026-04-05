"use client";

import { useEffect } from "react";

const PRESENCE_HEARTBEAT_INTERVAL_MS = 30000;

export function useDashboardPresenceHeartbeat() {
  useEffect(() => {
    let intervalId: number | null = null;
    const isVisible = () => document.visibilityState === "visible";

    const sendHeartbeat = () => {
      fetch("/dashboard/presence", { method: "POST", keepalive: true }).catch(() => {});
    };

    const stopHeartbeat = () => {
      if (intervalId === null) {
        return;
      }

      window.clearInterval(intervalId);
      intervalId = null;
    };

    const startHeartbeat = () => {
      stopHeartbeat();
      if (!isVisible()) {
        return;
      }

      sendHeartbeat();
      intervalId = window.setInterval(sendHeartbeat, PRESENCE_HEARTBEAT_INTERVAL_MS);
    };

    const handleVisibilityChange = () => {
      if (isVisible()) {
        startHeartbeat();
      } else {
        stopHeartbeat();
      }
    };

    const handleFocus = () => {
      if (isVisible()) {
        sendHeartbeat();
      }
    };

    startHeartbeat();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      stopHeartbeat();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
}
