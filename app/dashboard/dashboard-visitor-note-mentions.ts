import type { MentionableTeammate } from "@/lib/mention-identities";

export type VisitorNoteMentionFeedback = {
  sent?: string[];
  ambiguous?: string[];
  unresolved?: string[];
  disabled?: string[];
};

export type ActiveVisitorNoteMention = {
  query: string;
  start: number;
  end: number;
};

function normalizeMentionSearchValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findActiveVisitorNoteMention(
  value: string,
  selectionStart: number | null | undefined
) {
  const cursor = selectionStart ?? value.length;
  const beforeCursor = value.slice(0, cursor);
  const match = beforeCursor.match(/(^|[\s([{>])@([a-z0-9._-]{0,63})$/i);
  if (!match) {
    return null;
  }

  return {
    query: match[2]?.toLowerCase() ?? "",
    start: beforeCursor.length - ((match[2]?.length ?? 0) + 1),
    end: cursor
  } satisfies ActiveVisitorNoteMention;
}

export function getVisitorNoteMentionSuggestions(
  users: MentionableTeammate[],
  query: string
) {
  const normalizedQuery = normalizeMentionSearchValue(query);
  const matches = users.filter((user) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      normalizeMentionSearchValue(user.handle).includes(normalizedQuery) ||
      normalizeMentionSearchValue(user.displayName).includes(normalizedQuery)
    );
  });

  return matches.slice(0, 5);
}

export function applyVisitorNoteMention(
  value: string,
  mention: ActiveVisitorNoteMention,
  handle: string
) {
  const nextValue = `${value.slice(0, mention.start)}@${handle}${value.slice(mention.end)}`;
  return { value: nextValue, cursor: mention.start + handle.length + 1 };
}

function formatMentionHandleList(handles: string[]) {
  return handles.map((handle) => `@${handle}`).join(", ");
}

export function buildVisitorNoteMentionWarning(feedback: VisitorNoteMentionFeedback) {
  const messages: string[] = [];

  if (feedback.ambiguous?.length) {
    messages.push(`Pick a more specific teammate for ${formatMentionHandleList(feedback.ambiguous)}.`);
  }

  if (feedback.unresolved?.length) {
    messages.push(`We couldn't match ${formatMentionHandleList(feedback.unresolved)}.`);
  }

  if (feedback.disabled?.length) {
    messages.push(`Mention notifications are off for ${formatMentionHandleList(feedback.disabled)}.`);
  }

  return messages.join(" ");
}
