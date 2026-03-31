"use client";

import { createContext, useContext, type ReactNode } from "react";

type UnreadCountShape = {
  unreadCount: number;
};

const DashboardUnreadCountContext = createContext<((count: number) => void) | null>(null);

export function countUnreadConversations(conversations: UnreadCountShape[]) {
  return conversations.reduce((count, conversation) => count + conversation.unreadCount, 0);
}

export function DashboardUnreadCountProvider({
  setUnreadCount,
  children
}: {
  setUnreadCount: (count: number) => void;
  children: ReactNode;
}) {
  return <DashboardUnreadCountContext.Provider value={setUnreadCount}>{children}</DashboardUnreadCountContext.Provider>;
}

export function useSetDashboardUnreadCount() {
  return useContext(DashboardUnreadCountContext);
}
