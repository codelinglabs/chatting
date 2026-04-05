import type { ContactNote, ContactSummary } from "@/lib/contact-types";

type ContactProfileComparable = Pick<
  ContactSummary,
  "name" | "phone" | "company" | "role" | "avatarUrl" | "location" | "customFields" | "status" | "tags" | "notes" | "latestConversationId" | "latestSessionId"
>;

export function getChangedContactProfileFields(
  before: ContactProfileComparable,
  after: ContactProfileComparable
) {
  const changedFields: string[] = [];

  if (before.name !== after.name) {
    changedFields.push("name");
  }
  if (before.phone !== after.phone) {
    changedFields.push("phone");
  }
  if (before.company !== after.company) {
    changedFields.push("company");
  }
  if (before.role !== after.role) {
    changedFields.push("role");
  }
  if (before.avatarUrl !== after.avatarUrl) {
    changedFields.push("avatarUrl");
  }
  if (JSON.stringify(before.location) !== JSON.stringify(after.location)) {
    changedFields.push("location");
  }

  const customFieldKeys = Array.from(
    new Set([...Object.keys(before.customFields), ...Object.keys(after.customFields)])
  );
  for (const key of customFieldKeys) {
    if ((before.customFields[key] ?? null) !== (after.customFields[key] ?? null)) {
      changedFields.push(`customFields.${key}`);
    }
  }

  return changedFields;
}

export function diffContactTags(beforeTags: string[], afterTags: string[]) {
  const before = new Set(beforeTags);
  const after = new Set(afterTags);

  return {
    added: afterTags.filter((tag) => !before.has(tag)),
    removed: beforeTags.filter((tag) => !after.has(tag))
  };
}

export function getAddedContactNotes(beforeNotes: ContactNote[], afterNotes: ContactNote[]) {
  const existingIds = new Set(beforeNotes.map((note) => note.id));
  return afterNotes.filter((note) => !existingIds.has(note.id));
}

export function getContactMergeMetadata(
  before: Pick<ContactProfileComparable, "latestConversationId" | "latestSessionId">,
  after: Pick<ContactProfileComparable, "latestConversationId" | "latestSessionId">
) {
  const sessionChanged = Boolean(after.latestSessionId && after.latestSessionId !== before.latestSessionId);
  const conversationChanged = Boolean(
    after.latestConversationId && after.latestConversationId !== before.latestConversationId
  );

  if (!sessionChanged && !conversationChanged) {
    return null;
  }

  return {
    previousSessionId: before.latestSessionId,
    sessionId: after.latestSessionId,
    previousConversationId: before.latestConversationId,
    conversationId: after.latestConversationId
  };
}

export function normalizeExportFieldKeys(fields: string[]) {
  return Array.from(new Set(fields.map((field) => field.trim()).filter(Boolean))).sort();
}
