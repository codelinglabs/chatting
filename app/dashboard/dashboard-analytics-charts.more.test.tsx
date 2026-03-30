import { renderToStaticMarkup } from "react-dom/server";
import {
  HeatMap,
  LineChart,
  ResponseTimeChart,
  StatCard
} from "./dashboard-analytics-primary-charts";
import {
  DonutChart,
  SatisfactionBreakdown,
  TeamPerformanceTable,
  TopPagesCard
} from "./dashboard-analytics-secondary-charts";

describe("dashboard analytics chart edge states", () => {
  it("renders primary chart fallbacks for empty, sparse, and dense datasets", () => {
    const emptyLine = renderToStaticMarkup(<LineChart points={[]} />);
    const sparseLine = renderToStaticMarkup(
      <LineChart points={[{ label: "Mon", sublabel: "No conversations", value: 0 }]} />
    );
    const denseLine = renderToStaticMarkup(
      <LineChart
        points={Array.from({ length: 13 }, (_, index) => ({
          label: `Day ${index + 1}`,
          sublabel: `Point ${index + 1}`,
          value: index % 4 === 0 ? 0 : index + 1
        }))}
      />
    );
    const responseTime = renderToStaticMarkup(
      <ResponseTimeChart
        points={[
          { label: "Mon", sublabel: "Quick", value: 30 },
          { label: "Tue", sublabel: "Slow", value: 3600 }
        ]}
        averageSeconds={null}
        replyAverageSeconds={65}
        resolutionAverageSeconds={3660}
      />
    );
    const heatMap = renderToStaticMarkup(
      <HeatMap
        rows={[
          [
            { dayLabel: "Mon", hourLabel: "09:00", value: 1, level: 0 },
            { dayLabel: "Mon", hourLabel: "10:00", value: 2, level: 4 }
          ]
        ]}
      />
    );
    const statCard = renderToStaticMarkup(
      <StatCard
        label="Reply rate"
        value="0"
        badge={null}
        previousLabel="vs last period"
        previousValue={0}
        currentValue={0}
      />
    );

    expect(emptyLine).toContain("Conversations");
    expect(sparseLine).toContain("Mon");
    expect(denseLine).toContain("Day 13");
    expect(responseTime).toContain("Avg: —");
    expect(responseTime).toContain("1.1m");
    expect(responseTime).toContain("1.0h");
    expect(heatMap).toContain("Busiest hours");
    expect(heatMap).toContain("Mon 10:00: 2 conversations");
    expect(statCard).toContain("width:50%");
  });

  it("renders secondary chart fallbacks for negative trends and empty lists", () => {
    const teamTable = renderToStaticMarkup(
      <TeamPerformanceTable
        rows={[
          {
            name: "Tina",
            initials: "TB",
            conversations: 8,
            avgResponseSeconds: 60,
            resolutionRate: 80,
            satisfactionScore: 4.7
          },
          {
            name: "Alex",
            initials: "AL",
            conversations: 2,
            avgResponseSeconds: 240,
            resolutionRate: null,
            satisfactionScore: null
          }
        ]}
        trendPoints={[8, 4, 1]}
      />
    );
    const emptyPages = renderToStaticMarkup(<TopPagesCard pages={[]} />);
    const satisfaction = renderToStaticMarkup(
      <SatisfactionBreakdown
        score={null}
        rows={[
          { rating: 5, count: 3, percent: 60 },
          { rating: 1, count: 2, percent: 40 }
        ]}
      />
    );
    const emptyDonut = renderToStaticMarkup(<DonutChart tags={[]} />);
    const filledDonut = renderToStaticMarkup(
      <DonutChart
        tags={[
          { label: "support", count: 3, share: 0.6, colorClass: "bg-blue-500", strokeColor: "#3B82F6" },
          { label: "sales", count: 2, share: 0.4, colorClass: "bg-green-500", strokeColor: "#10B981" }
        ]}
      />
    );

    expect(teamTable).toContain("#EF4444");
    expect(teamTable).toContain("—");
    expect(emptyPages).toContain("No page data in this range yet.");
    expect(satisfaction).toContain(">—<");
    expect(emptyDonut).toContain("No conversation tags in this date range yet.");
    expect(filledDonut).toContain("support");
    expect(filledDonut).toContain(">5<");
  });
});
