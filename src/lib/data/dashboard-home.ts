import {
  getDashboardHomeConversationRange
} from "@/lib/repositories/dashboard-home-repository";
import { getDashboardHomeSnapshot } from "@/lib/repositories/dashboard-home-snapshot-repository";
import { isSiteWidgetInstalled } from "@/lib/site-installation";
import type { ConversationSummary } from "@/lib/types";
import { resolvePreferredTimeZoneForUserWithSource } from "../user-timezone-preference";
import { listRecentInboxConversationSummaries } from "./inbox-conversations";
import {
  buildDashboardHomeChart,
  calculatePercentChange,
  type DashboardHomeChart,
  type DashboardHomeRangeDays
} from "./dashboard-home-chart";
import { listSitesForUser } from "./sites";

export type DashboardHomeChartData = {
  chartPending: boolean;
  chart: DashboardHomeChart;
};

export type DashboardHomeData = DashboardHomeChartData & {
  hasWidgetInstalled: boolean;
  widgetSiteIds: string[];
  openConversations: number;
  openConversationsDelta: number;
  resolvedToday: number;
  resolvedTodayDelta: number;
  avgResponseSeconds: number | null;
  avgResponseDeltaPercent: number | null;
  satisfactionPercent: number | null;
  satisfactionDeltaPercent: number | null;
  recentConversations: ConversationSummary[];
};

function toNumber(value: string | null | undefined) {
  return value == null ? null : Number(value);
}

function roundToWhole(value: number | null) {
  return value == null || Number.isNaN(value) ? null : Math.round(value);
}

export async function getDashboardHomeChartData(
  userId: string,
  rangeDays: DashboardHomeRangeDays = 7,
  ownerUserId?: string
): Promise<DashboardHomeChartData> {
  const timeZone = await resolvePreferredTimeZoneForUserWithSource(userId);
  const chartRange = await getDashboardHomeConversationRange(
    ownerUserId ?? userId,
    timeZone.timeZone,
    rangeDays
  );

  return {
    chartPending: timeZone.source === "site" || timeZone.source === "utc",
    chart: buildDashboardHomeChart(chartRange.rows, chartRange.previousTotal, rangeDays)
  };
}

export async function getDashboardHomeData(
  userId: string,
  input: {
    rangeDays?: DashboardHomeRangeDays;
    workspaceOwnerId?: string;
  } = {}
): Promise<DashboardHomeData> {
  const rangeDays = input.rangeDays ?? 7;
  const ownerUserId = input.workspaceOwnerId ?? userId;
  const timeZone = await resolvePreferredTimeZoneForUserWithSource(userId);
  const [snapshot, recentConversations, sites] = await Promise.all([
    getDashboardHomeSnapshot(ownerUserId, timeZone.timeZone, rangeDays),
    listRecentInboxConversationSummaries(userId, 4, input.workspaceOwnerId),
    listSitesForUser(userId, input.workspaceOwnerId)
  ]);

  const currentAvgResponse = roundToWhole(toNumber(snapshot.response.current_avg_seconds));
  const previousAvgResponse = roundToWhole(toNumber(snapshot.response.previous_avg_seconds));
  const avgResponseDeltaPercent =
    currentAvgResponse != null && previousAvgResponse != null && previousAvgResponse > 0
      ? Math.round(((previousAvgResponse - currentAvgResponse) / previousAvgResponse) * 100)
      : null;

  const currentSatisfaction = roundToWhole(toNumber(snapshot.satisfaction.current_rate));
  const previousSatisfaction = roundToWhole(toNumber(snapshot.satisfaction.previous_rate));
  const hasWidgetInstalled = sites.some((site) => isSiteWidgetInstalled(site));

  return {
    hasWidgetInstalled,
    widgetSiteIds: sites.map((site) => site.id),
    openConversations: Number(snapshot.overview.open_conversations),
    openConversationsDelta: Number(snapshot.overview.opened_today),
    resolvedToday: Number(snapshot.overview.resolved_today),
    resolvedTodayDelta:
      Number(snapshot.overview.resolved_today) - Number(snapshot.overview.resolved_yesterday),
    avgResponseSeconds: currentAvgResponse,
    avgResponseDeltaPercent,
    satisfactionPercent: currentSatisfaction,
    satisfactionDeltaPercent: calculatePercentChange(currentSatisfaction, previousSatisfaction),
    recentConversations,
    chartPending: timeZone.source === "site" || timeZone.source === "utc",
    chart: buildDashboardHomeChart(snapshot.chart.rows, snapshot.chart.previousTotal, rangeDays)
  };
}
