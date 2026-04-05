import { requireUser } from "@/lib/auth";
import { listHelpCenterArticles, listSitesForUser } from "@/lib/data";
import { DashboardHelpCenterManager } from "../dashboard-help-center-manager";

export default async function HelpCenterPage() {
  const user = await requireUser();
  const [articles, sites] = await Promise.all([
    listHelpCenterArticles(user.id),
    listSitesForUser(user.id)
  ]);

  return (
    <DashboardHelpCenterManager
      initialArticles={articles}
      initialSites={sites}
      canManage={user.workspaceRole !== "member"}
    />
  );
}
