import { listConversationSummaries, listVisitorPresenceSessions } from "@/lib/data";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function GET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const [conversations, liveSessions] = await Promise.all([
    listConversationSummaries(auth.user.id),
    listVisitorPresenceSessions(auth.user.id)
  ]);

  return jsonOk({ conversations, liveSessions });
}
