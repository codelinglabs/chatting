import { getDashboardUnreadCount } from "@/lib/data";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function GET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const unreadCount = await getDashboardUnreadCount(auth.user.id);
  return jsonOk({ unreadCount });
}
