import { getPublicConversationMessages } from "@/lib/data";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";

export function OPTIONS() {
  return publicNoContentResponse();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = String(searchParams.get("siteId") ?? "").trim();
    const sessionId = String(searchParams.get("sessionId") ?? "").trim();
    const conversationId = String(searchParams.get("conversationId") ?? "").trim();

    if (!siteId || !sessionId || !conversationId) {
      return publicJsonResponse(
        { error: "siteId, sessionId, and conversationId are required." },
        { status: 400 }
      );
    }

    const messages = await getPublicConversationMessages({
      siteId,
      sessionId,
      conversationId
    });

    if (!messages) {
      return publicJsonResponse({ error: "Conversation not found." }, { status: 404 });
    }

    return publicJsonResponse({
      ok: true,
      conversationId,
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender === "founder" ? "team" : "user",
        attachments: message.attachments
      }))
    });
  } catch (error) {
    console.error("public conversation thread error", error);
    return publicJsonResponse({ error: "Unable to load conversation." }, { status: 500 });
  }
}
