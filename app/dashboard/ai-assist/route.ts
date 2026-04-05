import { getConversationById } from "@/lib/data";
import { generateDashboardAiAssist } from "@/lib/dashboard-ai-assist-service";
import { validateDashboardAiAssistRequest } from "@/lib/dashboard-ai-assist";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const action = String(payload.action ?? "").trim();
    const conversationId = String(payload.conversationId ?? "").trim();
    const draft = String(payload.draft ?? "");
    const validationError = validateDashboardAiAssistRequest({
      action,
      conversationId,
      draft
    });

    if (validationError) {
      const status = validationError === "draft-required" ? 422 : 400;
      return jsonError(validationError, status);
    }

    const conversation = await getConversationById(conversationId, auth.user.id);
    if (!conversation) {
      return jsonError("not-found", 404);
    }

    const result = await generateDashboardAiAssist({
      action: action as "summarize" | "rewrite" | "reply" | "tags",
      conversation,
      draft
    });

    return jsonOk({ action, result });
  } catch (error) {
    if (error instanceof Error && error.message === "MINIMAX_NOT_CONFIGURED") {
      return jsonError("ai-provider-not-configured", 500);
    }

    if (
      error instanceof Error &&
      (error.message === "DASHBOARD_AI_ASSIST_FAILED" ||
        error.message === "INVALID_DASHBOARD_AI_ASSIST_RESPONSE")
    ) {
      return jsonError("ai-assist-failed", 500);
    }

    return jsonError("ai-assist-failed", 500);
  }
}
