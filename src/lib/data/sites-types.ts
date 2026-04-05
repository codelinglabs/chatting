import type {
  WidgetAvatarStyle,
  WidgetLauncherPosition,
  WidgetOperatingHours,
  WidgetResponseTimeMode
} from "@/lib/types";

export type UpdateSiteWidgetSettingsInput = {
  domain: string | null;
  brandColor: string;
  widgetTitle: string;
  greetingText: string;
  launcherPosition: WidgetLauncherPosition;
  avatarStyle: WidgetAvatarStyle;
  showOnlineStatus: boolean;
  requireEmailOffline: boolean;
  offlineTitle: string;
  offlineMessage: string;
  awayTitle: string;
  awayMessage: string;
  soundNotifications: boolean;
  autoOpenPaths: string[];
  responseTimeMode: WidgetResponseTimeMode;
  operatingHoursEnabled: boolean;
  operatingHoursTimezone: string | null;
  operatingHours: WidgetOperatingHours;
};
