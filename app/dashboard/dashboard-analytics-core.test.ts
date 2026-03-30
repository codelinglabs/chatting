import {
  addDays,
  average,
  averageRatingScore,
  buildConversationBucketDescription,
  buildConversationBucketLabel,
  buildStatSummary,
  filterConversations,
  filterReplyEvents,
  formatCompactNumber,
  formatDurationLong,
  formatDurationShort,
  formatPercent,
  formatScore,
  resolveDateRange,
  startOfWeek,
  toDateInputValue
} from "./dashboard-analytics-core";

describe("dashboard analytics core", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats numbers, percentages, scores, and durations across edge cases", () => {
    expect(average([])).toBeNull();
    expect(average([10, 20, 30])).toBe(20);
    expect(formatCompactNumber(null)).toBe("—");
    expect(formatCompactNumber(1200)).toContain("1.2");
    expect(formatPercent(12.34, 1)).toBe("12.3%");
    expect(formatPercent(null)).toBe("—");
    expect(formatScore(4.26)).toBe("4.3/5");
    expect(formatScore(null)).toBe("—");
    expect(formatDurationShort(null)).toBe("—");
    expect(formatDurationShort(Number.NaN)).toBe("—");
    expect(formatDurationShort(59)).toBe("59s");
    expect(formatDurationShort(90)).toBe("1.5m");
    expect(formatDurationShort(900)).toBe("15m");
    expect(formatDurationShort(7200)).toBe("2.0h");
    expect(formatDurationLong(45)).toBe("45s");
    expect(formatDurationLong(90)).toBe("1m 30s");
    expect(formatDurationLong(3700)).toBe("1h 1m");
  });

  it("resolves date ranges for presets, custom input, and invalid ranges", () => {
    const today = resolveDateRange("today", "", "");
    const lastMonth = resolveDateRange("lastMonth", "", "");
    const custom = resolveDateRange("custom", "2026-03-10", "2026-03-12");
    const invalidCustom = resolveDateRange("custom", "2026-03-12", "2026-03-10");
    const fallbackCustom = resolveDateRange("custom", "bad", "still-bad");

    expect(toDateInputValue(today.start)).toBe("2026-04-15");
    expect(toDateInputValue(today.end)).toBe("2026-04-16");
    expect(toDateInputValue(lastMonth.start)).toBe("2026-03-01");
    expect(toDateInputValue(lastMonth.end)).toBe("2026-04-01");
    expect(toDateInputValue(custom.start)).toBe("2026-03-10");
    expect(toDateInputValue(custom.end)).toBe("2026-03-13");
    expect(custom.label).toBe("10 Mar 2026 - 12 Mar 2026");
    expect(toDateInputValue(invalidCustom.start)).toBe("2026-03-12");
    expect(toDateInputValue(invalidCustom.end)).toBe("2026-03-13");
    expect(toDateInputValue(fallbackCustom.start)).toBe("2026-04-09");
    expect(toDateInputValue(fallbackCustom.end)).toBe("2026-04-16");
  });

  it("filters records and groups dates by the selected granularity", () => {
    const start = new Date("2026-03-01T00:00:00.000Z");
    const end = new Date("2026-03-03T00:00:00.000Z");
    const monday = new Date("2026-03-23T10:00:00.000Z");
    const sunday = new Date("2026-03-29T10:00:00.000Z");

    expect(toDateInputValue(startOfWeek(monday))).toBe("2026-03-23");
    expect(toDateInputValue(startOfWeek(sunday))).toBe("2026-03-23");
    expect(toDateInputValue(addDays(start, 2))).toBe("2026-03-03");
    expect(
      filterConversations(
        [
          { createdAt: "2026-02-28T23:59:59.000Z" },
          { createdAt: "2026-03-01T00:00:00.000Z" },
          { createdAt: "2026-03-02T12:00:00.000Z" },
          { createdAt: "2026-03-03T00:00:00.000Z" }
        ] as never,
        start,
        end
      )
    ).toHaveLength(2);
    expect(
      filterReplyEvents(
        [
          { createdAt: "2026-03-01T06:00:00.000Z" },
          { createdAt: "2026-03-04T06:00:00.000Z" }
        ] as never,
        start,
        end
      )
    ).toHaveLength(1);
    expect(buildConversationBucketLabel(start, "monthly")).toBe("Mar");
    expect(buildConversationBucketLabel(start, "daily")).toBe("1 Mar");
    expect(buildConversationBucketDescription(start, end, "monthly")).toBe("Mar 2026");
    expect(buildConversationBucketDescription(start, end, "weekly")).toBe("1 Mar - 2 Mar");
    expect(buildConversationBucketDescription(start, end, "daily")).toBe("1 Mar 2026");
  });

  it("builds stat summaries with positive, negative, neutral, and empty-state badges", () => {
    const current = [
      { createdAt: "2026-03-28T00:00:00.000Z", firstResponseSeconds: 30, status: "resolved", rating: 4.8 },
      { createdAt: "2026-03-29T00:00:00.000Z", firstResponseSeconds: 90, status: "open", rating: null }
    ] as never;
    const previous = [
      { createdAt: "2026-03-20T00:00:00.000Z", firstResponseSeconds: 180, status: "resolved", rating: 4.1 },
      { createdAt: "2026-03-21T00:00:00.000Z", firstResponseSeconds: 240, status: "resolved", rating: 4.2 },
      { createdAt: "2026-03-22T00:00:00.000Z", firstResponseSeconds: null, status: "open", rating: null }
    ] as never;
    const summary = buildStatSummary(current, previous);
    const empty = buildStatSummary([], []);

    expect(averageRatingScore(current)).toBe(4.8);
    expect(summary.total.badge).toEqual({ tone: "negative", value: "-33%" });
    expect(summary.responseTime.badge).toEqual({ tone: "positive", value: "+71%" });
    expect(summary.resolutionRate.badge).toEqual({ tone: "negative", value: "-17" });
    expect(summary.satisfaction.badge).toEqual({ tone: "positive", value: "+0.6" });
    expect(empty.total.badge).toBeNull();
    expect(empty.responseTime.value).toBe("—");
    expect(empty.resolutionRate.badge).toBeNull();
    expect(empty.satisfaction.badge).toBeNull();
  });
});
