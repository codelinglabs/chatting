"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { DashboardSettingsNotifications } from "@/lib/data/settings-types";
import { DashboardNotificationToast } from "./dashboard-notification-toast";
import { useDashboardNavigation } from "./dashboard-shell";
import { useDashboardNotificationCenterState } from "./use-dashboard-notification-center";

export function DashboardNotificationCenter({
  initialSettings
}: {
  initialSettings: DashboardSettingsNotifications;
}) {
  const navigation = useDashboardNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeConversationId = pathname === "/dashboard/inbox" ? searchParams?.get("id")?.trim() || null : null;
  const { toast, dismissToast } = useDashboardNotificationCenterState({
    activeConversationId,
    initialSettings
  });

  if (!toast) {
    return null;
  }

  return (
    <DashboardNotificationToast
      toast={toast}
      onDismiss={dismissToast}
      onOpen={() => {
        dismissToast();
        navigation?.navigate(`/dashboard/inbox?id=${toast.conversationId}`);
      }}
    />
  );
}
