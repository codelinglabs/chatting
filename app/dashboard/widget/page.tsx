import { requireUser } from "@/lib/auth";
import { getDashboardBillingSummary, listSitesForUser } from "@/lib/data";
import { DashboardWidgetPageClient } from "./widget-page-client";

export default async function DashboardWidgetPage() {
  const user = await requireUser();
  const [sites, billing] = await Promise.all([
    listSitesForUser(user.id),
    getDashboardBillingSummary(user.id)
  ]);

  return <DashboardWidgetPageClient initialSites={sites} initialBilling={billing} />;
}
