"use client";

import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { ConversationThread, VisitorActivity } from "@/lib/types";

type SetState<T> = Dispatch<SetStateAction<T>>;

export async function hydrateConversationVisitorActivity(input: {
  conversationId: string;
  setActiveConversation: SetState<ConversationThread | null>;
  conversationCacheRef: MutableRefObject<Map<string, ConversationThread>>;
  visitorActivityRequestedRef: MutableRefObject<Set<string>>;
}) {
  const cached = input.conversationCacheRef.current.get(input.conversationId);
  if (
    cached?.visitorActivity ||
    input.visitorActivityRequestedRef.current.has(input.conversationId)
  ) {
    return cached?.visitorActivity ?? null;
  }

  input.visitorActivityRequestedRef.current.add(input.conversationId);

  try {
    const response = await fetch(
      `/dashboard/conversation-visitor-activity?conversationId=${encodeURIComponent(input.conversationId)}`,
      { method: "GET", cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      ok: true;
      visitorActivity: VisitorActivity;
    };
    const current = input.conversationCacheRef.current.get(input.conversationId);
    if (!current) {
      return payload.visitorActivity;
    }

    const next = { ...current, visitorActivity: payload.visitorActivity };
    input.conversationCacheRef.current.set(input.conversationId, next);
    input.setActiveConversation((active) =>
      active?.id === input.conversationId
        ? { ...active, visitorActivity: payload.visitorActivity }
        : active
    );
    return payload.visitorActivity;
  } catch {
    return null;
  }
}
