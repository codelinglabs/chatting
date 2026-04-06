import { query } from "@/lib/db";
import type { DashboardHomeChartRow, DashboardHomeRangeDays } from "@/lib/data/dashboard-home-chart";
import type { DashboardHomeOverviewRow, DashboardHomeResponseRow, DashboardHomeSatisfactionRow } from "./dashboard-home-repository";

type DashboardHomeSnapshotRow = DashboardHomeOverviewRow & DashboardHomeResponseRow & DashboardHomeSatisfactionRow & {
  day_key: string;
  day_label: string;
  count: string;
  previous_total: string;
};

export type DashboardHomeSnapshot = {
  overview: DashboardHomeOverviewRow;
  response: DashboardHomeResponseRow;
  satisfaction: DashboardHomeSatisfactionRow;
  chart: {
    previousTotal: number;
    rows: DashboardHomeChartRow[];
  };
};

const EMPTY_OVERVIEW: DashboardHomeOverviewRow = { open_conversations: "0", opened_today: "0", resolved_today: "0", resolved_yesterday: "0" };
const EMPTY_RESPONSE: DashboardHomeResponseRow = { current_avg_seconds: null, previous_avg_seconds: null };
const EMPTY_SATISFACTION: DashboardHomeSatisfactionRow = { current_rate: null, previous_rate: null };

export async function getDashboardHomeSnapshot(
  ownerUserId: string,
  timeZone: string,
  rangeDays: DashboardHomeRangeDays
): Promise<DashboardHomeSnapshot> {
  const result = await query<DashboardHomeSnapshotRow>(
    `
      WITH filtered_conversations AS (
        SELECT
          c.id,
          c.status,
          c.created_at,
          c.updated_at,
          (c.created_at AT TIME ZONE $2)::date AS local_day
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE s.user_id = $1
      ),
      first_user_messages AS (
        SELECT m.conversation_id, MIN(m.created_at) AS first_user_at
        FROM messages m
        INNER JOIN filtered_conversations fc
          ON fc.id = m.conversation_id
        WHERE m.sender = 'user'
        GROUP BY m.conversation_id
      ),
      first_team_replies AS (
        SELECT m.conversation_id, MIN(m.created_at) AS first_reply_at
        FROM messages m
        INNER JOIN filtered_conversations fc
          ON fc.id = m.conversation_id
        WHERE m.sender = 'team'
        GROUP BY m.conversation_id
      ),
      paired AS (
        SELECT
          fu.first_user_at,
          EXTRACT(EPOCH FROM (fr.first_reply_at - fu.first_user_at)) AS response_seconds
        FROM first_user_messages fu
        INNER JOIN first_team_replies fr
          ON fr.conversation_id = fu.conversation_id
        WHERE fr.first_reply_at > fu.first_user_at
      ),
      feedback_rows AS (
        SELECT f.rating, f.created_at
        FROM feedback f
        INNER JOIN filtered_conversations fc
          ON fc.id = f.conversation_id
      ),
      date_bounds AS (
        SELECT
          timezone($2, NOW())::date AS local_today,
          (timezone($2, NOW())::date - ($3::int - 1))::date AS current_start,
          (timezone($2, NOW())::date - (($3::int * 2) - 1))::date AS previous_start
      ),
      range_days AS (
        SELECT
          generate_series(
            (SELECT current_start FROM date_bounds),
            (SELECT local_today FROM date_bounds),
            INTERVAL '1 day'
          )::date AS local_day
      ),
      previous_total AS (
        SELECT COUNT(*)::text AS value
        FROM filtered_conversations fc
        WHERE fc.local_day >= (SELECT previous_start FROM date_bounds)
          AND fc.local_day < (SELECT current_start FROM date_bounds)
      ),
      chart_counts AS (
        SELECT rd.local_day, COUNT(fc.local_day)::text AS count
        FROM range_days rd
        LEFT JOIN filtered_conversations fc
          ON fc.local_day = rd.local_day
        GROUP BY rd.local_day
      )
      SELECT
        metrics.open_conversations::text AS open_conversations,
        metrics.opened_today::text AS opened_today,
        metrics.resolved_today::text AS resolved_today,
        metrics.resolved_yesterday::text AS resolved_yesterday,
        response.current_avg_seconds,
        response.previous_avg_seconds,
        satisfaction.current_rate,
        satisfaction.previous_rate,
        TO_CHAR(chart.local_day, 'YYYY-MM-DD') AS day_key,
        TO_CHAR(chart.local_day, 'Dy') AS day_label,
        chart.count,
        previous_total.value AS previous_total
      FROM (
        SELECT
          COUNT(*) FILTER (WHERE status = 'open') AS open_conversations,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS opened_today,
          COUNT(*) FILTER (WHERE status = 'resolved' AND updated_at >= CURRENT_DATE) AS resolved_today,
          COUNT(*) FILTER (
            WHERE status = 'resolved'
              AND updated_at >= CURRENT_DATE - INTERVAL '1 day'
              AND updated_at < CURRENT_DATE
          ) AS resolved_yesterday
        FROM filtered_conversations
      ) metrics
      CROSS JOIN (
        SELECT
          AVG(response_seconds) FILTER (
            WHERE first_user_at >= NOW() - INTERVAL '7 days'
          )::text AS current_avg_seconds,
          AVG(response_seconds) FILTER (
            WHERE first_user_at >= NOW() - INTERVAL '14 days'
              AND first_user_at < NOW() - INTERVAL '7 days'
          )::text AS previous_avg_seconds
        FROM paired
      ) response
      CROSS JOIN (
        SELECT
          ((AVG(rating) FILTER (
            WHERE created_at >= NOW() - INTERVAL '30 days'
          )) / 5 * 100)::text AS current_rate,
          ((AVG(rating) FILTER (
            WHERE created_at >= NOW() - INTERVAL '60 days'
              AND created_at < NOW() - INTERVAL '30 days'
          )) / 5 * 100)::text AS previous_rate
        FROM feedback_rows
      ) satisfaction
      CROSS JOIN previous_total
      INNER JOIN chart_counts chart
        ON TRUE
      ORDER BY chart.local_day ASC
    `,
    [ownerUserId, timeZone, rangeDays]
  );

  const firstRow = result.rows[0];

  return {
    overview: firstRow
      ? {
          open_conversations: firstRow.open_conversations,
          opened_today: firstRow.opened_today,
          resolved_today: firstRow.resolved_today,
          resolved_yesterday: firstRow.resolved_yesterday
        }
      : EMPTY_OVERVIEW,
    response: firstRow
      ? {
          current_avg_seconds: firstRow.current_avg_seconds,
          previous_avg_seconds: firstRow.previous_avg_seconds
        }
      : EMPTY_RESPONSE,
    satisfaction: firstRow
      ? {
          current_rate: firstRow.current_rate,
          previous_rate: firstRow.previous_rate
        }
      : EMPTY_SATISFACTION,
    chart: {
      previousTotal: Number(firstRow?.previous_total ?? 0),
      rows: result.rows.map((row) => ({
        dayKey: row.day_key,
        dayLabel: row.day_label,
        count: row.count
      }))
    }
  };
}
