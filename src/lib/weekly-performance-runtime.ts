import { getPublicAppUrl } from "@/lib/env";
import { releaseWeeklyPerformanceDelivery } from "@/lib/repositories/weekly-performance-repository";
import { withRetryableDatabaseConnectionRetry } from "@/lib/retryable-database-errors";
import { resolveReportTimeZone } from "@/lib/report-time";
import { getOrCreateWeeklyPerformanceSnapshot } from "@/lib/weekly-performance-snapshot-service";

export type WeeklyPerformanceSnapshot = Awaited<
  ReturnType<typeof getOrCreateWeeklyPerformanceSnapshot>
>;

export type WeeklyPerformanceSnapshotRequest = Parameters<
  typeof getOrCreateWeeklyPerformanceSnapshot
>[0];

export class WeeklyPerformanceCleanupError extends Error {
  constructor(
    readonly sendError: unknown,
    readonly cleanupError: unknown
  ) {
    super("weekly performance delivery cleanup failed");
    this.name = "WeeklyPerformanceCleanupError";
  }
}

function reportLinks() {
  const baseUrl = getPublicAppUrl();
  return {
    reportUrl: `${baseUrl}/dashboard/analytics?range=last_week`,
    settingsUrl: `${baseUrl}/dashboard/settings?section=reports`,
    widgetUrl: `${baseUrl}/dashboard/widget`
  };
}

function teamNameOrFallback(teamName?: string | null) {
  return teamName || "Chatting";
}

export function buildWeeklySnapshotRequest(input: {
  ownerUserId: string;
  teamName?: string | null;
  teamTimeZone?: string | null;
  weekStart: string;
  includeAiInsights?: boolean;
  includeTeamLeaderboard?: boolean;
}): WeeklyPerformanceSnapshotRequest {
  return {
    ...reportLinks(),
    ownerUserId: input.ownerUserId,
    teamName: teamNameOrFallback(input.teamName),
    weekStart: input.weekStart,
    teamTimeZone: resolveReportTimeZone(input.teamTimeZone),
    includeAiInsights: input.includeAiInsights ?? true,
    includeTeamLeaderboard: input.includeTeamLeaderboard ?? true
  };
}

function snapshotCacheKey(input: WeeklyPerformanceSnapshotRequest) {
  return [
    input.ownerUserId,
    input.weekStart,
    input.teamName ?? "",
    input.teamTimeZone ?? "",
    input.includeAiInsights ? "1" : "0",
    input.includeTeamLeaderboard ? "1" : "0"
  ].join(":");
}

export function loadWeeklyPerformanceSnapshot(input: WeeklyPerformanceSnapshotRequest) {
  return withRetryableDatabaseConnectionRetry(() =>
    getOrCreateWeeklyPerformanceSnapshot(input)
  );
}

export function createWeeklyPerformanceSnapshotLoader() {
  const cache = new Map<string, Promise<WeeklyPerformanceSnapshot>>();

  return async (input: WeeklyPerformanceSnapshotRequest) => {
    const key = snapshotCacheKey(input);
    const cached = cache.get(key);
    if (cached) return cached;

    const pending = loadWeeklyPerformanceSnapshot(input).catch((error) => {
      cache.delete(key);
      throw error;
    });

    cache.set(key, pending);
    return pending;
  };
}

export async function cleanupClaimedWeeklyPerformanceDelivery(input: {
  userId: string;
  ownerUserId: string;
  deliveryKey: string;
  sendError: unknown;
}) {
  try {
    await withRetryableDatabaseConnectionRetry(
      () =>
        releaseWeeklyPerformanceDelivery(
          input.userId,
          input.ownerUserId,
          input.deliveryKey
        ),
      3
    );
  } catch (cleanupError) {
    throw new WeeklyPerformanceCleanupError(input.sendError, cleanupError);
  }
}
