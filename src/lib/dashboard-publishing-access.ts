export const DASHBOARD_PUBLISHING_VIEWER_EMAIL = "tina@usechatting.com";

export function canAccessDashboardPublishing(userEmail: string) {
  return userEmail.trim().toLowerCase() === DASHBOARD_PUBLISHING_VIEWER_EMAIL;
}
