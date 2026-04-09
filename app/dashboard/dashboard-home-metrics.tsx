import type { DashboardHomeData } from "@/lib/data/dashboard-home";
import { formatResponseTime } from "@/lib/format-response-time";

function metricBadge(value: number | null, positiveLabel = true) {
  if (value == null) {
    return { text: "No data", tone: "neutral" as const };
  }

  if (value === 0) {
    return { text: "0", tone: "neutral" as const };
  }

  return {
    text: `${value > 0 && positiveLabel ? "+" : ""}${value}%`,
    tone: value > 0 ? ("positive" as const) : ("neutral" as const)
  };
}

function integerBadge(value: number) {
  if (value === 0) {
    return { text: "0", tone: "neutral" as const };
  }

  return {
    text: `${value > 0 ? "+" : ""}${value}`,
    tone: value > 0 ? ("positive" as const) : ("neutral" as const)
  };
}

function statBadgeClass(tone: "positive" | "neutral") {
  return tone === "positive"
    ? "bg-green-50 text-green-600 ring-1 ring-green-200"
    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
}

export function DashboardHomeMetrics({ data }: { data: DashboardHomeData }) {
  const openBadge = integerBadge(data.openConversationsDelta);
  const resolvedBadge = integerBadge(data.resolvedTodayDelta);
  const responseBadge = metricBadge(data.avgResponseDeltaPercent);
  const satisfactionBadge = metricBadge(data.satisfactionDeltaPercent);
  const cards = [
    ["Open conversations", String(data.openConversations), openBadge],
    ["Resolved today", String(data.resolvedToday), resolvedBadge],
    ["Avg response time", formatResponseTime(data.avgResponseSeconds, { emptyLabel: "--" }), responseBadge],
    [
      "Visitor satisfaction",
      data.satisfactionPercent == null ? "--" : `${data.satisfactionPercent}%`,
      satisfactionBadge
    ]
  ] as const;

  return (
    <section className="grid gap-6 xl:grid-cols-4">
      {cards.map(([label, value, badge]) => (
        <article key={label} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-normal text-slate-500">{label}</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statBadgeClass(badge.tone)}`}>
              {badge.text}
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </article>
      ))}
    </section>
  );
}
