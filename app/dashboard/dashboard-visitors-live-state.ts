import type { ConversationSummary, VisitorPresenceSession } from "@/lib/types";

function sessionKey(session: VisitorPresenceSession) {
  return `${session.siteId}:${session.sessionId}`;
}

export function upsertVisitorConversationSummary(
  current: ConversationSummary[],
  summary: ConversationSummary
) {
  const existingIndex = current.findIndex((conversation) => conversation.id === summary.id);
  if (existingIndex === -1) {
    return [summary, ...current];
  }

  return current.map((conversation) => (conversation.id === summary.id ? summary : conversation));
}

export function upsertVisitorPresenceSession(
  current: VisitorPresenceSession[],
  session: VisitorPresenceSession
) {
  const existingIndex = current.findIndex((entry) => sessionKey(entry) === sessionKey(session));
  if (existingIndex === -1) {
    return [session, ...current];
  }

  return current.map((entry) => (sessionKey(entry) === sessionKey(session) ? session : entry));
}
