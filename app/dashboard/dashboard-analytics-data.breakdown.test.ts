import {
  buildRatingBreakdown,
  buildTagBreakdown,
  buildTeamRows,
  buildTopPages
} from "./dashboard-analytics-data";
import type { AnalyticsConversationRecord } from "@/lib/data/analytics";

function conversation(overrides: Partial<AnalyticsConversationRecord> = {}): AnalyticsConversationRecord {
  return {
    id: "conv_1",
    createdAt: "2026-03-10T09:00:00.000Z",
    updatedAt: "2026-03-10T09:10:00.000Z",
    status: "open",
    pageUrl: "https://example.com/pricing",
    referrer: null,
    rating: 5,
    firstResponseSeconds: 120,
    resolutionSeconds: 900,
    tags: ["pricing"],
    ...overrides
  };
}

describe("dashboard analytics data breakdowns", () => {
  it("builds top pages, rating breakdowns, and tag chips", () => {
    const conversations = [
      conversation(),
      conversation({ id: "conv_2", pageUrl: null, rating: 4, tags: ["support"] }),
      conversation({ id: "conv_3", pageUrl: "https://example.com/docs", rating: 3, tags: ["feature"] }),
      conversation({ id: "conv_4", pageUrl: "https://example.com/bugs", rating: 2, tags: ["bug"] }),
      conversation({ id: "conv_5", pageUrl: "https://example.com/deals", rating: 1, tags: ["sales"] }),
      conversation({ id: "conv_6", pageUrl: "https://example.com/other", rating: null, tags: ["misc"] })
    ];

    expect(buildTopPages(conversations)).toEqual([
      { page: "/pricing", count: 1 },
      { page: "/", count: 1 },
      { page: "/docs", count: 1 },
      { page: "/bugs", count: 1 },
      { page: "/deals", count: 1 },
      { page: "/other", count: 1 }
    ]);

    expect(buildRatingBreakdown(conversations)).toEqual([
      { rating: 5, count: 1, percent: 20 },
      { rating: 4, count: 1, percent: 20 },
      { rating: 3, count: 1, percent: 20 },
      { rating: 2, count: 1, percent: 20 },
      { rating: 1, count: 1, percent: 20 }
    ]);
    expect(buildRatingBreakdown([])[0]).toEqual({ rating: 5, count: 0, percent: 0 });

    expect(buildTagBreakdown(conversations)).toEqual([
      expect.objectContaining({ label: "pricing", colorClass: "bg-blue-500", strokeColor: "#3B82F6" }),
      expect.objectContaining({ label: "support", colorClass: "bg-green-500", strokeColor: "#10B981" }),
      expect.objectContaining({ label: "feature", colorClass: "bg-violet-500", strokeColor: "#8B5CF6" }),
      expect.objectContaining({ label: "bug", colorClass: "bg-red-500", strokeColor: "#EF4444" }),
      expect.objectContaining({ label: "sales", colorClass: "bg-amber-500", strokeColor: "#F59E0B" }),
      expect.objectContaining({ label: "misc", colorClass: "bg-slate-400", strokeColor: "#94A3B8" })
    ]);
  });

  it("builds team rows with averages and nullable resolution rate", () => {
    expect(buildTeamRows([], "tina@usechatting.com")).toEqual([
      {
        name: "Tina",
        initials: "T",
        conversations: 0,
        avgResponseSeconds: null,
        resolutionRate: null,
        satisfactionScore: null
      }
    ]);

    expect(
      buildTeamRows(
        [
          conversation({ status: "resolved", rating: 5, firstResponseSeconds: 60 }),
          conversation({ id: "conv_2", status: "open", rating: 3, firstResponseSeconds: 180 })
        ],
        "tina@usechatting.com"
      )
    ).toEqual([
      {
        name: "Tina",
        initials: "T",
        conversations: 2,
        avgResponseSeconds: 120,
        resolutionRate: 50,
        satisfactionScore: 4
      }
    ]);
  });
});
