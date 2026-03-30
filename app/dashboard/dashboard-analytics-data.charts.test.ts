import {
  buildConversationChartPoints,
  buildHeatMap,
  buildResponseBuckets,
  exportAnalytics
} from "./dashboard-analytics-data";
import type { AnalyticsConversationRecord } from "@/lib/data/analytics";

function conversation(overrides: Partial<AnalyticsConversationRecord> = {}): AnalyticsConversationRecord {
  return {
    id: "conv_1",
    createdAt: "2026-03-10T09:00:00.000Z",
    updatedAt: "2026-03-10T09:10:00.000Z",
    status: "open",
    pageUrl: "https://example.com/pricing",
    referrer: "https://google.com",
    rating: 5,
    firstResponseSeconds: 120,
    resolutionSeconds: 900,
    tags: ["pricing"],
    ...overrides
  };
}

describe("dashboard analytics data charts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds daily, weekly, and monthly conversation buckets", () => {
    const conversations = [
      conversation(),
      conversation({ id: "conv_2", createdAt: "2026-03-11T10:00:00.000Z" }),
      conversation({ id: "conv_3", createdAt: "2026-04-04T10:00:00.000Z" })
    ];

    expect(
      buildConversationChartPoints(
        conversations,
        { start: new Date("2026-03-10T00:00:00.000Z"), end: new Date("2026-03-12T00:00:00.000Z") },
        "daily"
      ).map(({ value }) => value)
    ).toEqual([1, 1]);

    expect(
      buildConversationChartPoints(
        conversations,
        { start: new Date("2026-03-09T00:00:00.000Z"), end: new Date("2026-03-23T00:00:00.000Z") },
        "weekly"
      ).map(({ value }) => value)
    ).toEqual([2, 0]);

    expect(
      buildConversationChartPoints(
        conversations,
        { start: new Date("2026-03-01T00:00:00.000Z"), end: new Date("2026-05-01T00:00:00.000Z") },
        "monthly"
      ).map(({ value }) => value)
    ).toEqual([2, 1]);
  });

  it("builds response buckets and heat map intensity levels", () => {
    const conversations = [
      conversation({ id: "conv_1", createdAt: "2026-03-10T01:00:00.000Z", firstResponseSeconds: 60 }),
      conversation({ id: "conv_2", createdAt: "2026-03-10T02:00:00.000Z", firstResponseSeconds: 120 }),
      conversation({ id: "conv_3", createdAt: "2026-03-10T03:00:00.000Z", firstResponseSeconds: null }),
      conversation({ id: "conv_4", createdAt: "2026-03-11T02:00:00.000Z", firstResponseSeconds: 300 }),
      conversation({ id: "conv_5", createdAt: "2026-03-11T02:10:00.000Z", firstResponseSeconds: 600 }),
      conversation({ id: "conv_6", createdAt: "2026-03-11T02:20:00.000Z", firstResponseSeconds: 900 }),
      conversation({ id: "conv_7", createdAt: "2026-03-11T02:30:00.000Z", firstResponseSeconds: 1200 }),
      conversation({ id: "conv_8", createdAt: "2026-03-16T04:00:00.000Z", firstResponseSeconds: 30 })
    ];

    expect(
      buildResponseBuckets(
        conversations,
        { start: new Date("2026-03-10T00:00:00.000Z"), end: new Date("2026-03-12T00:00:00.000Z") },
        "daily"
      ).map(({ sublabel, value }) => [sublabel, value])
    ).toEqual([
      ["10 Mar 2026 • 1.5m", 90],
      ["11 Mar 2026 • 13m", 750]
    ]);

    expect(
      buildResponseBuckets(
        [],
        { start: new Date("2026-03-10T00:00:00.000Z"), end: new Date("2026-03-11T00:00:00.000Z") },
        "daily"
      )[0]
    ).toMatchObject({ sublabel: "10 Mar 2026 • —", value: 0 });

    const heatMap = buildHeatMap(conversations);
    expect(heatMap[1][1]).toMatchObject({ dayLabel: "Tue", level: 1, value: 1 });
    expect(heatMap[2][2]).toMatchObject({ dayLabel: "Wed", level: 4, value: 4 });
    expect(heatMap[0][4]).toMatchObject({ dayLabel: "Mon", level: 1, value: 1 });
  });

  it("exports analytics rows as a downloadable csv", () => {
    const appendChild = vi.fn();
    const click = vi.fn();
    const remove = vi.fn();
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:analytics"), revokeObjectURL });
    vi.stubGlobal("document", {
      body: { appendChild },
      createElement: vi.fn(() => ({ href: "", download: "", click, remove }))
    });

    exportAnalytics([conversation({ tags: ["pricing", "sales"] })], "Last 30 days");

    expect((globalThis.URL as typeof URL).createObjectURL).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:analytics");
  });
});
