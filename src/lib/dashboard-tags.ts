export const DASHBOARD_TAGS = ["pricing", "confusion", "bug", "objection"] as const;

export type DashboardTag = (typeof DASHBOARD_TAGS)[number];
